import mongoose from "mongoose";

const sopChunkSchema = new mongoose.Schema({
  text: String,
  embedding: {
    type: [Number],
    required: true,
  },
  metadata: {
    source: String,
    page: Number,
  },
});

export default mongoose.model("SopChunk", sopChunkSchema);
