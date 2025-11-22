'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import type { SensorData } from "@/lib/types";
import { formatDistanceToNow } from 'date-fns';
import { Badge } from "@/components/ui/badge";
import { getPatientStatusFromSensorData } from "@/lib/types";

interface SensorHistoryProps {
    sensorHistory: SensorData[] | null;
    isLoading: boolean;
}

export function SensorHistory({ sensorHistory, isLoading }: SensorHistoryProps) {
    
    const getStatusLabel = (status: 'stable' | 'warning' | 'critical') => {
        if (status === 'critical') return 'Critical';
        if (status === 'warning') return 'Warning';
        return 'Stable';
    }

    return (
        <Card className="rounded-xl">
            <CardHeader>
                <CardTitle>Recent Sensor History</CardTitle>
                <CardDescription>A log of the last 10 sensor readings for this patient.</CardDescription>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Timestamp</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Heart Rate</TableHead>
                            <TableHead>Patient Temp</TableHead>
                            <TableHead>O₂ Saturation</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading && Array.from({length: 5}).map((_, i) => (
                            <TableRow key={i}>
                                <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                                <TableCell><Skeleton className="h-6 w-20 rounded-full" /></TableCell>
                                <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                                <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                                <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                            </TableRow>
                        ))}
                        {!isLoading && sensorHistory?.map(reading => {
                            const status = getPatientStatusFromSensorData(reading);
                             return (
                                <TableRow key={reading.id}>
                                    <TableCell>{formatDistanceToNow(new Date(reading.timestamp), { addSuffix: true })}</TableCell>
                                    <TableCell>
                                        <Badge
                                          variant={
                                            status === "critical" ? "destructive" : status === "warning" ? "secondary" : "default"
                                          }
                                          className={status === "stable" ? "bg-accent text-accent-foreground" : status === 'warning' ? 'bg-yellow-500 text-white' : ''}
                                        >
                                          {getStatusLabel(status)}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>{reading.heartRate.toFixed(0)} bpm</TableCell>
                                    <TableCell>{reading.patientTemperature.toFixed(1)} °C</TableCell>
                                    <TableCell>{reading.o2Saturation.toFixed(1)} %</TableCell>
                                </TableRow>
                            )
                        })}
                    </TableBody>
                </Table>
                {!isLoading && (!sensorHistory || sensorHistory.length === 0) && (
                    <div className="text-center py-12 text-muted-foreground">
                        <p>No historical sensor data found.</p>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
