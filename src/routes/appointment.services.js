import express from "express";
import db from "../database/db.config.js";
import {
  processAppointment,
  insertToBufferAppointment,
  getAppointmentByPatientId,
  checkForAppointmentDuplicate,
  getAppointmentByDoctorId,
} from "../database/query/appointment_queries.js";

import {
  findAvailableSlots,
  getCurrentTime,
} from "../controllers/assistant/appointment.js";
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

  let getDoctorOperatingHour = "SELECT doh.doctor_id, `limit` FROM doctors AS d INNER JOIN doctor_operating_hours doh ON doh.doctor_id = d.doctor_id WHERE d.doctor_id = ?  AND doh.day = ?";

  db.query(getDoctorOperatingHour,
    [payload.doctor_id, payload.appointment_date], 
    async (err, res) => {
      if (res.length === 0) {
        return res
          .status(401)
          .json({ status: false, message: "Doctor does not have schedule for selected date." });
      }

      
  })

  try {
    

    db.query(
      getDoctors,
      [payload.doctor_id, payload.appointment_date],
      async (err, results) => {
        if (err) {
          return res.status(500).json({ message: "Server error", error: err });
        }

        if (results.length === 0) {
          return res
            .status(401)
            .json({ status: false, message: "The doctor does not exist." });
        }

        let getDoctorsAppointment = `SELECT appointment_start as start,appointment_end as end FROM appointments where doctor_id = ? and appointment_date = ? and status != "Cancelled" `;

        db.query(
          getDoctorsAppointment,
          [payload.doctor_id, payload.appointment_date],
          async (err, results1) => {
            if (err) {
              return res
                .status(500)
                .json({ message: "Server error", error: err });
            }
            if (results[0].limit != "") {
              if (results1.length == results[0].limit) {
                return res
                  .status(401)
                  .json({ status: false, message: "There's no open slot." });
              } else {
                const appointments = results1;

                const clinicStart = results[0].hours_start;
                const clinicEnd = results[0].hours_end;

                const availableSlots = await findAvailableSlots(
                  appointments,
                  clinicStart,
                  clinicEnd,
                  payload.preferredTime
                );

                res.status(200).json({
                  status: true,
                  message:
                    results[0].name +
                    " " +
                    results[0].specialty +
                    " is available.",
                  appointments: appointments,
                  availableSlots: availableSlots,
                });
              }
            }
          }
        );
      }
    );
  } catch (error) {
    return res.status(500).send({
      status: false,
      message: "Failed to fetch data from external API",
    });
  }
});

router.post("/appointment-settler", async (req, res) => {
  const payload = req.body;

  db.query(
    checkForAppointmentDuplicate,
    [payload.appointmentDate, payload.patientId, payload.doctorId],
    (error, result) => {
      if (result.length > 0) {
        return res.status(409).json({
          status: false,
          data: "Appointment already exists for this date.",
        });
      }

      db.beginTransaction((err) => {
        if (err) {
          return res
            .status(500)
            .json({ status: false, data: "Transaction start failed" });
        }

        db.query(
          insertToBufferAppointment,
          [
            payload.patientId,
            payload.doctorId,
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
            payload.estimate,
            payload.appointmentDate,
            payload.urgency
          ],
          (error, results) => {
            if (error) {
              return db.rollback(() => {
                res.status(500).json({
                  status: false,
                  data: `Error creating appointment ${error}`,
                });
              });
            }

            db.query(
              processAppointment,
              [payload.appointmentDate, payload.doctorId],
              (error, processResult) => {
                if (error || processResult.affectedRows < 1) {
                  return db.rollback(() => {
                    res.status(500).json({
                      status: false,
                      data: "Error processing appointment, rolling back changes",
                    });
                  });
                }

                db.commit((err) => {
                  if (err) {
                    return db.rollback(() => {
                      console.error("Transaction commit failed:", err);
                      res.status(500).json({ data: "Transaction failed" });
                    });
                  }

                  res.status(200).json({ data: processResult });
                });
              }
            );
          }
        );
      });
    }
  );
});

router.post("/cancel", async (req, res) => {
  const payload = req.body;

  try {
    const query = `SELECT * FROM appointments where appointment_id = ?`;

    db.query(query, [payload.appointment_id], async (error, results) => {
      if (results.length > 0) {
        //Cancelled the status
        const query = `UPDATE appointments SET status = "Cancelled" WHERE appointment_id  = ?`;

        db.query(query, [payload.appointment_id], async (error, results) => {
          if (results) {
            const datetime = await getCurrentTime();

            const query = `SELECT * FROM appointments WHERE appointment_date = ? and appointment_start >= ? ORDER BY urgency ASC LIMIT 1`;

            db.query(
              query,
              [payload.appointment_date, datetime],
              async (error, results) => {
                ////////////////////////////////
                //NOTIFY THE PATIENT IN RESULTS
                ////////////////////////////////
                res.status(201).send({
                  status: true,
                  message: `Appointment ${payload.appointment_id} is now cancelled.`,
                  params1: datetime,
                  params: results,
                });
              }
            );
          } else {
            return res.status(500).send({
              status: false,
              message: "Failed to fetch data from external API",
            });
          }
        });
      }
    });
  } catch (error) {
    return res.status(500).send({
      status: false,
      message: "Failed to fetch data from external API",
    });
  }
});

router.get("/appointment-patient", async (req, res) => {
  const { id, type } = req.query;

  const query =
    type === "doctor"
      ? getAppointmentByDoctorId
      : type === "patient"
      ? getAppointmentByPatientId
      : getAppointmentByPatientId;

  db.query(query, [id], (err, result) => {
    if (err) {
      return res.status(500).json({
        status: false,
        message: "Error fetching appointment for this patient",
      });
    }

    res.status(200).send({
      status: true,
      data: result,
    });
  });
});

export default router;
