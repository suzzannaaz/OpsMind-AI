import dotenv from "dotenv";

dotenv.config();

// Validate required env variables
const requiredVars = ["PORT", "MONGO_URI", "GOOGLE_API_KEY"];
requiredVars.forEach((v) => {
  if (!process.env[v]) {
    console.error(`Missing required env variable: ${v}`);
    process.exit(1);
  }
});

export const ENV = {
  PORT: process.env.PORT,
  MONGO_URI: process.env.MONGO_URI,
  GOOGLE_API_KEY: process.env.GOOGLE_API_KEY,
};
