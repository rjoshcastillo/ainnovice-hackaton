import express from "express";
import db from "../config/db.config.js";
const router = express.Router();

router.get("/", async (req, res) => {
  res.send("Appointment Services!");
});

router.post("/save", async (req, res) => {
  const payload = req.body;

  try {
    const query = `
      INSERT INTO appointments 
      (account_id, alcohol_consumption, smoking, height, weight,
       breathing_trouble, pain_level, pain_part, medical_concern, symptoms, temperature,appointment_date, urgency)  
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    db.query(
      query,
      [
        payload.account_id,
        payload.alcohol_consumption,
        payload.smoking,
        payload.height,
        payload.weight,
        payload.breathing_trouble,
        payload.pain_level,
        payload.pain_part,
        payload.medical_concern,
        payload.symptoms,
        payload.temperature,
        payload.appointment_date,
        payload.urgency,
      ],
      (error, results) => {
        if (error)
          return res.status(500).send({
            status: false,
            message: `Failed saving appointment ${error}`,
          });
        res.status(201).send({
          status: true,
          message: `Appointment saved with priority score of ${payload.urgency}`,
        });
      }
    );
  } catch (error) {
    return res.status(500).send({
      status: false,
      message: "Failed to fetch data from external API",
    });
  }
});




router.post("/available-doctor", async (req, res) => {
  const payload = req.body;

  try {
    //get doctor id
    //get available dates and time based on duration

    res.status(201).send({
      status: true,
      message: `Ongoing Development`,
    });


  } catch (error) {
    return res.status(500).send({
      status: false,
      message: "Failed to fetch data from external API",
    });
  }
});

router.post("/appointment-settler", async (req, res) => {
  const payload = req.body;

  try {
    //get doctor id
    //get patient id
    //set status active
    //date
    //time
    //priorityop

    res.status(201).send({
      status: true,
      message: `Ongoing Development`,
    });

  } catch (error) {
    return res.status(500).send({
      status: false,
      message: "Failed to fetch data from external API",
    });
  }
});

router.post("/cancel", async (req, res) => {
  const payload = req.body;

  try {
    //MAKE THE APPOINTMENT in CANCEL STATUS
    //INITIATE ANOTHER APOINTMENTS BASED ON PRIORITY.
    res.status(201).send({
      status: true,
      message: `Ongoing Development`,
    });
  } catch (error) {
    return res.status(500).send({
      status: false,
      message: "Failed to fetch data from external API",
    });
  }
});

export default router;
