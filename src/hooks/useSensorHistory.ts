'use client';

import { useState, useEffect } from 'react';
import {
  collection,
  query,
  orderBy,
  limit,
  onSnapshot,
  Timestamp,
} from 'firebase/firestore';
import { useFirestore, useMemoFirebase } from '@/firebase';
import type { SensorData } from '@/lib/types';

interface UseSensorHistoryResult {
  sensorHistory: SensorData[] | null;
  isLoading: boolean;
  error: Error | null;
}

export function useSensorHistory(patientId: string | undefined): UseSensorHistoryResult {
  const [sensorHistory, setSensorHistory] = useState<SensorData[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const firestore = useFirestore();

  const sensorHistoryQuery = useMemoFirebase(() => {
    if (!firestore || !patientId) return null;
    return query(
      collection(firestore, `patients/${patientId}/sensorData`),
      orderBy('timestamp', 'desc'),
      limit(10)
    );
  }, [firestore, patientId]);

  useEffect(() => {
    if (!sensorHistoryQuery) {
      setIsLoading(false);
      setSensorHistory([]);
      return;
    }

    setIsLoading(true);

    const unsubscribe = onSnapshot(
      sensorHistoryQuery,
      (snapshot) => {
        const history: SensorData[] = snapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            timestamp: data.timestamp, // Keep original format for sorting/display
            heartRate: data.heartRate ?? null,
            patientTemperature: data.patientTemperature ?? null,
            o2Saturation: data.o2Saturation ?? null,
            roomHumidity: data.roomHumidity ?? null,
            roomTemperature: data.roomTemperature ?? null,
            collectedBy: data.collectedBy ?? 'unknown',
            status: data.status ?? 'unknown',
          } as SensorData;
        });
        setSensorHistory(history);
        setError(null);
        setIsLoading(false);
      },
      (err) => {
        console.error("Error fetching sensor history:", err);
        setError(err);
        setSensorHistory([]);
        setIsLoading(false);
      }
    );

    return () => unsubscribe();
  }, [sensorHistoryQuery]);

  return { sensorHistory, isLoading, error };
}
