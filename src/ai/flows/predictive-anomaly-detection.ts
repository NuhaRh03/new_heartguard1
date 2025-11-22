'use server';
/**nn
 * @fileOverview Uses a generative AI tool to learn patterns of physiological data, proactively recognize when a patient's condition could be starting to deteriorate, and generate alerts if the anomaly level rises above a set level.
 *
 * - predictiveAnomalyDetection - A function that handles the anomaly detection process.
 * - PredictiveAnomalyDetectionInput - The input type for the predictiveAnomalyDetection function.
 * - PredictiveAnomalyDetectionOutput - The return type for the predictiveAnomalyDetection function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const PredictiveAnomalyDetectionInputSchema = z.object({
  patientId: z.string().describe('The ID of the patient.'),
  sensorData: z.array(
    z.object({
      timestamp: z.string().describe('The timestamp of the sensor reading.'),
      heartRate: z.number().describe('The heart rate of the patient in beats per minute.'),
      o2Saturation: z.number().describe('The O2 saturation of the patient in percent.'),
      roomTemperature: z.number().describe('The room temperature in Celsius.'),
      patientTemperature: z.number().describe('The patient temperature in Celsius.'),
      roomHumidity: z.number().describe('The room humidity in percent.'),
    })
  ).describe('An array of sensor data for the patient.'),
  alertThreshold: z.number().describe('The threshold for anomaly level to trigger an alert.'),
});
export type PredictiveAnomalyDetectionInput = z.infer<typeof PredictiveAnomalyDetectionInputSchema>;

const PredictiveAnomalyDetectionOutputSchema = z.object({
  anomalyLevel: z.number().describe('The anomaly level detected in the sensor data on a scale of 0-10.'),
  alertTriggered: z.boolean().describe('Whether an alert was triggered based on the anomaly level and threshold.'),
  explanation: z.string().describe('An explanation of why the anomaly level was detected.'),
});
export type PredictiveAnomalyDetectionOutput = z.infer<typeof PredictiveAnomalyDetectionOutputSchema>;

export async function predictiveAnomalyDetection(input: PredictiveAnomalyDetectionInput): Promise<PredictiveAnomalyDetectionOutput> {
  return predictiveAnomalyDetectionFlow(input);
}

const prompt = ai.definePrompt({
  name: 'predictiveAnomalyDetectionPrompt',
  input: {schema: PredictiveAnomalyDetectionInputSchema},
  output: {schema: PredictiveAnomalyDetectionOutputSchema},
  prompt: `You are an AI assistant trained to function like a RandomForestClassifier for patient vital signs. Your task is to analyze time-series sensor data and classify the patient's condition.

  Analyze the provided sensor data for patient {{patientId}}. Based on the patterns, classify the risk and determine an "anomaly level" from 0 (no risk) to 10 (critical risk).

  Key features to consider for classification are:
  - Heart Rate: Normal is 60-100 bpm. Deviations are significant.
  - Patient Temperature: Normal is 36.5-37.5°C. High fever is a critical indicator.
  - O2 Saturation: Normal is 95-100%. Anything below 95% is a concern, below 90% is critical.

  Sensor Data History:
  {{#each sensorData}}
  - Timestamp: {{timestamp}}, Heart Rate: {{heartRate}} bpm, Patient Temp: {{patientTemperature}}°C, O₂ Saturation: {{o2Saturation}}%
  {{/each}}

  Your output should be based on a holistic analysis of these features. If the anomaly level meets or exceeds the alert threshold of {{alertThreshold}}, set alertTriggered to true.

  Provide a very brief, one-sentence explanation for your classification, referencing the most important feature that influenced the result.
  `,
});

const predictiveAnomalyDetectionFlow = ai.defineFlow(
  {
    name: 'predictiveAnomalyDetectionFlow',
    inputSchema: PredictiveAnomalyDetectionInputSchema,
    outputSchema: PredictiveAnomalyDetectionOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
