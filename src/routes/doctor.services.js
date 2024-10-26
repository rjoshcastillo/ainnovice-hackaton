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

export default router;
