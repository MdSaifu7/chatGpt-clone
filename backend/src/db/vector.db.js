// Import the Pinecone library
import { Pinecone } from "@pinecone-database/pinecone";

// Initialize a Pinecone client with your API key
const pc = new Pinecone({ apiKey: process.env.PINECONE_API_KEY });

// const cohortChatGptIndex = pc.Index("cohort-chat-gpt");
// async function createMemory({ vectors, metadata, messageId }) {
//   try {
//     console.log("vectors length:", vectors?.length);
//     console.log("isArray:", Array.isArray(vectors));
//     console.log("type:", vectors.constructor.name);
//     await cohortChatGptIndex.upsert([
//       {
//         "_id": messageId.toString(),
//         "chunk_text": Array.from(vectors),
//         metadata: { ...metadata },
//       },
//     ]);

//     console.log("✅ Upsert success");
//   } catch (err) {
//     console.error("❌ Pinecone error:", err);
//   }
// }

const cohortChatGptIndex = pc.Index("chatgpt-2");
async function createMemory({ content, metadata, messageId }) {
  console.log(content);
  console.log(messageId);

  try {
    await cohortChatGptIndex.upsert([
      {
        _id: messageId.toString(),
        chunk_text: content,
      },
    ]);

    console.log("✅ Upsert success");
  } catch (err) {
    console.error("❌ Pinecone error:", err);
  }
}
async function queryMemory({ queryVector, limit = 5, metadata }) {
  await cohortChatGptIndex.query({
    vector: queryVector,
    topK: limit,
    filter: metadata,

    includeMetadata: true,
  });
}

// Define the query
const query = "Famous historical structures and monuments";
async function queryVector({ queryVector, limit = 5 }) {
  // Search the dense index
  const results = await cohortChatGptIndex.searchRecords({
    query: {
      topK: limit,
      inputs: { text: queryVector },
    },
  });

  // Print the results
  return results.result.hits;
}

export { createMemory, queryMemory };
