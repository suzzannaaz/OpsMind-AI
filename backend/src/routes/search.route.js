//search.route.js
import express from "express";
import { searchSOP } from "../services/search.service.js";

const router = express.Router();

// POST /search
router.post("/", async (req, res) => {
  try {
    const { query } = req.body;
    if (!query) return res.status(400).json({ error: "Query is required" });

    const results = await searchSOP(query, 5); // return top 5 matches
    res.json(results);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

export default router;
