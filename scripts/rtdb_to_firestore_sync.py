
import warnings
warnings.filterwarnings("ignore", category=FutureWarning)

import base64
import json
from datetime import datetime, timezone
from typing import Optional, Dict, Any

from Crypto.Cipher import AES
from Crypto.Util.Padding import unpad

import firebase_admin
from firebase_admin import credentials, db, firestore

# ==============================================================================
# CONFIGURATION
# ==============================================================================

# --- Firebase Service Account ---
# IMPORTANT: Download this from your Firebase Project Settings > Service accounts
# and place it in the /scripts directory.
SERVICE_ACCOUNT_KEY_PATH = "scripts/serviceAccountKey.json"

# --- Firebase Project Config ---
DATABASE_URL = "https://nouhaila-66422-default-rtdb.firebaseio.com/"

# --- Patient & Device Config ---
# The patient document ID in Firestore to which the data will be saved.
# You can get this ID from the URL when viewing a patient in the web app.
# Example: /patients/29sxeWUSDRD1L1RjDEAC -> "29sxeWUSDRD1L1RjDEAC"
PATIENT_ID = "29sxeWUSDRD1L1RjDEAC"

# The path in Realtime Database where the ESP32 sends its data.
RTDB_SENSOR_PATH = "sensors/ESP32_01"


# --- AES Decryption Config ---
# IMPORTANT: This key and IV MUST exactly match what is on your ESP32 device.
AES_KEY = b"MaCleSecreteAES1"        # 16 bytes key
AES_IV  = bytes(range(16))           # byte array [0,1,2,...,15]

# ==============================================================================
# INITIALIZATION
# ==============================================================================

try:
    cred = credentials.Certificate(SERVICE_ACCOUNT_KEY_PATH)
    firebase_admin.initialize_app(cred, {"databaseURL": DATABASE_URL})
except Exception as e:
    print(f"❌ Failed to initialize Firebase Admin SDK.")
    print(f"   Make sure '{SERVICE_ACCOUNT_KEY_PATH}' exists and is valid.")
    print(f"   Error: {e}")
    exit(1)

fs = firestore.client()
print("✅ Firebase Admin SDK initialized successfully.")

# ==============================================================================
# DECRYPTION & DATA PROCESSING LOGIC
# ==============================================================================

def aes_decrypt(cipher_b64: str) -> Optional[Dict[str, Any]]:
    """
    Decrypts a Base64 encoded AES-128-CBC string and parses it into a dictionary.
    Handles mbedTLS/PKCS7 padding from the ESP32.
    Returns a dictionary on success, or None on failure.
    """
    try:
        cipher_bytes = base64.b64decode(cipher_b64)
        cipher = AES.new(AES_KEY, AES.MODE_CBC, AES_IV)
        padded_bytes = cipher.decrypt(cipher_bytes)
        unpadded_bytes = unpad(padded_bytes, AES.block_size)
        json_string = unpadded_bytes.decode("utf-8")
        return json.loads(json_string)
    except (ValueError, KeyError, json.JSONDecodeError) as e:
        print(f"❌ Decryption or JSON parsing failed: {e}")
        return None
    except Exception as e:
        print(f"❌ An unexpected error occurred during decryption: {e}")
        return None


def compute_status(reading: Dict[str, Any]) -> str:
    """
    Determines the patient's status based on sensor readings.
    """
    hr = reading.get("heartRate")
    pt = reading.get("patientTemperature")
    spo2 = reading.get("o2Saturation")

    # Use a list of checks for clarity
    critical_checks = [
        hr is not None and (hr < 40 or hr > 140),
        pt is not None and pt > 39.5,
        spo2 is not None and spo2 < 88,
    ]
    warning_checks = [
        hr is not None and (hr < 50 or hr > 120),
        pt is not None and pt > 38.5,
        spo2 is not None and spo2 < 94,
    ]

    if any(critical_checks):
        return "critical"
    if any(warning_checks):
        return "warning"

    # If any vital value is missing, status is unknown
    if any(v is None for v in [hr, pt, spo2]):
        return "unknown"
        
    return "stable"

def process_and_save_reading(encrypted_data: str):
    """
    Main function to process a single encrypted reading from RTDB.
    It decrypts, computes status, and updates Firestore.
    """
    print(f"\n- - - New Reading Received at {datetime.now().strftime('%H:%M:%S')} - - -")
    print(f"  Encrypted: {encrypted_data[:30]}...")

    decrypted_data = aes_decrypt(encrypted_data)
    if not decrypted_data:
        print("  --> Decryption failed. Skipping.")
        return

    print(f"  Decrypted: {json.dumps(decrypted_data)}")

    # Ensure timestamp exists, defaulting to now if missing
    if not decrypted_data.get("timestamp"):
        decrypted_data["timestamp"] = datetime.now(timezone.utc).isoformat()
    
    # Standardize the data structure for Firestore
    firestore_doc = {
        "timestamp": decrypted_data["timestamp"],
        "heartRate": decrypted_data.get("heartRate"),
        "patientTemperature": decrypted_data.get("patientTemperature"),
        "roomTemperature": decrypted_data.get("roomTemperature"),
        "roomHumidity": decrypted_data.get("roomHumidity"),
        "o2Saturation": decrypted_data.get("o2Saturation"),
        "collectedBy": decrypted_data.get("collectedBy", "ESP32"),
    }
    
    # Compute status based on the standardized data
    status = compute_status(firestore_doc)
    firestore_doc["status"] = status
    
    # Get a reference to the patient document in Firestore
    patient_ref = fs.collection("patients").document(PATIENT_ID)

    # 1. Update the main patient document with the latest data
    patient_ref.set({
        "lastReadingAt": firestore_doc["timestamp"],
        "status": status,
        "latestSensorData": firestore_doc,
    }, merge=True)
    print(f"  > Updated patient/{PATIENT_ID} with status '{status}'.")

    # 2. Add the full reading as a new document in the subcollection
    sensor_data_ref = patient_ref.collection("sensorData")
    sensor_data_ref.add(firestore_doc)
    print(f"  > Added new document to sensorData subcollection.")
    print("✅ Successfully updated Firestore.")

# ==============================================================================
# REALTIME DATABASE LISTENER
# ==============================================================================

def rtdb_listener(event: db.Event):
    """
    The callback function for the RTDB listener.
    It handles new data events from the specified path.
    """
    # On initial connection, Firebase sends the entire existing data at the path.
    # We want to ignore this initial dump and only process new children.
    if event.path == "/" and isinstance(event.data, dict):
        print("-> Initial data sync from RTDB complete. Listening for new entries...")
        return

    # A new child was pushed (event.data is the value of the new child)
    if event.event_type == 'put' and event.path != '/':
         if isinstance(event.data, str):
            process_and_save_reading(event.data)
         else:
             print(f"⚠ Skipping event with non-string data: {event.data}")

    # A patch event can contain multiple new children
    elif event.event_type == 'patch':
         if isinstance(event.data, dict):
            for key, value in event.data.items():
                if isinstance(value, str):
                    process_and_save_reading(value)
                else:
                    print(f"⚠ Skipping patch item with non-string value: {value}")


def start_live_sync():
    """
    Initializes and starts the real-time listener on the specified RTDB path.
    """
    ref = db.reference(RTDB_SENSOR_PATH)
    print("==================================================")
    print(f"🚀 Starting Realtime Database Listener")
    print(f"   - Listening at: {RTDB_SENSOR_PATH}")
    print(f"   - Saving to Firestore for Patient ID: {PATIENT_ID}")
    print("==================================================")
    print("Waiting for new data from your IoT device...")
    
    try:
        ref.listen(rtdb_listener)
    except Exception as e:
        print(f"❌ Could not start RTDB listener: {e}")

if __name__ == "__main__":
    start_live_sync()
