'use client';

import { useParams, notFound } from 'next/navigation';
import { doc, updateDoc, serverTimestamp, addDoc, collection, query, orderBy, limit } from 'firebase/firestore';
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


  // ---------- 3) Loading / errors / 404 ----------
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
  
  // ---------- 4) Page layout ----------
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
