
import warnings
warnings.filterwarnings("ignore", category=FutureWarning)

import base64
import json
import random
import time
from datetime import datetime

from Crypto.Cipher import AES
from Crypto.Util.Padding import pad

import firebase_admin
from firebase_admin import credentials, db

# ==========================
# 1) Firebase initialization
# ==========================

# Make sure serviceAccountKey.json is in the same directory
try:
    cred = credentials.Certificate("scripts/serviceAccountKey.json")
except Exception as e:
    print("❌ Could not find 'scripts/serviceAccountKey.json'.")
    print("Please download it from your Firebase project settings and place it in the 'scripts' directory.")
    exit(1)


firebase_admin.initialize_app(cred, {
    # Replace with your database URL if different
    "databaseURL": "https://nouhaila-66422-default-rtdb.firebaseio.com/"
})

# RTDB path to send data to, just like the ESP32
RTDB_SENSOR_PATH = "sensors/ESP32_01"


# ==========================
# 2) AES config (must match the device)
# ==========================

AES_KEY = b"MaCleSecreteAES1"   # 16 bytes
AES_IV  = bytes(range(16))      # 0..15


def aes_encrypt_to_base64(plain_text: str) -> str:
    """
    JSON (string) -> AES-128-CBC (PKCS7) -> Base64 string
    """
    data = plain_text.encode("utf-8")
    cipher = AES.new(AES_KEY, AES.MODE_CBC, AES_IV)
    padded_data = pad(data, AES.block_size)
    cipher_bytes = cipher.encrypt(padded_data)
    return base64.b64encode(cipher_bytes).decode("utf-8")


# ==========================
# 3) Generate fake sensor data
# ==========================

def generate_sensor_reading() -> dict:
    """
    Generates plausible values to simulate real sensors.
    """
    bpm = random.randint(65, 95)                 # heart rate
    gas = random.randint(200, 600)               # MQ135-ish value
    hum = round(random.uniform(40.0, 55.0), 2)   # humidity
    temp_dht = round(random.uniform(22.0, 26.0), 2)  # room temp
    temp_ds = round(random.uniform(36.5, 37.5), 2)   # patient temp
    spo2 = round(random.uniform(96.0, 99.0), 1)      # O2 saturation

    timestamp = datetime.now().isoformat()

    return {
        "heartRate": bpm,
        "roomHumidity": hum,
        "patientTemperature": temp_ds,
        "roomTemperature": temp_dht,
        "o2Saturation": spo2,
        "timestamp": timestamp,
        "collectedBy": "ESP32_SIMULATOR",
    }


# ==========================
# 4) Push encrypted data to RTDB
# ==========================

def push_one_reading():
    """Generates, encrypts, and pushes a single reading."""
    reading = generate_sensor_reading()
    json_str = json.dumps(reading)

    encrypted_b64 = aes_encrypt_to_base64(json_str)

    print("=== Plain JSON ===")
    print(json_str)
    print("\n=== Encrypted Base64 ===")
    print(encrypted_b64)

    try:
        ref = db.reference(RTDB_SENSOR_PATH)
        ref.push(encrypted_b64)
        print("✅ Pushed encrypted reading to RTDB\n")
    except Exception as e:
        print(f"❌ Failed to push to Firebase: {e}")


def run_loop(interval_seconds: int = 5):
    """
    Runs a continuous loop, pushing a new reading every interval_seconds.
    """
    print(f"🚀 Sensor simulator started, pushing to {RTDB_SENSOR_PATH}")
    print("Press Ctrl+C to stop.")
    while True:
        try:
            push_one_reading()
            time.sleep(interval_seconds)
        except KeyboardInterrupt:
            print("\n⛔ Stopped by user.")
            break
        except Exception as e:
            print(f"❌ An error occurred in the loop: {e}")
            time.sleep(interval_seconds)


if __name__ == "__main__":
    # To run in live mode (every 5 seconds):
    run_loop(interval_seconds=5)

    # To send just one reading:
    # push_one_reading()
