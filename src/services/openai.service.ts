import OpenAI from "openai";
import config from "../config/env";

const openai = new OpenAI({
  apiKey: config.openaiKey,
});

export const generateSessionSummary = async (data: {
  title: string;
  duration: number;
  language: string;
  notes: string | null;
}): Promise<string> => {
  const prompt = `You are an expert coding productivity assistant.

    Generate a concise summary for this coding session.

    Title: ${data.title}
    Language: ${data.language}
    Notes: ${data.notes ?? "No notes provided"}
    Duration: ${data.duration}

    Return:
    - key work completed
    - probable focus area
    - concise productivity summary
    `;

  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",

    messages: [
      {
        role: "system",
        content: "You generate concise developer session summaries.",
      },
      {
        role: "user",
        content: prompt,
      },
    ],

    temperature: 0.4,

    max_tokens: 200,
  });

  return response.choices[0]?.message.content ?? "No summary generated";
};
