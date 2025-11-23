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
  const lastProcessedKey = useRef<string | null>(null);

  // ---------- 3) Sensor data from Realtime Database ----------
  useEffect(() => {
    if (!id || !user || !firestore) return; // Wait for patient ID and authenticated user

    const db = getDatabase();
    // Listen to the specific device path for encrypted data
    const streamRef = ref(db, `/sensors/ESP32_01`);

    const unsubscribe = onValue(
      streamRef,
      async (snapshot) => {
        if (snapshot.exists() && !isProcessing.current) {
          isProcessing.current = true;
          try {
            const readings = snapshot.val();
            const lastKey = Object.keys(readings).pop();

            if (!lastKey || lastKey === lastProcessedKey.current) {
                 isProcessing.current = false;
                 return;
            }
            lastProcessedKey.current = lastKey;

            const encryptedData = readings[lastKey];
            
            // Call the decryption API
            const decryptResponse = await fetch('/api/decrypt', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ data: encryptedData }),
            });

            if (!decryptResponse.ok) {
                throw new Error(`Decryption failed: ${await decryptResponse.text()}`);
            }

            const decryptedReading = await decryptResponse.json();
            
             const newReading: Omit<SensorData, 'id'> = {
                timestamp: decryptedReading.timestamp || new Date().toISOString(),
                heartRate: decryptedReading.BPM,
                patientTemperature: decryptedReading.TempDS,
                roomTemperature: decryptedReading.TempDHT,
                roomHumidity: decryptedReading.Hum,
                o2Saturation: decryptedReading.o2Saturation,
                collectedBy: decryptedReading.collectedBy,
            };
            
            const readingsCollectionRef = collection(firestore, 'patients', id, 'sensorData');
            await addDoc(readingsCollectionRef, {
                ...newReading,
                timestamp: serverTimestamp() 
            });

            const allReadings = [newReading, ...(sensorHistory || []).map(s => ({...s, timestamp: new Date(s.timestamp).toISOString()}))].slice(0, 20);

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
            
             if (patientDocRef) {
                const updatePayload: Partial<Patient> = {
                    latestSensorData: newReading,
                    lastReadingAt: new Date().toISOString(),
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
                   updatePayload.status = getAIStatus(0);
                }
                await updateDoc(patientDocRef, updatePayload);
             }

          } catch (error) {
            console.error("Failed to process sensor data:", error);
          } finally {
            setTimeout(() => { isProcessing.current = false; }, 1000);
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

  if (!patient && patientDocRef) {
    notFound();
  }

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
