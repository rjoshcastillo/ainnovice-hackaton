import express from "express";
import db from "../database/db.config.js";
import {
  processAppointment,
  insertToBufferAppointment,
  getAppointmentByPatientId,
  checkForAppointmentDuplicate,
  getAppointmentByDoctorId,
} from "../database/query/appointment_queries.js";
import moment from "moment";

import {
  findAvailableSlots,
  getCurrentTime,
  processScheduleAppointment,
  scheduleAppointments,
} from "../controllers/assistant/appointment.js";
const router = express.Router();

const timeToMinutes = (time) => {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
};

router.get("/", async (req, res) => {
  res.send("Appointment Services!");
});

router.post("/available-doctor", async (req, res) => {
  const payload = req.body;

  let getDoctorOperatingHour =
    "SELECT doh.doctor_id, `limit` FROM doctors AS d INNER JOIN doctor_operating_hours doh ON doh.doctor_id = d.doctor_id WHERE d.doctor_id = ?  AND doh.day = ?";

  db.query(
    getDoctorOperatingHour,
    [payload.doctor_id, payload.appointment_date],
    async (err, res) => {
      if (res.length === 0) {
        return res.status(401).json({
          status: false,
          message: "Doctor does not have schedule for selected date.",
        });
      }
    }
  );

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
            payload.appointmentDate,
            payload.estimate,
            payload.urgency,
            payload.status,
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

router.post("/update-appointment-summary", async (req, res) => {
  const payload = req.body;

  const updateSummaryQuery =
    "UPDATE appointments SET findings = ? WHERE appointment_id = ?";

  const summary = `{
      "findings": "${payload.summary}", 
      "lab_request": ${JSON.stringify(payload.equipments)}
    }`;

  db.query(
    updateSummaryQuery,
    [summary, payload.appointment_id],
    async (err, results) => {
      return res.status(200).send({
        status: true,
        data: summary,
      });
    }
  );
});
router.post("/save-appointment", async (req, res) => {
  const payload = req.body;

  const newAppointmentQuery = `INSERT INTO appointments (
        patient_id, doctor_id, alcohol_consumption, smoking, height, 
        weight, breathing_trouble, pain_level, pain_part, medical_concern, 
        symptoms, temperature, appointment_date, estimate, urgency, status) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

  db.query(
    newAppointmentQuery,
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
      payload.appointmentDate,
      payload.estimate,
      payload.urgency,
      payload.status,
      payload.created_at
    ],
    async (error, results) => {
      if (error) {
        return res
          .status(500)
          .json({ message: "Error inserting appointment", error });
      }

      try {
        const scheduleResult = await processScheduleAppointment({
          appointmentDate: payload.appointmentDate,
          doctorId: payload.doctorId,
        });

        res.status(200).json({
          message: "Appointment saved and scheduled successfully",
          data: scheduleResult,
        });
      } catch (processError) {
        res.status(500).json({
          message: "Error processing schedule appointment",
          error: processError.message,
        });
      }
    }
  );
});

router.post("/process-appointment", async (req, res) => {
  const payload = req.body;

  const getAllAppointmentsByDateAndDoctorId =
    "SELECT * FROM appointments WHERE appointment_date = ? AND doctor_id = ?";
  db.query(
    getAllAppointmentsByDateAndDoctorId,
    [payload.appointmentDate, payload.doctorId],
    async (req, appointments) => {
      const getDoh =
        "SELECT * FROM doctor_operating_hours WHERE doctor_id = ? AND day = ?";
      db.query(
        getDoh,
        [payload.doctorId, payload.appointmentDate],
        async (req, doh) => {
          const scheduledAppointments = scheduleAppointments(
            appointments,
            doh[0].hours_start
          );

          const updateQueries = scheduledAppointments.map((appointment) => {
            const updateQuery = `
              UPDATE appointments 
              SET appointment_start = ?, appointment_end = ?
              WHERE appointment_id = ?`;
            return new Promise((resolve, reject) => {
              db.query(
                updateQuery,
                [
                  appointment.appointment_start,
                  appointment.appointment_end,
                  appointment.appointment_id,
                ],
                (error) => {
                  if (error) {
                    reject(error);
                  } else {
                    resolve();
                  }
                }
              );
            });
          });

          Promise.all(updateQueries)
            .then(() => {
              return res.send({
                result: scheduledAppointments,
              });
            })
            .catch((error) => {
              return res
                .status(500)
                .send({ error: "Error updating appointments", error });
            });
        }
      );
    }
  );
});

router.post("/lab-request", async (req, res) => {
  const payload = req.body;

  const query = `INSERT INTO lab_appointments (patient_id,  equipment_id, appointment_date, status) VALUES (?, ?, ?, ?)`;
  db.query(
    query,
    [
      payload.patient_id,
      payload.equipment_id,
      payload.appointment_date,
      "Waiting",
    ],
    async (req, result) => {
      res.status(200).json({ data: result });
    }
  );
});
router.post("/update", async (req, res) => {
  const payload = req.body;

  const appointmentsQuery = `SELECT * FROM appointments WHERE appointment_id = ?`;
  db.query(appointmentsQuery, [payload.appointment_id], (err, results) => {
    if (err) {
      return res.status(500).send({ status: false, message: "Database error" });
    }

    if (results.length < 1) {
      return res
        .status(404)
        .send({ status: false, message: "No appointment found" });
    }

    db.beginTransaction(async (transactionErr) => {
      if (transactionErr) {
        return res.status(500).json({
          message: "Error starting transaction",
          error: transactionErr,
        });
      }

      const updateQuery = `UPDATE appointments SET status = ? WHERE appointment_id = ?`;
      db.query(
        updateQuery,
        [payload.status, payload.appointment_id],
        async (updateErr, results1) => {
          if (updateErr) {
            return db.rollback(() => {
              res.status(500).json({
                message: "Error updating appointment status",
                error: updateErr,
              });
            });
          }

          if (results1.affectedRows > 0) {
            try {
              const processResult = await processScheduleAppointment({
                appointmentDate: results[0].appointment_date,
                doctorId: results[0].doctor_id,
              });

              db.commit((commitError) => {
                if (commitError) {
                  console.error("Error committing transaction:", commitError);
                  return db.rollback(() => {
                    res.status(500).json({
                      message: "Error committing transaction",
                      error: commitError,
                    });
                  });
                }

                res.status(200).json({
                  status: true,
                  data: processResult,
                  message: "Appointment status changed!",
                  appointment_status: payload.status,
                });
              });
            } catch (processError) {
              db.rollback(() => {
                res.status(500).json({
                  message: "Error processing schedule appointment",
                  error: processError.message,
                });
              });
            }
          } else {
            db.rollback(() => {
              res
                .status(404)
                .json({ status: false, message: "No rows affected" });
            });
          }
        }
      );
    });
  });
});

router.get("/get-equipments", async (req, res) => {
  const query = "SELECT * FROM equipments";
  db.query(query, async (req, results) => {
    if (results.length < 1) {
      return res.status(200).send({
        message: "No equipments found",
      });
    }

    return res.status(200).send({
      message: "Equipments found",
      data: results,
    });
  });
});

export default router;
