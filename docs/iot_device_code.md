# IoT Device Code (ESP32)

This file contains the C++ code for the ESP32 device responsible for collecting and transmitting sensor data. The device encrypts the data using AES-128-CBC and sends it to the Firebase Realtime Database.

The web application listens for this encrypted data, decrypts it on the server, and then saves it to Firestore.

## Dependencies

- `<WiFi.h>`
- `<Firebase_ESP_Client.h>`
- `<DHT.h>`
- `<OneWire.h>`
- `<DallasTemperature.h>`
- `<time.h>`
- `<mbedtls/aes.h>`
- `<mbedtls/base64.h>`

*Note: The `<AESLib.h>` and `<Base64.h>` libraries have been replaced with the more standard `mbedtls` library for better compatibility and padding handling.*

## Full Device Code

```cpp
#include <WiFi.h>
#include <Firebase_ESP_Client.h>
#include <DHT.h>
#include <OneWire.h>
#include <DallasTemperature.h>
#include <time.h>
// mbedTLS for AES and Base64
#include "mbedtls/aes.h"
#include "mbedtls/base64.h"

// ====== CONFIG WIFI ======
#define WIFI_SSID "YOUR_WIFI_SSID"
#define WIFI_PASSWORD "YOUR_WIFI_PASSWORD"

// ====== CONFIG FIREBASE ======
#define API_KEY "AIzaSyAM6yuxcRPJW5drSotFovd_7jhmij48Vkg" // Replace with your actual API Key
#define DATABASE_URL "https://nouhaila-66422-default-rtdb.firebaseio.com/"

// ====== CAPTEURS ======
#define DHTPIN 4
#define DHTTYPE DHT22
#define ONE_WIRE_BUS 5
#define MQ135_PIN 34
#define SAMPLE_INTERVAL 5000 // Send data every 5 seconds

// ====== OBJETS CAPTEURS ======
DHT dht(DHTPIN, DHTTYPE);
OneWire oneWire(ONE_WIRE_BUS);
DallasTemperature sensors(&oneWire);

// ====== AES CONFIGURATION ======
// IMPORTANT: This key and IV MUST match the ones used in the backend decryption API.
const unsigned char AES_KEY[16] = {'M','a','C','l','e','S','e','c','r','e','t','e','A','E','S','1'};
const unsigned char AES_IV_INIT[16] = {0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15};

// ====== FIREBASE ======
FirebaseData fbdo;
FirebaseAuth auth;
FirebaseConfig config;

// ====== ID DU DEVICE (important pour Firebase) ======
String device_id = "ESP32_01";

// ====== NTP Timestamp ======
String getTimestamp() {
  struct tm timeinfo;
  if (!getLocalTime(&timeinfo)) {
    return "N/A";
  }
  char buffer[32];
  // Format to ISO 8601 string, which is standard for web applications
  strftime(buffer, sizeof(buffer), "%Y-%m-%dT%H:%M:%SZ", &timeinfo);
  return String(buffer);
}

// Function to encrypt JSON string using AES-128-CBC with PKCS7 padding
String encryptJson(const String &plain) {
  // --- PKCS7 padding ---
  size_t len = plain.length();
  size_t padded_len = ((len / 16) + 1) * 16;  // Calculate length of next multiple of 16

  uint8_t input[padded_len];
  uint8_t output[padded_len];

  // Copy data
  memset(input, 0, padded_len);
  memcpy(input, plain.c_str(), len);

  // Apply PKCS7 padding
  uint8_t pad = padded_len - len;
  for (size_t i = len; i < padded_len; i++) {
    input[i] = pad;
  }

  // --- AES-128-CBC encrypt ---
  mbedtls_aes_context aes;
  mbedtls_aes_init(&aes);

  uint8_t iv[16];
  memcpy(iv, AES_IV_INIT, 16); // IMPORTANT: Use a fresh copy of the IV for each encryption

  mbedtls_aes_setkey_enc(&aes, AES_KEY, 128);
  mbedtls_aes_crypt_cbc(&aes, MBEDTLS_AES_ENCRYPT, padded_len, iv, input, output);

  mbedtls_aes_free(&aes);

  // --- Base64 encode with mbedTLS ---
  unsigned char encoded[400]; // Buffer for Base64 output
  size_t out_len = 0;
  int ret = mbedtls_base64_encode(encoded, sizeof(encoded), &out_len, output, padded_len);

  if (ret != 0) {
    Serial.println("❌ mbedtls_base64_encode failed");
    return "";
  }

  encoded[out_len] = '\0'; // Null-terminate the string
  return String((char*)encoded);
}


void setup() {
  Serial.begin(115200);
  
  dht.begin();
  sensors.begin();

  // --- WiFi Connection ---
  Serial.println("Connecting to WiFi...");
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  while (WiFi.status() != WL_CONNECTED) {
    Serial.print(".");
    delay(300);
  }
  Serial.println("\n✅ Connected to WiFi!");
  Serial.print("ESP32 IP Address: ");
  Serial.println(WiFi.localIP());

  // --- NTP Time Sync ---
  configTime(0, 0, "pool.ntp.org", "time.nist.gov");
  Serial.println("⏳ Syncing NTP time...");
  delay(2000); // Give time for sync

  // --- Firebase Auth & Config ---
  // NOTE: This auth is just for the ESP32 to have permission to write to RTDB.
  // The web app has its own separate authentication.
  auth.user.email = "dr.amine.benali@example.com";
  auth.user.password = "StrongPass123!";

  config.api_key = API_KEY;
  config.database_url = DATABASE_URL;

  Firebase.begin(&config, &auth);
  Firebase.reconnectWiFi(true);

  Serial.println("✅ Firebase initialized!");
}

void loop() {
  // === Read Sensors ===
  float tempDHT = dht.readTemperature();
  float hum = dht.readHumidity();
  sensors.requestTemperatures();
  float tempDS = sensors.getTempCByIndex(0);
  int gasValue = analogRead(MQ135_PIN);
  
  // Simulate other values for now
  int bpm = random(65, 95);
  float o2Saturation = random(950, 1000) / 10.0; // Random between 95.0 and 100.0

  // Check for sensor reading errors
  if (isnan(tempDHT) || isnan(hum) || tempDS < -50) {
      Serial.println("❌ Failed to read from sensors!");
      delay(SAMPLE_INTERVAL);
      return;
  }

  // === Get NTP Timestamp ===
  String timestamp = getTimestamp();

  // === Create JSON String ===
  char json[256];
  sprintf(json,
          "{\"heartRate\":%d,\"roomHumidity\":%.1f,\"patientTemperature\":%.2f,"
          "\"roomTemperature\":%.2f,\"o2Saturation\":%.1f,\"timestamp\":\"%s\"}",
          bpm, hum, tempDS, tempDHT, o2Saturation, timestamp.c_str());

  Serial.println("=== Plain JSON ===");
  Serial.println(json);

  // === Encrypt & Encode ===
  String encrypted_base64 = encryptJson(String(json));
  
  if (encrypted_base64.length() == 0) {
      Serial.println("❌ Encryption failed. Skipping Firebase send.");
      delay(SAMPLE_INTERVAL);
      return;
  }

  Serial.println("=== Encrypted Base64 JSON ===");
  Serial.println(encrypted_base64);

  // === Send to Firebase RTDB ===
  String firebase_path = "/sensors/" + device_id;
  
  if (Firebase.RTDB.pushString(&fbdo, firebase_path.c_str(), encrypted_base64)) {
    Serial.println("✅ Encrypted data sent successfully!");
  } else {
    Serial.print("❌ Firebase Error: ");
    Serial.println(fbdo.errorReason());
  }

  Serial.println("----------------------------");
  delay(SAMPLE_INTERVAL);
}

```
