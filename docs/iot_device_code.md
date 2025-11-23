# IoT Device Code

This file contains the C++ code intended for an ESP32 device to read sensor data and send it to Firebase Realtime Database.
#this my code
```cpp
#include <WiFi.h>
#include <Firebase_ESP_Client.h>
#include <DHT.h>
#include <OneWire.h>
#include <DallasTemperature.h>
#include <time.h>  

// ====== CONFIG WIFI ======
#define WIFI_SSID "La_Fibre_dOrange_52EF"
#define WIFI_PASSWORD "NHDK476XAQQKFZA39U"

// ====== CONFIG FIREBASE ======
#define API_KEY "AIzaSyAM6yuxcRPJW5drSotFovd_7jhmij48Vkg"
#define DATABASE_URL "https://nouhaila-66422-default-rtdb.firebaseio.com/"

// ====== CAPTEURS ======
#define DHTPIN 4
#define DHTTYPE DHT22
#define ONE_WIRE_BUS 5
#define MQ135_PIN 34
#define SAMPLE_INTERVAL 2000

// ====== OBJETS CAPTEURS ======
DHT dht(DHTPIN, DHTTYPE);
OneWire oneWire(ONE_WIRE_BUS);
DallasTemperature sensors(&oneWire);

// ====== FIREBASE ======
FirebaseData fbdo;
FirebaseAuth auth;
FirebaseConfig config;

// ====== ID DU DEVICE (important pour Firebase) ======
String device_id = "ESP32_01";

// ====== Timestamp via NTP ======
String getTimestamp() {
  struct tm timeinfo;
  if (!getLocalTime(&timeinfo)) {
    return "N/A";
  }
  char buffer[32];
  strftime(buffer, sizeof(buffer), "%Y-%m-%d %H:%M:%S", &timeinfo);
  return String(buffer);
}

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
  Serial.println("\n✅ Connecté au WiFi !");
  Serial.print("Adresse IP ESP32 : ");
  Serial.println(WiFi.localIP());

  // --- NTP ---
  configTime(0, 0, "pool.ntp.org", "time.nist.gov");
  Serial.println("⏳ Synchronisation NTP...");
  delay(2000);

  // --- Auth Firebase ---
  auth.user.email = "dr.amine.benali@example.com";
  auth.user.password = "StrongPass123!";

  config.api_key = API_KEY;
  config.database_url = DATABASE_URL;

  Firebase.begin(&config, &auth);
  Firebase.reconnectWiFi(true);

  Serial.println("✅ Firebase initialisé !");
}

void loop() {

  // === Lecture capteurs ===
  int bpm = random(60, 110);
  float tempDHT = dht.readTemperature();
  float hum = dht.readHumidity();
  sensors.requestTemperatures();
  float tempDS = sensors.getTempCByIndex(0);
  int gasValue = analogRead(MQ135_PIN);

  float o2Saturation = random(950, 1000) / 10.0;

  // === Timestamp NTP ===
  String timestamp = getTimestamp();

  // ========= CRÉATION JSON =========
  FirebaseJson json;
  json.set("BPM", bpm);
  json.set("Gaz", gasValue);
  json.set("Hum", hum);
  json.set("TempDHT", tempDHT);
  json.set("TempDS", tempDS);
  json.set("collectedBy", device_id);
  json.set("o2Saturation", o2Saturation);
  json.set("timestamp", timestamp);

  Serial.println("=== JSON clair ===");
  String jsonStr;
  json.toString(jsonStr, true); // pretty print
  Serial.println(jsonStr);

  // ========= Envoi Firebase =========
  String firebase_path = "/sensors/" + device_id;

  // Push
  if (Firebase.RTDB.pushJSON(&fbdo, firebase_path.c_str(), &json)) {
    Serial.println("✅ Données envoyées !");
  } else {
    Serial.print("❌ Erreur Firebase : ");
    Serial.println(fbdo.errorReason());
  }

  Serial.println("----------------------------");
  delay(SAMPLE_INTERVAL);
}
```