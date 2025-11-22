import { SeedDataData, ListPatientVitalsData, CreateNewPatientData, CreateNewPatientVariables, GetDoctorPatientsData, GetDoctorPatientsVariables } from '../';
import { UseDataConnectQueryResult, useDataConnectQueryOptions, UseDataConnectMutationResult, useDataConnectMutationOptions} from '@tanstack-query-firebase/react/data-connect';
import { UseQueryResult, UseMutationResult} from '@tanstack/react-query';
import { DataConnect } from 'firebase/data-connect';
import { FirebaseError } from 'firebase/app';


export function useSeedData(options?: useDataConnectMutationOptions<SeedDataData, FirebaseError, void>): UseDataConnectMutationResult<SeedDataData, undefined>;
export function useSeedData(dc: DataConnect, options?: useDataConnectMutationOptions<SeedDataData, FirebaseError, void>): UseDataConnectMutationResult<SeedDataData, undefined>;

export function useListPatientVitals(options?: useDataConnectQueryOptions<ListPatientVitalsData>): UseDataConnectQueryResult<ListPatientVitalsData, undefined>;
export function useListPatientVitals(dc: DataConnect, options?: useDataConnectQueryOptions<ListPatientVitalsData>): UseDataConnectQueryResult<ListPatientVitalsData, undefined>;

export function useCreateNewPatient(options?: useDataConnectMutationOptions<CreateNewPatientData, FirebaseError, CreateNewPatientVariables>): UseDataConnectMutationResult<CreateNewPatientData, CreateNewPatientVariables>;
export function useCreateNewPatient(dc: DataConnect, options?: useDataConnectMutationOptions<CreateNewPatientData, FirebaseError, CreateNewPatientVariables>): UseDataConnectMutationResult<CreateNewPatientData, CreateNewPatientVariables>;

export function useGetDoctorPatients(vars: GetDoctorPatientsVariables, options?: useDataConnectQueryOptions<GetDoctorPatientsData>): UseDataConnectQueryResult<GetDoctorPatientsData, GetDoctorPatientsVariables>;
export function useGetDoctorPatients(dc: DataConnect, vars: GetDoctorPatientsVariables, options?: useDataConnectQueryOptions<GetDoctorPatientsData>): UseDataConnectQueryResult<GetDoctorPatientsData, GetDoctorPatientsVariables>;
