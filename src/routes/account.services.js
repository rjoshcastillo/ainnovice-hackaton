import express from "express";
import db from "../config/db.config.js";

const router = express.Router();

router.get("/", async (req, res) => {
  res.send("Account Services");
});

router.post("/login", (req, res) => {
  try {
    const { email, password } = req.body;
    const query = "SELECT * FROM accounts WHERE email = ? AND password = ?";

    db.query(query, [email, password], (err, results) => {
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
          accountId: `${results[0].account_id}`,
          fullName: `${results[0].fname} ${results[0].lname}`,
          gender: `${results[0].gender}`,
          age: `${results[0].age}`,
          employed: `${results[0].employed}`,
          jobDescription: `${results[0].job_description}`,
          email: `${results[0].email}`,
          contact_number: `${results[0].contact_number}`,
          type: `${results[0].type}`
        },
      });
    });
  } catch (error) {
    res.status(500).json({ status: false, message: "Server error" });
  }
});
export default router;
