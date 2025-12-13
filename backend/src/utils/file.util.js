// utils/file.util.js
import fs from "fs";

export const deleteFile = (path) => {
  fs.unlink(path, (err) => {
    if (err) console.error("Error deleting file:", err);
  });
};

export const isPDF = (file) => file.mimetype === "application/pdf";
