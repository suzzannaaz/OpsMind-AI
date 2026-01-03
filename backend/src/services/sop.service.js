// src/services/sop.service.js
import SOPChunk from "../models/SOPChunk.js";
import { parsePDFWithSections } from "../utils/pdfUtils.js";
import { getEmbedding } from "./embeddings.service.js";
import Groq from "groq-sdk";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

/* ---------------- PDF UPLOAD ---------------- */
export const uploadSOP = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No file uploaded" });
    const { originalname, buffer } = req.file;

    // Parse PDF into chunks with sections
    const chunks = await parsePDFWithSections(buffer, originalname);

    // Remove previous chunks for this document
    await SOPChunk.deleteMany({ documentName: originalname });

    // Generate embeddings for each chunk
    const docs = [];
    for (const chunk of chunks) {
      const embedding = await getEmbedding(chunk.chunkText);
      if (embedding) docs.push({ ...chunk, embedding });
    }

    // Insert into MongoDB
    await SOPChunk.insertMany(docs);

    res.json({ success: true, message: `Ingested ${docs.length} chunks from ${originalname}` });
  } catch (e) {
    console.error("Upload SOP Error:", e);
    res.status(500).json({ error: e.message });
  }
};

/* ---------------- ASK QUESTION ---------------- */
// src/services/sop.service.js
export const askQuestion = async (req, res) => {
  try {
    const { question, history = [] } = req.body;

    if (!question || question.trim() === "") {
      return res.status(400).json({ error: "Question is required" });
    }

    // 1️⃣ Generate embedding for the question
    const queryEmbedding = await getEmbedding(question);

    // 2️⃣ Retrieve top 15 relevant chunks using vector search
    const results = await SOPChunk.aggregate([
      {
        $vectorSearch: {
          index: "sop_vector",
          path: "embedding",
          queryVector: queryEmbedding,
          numCandidates: 200,
          limit: 15
        }
      }
    ]);

    if (!results || results.length === 0) {
      return res.json({ answer: "I don’t know based on the current context.", sources: [] });
    }

    // 3️⃣ Build context string & collect sources
    let context = "";
    const contextSources = [];

    for (const r of results) {
      const line = `${r.chunkText} [${r.documentName} | Page ${r.page}${r.section ? ` | Section ${r.section}` : ""}]\n\n`;

      // Limit context length to ~9000 characters
      if ((context + line).length > 9000) break;

      context += line;

      // Add to sources if not already present
      const key = `${r.documentName}-${r.page}-${r.section || ""}`;
      if (!contextSources.some(s => `${s.document}-${s.page}-${s.section || ""}` === key)) {
        contextSources.push({
          document: r.documentName,
          page: r.page,
          section: r.section || null
        });
      }
    }

    // 4️⃣ Ask Groq to generate answer using context
    const completion = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [
        {
          role: "system",
          content:
            "You are a document Q&A assistant. Answer ONLY using the provided context. " +
            "Cite page and section exactly as shown inline (e.g., 'Task X (Page 6 | Section HR)'). " +
            "If the answer is missing or unclear, say: 'I don’t know based on the current context.'"
        },
        ...history.slice(-4),
        { role: "user", content: `Context:\n${context}\n\nQuestion: ${question}` }
      ],
      max_tokens: 1024,
      temperature: 0.2
    });

    const answer = completion.choices[0].message.content.trim();

    // 5️⃣ Assign final sources
   // 5️⃣ Assign final sources based on answer content
let finalSources;

if (answer.startsWith("I don’t know")) {
  // If answer is "I don't know", include only the first chunk
  finalSources = contextSources.slice(0, 1);
} else {
  // Otherwise, include only the sources actually mentioned in the answer
  finalSources = contextSources.filter(s => {
    // Check if document + page (and section) appear in answer text
    const pageMatch = answer.includes(`Page ${s.page}`);
    const docMatch = answer.includes(s.document.split(".pdf")[0]);
    return pageMatch && docMatch;
  });
}


    // 6️⃣ Return answer + sources
    res.json({ answer, sources: finalSources });

  } catch (e) {
    console.error("Ask Error:", e.message);
    res.status(500).json({ error: e.message });
  }
};



/* ---------------- DELETE SOP ---------------- */
export const deleteSOP = async (req, res) => {
  try {
    const { name } = req.params;
    const result = await SOPChunk.deleteMany({ documentName: name });
    res.json({ success: true, message: `Deleted ${result.deletedCount} chunks of ${name}` });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

/* ---------------- LIST SOPs ---------------- */
export const listSOPs = async (req, res) => {
  try {
    const docs = await SOPChunk.distinct("documentName");
    res.json(docs);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};
