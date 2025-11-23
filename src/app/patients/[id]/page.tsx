
'use client';

import { useParams, notFound } from 'next/navigation';
import { doc, updateDoc, serverTimestamp, addDoc, collection, query, orderBy, limit } from 'firebase/firestore';
import {
  useDoc,
  useFirestore,
  useMemoFirebase,
  useUser,
  useCollection,
  useDatabase,
} from '@/firebase';
import { getAIStatus, type Patient, type SensorData } from '@/lib/types';
import { PatientInfoCard } from './_components/patient-info-card';
import { DashboardLayout } from '@/components/dashboard-layout';
import { VitalsMonitor } from './_components/vitals-monitor';
import { SensorHistory } from './_components/sensor-history';
import { AIAnalysisCard } from './_components/ai-analysis-card';
import { PatientHeader } from './_components/patient-header';
import { useEffect, useRef, useState } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { runAnomalyDetection } from './actions';
import { onValue, ref as dbRef } from 'firebase/database';
import { useToast } from '@/hooks/use-toast';

export default function PatientPage() {
  const params = useParams() as any;
  const id = typeof params?.id === 'string' ? params.id : Array.isArray(params?.id) ? params.id[0] : undefined;

  const firestore = useFirestore();
  const database = useDatabase();
  const { user, isUserLoading } = useUser();
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);
  const lastProcessedTimestamp = useRef<string | null>(null);

  // ---------- 1) Patient from Firestore ----------
  const patientDocRef = useMemoFirebase(() => {
    if (!firestore || !id || isUserLoading) return null;
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

  // ---------- 3) Listen for new encrypted data from RTDB ----------
  useEffect(() => {
    if (!database || !patientDocRef) return;

    const sensorDataRef = dbRef(database, '/sensors/ESP32_01');
    const unsubscribe = onValue(sensorDataRef, async (snapshot) => {
      const data = snapshot.val();
      if (!data) return;

      const latestKey = Object.keys(data).pop();
      if (!latestKey) return;
      
      const encryptedBase64 = data[latestKey];
      if (typeof encryptedBase64 !== 'string') return;
      
      try {
        setIsProcessing(true);
        const decryptResponse = await fetch('/api/decrypt', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ data: encryptedBase64 }),
        });

        if (!decryptResponse.ok) {
          const { error, details } = await decryptResponse.json();
          throw new Error(details || error || 'Decryption failed');
        }

        const newSensorData: Omit<SensorData, 'id'> = await decryptResponse.json();
        
        // Prevent processing the same reading multiple times
        if (newSensorData.timestamp === lastProcessedTimestamp.current) {
            return;
        }
        lastProcessedTimestamp.current = newSensorData.timestamp;

        // Run AI Analysis
        const aiInput = {
          patientId: patientDocRef.id,
          sensorData: [newSensorData, ...(sensorHistory || [])].slice(0, 10).map(d => ({...d, timestamp: new Date(d.timestamp).toISOString()})),
          alertThreshold: 7,
        };

        const aiResult = await runAnomalyDetection(aiInput);

        if (!aiResult.success) {
            throw new Error(aiResult.error || 'AI analysis failed');
        }
        
        const newStatus = getAIStatus(aiResult.data.anomalyLevel);

        // Update Firestore
        await Promise.all([
          addDoc(collection(patientDocRef, 'sensorData'), newSensorData),
          updateDoc(patientDocRef, {
            latestSensorData: newSensorData,
            status: newStatus,
            lastReadingAt: new Date().toISOString(),
            aiAnalysis: { ...aiResult.data, analyzedAt: new Date().toISOString() },
          }),
        ]);

        toast({
          title: 'New Sensor Reading',
          description: `Received new data for ${patient?.name}. Status: ${newStatus}`,
        });

      } catch (error: any) {
        console.error('Failed to process sensor data:', error);
        toast({
          variant: 'destructive',
          title: 'Processing Error',
          description: error.message || 'Could not process new sensor data.',
        });
      } finally {
        setIsProcessing(false);
      }
    });

    return () => unsubscribe();
  }, [database, patientDocRef, sensorHistory, toast, patient?.name]);


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

