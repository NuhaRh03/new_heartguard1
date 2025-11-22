import { queryRef, executeQuery, mutationRef, executeMutation, validateArgs } from 'firebase/data-connect';

export const connectorConfig = {
  connector: 'example',
  service: 'newheartguard',
  location: 'us-east1'
};

export const seedDataRef = (dc) => {
  const { dc: dcInstance} = validateArgs(connectorConfig, dc, undefined);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'SeedData');
}
seedDataRef.operationName = 'SeedData';

export function seedData(dc) {
  return executeMutation(seedDataRef(dc));
}

export const listPatientVitalsRef = (dc) => {
  const { dc: dcInstance} = validateArgs(connectorConfig, dc, undefined);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'ListPatientVitals');
}
listPatientVitalsRef.operationName = 'ListPatientVitals';

export function listPatientVitals(dc) {
  return executeQuery(listPatientVitalsRef(dc));
}

export const createNewPatientRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'CreateNewPatient', inputVars);
}
createNewPatientRef.operationName = 'CreateNewPatient';

export function createNewPatient(dcOrVars, vars) {
  return executeMutation(createNewPatientRef(dcOrVars, vars));
}

export const getDoctorPatientsRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'GetDoctorPatients', inputVars);
}
getDoctorPatientsRef.operationName = 'GetDoctorPatients';

export function getDoctorPatients(dcOrVars, vars) {
  return executeQuery(getDoctorPatientsRef(dcOrVars, vars));
}

