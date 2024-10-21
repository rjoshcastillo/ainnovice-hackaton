// src/predict.js

import * as tf from "@tensorflow/tfjs-node";
import { oneHotEncode } from "../utils/encoder.js";
import { category } from "../utils/dataset.js";
import path from "path";

/* Load Traige Model */
async function loadModel() {
  const modelPath = path.join(process.cwd(), "src", "models", "time_estimate");
  const model = await tf.loadLayersModel(`file://${modelPath}/model.json`);
  return model;
}

async function preprocessInput(input) {
  const csv_dataset = "src/data/patient_checkup_estimate.csv";
  const appointment_time_category = await category(
    "appointment_time",
    csv_dataset
  );
  const reason_for_visit_category = await category(
    "reason_for_visit",
    csv_dataset
  );

  const day_of_week_category = await category("day_of_week", csv_dataset);

  const numericFeatures = [Number(input.age), input.gender === "M" ? 1 : 0];

  const appointment_time_category_encoded = oneHotEncode(
    input.appointment_time,
    appointment_time_category
  );

  const reason_for_visit_category_encoded = oneHotEncode(
    input.reason_for_visit,
    reason_for_visit_category
  );
  const day_of_week_category_encoded = oneHotEncode(
    input.day_of_week,
    day_of_week_category
  );
  return [
    ...numericFeatures,
    ///...appointment_time_category_encoded,
    ...reason_for_visit_category_encoded,
    ...day_of_week_category_encoded,
  ];
}

export async function predictEstimate(userInput) {
  const model = await loadModel();

  const inputData = await preprocessInput(userInput);
  const inputTensor = tf.tensor2d([inputData]);

  const prediction = model.predict(inputTensor);

  const urgency = prediction.dataSync()[0];

  return urgency;
}

/* Dummy input */
const userInput = {
  age: 30,
  gender: "M",
  reason_for_visit: "Medication review",
  day_of_week: "Monday"
};

// predictEstimate(userInput).then((urgency) => {
//   if (urgency !== null) {
//     console.log(`Predicted Time Estimate: ${urgency}`);
//   } else {
//     console.log("Failed to predict Time Estimate due to input issues.");
//   }
// });
