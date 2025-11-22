'use client';
import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { useUser, useFirestore } from "@/firebase";
import { collection, addDoc } from "firebase/firestore";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DashboardLayout } from "@/components/dashboard-layout";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Patient } from "@/lib/types";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";


const patientSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters."),
  email: z.string().email("Invalid email address.").optional().or(z.literal('')),
  phone: z.string().optional(),
  birthDate: z.string().refine((val) => !isNaN(Date.parse(val)), { message: "Invalid date format."}),
  gender: z.enum(["Male", "Female", "Other"]),
  emergencyContactName: z.string().min(2, "Name is required"),
  emergencyContactRelationship: z.string().min(2, "Relationship is required"),
  emergencyContactPhone: z.string().min(10, "Enter a valid phone number."),
  historicalDiseases: z.string().optional(),
  currentMedications: z.string().optional(),
});

type PatientFormData = z.infer<typeof patientSchema>;

export default function AddPatientPage() {
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();
  const firestore = useFirestore();
  const { user: doctor } = useUser();
  const router = useRouter();

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<PatientFormData>({
    resolver: zodResolver(patientSchema),
    defaultValues: {
      name: "Maria Garcia",
      birthDate: "1988-05-20",
      gender: "Female",
      email: "maria.garcia@example.com",
      phone: "555-0102",
      emergencyContactName: "Carlos Garcia",
      emergencyContactRelationship: "Husband",
      emergencyContactPhone: "+212600123456",
      historicalDiseases: "Hypertension",
      currentMedications: "Amlodipine"
    }
  });

  const onSubmit = (data: PatientFormData) => {
    if (!doctor) {
        toast({ variant: "destructive", title: "Authentication Error", description: "You must be logged in to add a patient."});
        return;
    }

    startTransition(async () => {
        const patientData: Omit<Patient, 'id'> = {
            name: data.name,
            email: data.email,
            phone: data.phone,
            birthDate: data.birthDate,
            gender: data.gender,
            emergencyContact: {
              name: data.emergencyContactName,
              relationship: data.emergencyContactRelationship,
              phone: data.emergencyContactPhone
            },
            historicalDiseases: data.historicalDiseases ? data.historicalDiseases.split(',').map(s => s.trim()).filter(Boolean) : [],
            currentMedications: data.currentMedications ? data.currentMedications.split(',').map(s => s.trim()).filter(Boolean) : [],
            createdBy: doctor.uid,
            status: 'unknown',
            createdAt: new Date().toISOString(),
            lastReadingAt: new Date().toISOString(),
            latestSensorData: {
              timestamp: new Date().toISOString(),
              heartRate: 0,
              o2Saturation: 0,
              roomHumidity: 0,
              roomTemperature: 0,
              patientTemperature: 0,
              collectedBy: 'system-init',
            }
        };

        const patientsCollection = collection(firestore, 'patients');
        await addDoc(patientsCollection, patientData);
        
        toast({
            title: "Patient Added",
            description: `${data.name} has been added to your patient list.`,
        });

        router.push('/');
    });
  };

  return (
    <DashboardLayout>
        <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
             <div className="flex items-center gap-4">
                <Button variant="outline" size="icon" asChild>
                    <Link href="/">
                        <ArrowLeft className="h-4 w-4" />
                    </Link>
                </Button>
                <h1 className="text-3xl font-bold tracking-tight">Add New Patient</h1>
            </div>
            <Card className="max-w-4xl">
                <CardHeader>
                    <CardTitle>Patient Details</CardTitle>
                    <CardDescription>Enter the details for the new patient below. Default values are provided for demonstration.</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit(onSubmit)} className="grid gap-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">Full Name</Label>
                                <Input id="name" {...register("name")} placeholder="e.g. John Doe" />
                                {errors.name && <p className="text-destructive text-sm mt-1">{errors.name.message}</p>}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="email">Email Address</Label>
                                <Input id="email" {...register("email")} placeholder="e.g. john.doe@example.com" />
                                {errors.email && <p className="text-destructive text-sm mt-1">{errors.email.message}</p>}
                            </div>
                             <div className="space-y-2">
                                <Label htmlFor="phone">Phone Number</Label>
                                <Input id="phone" {...register("phone")} placeholder="e.g. 555-0101" />
                                {errors.phone && <p className="text-destructive text-sm mt-1">{errors.phone.message}</p>}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="birthDate">Date of Birth</Label>
                                <Input id="birthDate" type="date" {...register("birthDate")} />
                                {errors.birthDate && <p className="text-destructive text-sm mt-1">{errors.birthDate.message}</p>}
                            </div>
                             <div className="space-y-2">
                                <Label htmlFor="gender">Gender</Label>
                                <Controller
                                  control={control}
                                  name="gender"
                                  render={({ field }) => (
                                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <SelectTrigger id="gender">
                                            <SelectValue placeholder="Select gender" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Male">Male</SelectItem>
                                            <SelectItem value="Female">Female</SelectItem>
                                            <SelectItem value="Other">Other</SelectItem>
                                        </SelectContent>
                                      </Select>
                                  )}
                                />
                                {errors.gender && <p className="text-destructive text-sm mt-1">{errors.gender.message}</p>}
                            </div>
                        </div>
                        
                        <div className="space-y-4 rounded-lg border p-4">
                            <h3 className="font-medium">Emergency Contact</h3>
                             <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="emergencyContactName">Full Name</Label>
                                    <Input id="emergencyContactName" {...register("emergencyContactName")} />
                                    {errors.emergencyContactName && <p className="text-destructive text-sm mt-1">{errors.emergencyContactName.message}</p>}
                                </div>
                                 <div className="space-y-2">
                                    <Label htmlFor="emergencyContactRelationship">Relationship</Label>
                                    <Input id="emergencyContactRelationship" {...register("emergencyContactRelationship")} />
                                    {errors.emergencyContactRelationship && <p className="text-destructive text-sm mt-1">{errors.emergencyContactRelationship.message}</p>}
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="emergencyContactPhone">Phone</Label>
                                    <Input id="emergencyContactPhone" {...register("emergencyContactPhone")} />
                                    {errors.emergencyContactPhone && <p className="text-destructive text-sm mt-1">{errors.emergencyContactPhone.message}</p>}
                                </div>
                            </div>
                        </div>


                        <div className="space-y-2">
                            <Label htmlFor="historicalDiseases">Historical Diseases (comma-separated)</Label>
                            <Textarea id="historicalDiseases" {...register("historicalDiseases")} placeholder="e.g., Diabetes, Asthma" />
                            {errors.historicalDiseases && <p className="text-destructive text-sm mt-1">{errors.historicalDiseases.message}</p>}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="currentMedications">Current Medications (comma-separated)</Label>
                            <Textarea id="currentMedications" {...register("currentMedications")} placeholder="e.g., Metformin, Lisinopril" />
                            {errors.currentMedications && <p className="text-destructive text-sm mt-1">{errors.currentMedications.message}</p>}
                        </div>
                        <div className="flex justify-end">
                            <Button type="submit" disabled={isPending}>
                                {isPending ? 'Adding Patient...' : 'Add Patient'}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    </DashboardLayout>
  );
}
