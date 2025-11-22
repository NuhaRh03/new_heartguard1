
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { User, Phone, Mail, Stethoscope, Pill, ShieldAlert } from "lucide-react";
import type { Patient } from "@/lib/types";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";

interface PatientInfoCardProps {
  patient: Patient;
}

function InfoRow({ icon, label, value }: { icon: React.ReactNode, label: string, value: string | undefined | null }) {
  if (!value) return null;
  return (
    <div className="flex items-start gap-3">
      <div className="text-muted-foreground mt-1">{icon}</div>
      <div>
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-sm font-medium">{value}</p>
      </div>
    </div>
  );
}

export function PatientInfoCard({ patient }: PatientInfoCardProps) {
  return (
    <Card className="rounded-xl">
      <CardHeader>
        <CardTitle>Patient Information</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
            <h3 className="font-semibold flex items-center gap-2 text-sm">
                <User size={16} /> Contact Details
            </h3>
            <InfoRow
                icon={<Mail size={14} />}
                label="Email"
                value={patient.email}
            />
             <InfoRow
                icon={<Phone size={14} />}
                label="Phone"
                value={patient.phone}
            />
        </div>
        
        <Separator />
        
        <div className="space-y-3">
            <h3 className="font-semibold flex items-center gap-2 text-sm text-destructive">
                <ShieldAlert size={16} /> Emergency Contact
            </h3>
             <InfoRow
                icon={<User size={14} />}
                label="Name"
                value={patient.emergencyContact?.name}
            />
            <InfoRow
                icon={<Stethoscope size={14} />}
                label="Relationship"
                value={patient.emergencyContact?.relationship}
            />
             <InfoRow
                icon={<Phone size={14} />}
                label="Phone Number"
                value={patient.emergencyContact?.phone}
            />
        </div>

        <Separator />

        <div className="space-y-3">
            <h3 className="font-semibold flex items-center gap-2 text-sm">
                <Stethoscope size={16} /> Medical History
            </h3>
            <div className="flex flex-wrap gap-2">
              {patient.historicalDiseases?.length > 0 ? patient.historicalDiseases.map(disease => (
                <Badge key={disease} variant="secondary">{disease}</Badge>
              )) : <p className="text-xs text-muted-foreground">No historical diseases listed.</p>}
            </div>
        </div>

        <Separator />

        <div className="space-y-3">
            <h3 className="font-semibold flex items-center gap-2 text-sm">
                <Pill size={16} /> Current Medications
            </h3>
            <div className="flex flex-wrap gap-2">
              {patient.currentMedications?.length > 0 ? patient.currentMedications.map(med => (
                <Badge key={med} variant="secondary">{med}</Badge>
              )) : <p className="text-xs text-muted-foreground">No current medications listed.</p>}
            </div>
        </div>
      </CardContent>
    </Card>
  );
}
