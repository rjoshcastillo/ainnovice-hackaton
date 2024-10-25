import express from "express";
import db from "../config/db.config.js";
import { findAvailableSlots, getCurrentTime } from "../controllers/assistant/appointment.js";
const router = express.Router();

router.get("/", async (req, res) => {
  res.send("Appointment Services!");
});


// PARAMETERS
// {
//   "doctor_id":"7",
//   "appointment_date": "2024-10-23"
// }
router.post("/available-doctor", async (req, res) => {
  const payload = req.body;

  try {
    //Check if doctor is legit
    let getDoctors = "SELECT * FROM doctors d inner join doctor_operating_hours doh on doh.doctor_id = d.doctor_id WHERE d.doctor_id = ? AND doh.day = ?";

    db.query(getDoctors, [payload.doctor_id, payload.appointment_date], async (err, results) => {
      
      if (err) {
        return res.status(500).json({ message: "Server error", error: err });
      }

      if (results.length === 0) {
        return res
          .status(401)
          .json({ status: false, message: "The doctor does not exist." });
      }

      let getDoctorsAppointment =  `SELECT appointment_start as start,appointment_end as end FROM appointments where doctor_id = ? and appointment_date = ? and status != "Cancelled" `;
      
      db.query(getDoctorsAppointment, [payload.doctor_id, payload.appointment_date], async (err, results1) => {
        
        if (err) {
          return res.status(500).json({ message: "Server error", error: err });
        }
        if(results[0].limit != ""){ 
          if (results1.length == results[0].limit) {
            return res
              .status(401)
              .json({ status: false, message: "There's no open slot."});
          }
          else{
            const appointments = results1;
  
            const clinicStart = results[0].hours_start;
            const clinicEnd = results[0].hours_end;
            
            const availableSlots = await findAvailableSlots(appointments, clinicStart, clinicEnd, payload.preferredTime);
            
            res.status(200).json({
              status: true,
              message: results[0].name +" "+ results[0].specialty + " is available.",
              appointments: appointments,
              availableSlots: availableSlots,
            });
          }
        }

      });

      
      
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

  try{
      const query = `
      INSERT INTO appointments 
      (account_id, doctor_id, alcohol_consumption, smoking, height, weight,
       breathing_trouble, pain_level, pain_part, medical_concern, symptoms, temperature,appointment_date, appointment_start,appointment_end,urgency,status)  
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ? ,? ,?, ?)
    `;
    db.query(query,[
      payload.account_id,
      payload.doctor_id,
      payload.alcoholConsumption,
      payload.smoking,
      payload.height,
      payload.weight,
      payload.breathingTrouble,
      payload.painLevel,
      payload.painPart,
      payload.medicalConcern,
      payload.symptoms,
      payload.temperature,
      payload.appointment_date,
      payload.appointment_start,
      payload.appointment_end,
      payload.urgency,
      payload.status,
    ],(error, results) => {
      if (error)
        return res.status(500).send({
          status: false,
          message: `Failed saving appointment ${error}`,
        });
      res.status(201).send({
        status: true,
        message: `Appointment saved with priority score of ${payload.urgency}`,
        data: results
      });

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

    const query = `SELECT * FROM appointments where appointment_id = ?`;

    db.query(query, [payload.appointment_id], async(error, results) => {
      if(results.length > 0){
        //Cancelled the status
        const query = `UPDATE appointments SET status = "Cancelled" WHERE appointment_id  = ?`;

        db.query(query, [payload.appointment_id], async(error, results) => {
        
          if(results){
            const datetime= await getCurrentTime();

            const query = `SELECT * FROM appointments WHERE appointment_date = ? and appointment_start >= ? ORDER BY urgency ASC LIMIT 1`;

            db.query(query,[ payload.appointment_date, datetime], async(error, results) => {
              ////////////////////////////////
              //NOTIFY THE PATIENT IN RESULTS
              ////////////////////////////////
              res.status(201).send({
                status: true,
                message: `Appointment ${payload.appointment_id} is now cancelled.`,
                params1: datetime,
                params: results
              });
              
            });
          }
          else{
            return res.status(500).send({
              status: false,
              message: "Failed to fetch data from external API",
            });
          }
        });
      }

    })
    
  } catch (error) {
    return res.status(500).send({
      status: false,
      message: "Failed to fetch data from external API",
    });
  }
});


router.get("/get/:account_id", async (req, res) => {
  const accountId = req.params.account_id;
  try {
    const query = `
      SELECT 
    a.appointment_id,
    a.account_id,
    a.medical_concern, 
    a.status, 
    doc.name as doctor,
    doc.specialty, 
    a.appointment_date, 
    a.appointment_start,
    a.appointment_end
    FROM 
        appointments AS a
    JOIN 
        doctors AS doc ON a.doctor_id = doc.doctor_id
    WHERE a.account_id = ?`;

    db.query(query, [accountId], (err, result) => {
      if (err) {
        return res
          .status(500)
          .json({ status: false, message: "Error fetching appointments" });
      }

      res.status(200).send({
        status: true,
        data: result,
      });
    });
  } catch (error) {
    res.status(500).json({ status: false, message: "Server error" });
  }
});

export default router;
