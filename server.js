import express from "express";
import machineLearning from "./src/routes/ml.services.js";
import accountServices from "./src/routes/account.services.js";
import appointmentServices from "./src/routes/appointment.services.js";

import db from "./src/config/db.config.js";
import cors from "cors";

const app = express();
const port = 5000;

const endpoint = "/api";
const ml = `${endpoint}/ml`;
const account = `${endpoint}/account`;
const appointment = `${endpoint}/appointment`;

app.use(cors());
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
app.use(ml, machineLearning);
app.use(account, accountServices);
app.use(appointment, appointmentServices);

app.listen(port, () => {
  console.log(`listening on port ${port}`);
});
