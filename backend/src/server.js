import express from "express";
import { connectDB } from "./config/db.js";
import uploadRoute from "./routes/upload.route.js";
import { ENV } from "./config/env.js";

const app = express();
app.use(express.json());
app.use("/api", uploadRoute);

// Connect DB
connectDB();

app.listen(ENV.PORT, () => {
  console.log(`Server running on port ${ENV.PORT}`);
});
