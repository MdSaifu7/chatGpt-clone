import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function convertToVector(content) {
  try {
    const response = await openai.embeddings.create({
      model: "text-embedding-3-small",
      input: content,

      encoding_format: "float",
    });

    return response.data[0].embedding;
  } catch (error) {
    console.error("Embedding error:", error);
  }
}

export default convertToVector;
