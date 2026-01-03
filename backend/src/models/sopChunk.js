import mongoose from "mongoose";

const SOPChunkSchema = new mongoose.Schema({
  documentName: String,
  chunkText: String,
  embedding: [Number],
  page: Number,
  section: String
});

export default mongoose.model("SOPChunk", SOPChunkSchema);
