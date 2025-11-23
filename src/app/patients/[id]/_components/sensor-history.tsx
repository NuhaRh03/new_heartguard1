'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import type { PatientStatus, SensorData } from "@/lib/types";
import { formatDistanceToNow } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { getPatientStatusFromSensorData } from "@/lib/types";

interface SensorHistoryProps {
  sensorHistory: SensorData[] | null;
  isLoading: boolean;
}

export function SensorHistory({ sensorHistory, isLoading }: SensorHistoryProps) {
  type Status = PatientStatus["level"]; // "stable" | "warning" | "critical" | "unknown"

  const getStatusLabel = (status: Status) => {
    if (status === "critical") return "Critical";
    if (status === "warning") return "Warning";
    if (status === "stable") return "Stable";
    return "No Data";
  };

  const formatTimestamp = (ts: any) => {
    try {
      if (!ts) return "N/A";
      const date =
        typeof ts === "string"
          ? new Date(ts)
          : typeof ts.toDate === "function"
          ? ts.toDate()
          : new Date(ts);
      return formatDistanceToNow(date, { addSuffix: true });
    } catch {
      return "N/A";
    }
  };

  const sortedHistory =
    sensorHistory
      ?.slice()
      .sort((a, b) => {
        const ta = new Date(a.timestamp as any).getTime();
        const tb = new Date(b.timestamp as any).getTime();
        return tb - ta;
      }) ?? [];

  return (
    <Card className="rounded-xl">
      <CardHeader>
        <CardTitle>Recent Sensor History</CardTitle>
        <CardDescription>
          A log of the last 10 sensor readings for this patient.
        </CardDescription>
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
            {isLoading &&
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell>
                    <Skeleton className="h-4 w-32" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-6 w-20 rounded-full" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-16" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-16" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-16" />
                  </TableCell>
                </TableRow>
              ))}

            {!isLoading &&
              sortedHistory.map((reading) => {
                // statut calculé à partir des données
                const computedStatus = getPatientStatusFromSensorData(reading) as Status;

                // si tu as stocké un champ "status" dans Firestore, on le priorise
                const status: Status =
                  ((reading as any).status as Status | undefined) ??
                  computedStatus ??
                  "unknown";

                return (
                  <TableRow
                    key={
                      (reading as any).id ||
                      String(reading.timestamp) ||
                      JSON.stringify(reading)
                    }
                  >
                    <TableCell>{formatTimestamp(reading.timestamp)}</TableCell>

                    <TableCell>
                      <Badge
                        variant={
                          status === "critical"
                            ? "destructive"
                            : status === "warning"
                            ? "secondary"
                            : "default"
                        }
                        className={
                          status === "stable"
                            ? "bg-accent text-accent-foreground"
                            : status === "warning"
                            ? "bg-yellow-500 text-white"
                            : ""
                        }
                      >
                        {getStatusLabel(status)}
                      </Badge>
                    </TableCell>

                    <TableCell>
                      {reading.heartRate != null
                        ? `${reading.heartRate.toFixed(0)} bpm`
                        : "—"}
                    </TableCell>

                    <TableCell>
                      {reading.patientTemperature != null
                        ? `${reading.patientTemperature.toFixed(1)} °C`
                        : "—"}
                    </TableCell>

                    <TableCell>
                      {reading.o2Saturation != null
                        ? `${reading.o2Saturation.toFixed(1)} %`
                        : "—"}
                    </TableCell>
                  </TableRow>
                );
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
  );
}
