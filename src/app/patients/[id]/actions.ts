"use server";
import {
  predictiveAnomalyDetection,
  type PredictiveAnomalyDetectionInput,
} from "@/ai/flows/predictive-anomaly-detection";

export async function runAnomalyDetection(
  input: PredictiveAnomalyDetectionInput
) {
  try {
    const result = await predictiveAnomalyDetection(input);
    return { success: true, data: result };
  } catch (error) {
    console.error("Anomaly detection failed:", error);
    if (error instanceof Error) {
        return { success: false, error: error.message };
    }
    return { success: false, error: "An unknown error occurred during AI analysis." };
  }
}
