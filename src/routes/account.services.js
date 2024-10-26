import express from "express";
import db from "../database/db.config.js";
import { loginQuery } from "../database/query/account_queries.js";

const router = express.Router();

router.get("/", async (req, res) => {
  res.send("Account Services");
});

router.post("/login", (req, res) => {
  try {
    const { email, password } = req.body;

    db.query(loginQuery, [email, password], (err, results) => {
      if (err) {
        return res.status(500).json({ message: "Server error", error: err });
      }

      if (results.length === 0) {
        return res
          .status(401)
          .json({ status: false, message: "Invalid email or password" });
      }

      res.status(200).json({
        status: true,
        message: "Login successful",
        data: {
          account_id: results[0].account_id,
          email: results[0].email,
          full_name: `${results[0].fname} ${results[0].lname}`,
          age: results[0].age,
          gender: results[0].gender,
          employed: results[0].employed,
          job_description: results[0].job_description,
          contact_number: results[0].contact_number,
          employed: results[0].employed,
          type: results[0].type,
          id:   results[0].type === "doctor"
              ? results[0].doctor_id
              : results[0].type === "nurse"
              ? results[0].nurse_id
              : results[0].patient_id,
        },
      });
    });
  } catch (error) {
    res.status(500).json({ status: false, message: "Server error" });
  }
});
export default router;
