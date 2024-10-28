import express from "express";
import db from "../database/db.config.js";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const query = `SELECT doctor_id, d.account_id, specialty, email, age, gender,CONCAT(fname, ' ', lname) AS name,
     contact_number FROM doctors AS d JOIN accounts AS acc ON d.account_id = acc.account_id`;
    db.query(query, (err, result) => {
      res.send(result);
    });
  } catch (error) {}
});

router.get("/available-dates", async (req, res) => {
  const { doctor_id } = req.query;

  if (!doctor_id) {
    return res
      .status(400)
      .json({ status: false, message: "Doctor ID is required" });
  }

  try {
    const operatingHoursQuery = `
      SELECT doh.day, doh.limit
      FROM doctor_operating_hours as doh
      WHERE doctor_id = ? AND DAY >= CURDATE()
    `;

    db.query(operatingHoursQuery, [doctor_id], async (err, operatingHours) => {
      if (err) {
        return res
          .status(500)
          .json({ status: false, message: "Database error", error: err });
      }

      const availableDates = [];

      for (const day of operatingHours) {
        const { day: date, limit } = day;

        const appointmentsQuery = `
          SELECT COUNT(*) AS appointment_count
          FROM appointments AS a
          WHERE a.doctor_id = ? AND a.appointment_date = ? AND a.status NOT IN ("Completed", "Cancelled");
        `;

        await new Promise((resolve, reject) => {
          db.query(appointmentsQuery, [doctor_id, date], (err, results) => {
            if (err) return reject(err);

            const newDate = new Date(date);
            newDate.setDate(newDate.getDate() + 1);

            const appointmentCount = results[0].appointment_count;
            if (appointmentCount < limit) {
              availableDates.push(newDate.toISOString().split("T")[0]);
            }

            resolve();
          });
        });
      }

      return res.status(200).json(availableDates);
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: false, message: "Server error", error });
  }
});
export default router;
