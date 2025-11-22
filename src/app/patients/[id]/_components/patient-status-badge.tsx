
import { Badge } from "@/components/ui/badge";
import { getPatientStatusAppearance, type Patient } from "@/lib/types";

interface PatientStatusBadgeProps {
  status: Patient['status'];
}

export function PatientStatusBadge({ status }: PatientStatusBadgeProps) {
  const statusInfo = getPatientStatusAppearance(status);

  return (
    <Badge
      variant={
        statusInfo.level === "critical"
          ? "destructive"
          : statusInfo.level === "warning"
          ? "secondary"
          : "default"
      }
      className={
        statusInfo.level === "stable"
          ? "bg-accent text-accent-foreground"
          : statusInfo.level === "warning"
          ? "bg-yellow-500 text-white"
          : ""
      }
    >
      {statusInfo.label}
    </Badge>
  );
}
