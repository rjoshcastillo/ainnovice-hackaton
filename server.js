import express from "express";
<<<<<<< HEAD
import triageServices from "./src/routes/triage.services.js";
import assistantServices from "./src/routes/assistant.services.js";
=======
import machineLearning from "./src/routes/ml.services.js";
import accountServices from "./src/routes/account.services.js";
import appointmentServices from "./src/routes/appointment.services.js";

>>>>>>> f5e4334c1793858a00a40c9f0267b3938cd22547
import db from "./src/config/db.config.js";
import cors from "cors";

const app = express();
const port = 5000;

const endpoint = "/api";
<<<<<<< HEAD
const triage = `${endpoint}/triage`;
const assistant = `${endpoint}/assistant`;
=======
const ml = `${endpoint}/ml`;
const account = `${endpoint}/account`;
const appointment = `${endpoint}/appointment`;
>>>>>>> f5e4334c1793858a00a40c9f0267b3938cd22547

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
<<<<<<< HEAD
app.use(triage, triageServices);
app.use(assistant, assistantServices);
=======
app.use(ml, machineLearning);
app.use(account, accountServices);
app.use(appointment, appointmentServices);
>>>>>>> f5e4334c1793858a00a40c9f0267b3938cd22547

app.listen(port, () => {
  console.log(`listening on port ${port}`);
});
