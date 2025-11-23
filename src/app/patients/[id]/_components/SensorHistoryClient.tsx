"use client";

import { SensorHistory } from "@/app/patients/[id]/_components/sensor-history";
import { useSensorHistory } from "@/hooks/useSensorHistory";

export default function SensorHistoryClient({ patientId }: { patientId: string }) {
  const { sensorHistory, isLoading } = useSensorHistory(patientId);
  return <SensorHistory sensorHistory={sensorHistory} isLoading={isLoading} />;
}
