import express from "express";
import { connectDB } from "./config/db.js";
import sopRoutes from "./routes/sop.route.js";
import { errorHandler } from "./middleware/errorHandler.js";

const app = express();
app.use(express.json());

// Connect to MongoDB
connectDB();

// Mount SOP routes
app.use("/sop", sopRoutes);

// Global error handler
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
