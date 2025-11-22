import { ConnectorConfig, DataConnect, QueryRef, QueryPromise, MutationRef, MutationPromise } from 'firebase/data-connect';

export const connectorConfig: ConnectorConfig;

export type TimestampString = string;
export type UUIDString = string;
export type Int64String = string;
export type DateString = string;




export interface CreateNewPatientData {
  patient_insert: Patient_Key;
}

export interface CreateNewPatientVariables {
  name: string;
  age: number;
  doctorId: UUIDString;
}

export interface Doctor_Key {
  id: UUIDString;
  __typename?: 'Doctor_Key';
}

export interface GetDoctorPatientsData {
  doctor?: {
    name: string;
    speciality: string;
    patients_on_doctor: ({
      id: UUIDString;
      name: string;
      age: number;
      medicalHistory?: string | null;
    } & Patient_Key)[];
  };
}

export interface GetDoctorPatientsVariables {
  doctorId: UUIDString;
}

export interface ListPatientVitalsData {
  patientVitalsDatas: ({
    id: UUIDString;
    patient?: {
      name: string;
    };
      sensor?: {
        sensorType: string;
      };
        timestamp: TimestampString;
        value: number;
        unit: string;
        notes?: string | null;
  } & PatientVitalsData_Key)[];
}

export interface PatientVitalsData_Key {
  id: UUIDString;
  __typename?: 'PatientVitalsData_Key';
}

export interface Patient_Key {
  id: UUIDString;
  __typename?: 'Patient_Key';
}

export interface RoomEnvironmentData_Key {
  id: UUIDString;
  __typename?: 'RoomEnvironmentData_Key';
}

export interface SeedDataData {
  doctor_insertMany: Doctor_Key[];
  patient_insertMany: Patient_Key[];
  sensor_insertMany: Sensor_Key[];
  patientVitalsData_insertMany: PatientVitalsData_Key[];
  roomEnvironmentData_insertMany: RoomEnvironmentData_Key[];
}

export interface Sensor_Key {
  id: UUIDString;
  __typename?: 'Sensor_Key';
}

interface SeedDataRef {
  /* Allow users to create refs without passing in DataConnect */
  (): MutationRef<SeedDataData, undefined>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect): MutationRef<SeedDataData, undefined>;
  operationName: string;
}
export const seedDataRef: SeedDataRef;

export function seedData(): MutationPromise<SeedDataData, undefined>;
export function seedData(dc: DataConnect): MutationPromise<SeedDataData, undefined>;

interface ListPatientVitalsRef {
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<ListPatientVitalsData, undefined>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect): QueryRef<ListPatientVitalsData, undefined>;
  operationName: string;
}
export const listPatientVitalsRef: ListPatientVitalsRef;

export function listPatientVitals(): QueryPromise<ListPatientVitalsData, undefined>;
export function listPatientVitals(dc: DataConnect): QueryPromise<ListPatientVitalsData, undefined>;

interface CreateNewPatientRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: CreateNewPatientVariables): MutationRef<CreateNewPatientData, CreateNewPatientVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: CreateNewPatientVariables): MutationRef<CreateNewPatientData, CreateNewPatientVariables>;
  operationName: string;
}
export const createNewPatientRef: CreateNewPatientRef;

export function createNewPatient(vars: CreateNewPatientVariables): MutationPromise<CreateNewPatientData, CreateNewPatientVariables>;
export function createNewPatient(dc: DataConnect, vars: CreateNewPatientVariables): MutationPromise<CreateNewPatientData, CreateNewPatientVariables>;

interface GetDoctorPatientsRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: GetDoctorPatientsVariables): QueryRef<GetDoctorPatientsData, GetDoctorPatientsVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: GetDoctorPatientsVariables): QueryRef<GetDoctorPatientsData, GetDoctorPatientsVariables>;
  operationName: string;
}
export const getDoctorPatientsRef: GetDoctorPatientsRef;

export function getDoctorPatients(vars: GetDoctorPatientsVariables): QueryPromise<GetDoctorPatientsData, GetDoctorPatientsVariables>;
export function getDoctorPatients(dc: DataConnect, vars: GetDoctorPatientsVariables): QueryPromise<GetDoctorPatientsData, GetDoctorPatientsVariables>;

