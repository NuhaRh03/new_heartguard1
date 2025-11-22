"use client";

import type { Patient } from "@/lib/types";
import { VitalCard } from "./vital-card";
import { Thermometer, Droplets, HeartPulse, Wind } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface VitalsMonitorProps {
  patient: Patient;
}

export function VitalsMonitor({ patient }: VitalsMonitorProps) {
  const currentData = patient.latestSensorData;

  if (!currentData) {
    return (
        <Card className="rounded-xl">
            <CardHeader>
                <CardTitle>Live Vitals</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="text-center py-12 text-muted-foreground">No sensor data available.</div>
            </CardContent>
        </Card>
    );
  }

  const chartData = [{ ...currentData, timestamp: patient.lastReadingAt || new Date().toISOString() }];

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <VitalCard
        title="Heart Rate"
        value={currentData.heartRate}
        unit="bpm"
        Icon={HeartPulse}
        data={chartData}
        dataKey="heartRate"
        color="hsl(var(--chart-1))"
        normalRange={[60, 100]}
      />
      <VitalCard
        title="O2 Saturation"
        value={currentData.o2Saturation ?? 0}
        unit="%"
        Icon={Wind}
        data={chartData}
        dataKey="o2Saturation"
        color="hsl(var(--chart-2))"
        normalRange={[95, 100]}
      />
      <VitalCard
        title="Patient Temperature"
        value={currentData.patientTemperature}
        unit="°C"
        Icon={Thermometer}
        data={chartData}
        dataKey="patientTemperature"
        color="hsl(var(--chart-3))"
        normalRange={[36.5, 37.5]}
      />
       <VitalCard
        title="Room Humidity"
        value={currentData.roomHumidity}
        unit="%"
        Icon={Droplets}
        data={chartData}
        dataKey="roomHumidity"
        color="hsl(var(--chart-4))"
        normalRange={[30, 60]}
      />
    </div>
  );
}
