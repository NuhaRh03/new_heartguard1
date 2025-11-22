
export interface DoctorProfile {
  id: string;
  name: string;
  dateOfBirth: string;
  age: number;
  speciality: string;
  idCardNumber: string;
}

export interface AIAnalysisResult {
    anomalyLevel: number;
    explanation: string;
    alertTriggered: boolean;
    analyzedAt: string; // ISO string
}

export interface Patient {
  id: string;
  name: string;
  birthDate: string;
  gender: 'Male' | 'Female' | 'Other';
  emergencyContact: {
      name: string;
      relationship: string;
      phone: string;
  };
  email?: string;
  phone?: string;
  historicalDiseases: string[];
  currentMedications: string[];
  createdBy: string; 
  status?: 'stable' | 'warning' | 'critical' | 'unknown';
  createdAt?: string;
  lastReadingAt?: string; // ISO string
  latestSensorData?: Omit<SensorData, 'id'>;
  aiAnalysis?: AIAnalysisResult;
}

export interface SensorData {
  id: string;
  timestamp: string; // ISO string
  heartRate: number; // BPM
  o2Saturation: number; 
  roomHumidity: number; // Hum
  roomTemperature: number; // TempDHT
  patientTemperature: number; // TempDS
  gasValue?: number; // Gaz - now optional as it's processed
  collectedBy: string;
}


export interface PatientStatus {
  level: 'stable' | 'warning' | 'critical' | 'unknown';
  label: string;
}

export const getAIStatus = (anomalyLevel: number): PatientStatus['level'] => {
    if (anomalyLevel >= 7) return 'critical';
    if (anomalyLevel >= 4) return 'warning';
    return 'stable';
};


export const getPatientStatusFromSensorData = (reading: Omit<SensorData, 'id'>): PatientStatus['level'] => {
    if (reading.patientTemperature > 39.5 || reading.heartRate > 120 || reading.heartRate < 50 || (reading.o2Saturation && reading.o2Saturation < 90)) {
        return 'critical';
    }
    if (reading.patientTemperature > 38.5 || reading.heartRate > 100 || reading.heartRate < 60 || (reading.o2Saturation && reading.o2Saturation < 95)) {
        return 'warning';
    }
    return 'stable';
};


export const getPatientStatusAppearance = (status?: Patient['status']): PatientStatus => {
  switch (status) {
    case 'critical':
      return { level: 'critical', label: 'Critical' };
    case 'warning':
      return { level: 'warning', label: 'Warning' };
    case 'stable':
      return { level: 'stable', label: 'Stable' };
    default:
      return { level: 'unknown', label: 'No Data' };
  }
};

    