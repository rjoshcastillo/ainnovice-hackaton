import express from "express";
import { predictUrgency } from "../controllers/triage.controller.js";

const router = express.Router();

router.get("/", async (req, res) => {
  res.send("Hello World!");
});

router.post("/predict", async (req, res) => {
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

export default router;
