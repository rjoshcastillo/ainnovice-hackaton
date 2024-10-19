import express from "express";
import triageServices from "./src/routes/triage.services.js";
import db from "./src/config/db.config.js";

const app = express();
const port = 5000;

const endpoint = "/api";
const triage = `${endpoint}/triage`;

db.connect((err) => {
  if (err) {
    console.error("Error connecting to MySQL:", err);
    return;
  }
  console.log("Connected to MySQL");
});

/* Middleware to Parse JSON Body */
app.use(express.json());

/* Please all services here */
app.use(triage, triageServices);

app.listen(port, () => {
  console.log(`listening on port ${port}`);
});
