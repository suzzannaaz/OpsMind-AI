import express from "express";
import multer from "multer";
import { uploadSOP, askQuestion, deleteSOP, listSOPs } from "../services/sop.service.js";

const router = express.Router();
const upload = multer();

router.post("/upload", upload.single("file"), uploadSOP);
router.post("/ask", askQuestion);
router.delete("/delete/:name", deleteSOP);
router.get("/list", listSOPs);

export default router;
