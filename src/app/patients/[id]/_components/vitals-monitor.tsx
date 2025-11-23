
'use client';

import type { SensorData } from '@/lib/types';
import { VitalCard } from './vital-card';
import { Thermometer, Droplets, HeartPulse, Wind } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { format } from 'date-fns';

interface VitalsMonitorProps {
  latestSensorData: Omit<SensorData, 'id'> | undefined;
  sensorHistory: SensorData[] | null;
}

export function VitalsMonitor({
  latestSensorData,
  sensorHistory,
}: VitalsMonitorProps) {
  if (!latestSensorData) {
    return (
      <Card className="rounded-xl">
        <CardHeader>
          <CardTitle>Live Vitals</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12 text-muted-foreground">
            No sensor data available.
          </div>
        </CardContent>
      </Card>
    );
  }

  // Chart data for the main heart rate chart, formatted for display
  const heartRateHistory = (sensorHistory || [])
    .map((d) => ({
      ...d,
      timestamp: format(new Date(d.timestamp), 'HH:mm'), // Format timestamp for X-axis
    }))
    .slice(-20); // Use last 20 readings for a clean chart

  // Simplified chart data for other cards (e.g., last 5 readings)
  const recentHistory = (sensorHistory || []).slice(-5);


  return (
    <div className="grid gap-4 md:grid-cols-2">
      <VitalCard
        title="Heart Rate"
        value={latestSensorData.heartRate}
        unit="bpm"
        Icon={HeartPulse}
        data={heartRateHistory}
        dataKey="heartRate"
        color="hsl(var(--chart-1))"
        normalRange={[60, 100]}
        showXAxis={true} // Explicitly show the X-axis for this chart
      />
      <VitalCard
        title="O2 Saturation"
        value={latestSensorData.o2Saturation ?? 0}
        unit="%"
        Icon={Wind}
        data={recentHistory}
        dataKey="o2Saturation"
        color="hsl(var(--primary))"
        normalRange={[95, 100]}
      />
      <VitalCard
        title="Patient Temperature"
        value={latestSensorData.patientTemperature}
        unit="°C"
        Icon={Thermometer}
        data={recentHistory}
        dataKey="patientTemperature"
        color="hsl(var(--chart-3))"
        normalRange={[36.5, 37.5]}
      />
      <VitalCard
        title="Room Humidity"
        value={latestSensorData.roomHumidity}
        unit="%"
        Icon={Droplets}
        data={recentHistory}
        dataKey="roomHumidity"
        color="hsl(var(--chart-4))"
        normalRange={[30, 60]}
      />
    </div>
  );
}
