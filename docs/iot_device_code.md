# IoT Device Code

This file contains the C++ code intended for an ESP32 device to read sensor data and send it to Firebase Realtime Database. This version sends a raw JSON object, without encryption.
#this my code
```cpp
#include <WiFi.h>
#include <Firebase_ESP_Client.h>
#include <DHT.h>
#include <OneWire.h>
#include <DallasTemperature.h>

// ====== CONFIG WIFI ======
#define WIFI_SSID "FSA-2"
#define WIFI_PASSWORD ""

// ====== CONFIG FIREBASE ======
#define API_KEY "" // Replace with your Firebase Web API Key
#define DATABASE_URL "https://iot-cloud-project-92142-default-rtdb.europe-west1.firebasedatabase.app/" // Replace with your RTDB URL

// ====== CAPTEURS ======
#define DHTPIN 4
#define DHTTYPE DHT22
#define ONE_WIRE_BUS 5
#define MQ135_PIN 34
#define SAMPLE_INTERVAL 5000 // Send data every 5 seconds

// ====== OBJETS ======
DHT dht(DHTPIN, DHTTYPE);
OneWire oneWire(ONE_WIRE_BUS);
DallasTemperature sensors(&oneWire);

// ====== FIREBASE ======
FirebaseData fbdo;
FirebaseAuth auth;
FirebaseConfig config;

void setup() {
  Serial.begin(115200);
  dht.begin();
  sensors.begin();

  // --- Connexion WiFi ---
  Serial.println("Connexion au WiFi...");
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  while (WiFi.status() != WL_CONNECTED) {
    Serial.print(".");
    delay(300);
  }
  Serial.println("\n✅ Connecté au WiFi");

  // --- Authentification Firebase (Anonymous or other) ---
  // For this simplified example, we can use anonymous auth or no auth if rules allow.
  // If using email/password, fill these in.
  auth.user.email = "";
  auth.user.password = "";

  // --- Configuration Firebase ---
  config.api_key = API_KEY;
  config.database_url = DATABASE_URL;

  // Optionnel : callback pour surveiller l'état du token
  config.token_status_callback = [](TokenInfo info){
    Serial.printf("Firebase token status: %s\n", info.status_string.c_str());
  };

  // --- Initialisation Firebase ---
  Firebase.begin(&config, &auth);
  Firebase.reconnectWiFi(true);

  Serial.println("✅ Firebase initialisé !");
}

void loop() {
  // --- Lecture des capteurs ---
  int bpm = random(60, 110);  // Simulé
  float tempDHT = dht.readTemperature();
  float hum = dht.readHumidity();
  sensors.requestTemperatures();
  float tempDS = sensors.getTempCByIndex(0);
  int gasValue = analogRead(MQ135_PIN);

  // Check if readings are valid
  if (isnan(tempDHT) || isnan(hum) || tempDS == -127.0) {
    Serial.println("❌ Failed to read from sensors!");
    delay(SAMPLE_INTERVAL);
    return;
  }

  // --- Création de l'objet JSON ---
  FirebaseJson json;
  json.set("BPM", bpm);
  json.set("TempDHT", String(tempDHT, 2));
  json.set("Hum", String(hum, 2));
  json.set("TempDS", String(tempDS, 2));
  json.set("Gaz", gasValue);

  Serial.println("=== Sending JSON Data ===");
  json.toString(Serial, true); // Print the JSON to Serial monitor

  // --- Envoi sur Firebase ---
  // We use setJson instead of pushString
  if (Firebase.RTDB.setJSON(&fbdo, "/iot_data/data", &json)) {
    Serial.println("\n✅ Données envoyées avec succès !");
  } else {
    Serial.print("\n❌ Erreur d’envoi : ");
    Serial.println(fbdo.errorReason());
  }

  Serial.println("----------------------------");
  delay(SAMPLE_INTERVAL);
}
```