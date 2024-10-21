// src/trainModel.js

import * as tf from "@tensorflow/tfjs-node";
import { oneHotEncode } from "../../utils/encoder.js";
import { category, loadDataset } from "../../utils/dataset.js";
import fs from "fs";
import path from "path";

/* Model for Traige */
function createModel(inputShape) {
  const model = tf.sequential();
  model.add(
    tf.layers.dense({ units: 64, activation: "relu", inputShape: [inputShape] })
  );
  model.add(tf.layers.dropout({ rate: 0.2 })); // Add dropout to prevent overfitting
  model.add(tf.layers.dense({ units: 32, activation: "relu" }));
  model.add(tf.layers.dense({ units: 1, activation: "linear" })); // Predict urgency level (1-10)

  model.compile({
    optimizer: tf.train.adam(0.001), // Adjust the learning rate if necessary
    loss: "meanSquaredError", // Use mean squared error for regression
    metrics: ["mae"], // Mean absolute error
  });
  return model;
}

async function prepareInputs(dataset) {
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

  return dataset.map((item) => {
    const numericFeatures = [Number(item.age), item.gender === "M" ? 1 : 0];

    const appointment_time_category_encoded = oneHotEncode(
      item.appointment_time,
      appointment_time_category
    );

    const reason_for_visit_category_encoded = oneHotEncode(
      item.reason_for_visit,
      reason_for_visit_category
    );
    const day_of_week_category_encoded = oneHotEncode(
      item.day_of_week,
      day_of_week_category
    );

    return {
      input: [
        ...numericFeatures,
        ///...appointment_time_category_encoded,
        ...reason_for_visit_category_encoded,
        ...day_of_week_category_encoded,
      ],
      label: Number(item.actual_duration),
    };
  });
}

async function trainModel() {
  const dataset = await loadDataset("src/data/patient_checkup_estimate.csv");

  const preparedData = await prepareInputs(dataset);
  const inputs = preparedData.map((d) => d.input);
  const labels = preparedData.map((d) => d.label);

  const xs = tf.tensor2d(inputs);
  const ys = tf.tensor2d(labels, [labels.length, 1]);

  console.log(`Input shape: ${xs.shape}`);
  console.log(`Output shape: ${ys.shape}`);

  const hasInvalidData =
    inputs.some((input) => !input.every(isFinite)) ||
    labels.some((label) => !isFinite(label));

  if (hasInvalidData) {
    preparedData.forEach((data, index) => {
      const { input, label } = data;
      if (!input.every(isFinite) || !isFinite(label)) {
        console.log(`Invalid data at index ${index}:`, data);
      }
    });
    return;
  }

  const model = createModel(xs.shape[1]);
  const history = await model.fit(xs, ys, {
    epochs: 100,
    validationSplit: 0.2,
    callbacks: {
      earlyStopping: {
        monitor: "val_loss",
        patience: 10, // Stop if no improvement for 10 epochs
        restoreBestWeights: true,
      },
      onEpochEnd: (epoch, logs) => {
        console.log(`Epoch ${epoch}: Loss = ${logs.loss}, MAE = ${logs.mae}`);
      },
    },
  });

  // Model save path
  const modelSavePath = path.join(
    process.cwd(),
    "src",
    "models",
    "time_estimate"
  );

  // Check the directory exists
  if (!fs.existsSync(path.dirname(modelSavePath))) {
    fs.mkdirSync(path.dirname(modelSavePath), { recursive: true });
  }

  // Save the model using the correct URL format
  try {
    await model.save(`file://${modelSavePath}`);
    console.log(`Model saved to ${modelSavePath}`);
  } catch (error) {
    console.error(`Error saving model: ${error.message}`);
  }
}

// Start the training process
trainModel();
