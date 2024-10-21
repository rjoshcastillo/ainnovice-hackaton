import { readCSV, readCSVUniqueData } from "./csv-helper.js";

export async function loadDataset(datasets) {
  return new Promise((resolve, reject) => {
    const output = [];
    readCSV(datasets, (patientsData) => {
      output.push(...patientsData);
      resolve(output);
    });
  });
}

export function category(category, datasets) {
  return new Promise((resolve, reject) => {
    const output = [];
    readCSVUniqueData(datasets,
      category,
      (data) => {
        output.push(...data);
        resolve(output);
      }
    );
  });
}
