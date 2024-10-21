// src/predict.js

import * as tf from "@tensorflow/tfjs-node";
import { oneHotEncode } from "../utils/encoder.js";
import { category } from "../utils/dataset.js";
import path from "path";

/* Load Traige Model */
async function loadModel() {
  const modelPath = path.join(process.cwd(), "src", "models", "triage_model");
  const model = await tf.loadLayersModel(`file://${modelPath}/model.json`);
  return model;
}

async function preprocessInput(input) {
  const csv_dataset = "src/data/patient_historical_data.csv";
  const medical_concern_categories = await category(
    "medical_concern",
    csv_dataset
  );
  const pain_part_categories = await category("pain_part", csv_dataset);
  const pain_level_categories = await category("pain_level", csv_dataset);
  const alcohol_consumption_categories = await category(
    "alcohol_consumption",
    csv_dataset
  );
  const symptoms_categories = await category("symptoms", csv_dataset);

  /* Split each string and flatten the array */
  const split_symptoms = symptoms_categories.flatMap((symptom) =>
    symptom.split(",").map((s) => s.trim())
  );
  /* Get unique symptoms */
  const unique_symptoms = [...new Set(split_symptoms)];

  const numericFeatures = [
    Number(input.age),
    input.gender === "M" ? 1 : 0,
    input.employed === "Yes" ? 1 : 0,
    input.smoking === "Yes" ? 1 : 0,
    Number(input.height),
    Number(input.weight),
    input.breathing_trouble === "Yes" ? 1 : 0,
    Number(input.temperature),
  ];

  const medical_concern_ecoded = oneHotEncode(
    input.medical_concern,
    medical_concern_categories
  );
  const body_part_encoded = oneHotEncode(input.pain_part, pain_part_categories);
  const alcohol_consumption_encoded = oneHotEncode(
    input.alcohol_consumption,
    alcohol_consumption_categories
  );
  const pain_level_encoded = oneHotEncode(
    input.pain_level,
    pain_level_categories
  );
  const symptoms_encoded = oneHotEncode(input.symptoms, unique_symptoms);

  return [
    ...numericFeatures,
    ...medical_concern_ecoded,
    ...body_part_encoded,
    ...pain_level_encoded,
    ...alcohol_consumption_encoded,
    ...symptoms_encoded,
  ];
}

export async function predictUrgency(patientInput) {
  const model = await loadModel();

  const inputData = await preprocessInput(patientInput);
  const inputTensor = tf.tensor2d([inputData]);

  const prediction = model.predict(inputTensor);

  const urgency = prediction.dataSync()[0];

  return urgency;
}

/* Dummy input */
const patientInput = {
  age: 90,
  gender: "F",
  employed: "No",
  alcohol_consumption: "Moderate",
  smoking: "Yes",
  height: 176,
  weight: 71,
  breathing_trouble: "No",
  pain_level: 9,
  pain_part: "Shoulder",
  medical_concern: "Asthma",
  symptoms: "Headache",
  temperature: 36.5,
};


//  predictUrgency(patientInput).then((urgency) => {
//     if (urgency !== null) {
//         console.log(`Predicted urgency: ${urgency}`);
//     } else {
//         console.log("Failed to predict urgency due to input issues.");
//     }
//    });

