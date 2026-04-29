import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});
function cleanTitle(text) {
  if (!text) return "Untitled";

  return (
    text
      .trim()
      .replace(/[^a-zA-Z\s]/g, "")
      .split(/\s+/)
      .slice(0, 2)
      .join(" ") || "Untitled"
  );
}

export async function generateTitle(content) {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini", // ✅ fast + cheap + reliable
      temperature: 0.2,
      max_tokens: 20,
      messages: [
        {
          role: "system",
          content:
            "Generate a very short title (maximum 2 words). Return only the title.",
        },
        {
          role: "user",
          content: content || "Generate a simple title",
        },
      ],
    });

    console.log("RAW:", response);

    const raw = response.choices?.[0]?.message?.content;
    const title = cleanTitle(raw);

    return title;
  } catch (error) {
    console.error("OpenAI error:", error);
    return "Untitled";
  }
}
