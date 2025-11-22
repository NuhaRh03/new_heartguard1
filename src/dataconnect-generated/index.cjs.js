const { queryRef, executeQuery, mutationRef, executeMutation, validateArgs } = require('firebase/data-connect');

const connectorConfig = {
  connector: 'example',
  service: 'newheartguard',
  location: 'us-east1'
};
exports.connectorConfig = connectorConfig;

const seedDataRef = (dc) => {
  const { dc: dcInstance} = validateArgs(connectorConfig, dc, undefined);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'SeedData');
}
seedDataRef.operationName = 'SeedData';
exports.seedDataRef = seedDataRef;

exports.seedData = function seedData(dc) {
  return executeMutation(seedDataRef(dc));
};

const listPatientVitalsRef = (dc) => {
  const { dc: dcInstance} = validateArgs(connectorConfig, dc, undefined);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'ListPatientVitals');
}
listPatientVitalsRef.operationName = 'ListPatientVitals';
exports.listPatientVitalsRef = listPatientVitalsRef;

exports.listPatientVitals = function listPatientVitals(dc) {
  return executeQuery(listPatientVitalsRef(dc));
};

const createNewPatientRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'CreateNewPatient', inputVars);
}
createNewPatientRef.operationName = 'CreateNewPatient';
exports.createNewPatientRef = createNewPatientRef;

exports.createNewPatient = function createNewPatient(dcOrVars, vars) {
  return executeMutation(createNewPatientRef(dcOrVars, vars));
};

const getDoctorPatientsRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'GetDoctorPatients', inputVars);
}
getDoctorPatientsRef.operationName = 'GetDoctorPatients';
exports.getDoctorPatientsRef = getDoctorPatientsRef;

exports.getDoctorPatients = function getDoctorPatients(dcOrVars, vars) {
  return executeQuery(getDoctorPatientsRef(dcOrVars, vars));
};
