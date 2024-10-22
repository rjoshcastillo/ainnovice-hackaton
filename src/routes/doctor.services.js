import express from "express";
import db from "../config/db.config.js";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const query = "SELECT * FROM doctors";
    db.query(query, (err, result) => {
      res.send(result);
    });
  } catch (error) {}
});

export default router;
