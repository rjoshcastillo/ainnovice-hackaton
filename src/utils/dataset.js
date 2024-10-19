import { readCSV, readCSVUniqueData } from "./csv-helper.js";

export async function loadDataset() {
  return new Promise((resolve, reject) => {
    const dataset = [];
    readCSV("src/data/patient_historical_data.csv", (patientsData) => {
      dataset.push(...patientsData);
      resolve(dataset);
    });
  });
}

export function category(category) {
  return new Promise((resolve, reject) => {
    const dataset = [];
    readCSVUniqueData(
      "src/data/patient_historical_data.csv",
      category,
      (data) => {
        dataset.push(...data);
        resolve(dataset);
      }
    );
  });
}
