import mongoose from "mongoose";
const sopChunkSchema = new mongoose.Schema({
  text: { type: String, required: true },

  embedding: {
    type: [Number],
    required: true,
  },

  metadata: {
    source: String,
    page: Number,
  },

  chunkId: Number   // optional but recommended
});
export default mongoose.model("SopChunk", sopChunkSchema);