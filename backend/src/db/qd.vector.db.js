import { QdrantClient } from "@qdrant/js-client-rest";

const client = new QdrantClient({
  url: "https://fc799a1a-fe2b-4d0e-ad8c-3594d3f2c384.eu-west-2-0.aws.cloud.qdrant.io:6333",
  apiKey: process.env.QDRANT_API_KEY,
});

try {
  const result = await client.getCollections();
  console.log("List of collections:", result.collections);
} catch (err) {
  console.error("Could not get collections:", err);
}

async function createMemoryQD({ vectors, metadata, messageId }) {
  try {
    await client.upsert("my-chatgpt", {
      points: [
        {
          id: messageId,
          vector: {
            "dense-vector": vectors,
          },
          payload: metadata,
        },
      ],
    });

    console.log("✅ Qdrant upsert success");
  } catch (err) {
    console.error("❌ Qdrant error:", err);
  }
}
async function queryMemoryQD({ queryVector, limit = 5 }) {
  try {
    const results = await client.search("my-chatgpt", {
      vector: {
        name: "dense-vector", // ✅ REQUIRED
        vector: Array.from(queryVector), // ✅ REQUIRED
      },
      limit: limit,
      with_payload: true,
    });

    return results;
  } catch (err) {
    console.error("❌ Qdrant search error:", err);
  }
}
export { createMemoryQD, queryMemoryQD };
