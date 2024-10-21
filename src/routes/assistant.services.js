import express from "express";
import { getBasicResponse } from "../controllers/assistant/basic_response.js";
import { getRelatedMedicalField } from "../controllers/assistant/getRelatedField.js";

const router = express.Router();

router.get("/", async (req, res) => {
  res.send("Hello World!");
});

router.post("/basic", async (req, res) => {
  try {
    const payload = req.body;
    await getBasicResponse(payload).then((result) => {
      if (result !== null) {
        res.send(`message: ${result}`);
      } else {
        res.send("Failed to load message");
      }
    });
  } catch (error) {}
});
/// match medical field base on issue of the patient
router.post("/generalMedicalNeed", async (req, res) => {
  try {
    const payload = req.body;
    await getRelatedMedicalField(payload).then((result) => {
      if (result !== null) {
          res.send({
            result : result
        });
      } else {
        res.send("Failed to load message");
      }
    });
  } catch (error) {}
});
export default router;
