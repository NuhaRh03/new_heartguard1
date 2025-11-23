'use client';

import { useParams, notFound } from 'next/navigation';
import { doc, updateDoc, serverTimestamp, addDoc, collection, query, orderBy, limit } from 'firebase/firestore';
import {
  getDatabase,
  ref,
  onValue,
} from 'firebase/database';
import {
  useDoc,
  useFirestore,
  useMemoFirebase,
  useUser,
  useCollection,
} from '@/firebase';
import { getAIStatus, type Patient, type SensorData } from '@/lib/types';
import { PatientInfoCard } from './_components/patient-info-card';
import { DashboardLayout } from '@/components/dashboard-layout';
import { VitalsMonitor } from './_components/vitals-monitor';
import { SensorHistory } from './_components/sensor-history';
import { AIAnalysisCard } from './_components/ai-analysis-card';
import { PatientHeader } from './_components/patient-header';
import { useEffect, useRef } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { runAnomalyDetection } from './actions';

// Data structure from the device
interface RawReading {
    BPM: number;
    TempDHT: number;
    Hum: number;
    TempDS: number;
    Gaz: number;
}

// Function to map the gas value to O2 saturation
// This is a simplified example. A real-world scenario would require a calibrated sensor and a proper conversion formula.
const mapGasToO2 = (gasValue: number): number => {
    const minGas = 200; // Lower bound of your sensor's expected "normal" air reading
    const maxGas = 800; // Upper bound (less oxygen)
    const minO2 = 90; // Don't show less than 90%
    const maxO2 = 100; // Max O2

    // Clamp the gas value to its expected range
    const clampedGas = Math.max(minGas, Math.min(gasValue, maxGas));
    
    // Invert the mapping: higher gas value means lower O2
    const o2 = maxO2 - ((clampedGas - minGas) / (maxGas - minGas)) * (maxO2 - minO2);

    return Math.max(minO2, Math.min(o2, maxO2)); // Ensure the result is within O2 bounds
};


export default function PatientPage() {
  const params = useParams() as any;
  const id = typeof params?.id === 'string' ? params.id : Array.isArray(params?.id) ? params.id[0] : undefined;

  const firestore = useFirestore();
  const { user, isUserLoading } = useUser();

  // ---------- 1) Patient from Firestore ----------
  const patientDocRef = useMemoFirebase(() => {
    if (!firestore || !id || isUserLoading) return null; // Wait for user loading to complete
    return doc(firestore, 'patients', id);
  }, [firestore, id, isUserLoading]);

  const {
    data: patient,
    isLoading: isLoadingPatient,
    error: patientError,
  } = useDoc<Patient>(patientDocRef);

  // ---------- 2) Sensor history from Firestore ----------
  const sensorHistoryQuery = useMemoFirebase(() => {
    if (!patientDocRef) return null;
    return query(collection(patientDocRef, 'sensorData'), orderBy('timestamp', 'desc'), limit(20));
  }, [patientDocRef]);

  const { data: sensorHistory, isLoading: isLoadingHistory } = useCollection<SensorData>(sensorHistoryQuery);

  const isProcessing = useRef(false);

  // ---------- 3) Sensor data from Realtime Database ----------
  useEffect(() => {
    if (!id || !user || !firestore) return; // Wait for patient ID and authenticated user

    const db = getDatabase();
    const streamRef = ref(db, `/iot_data/data`);

    const unsubscribe = onValue(
      streamRef,
      async (snapshot) => {
        if (snapshot.exists() && !isProcessing.current) {
          isProcessing.current = true;
          try {
            // Data is now expected to be a raw JSON object
            const rawReading: RawReading = snapshot.val();
            
            // Validate the received data
            if (typeof rawReading.BPM !== 'number') {
                console.warn("Received invalid sensor data, skipping.", rawReading);
                isProcessing.current = false;
                return;
            }

            const newReading: Omit<SensorData, 'id'> = {
              timestamp: new Date().toISOString(),
              heartRate: rawReading.BPM,
              patientTemperature: rawReading.TempDS,
              roomTemperature: rawReading.TempDHT,
              roomHumidity: rawReading.Hum,
              gasValue: rawReading.Gaz,
              o2Saturation: mapGasToO2(rawReading.Gaz),
              collectedBy: 'device-iot-01',
            };
            
            // Save the new reading to the sensorData subcollection
            const readingsCollectionRef = collection(firestore, 'patients', id, 'sensorData');
            await addDoc(readingsCollectionRef, {
                ...newReading,
                timestamp: serverTimestamp() // Use server timestamp for consistency
            });

            const allReadings = [newReading, ...(sensorHistory || []).map(s => ({...s, timestamp: new Date(s.timestamp).toISOString()}))].slice(0, 20);

            // Run AI analysis
            const aiResponse = await runAnomalyDetection({
                patientId: id,
                sensorData: allReadings.map(d => ({
                    timestamp: d.timestamp,
                    heartRate: d.heartRate,
                    o2Saturation: d.o2Saturation,
                    roomTemperature: d.roomTemperature,
                    patientTemperature: d.patientTemperature,
                    roomHumidity: d.roomHumidity,
                })),
                alertThreshold: 7,
            });
            
            // Update patient doc with latest data and AI analysis
             if (patientDocRef) {
                const updatePayload: Partial<Patient> = {
                    latestSensorData: newReading,
                    lastReadingAt: newReading.timestamp,
                };

                if(aiResponse.success && aiResponse.data) {
                    updatePayload.status = getAIStatus(aiResponse.data.anomalyLevel);
                    updatePayload.aiAnalysis = {
                        anomalyLevel: aiResponse.data.anomalyLevel,
                        explanation: aiResponse.data.explanation,
                        alertTriggered: aiResponse.data.alertTriggered,
                        analyzedAt: new Date().toISOString()
                    };
                } else {
                   updatePayload.status = getAIStatus(0); // Default to stable if AI fails
                }
                await updateDoc(patientDocRef, updatePayload);
             }

          } catch (error) {
            console.error("Failed to process sensor data:", error);
          } finally {
            setTimeout(() => { isProcessing.current = false; }, 1000); // Prevent rapid-fire processing
          }
        }
      },
      (error) => {
        console.error('Error loading sensor data from RTDB:', error);
      }
    );

    return () => unsubscribe();
  }, [id, user, firestore, patientDocRef, sensorHistory]);


  // ---------- 4) Loading / errors / 404 ----------
  const isStillLoading = isUserLoading || isLoadingPatient;

  if (isStillLoading) {
    return (
      <DashboardLayout>
        <main className="p-4 sm:px-6 sm:py-0 md:gap-8 space-y-4">
          <div className="flex items-center gap-4">
            <Skeleton className="h-16 w-16 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-8 w-48" />
              <Skeleton className="h-4 w-32" />
            </div>
          </div>
          <div className="grid flex-1 items-start gap-4 md:gap-8 lg:grid-cols-3 xl:grid-cols-3">
            <div className="grid auto-rows-max items-start gap-4 md:gap-8 lg:col-span-2">
              <div className="grid gap-4 md:grid-cols-2">
                <Skeleton className="h-40 rounded-xl" />
                <Skeleton className="h-40 rounded-xl" />
                <Skeleton className="h-40 rounded-xl" />
                <Skeleton className="h-40 rounded-xl" />
              </div>
              <Skeleton className="h-96 rounded-xl" />
            </div>
            <div className="grid auto-rows-max items-start gap-4 md:gap-8">
              <Skeleton className="h-48 rounded-xl" />
              <Skeleton className="h-64 rounded-xl" />
            </div>
          </div>
        </main>
      </DashboardLayout>
    );
  }

  // After loading, if there's no user, an id, a ref, OR a patient, it's a 404.
  if (!patient && patientDocRef) {
    notFound();
  }

  // This should only happen if the user is not authenticated for this patient.
  if (!patient) {
     return (
      <DashboardLayout>
        <main className="min-h-screen flex items-center justify-center">
          <div className="border rounded-xl p-6 text-center text-sm">
            <h2 className="font-bold text-lg mb-2">Access Denied</h2>
            <p className="text-muted-foreground">You may not have permission to view this patient's records.</p>
          </div>
        </main>
      </DashboardLayout>
    );
  }

  if (patientError) {
    return (
      <DashboardLayout>
        <main className="min-h-screen flex items-center justify-center">
          <div className="border rounded-xl p-6 text-sm text-red-600 max-w-md">
            <p className="font-semibold mb-1">Error</p>
            <p>{patientError.message}</p>
          </div>
        </main>
      </DashboardLayout>
    );
  }
  
  // ---------- 5) Page layout ----------
  return (
    <DashboardLayout>
      <main className="p-4 sm:px-6 sm:py-0 md:gap-8 space-y-4">
        <PatientHeader patient={patient} />
        <div className="grid flex-1 items-start gap-4 md:gap-8 lg:grid-cols-3 xl:grid-cols-3">
          <div className="grid auto-rows-max items-start gap-4 md:gap-8 lg:col-span-2">
            <VitalsMonitor latestSensorData={patient.latestSensorData} sensorHistory={sensorHistory} />
            <SensorHistory sensorHistory={sensorHistory} isLoading={isLoadingHistory} />
          </div>
          <div className="grid auto-rows-max items-start gap-4 md:gap-8">
            <AIAnalysisCard patient={patient} />
            <PatientInfoCard patient={patient} />
          </div>
        </div>
      </main>
    </DashboardLayout>
  );
}
