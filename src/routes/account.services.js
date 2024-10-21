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
          fullName: `${results[0].fname} ${results[0].lname}`,
          age: `${results[0].age}`,
        },
      });
    });
  } catch (error) {
    res.status(500).json({ status: false, message: "Server error" });
  }
});
export default router;
