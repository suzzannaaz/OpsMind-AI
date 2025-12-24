import fs from "fs";
import path from "path";

export const isPDF = (file) => {
  return file && path.extname(file.originalname).toLowerCase() === ".pdf";
};

export const deleteFile = (filePath) => {
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }
};
