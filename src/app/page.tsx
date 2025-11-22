
'use client';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import Link from "next/link";
import { PlusCircle } from "lucide-react";
import { Patient, getPatientStatusAppearance } from "@/lib/types";
import { useUser, useFirestore, useCollection, useMemoFirebase } from "@/firebase";
import { collection, query, where } from "firebase/firestore";
import { DashboardLayout } from "@/components/dashboard-layout";
import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardPage() {
  const firestore = useFirestore();
  const { user, isUserLoading } = useUser();

  const patientsQuery = useMemoFirebase(() => {
    if (user && firestore) {
      return query(collection(firestore, 'patients'), where('createdBy', '==', user.uid));
    }
    return null;
  }, [user, firestore]);
  
  const { data: patients, isLoading: isLoadingPatients } = useCollection<Patient>(patientsQuery);

  const isLoading = isUserLoading || isLoadingPatients;

  const calculateAge = (birthDate: string) => {
    if (!birthDate) return NaN;
    const birth = new Date(birthDate);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  return (
    <DashboardLayout>
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <div className="flex items-center justify-between space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Patient Dashboard</h1>
          <Button asChild>
            <Link href="/patients/new">
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Patient
            </Link>
          </Button>
        </div>
        <Card className="rounded-xl">
          <CardHeader>
            <CardTitle>My Patients</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Patient</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="hidden lg:table-cell">Heart Rate</TableHead>
                  <TableHead className="hidden lg:table-cell">O₂ Sat.</TableHead>
                  <TableHead className="hidden md:table-cell">Patient Temp</TableHead>
                  <TableHead className="hidden xl:table-cell">Room Temp</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading && Array.from({ length: 4 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Skeleton className="h-10 w-10 rounded-full" />
                        <Skeleton className="h-4 w-32" />
                      </div>
                    </TableCell>
                    <TableCell><Skeleton className="h-6 w-20 rounded-full" /></TableCell>
                    <TableCell className="hidden lg:table-cell"><Skeleton className="h-4 w-16" /></TableCell>
                    <TableCell className="hidden lg:table-cell"><Skeleton className="h-4 w-16" /></TableCell>
                    <TableCell className="hidden md:table-cell"><Skeleton className="h-4 w-16" /></TableCell>
                    <TableCell className="hidden xl:table-cell"><Skeleton className="h-4 w-16" /></TableCell>
                    <TableCell className="text-right"><Button variant="ghost" size="sm" disabled>View</Button></TableCell>
                  </TableRow>
                ))}
                {!isLoading && patients?.map((patient) => {
                  const latestReading = patient.latestSensorData;
                  const status = getPatientStatusAppearance(patient.status);
                  
                  return (
                    <TableRow key={patient.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarFallback>
                              {patient.name
                                ? patient.name
                                    .split(" ")
                                    .map((n) => n[0])
                                    .join("")
                                : 'P'}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium">{patient.name}</div>
                            <div className="text-sm text-muted-foreground hidden md:inline">
                               {calculateAge(patient.birthDate)} yrs &bull; {patient.gender}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            status.level === "critical"
                              ? "destructive"
                              : status.level === "warning"
                              ? "secondary"
                              : "default"
                          }
                          className={status.level === "stable" ? "bg-accent text-accent-foreground" : status.level === 'warning' ? 'bg-yellow-500 text-white' : ''}
                        >
                          {status.label}
                        </Badge>
                      </TableCell>
                      <TableCell className="hidden lg:table-cell">
                        {latestReading?.heartRate ? `${latestReading.heartRate.toFixed(0)} bpm` : 'N/A'}
                      </TableCell>
                       <TableCell className="hidden lg:table-cell">
                        {latestReading?.o2Saturation ? `${latestReading.o2Saturation.toFixed(1)} %` : 'N/A'}
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        {latestReading?.patientTemperature ? `${latestReading.patientTemperature.toFixed(1)} °C` : 'N"A'}
                      </TableCell>
                      <TableCell className="hidden xl:table-cell">
                        {latestReading?.roomTemperature ? `${latestReading.roomTemperature.toFixed(1)} °C` : 'N/A'}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button asChild variant="link">
                          <Link href={`/patients/${patient.id}`}>Open</Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
             {!isLoading && patients?.length === 0 && (
              <div className="text-center py-12 text-muted-foreground">
                <h3 className="text-lg font-semibold">No Patients Found</h3>
                <p className="text-sm">Click "Add Patient" to get started.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
