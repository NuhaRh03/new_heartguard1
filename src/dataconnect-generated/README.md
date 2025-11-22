# Generated TypeScript README
This README will guide you through the process of using the generated JavaScript SDK package for the connector `example`. It will also provide examples on how to use your generated SDK to call your Data Connect queries and mutations.

**If you're looking for the `React README`, you can find it at [`dataconnect-generated/react/README.md`](./react/README.md)**

***NOTE:** This README is generated alongside the generated SDK. If you make changes to this file, they will be overwritten when the SDK is regenerated.*

# Table of Contents
- [**Overview**](#generated-javascript-readme)
- [**Accessing the connector**](#accessing-the-connector)
  - [*Connecting to the local Emulator*](#connecting-to-the-local-emulator)
- [**Queries**](#queries)
  - [*ListPatientVitals*](#listpatientvitals)
  - [*GetDoctorPatients*](#getdoctorpatients)
- [**Mutations**](#mutations)
  - [*SeedData*](#seeddata)
  - [*CreateNewPatient*](#createnewpatient)

# Accessing the connector
A connector is a collection of Queries and Mutations. One SDK is generated for each connector - this SDK is generated for the connector `example`. You can find more information about connectors in the [Data Connect documentation](https://firebase.google.com/docs/data-connect#how-does).

You can use this generated SDK by importing from the package `@dataconnect/generated` as shown below. Both CommonJS and ESM imports are supported.

You can also follow the instructions from the [Data Connect documentation](https://firebase.google.com/docs/data-connect/web-sdk#set-client).

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig } from '@dataconnect/generated';

const dataConnect = getDataConnect(connectorConfig);
```

## Connecting to the local Emulator
By default, the connector will connect to the production service.

To connect to the emulator, you can use the following code.
You can also follow the emulator instructions from the [Data Connect documentation](https://firebase.google.com/docs/data-connect/web-sdk#instrument-clients).

```typescript
import { connectDataConnectEmulator, getDataConnect } from 'firebase/data-connect';
import { connectorConfig } from '@dataconnect/generated';

const dataConnect = getDataConnect(connectorConfig);
connectDataConnectEmulator(dataConnect, 'localhost', 9399);
```

After it's initialized, you can call your Data Connect [queries](#queries) and [mutations](#mutations) from your generated SDK.

# Queries

There are two ways to execute a Data Connect Query using the generated Web SDK:
- Using a Query Reference function, which returns a `QueryRef`
  - The `QueryRef` can be used as an argument to `executeQuery()`, which will execute the Query and return a `QueryPromise`
- Using an action shortcut function, which returns a `QueryPromise`
  - Calling the action shortcut function will execute the Query and return a `QueryPromise`

The following is true for both the action shortcut function and the `QueryRef` function:
- The `QueryPromise` returned will resolve to the result of the Query once it has finished executing
- If the Query accepts arguments, both the action shortcut function and the `QueryRef` function accept a single argument: an object that contains all the required variables (and the optional variables) for the Query
- Both functions can be called with or without passing in a `DataConnect` instance as an argument. If no `DataConnect` argument is passed in, then the generated SDK will call `getDataConnect(connectorConfig)` behind the scenes for you.

Below are examples of how to use the `example` connector's generated functions to execute each query. You can also follow the examples from the [Data Connect documentation](https://firebase.google.com/docs/data-connect/web-sdk#using-queries).

## ListPatientVitals
You can execute the `ListPatientVitals` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
listPatientVitals(): QueryPromise<ListPatientVitalsData, undefined>;

interface ListPatientVitalsRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<ListPatientVitalsData, undefined>;
}
export const listPatientVitalsRef: ListPatientVitalsRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
listPatientVitals(dc: DataConnect): QueryPromise<ListPatientVitalsData, undefined>;

interface ListPatientVitalsRef {
  ...
  (dc: DataConnect): QueryRef<ListPatientVitalsData, undefined>;
}
export const listPatientVitalsRef: ListPatientVitalsRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the listPatientVitalsRef:
```typescript
const name = listPatientVitalsRef.operationName;
console.log(name);
```

### Variables
The `ListPatientVitals` query has no variables.
### Return Type
Recall that executing the `ListPatientVitals` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `ListPatientVitalsData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
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
```
### Using `ListPatientVitals`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, listPatientVitals } from '@dataconnect/generated';


// Call the `listPatientVitals()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await listPatientVitals();

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await listPatientVitals(dataConnect);

console.log(data.patientVitalsDatas);

// Or, you can use the `Promise` API.
listPatientVitals().then((response) => {
  const data = response.data;
  console.log(data.patientVitalsDatas);
});
```

### Using `ListPatientVitals`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, listPatientVitalsRef } from '@dataconnect/generated';


// Call the `listPatientVitalsRef()` function to get a reference to the query.
const ref = listPatientVitalsRef();

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = listPatientVitalsRef(dataConnect);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.patientVitalsDatas);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.patientVitalsDatas);
});
```

## GetDoctorPatients
You can execute the `GetDoctorPatients` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
getDoctorPatients(vars: GetDoctorPatientsVariables): QueryPromise<GetDoctorPatientsData, GetDoctorPatientsVariables>;

interface GetDoctorPatientsRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: GetDoctorPatientsVariables): QueryRef<GetDoctorPatientsData, GetDoctorPatientsVariables>;
}
export const getDoctorPatientsRef: GetDoctorPatientsRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
getDoctorPatients(dc: DataConnect, vars: GetDoctorPatientsVariables): QueryPromise<GetDoctorPatientsData, GetDoctorPatientsVariables>;

interface GetDoctorPatientsRef {
  ...
  (dc: DataConnect, vars: GetDoctorPatientsVariables): QueryRef<GetDoctorPatientsData, GetDoctorPatientsVariables>;
}
export const getDoctorPatientsRef: GetDoctorPatientsRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the getDoctorPatientsRef:
```typescript
const name = getDoctorPatientsRef.operationName;
console.log(name);
```

### Variables
The `GetDoctorPatients` query requires an argument of type `GetDoctorPatientsVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface GetDoctorPatientsVariables {
  doctorId: UUIDString;
}
```
### Return Type
Recall that executing the `GetDoctorPatients` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `GetDoctorPatientsData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
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
```
### Using `GetDoctorPatients`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, getDoctorPatients, GetDoctorPatientsVariables } from '@dataconnect/generated';

// The `GetDoctorPatients` query requires an argument of type `GetDoctorPatientsVariables`:
const getDoctorPatientsVars: GetDoctorPatientsVariables = {
  doctorId: ..., 
};

// Call the `getDoctorPatients()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await getDoctorPatients(getDoctorPatientsVars);
// Variables can be defined inline as well.
const { data } = await getDoctorPatients({ doctorId: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await getDoctorPatients(dataConnect, getDoctorPatientsVars);

console.log(data.doctor);

// Or, you can use the `Promise` API.
getDoctorPatients(getDoctorPatientsVars).then((response) => {
  const data = response.data;
  console.log(data.doctor);
});
```

### Using `GetDoctorPatients`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, getDoctorPatientsRef, GetDoctorPatientsVariables } from '@dataconnect/generated';

// The `GetDoctorPatients` query requires an argument of type `GetDoctorPatientsVariables`:
const getDoctorPatientsVars: GetDoctorPatientsVariables = {
  doctorId: ..., 
};

// Call the `getDoctorPatientsRef()` function to get a reference to the query.
const ref = getDoctorPatientsRef(getDoctorPatientsVars);
// Variables can be defined inline as well.
const ref = getDoctorPatientsRef({ doctorId: ..., });

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = getDoctorPatientsRef(dataConnect, getDoctorPatientsVars);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.doctor);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.doctor);
});
```

# Mutations

There are two ways to execute a Data Connect Mutation using the generated Web SDK:
- Using a Mutation Reference function, which returns a `MutationRef`
  - The `MutationRef` can be used as an argument to `executeMutation()`, which will execute the Mutation and return a `MutationPromise`
- Using an action shortcut function, which returns a `MutationPromise`
  - Calling the action shortcut function will execute the Mutation and return a `MutationPromise`

The following is true for both the action shortcut function and the `MutationRef` function:
- The `MutationPromise` returned will resolve to the result of the Mutation once it has finished executing
- If the Mutation accepts arguments, both the action shortcut function and the `MutationRef` function accept a single argument: an object that contains all the required variables (and the optional variables) for the Mutation
- Both functions can be called with or without passing in a `DataConnect` instance as an argument. If no `DataConnect` argument is passed in, then the generated SDK will call `getDataConnect(connectorConfig)` behind the scenes for you.

Below are examples of how to use the `example` connector's generated functions to execute each mutation. You can also follow the examples from the [Data Connect documentation](https://firebase.google.com/docs/data-connect/web-sdk#using-mutations).

## SeedData
You can execute the `SeedData` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
seedData(): MutationPromise<SeedDataData, undefined>;

interface SeedDataRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (): MutationRef<SeedDataData, undefined>;
}
export const seedDataRef: SeedDataRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
seedData(dc: DataConnect): MutationPromise<SeedDataData, undefined>;

interface SeedDataRef {
  ...
  (dc: DataConnect): MutationRef<SeedDataData, undefined>;
}
export const seedDataRef: SeedDataRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the seedDataRef:
```typescript
const name = seedDataRef.operationName;
console.log(name);
```

### Variables
The `SeedData` mutation has no variables.
### Return Type
Recall that executing the `SeedData` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `SeedDataData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface SeedDataData {
  doctor_insertMany: Doctor_Key[];
  patient_insertMany: Patient_Key[];
  sensor_insertMany: Sensor_Key[];
  patientVitalsData_insertMany: PatientVitalsData_Key[];
  roomEnvironmentData_insertMany: RoomEnvironmentData_Key[];
}
```
### Using `SeedData`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, seedData } from '@dataconnect/generated';


// Call the `seedData()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await seedData();

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await seedData(dataConnect);

console.log(data.doctor_insertMany);
console.log(data.patient_insertMany);
console.log(data.sensor_insertMany);
console.log(data.patientVitalsData_insertMany);
console.log(data.roomEnvironmentData_insertMany);

// Or, you can use the `Promise` API.
seedData().then((response) => {
  const data = response.data;
  console.log(data.doctor_insertMany);
  console.log(data.patient_insertMany);
  console.log(data.sensor_insertMany);
  console.log(data.patientVitalsData_insertMany);
  console.log(data.roomEnvironmentData_insertMany);
});
```

### Using `SeedData`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, seedDataRef } from '@dataconnect/generated';


// Call the `seedDataRef()` function to get a reference to the mutation.
const ref = seedDataRef();

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = seedDataRef(dataConnect);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.doctor_insertMany);
console.log(data.patient_insertMany);
console.log(data.sensor_insertMany);
console.log(data.patientVitalsData_insertMany);
console.log(data.roomEnvironmentData_insertMany);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.doctor_insertMany);
  console.log(data.patient_insertMany);
  console.log(data.sensor_insertMany);
  console.log(data.patientVitalsData_insertMany);
  console.log(data.roomEnvironmentData_insertMany);
});
```

## CreateNewPatient
You can execute the `CreateNewPatient` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
createNewPatient(vars: CreateNewPatientVariables): MutationPromise<CreateNewPatientData, CreateNewPatientVariables>;

interface CreateNewPatientRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: CreateNewPatientVariables): MutationRef<CreateNewPatientData, CreateNewPatientVariables>;
}
export const createNewPatientRef: CreateNewPatientRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
createNewPatient(dc: DataConnect, vars: CreateNewPatientVariables): MutationPromise<CreateNewPatientData, CreateNewPatientVariables>;

interface CreateNewPatientRef {
  ...
  (dc: DataConnect, vars: CreateNewPatientVariables): MutationRef<CreateNewPatientData, CreateNewPatientVariables>;
}
export const createNewPatientRef: CreateNewPatientRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the createNewPatientRef:
```typescript
const name = createNewPatientRef.operationName;
console.log(name);
```

### Variables
The `CreateNewPatient` mutation requires an argument of type `CreateNewPatientVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface CreateNewPatientVariables {
  name: string;
  age: number;
  doctorId: UUIDString;
}
```
### Return Type
Recall that executing the `CreateNewPatient` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `CreateNewPatientData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface CreateNewPatientData {
  patient_insert: Patient_Key;
}
```
### Using `CreateNewPatient`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, createNewPatient, CreateNewPatientVariables } from '@dataconnect/generated';

// The `CreateNewPatient` mutation requires an argument of type `CreateNewPatientVariables`:
const createNewPatientVars: CreateNewPatientVariables = {
  name: ..., 
  age: ..., 
  doctorId: ..., 
};

// Call the `createNewPatient()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await createNewPatient(createNewPatientVars);
// Variables can be defined inline as well.
const { data } = await createNewPatient({ name: ..., age: ..., doctorId: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await createNewPatient(dataConnect, createNewPatientVars);

console.log(data.patient_insert);

// Or, you can use the `Promise` API.
createNewPatient(createNewPatientVars).then((response) => {
  const data = response.data;
  console.log(data.patient_insert);
});
```

### Using `CreateNewPatient`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, createNewPatientRef, CreateNewPatientVariables } from '@dataconnect/generated';

// The `CreateNewPatient` mutation requires an argument of type `CreateNewPatientVariables`:
const createNewPatientVars: CreateNewPatientVariables = {
  name: ..., 
  age: ..., 
  doctorId: ..., 
};

// Call the `createNewPatientRef()` function to get a reference to the mutation.
const ref = createNewPatientRef(createNewPatientVars);
// Variables can be defined inline as well.
const ref = createNewPatientRef({ name: ..., age: ..., doctorId: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = createNewPatientRef(dataConnect, createNewPatientVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.patient_insert);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.patient_insert);
});
```

