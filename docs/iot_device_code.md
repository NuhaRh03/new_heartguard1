# IoT Device Data

This application now reads patient sensor data directly from **Cloud Firestore**.

To populate the sensor history for a patient, you must add new documents to the `sensorData` subcollection for that patient.

**Firestore Path:** `/patients/{patientId}/sensorData/{readingId}`

Each document should be a `SensorData` object with the following structure:

```json
{
  "timestamp": "2024-05-23T10:00:00Z",
  "heartRate": 75,
  "o2Saturation": 98,
  "roomHumidity": 45,
  "roomTemperature": 24,
  "patientTemperature": 37.0,
  "collectedBy": "ESP32_01"
}
```

You can add this data manually through the Firebase Console or programmatically using a server-side script or IoT device configured with the Firebase SDKs (e.g., Firebase Admin SDK for Node.js, Python, etc.).
