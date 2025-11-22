

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { getPatientStatusAppearance, type Patient } from "@/lib/types";
import { useEffect, useState } from "react";

interface PatientHeaderProps {
  patient: Patient;
}

function calculateAge(birthDate: string): number {
  if (!birthDate) return 0;
  const date = new Date(birthDate);
  const today = new Date();
  let age = today.getFullYear() - date.getFullYear();
  const m = today.getMonth() - date.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < date.getDate())) {
    age--;
  }
  return age;
}

export function PatientHeader({ patient }: PatientHeaderProps) {
  const status = getPatientStatusAppearance(patient.status);
  const [age, setAge] = useState<number | null>(null);

  useEffect(() => {
    if (patient.birthDate) {
      setAge(calculateAge(patient.birthDate));
    }
  }, [patient.birthDate]);
  
  return (
    <div className="flex items-center gap-4">
      <Avatar className="h-16 w-16">
        <AvatarFallback className="text-2xl">
          {patient.name ? patient.name.split(" ").map((n) => n[0]).join("") : 'P'}
        </AvatarFallback>
      </Avatar>
      <div>
        <h1 className="text-2xl md:text-3xl font-bold">{patient.name}</h1>
        <div className="flex items-center gap-2 text-muted-foreground">
          {age !== null ? <span>{age} years old</span> : <span>...</span>}
          <span>&bull;</span>
          <span>{patient.gender}</span>
           <span>&bull;</span>
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
        </div>
      </div>
    </div>
  );
}
