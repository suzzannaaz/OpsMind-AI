import dotenv from "dotenv";
dotenv.config();

export const ENV = {
  GOOGLE_API_KEY: process.env.GOOGLE_API_KEY,
  MONGO_URI: process.env.MONGO_URI,
  PORT: process.env.PORT || 5000
};
