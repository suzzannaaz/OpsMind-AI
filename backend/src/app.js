import express from "express";
import uploadRoute from "./routes/upload.route.js";
import searchRoute from "./routes/search.route.js";

const app = express();

// Middleware to parse JSON bodies
app.use(express.json());

// Routes
app.use("/api", uploadRoute);
app.use("/api/search", searchRoute);

export default app;
