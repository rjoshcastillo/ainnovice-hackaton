import express from "express";
import { predictUrgency } from "../controllers/triage.controller.js";
import { predictEstimate } from "../controllers/time_estimate.controller.js";

const router = express.Router();

router.get("/", async (req, res) => {
  res.send("Hello World!");
});

router.post("/urgency", async (req, res) => {
  try {
    const payload = req.body;
    await predictUrgency(payload).then((urgency) => {
      if (urgency !== null) {
        res.send(`Predicted urgency: ${urgency}`);
      } else {
        res.send("Failed to predict urgency due to input issues.");
      }
    });
  } catch (error) {}
});

router.post("/time-estimate", async (req, res) => {
  try {
    const payload = req.body;
    await predictEstimate(payload).then((result) => {
      if (result !== null) {
        res.send(`Predicted time estimate: ${result}`);
      } else {
        res.send("Failed to predict result due to input issues.");
      }
    });
  } catch (error) {}
});
export default router;
