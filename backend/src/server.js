import app from "./app.js";
import { connectDB } from "./config/db.js";
import { ENV } from "./config/env.js";

// Connect to MongoDB
connectDB();

// Start server
app.listen(ENV.PORT, () => {
  console.log(`Server running on port ${ENV.PORT}`);
});
