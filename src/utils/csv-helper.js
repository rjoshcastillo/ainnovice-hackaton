import fs from "fs";
import csv from "csv-parser";

// Function to read CSV files
export function readCSV(filePath, callback) {
  const results = [];
  fs.createReadStream(filePath)
    .pipe(csv())
    .on("data", (data) => results.push(data))
    .on("end", () => {
      callback(results);
    });
}
export function readCSVUniqueData(filePath, key, callback) {
  const uniqueKey = new Set();

  fs.createReadStream(filePath)
    .pipe(csv())
    .on("data", (data) => {
      // Ensure the specified key exists and is not empty
      if (data[key]) {
        uniqueKey.add(data[key].trim()); // Add the trimmed value to the set
      }
    })
    .on("end", () => {
      callback(Array.from(uniqueKey)); // Convert the Set to an array and pass it to the callback
    })
    .on("error", (error) => {
      console.error("Error reading CSV file:", error);
      callback([]); // Return an empty array in case of error
    });
}
