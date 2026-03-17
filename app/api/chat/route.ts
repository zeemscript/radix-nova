import { createGoogleGenerativeAI } from "@ai-sdk/google";

const google = createGoogleGenerativeAI({
  apiKey: process.env.GEMINI_API_KEY,
});
import {
  consumeStream,
  convertToModelMessages,
  streamText,
  UIMessage,
} from "ai";

export const maxDuration = 60;

export async function POST(req: Request) {
  console.log("[v0] Chat API called");

  try {
    const { messages }: { messages: UIMessage[] } = await req.json();

    // Ensure messages have a 'parts' array if they only have string 'content'
    const formattedMessages = messages.map((msg: any) => {
      if (
        typeof msg.content === "string" &&
        (!msg.parts || msg.parts.length === 0)
      ) {
        return {
          ...msg,
          parts: [{ type: "text" as const, text: msg.content }],
        };
      }
      return msg;
    });

    const result = streamText({
      model: google("gemini-2.5-flash"),
      system: `You are a creative social media content expert called "Radix Nova". Your role is to help users craft engaging, compelling posts for social media platforms.

IMPORTANT: The user's message will start with platform info in brackets like: [Platform: Twitter / X, Character limit: 280, Style: Short, punchy, conversational]

When creating posts:
- STRICTLY follow the character limit for the selected platform
- Use the appropriate tone and style indicated for that platform
- Include relevant, trending hashtags appropriate for the platform (more for Instagram, fewer for LinkedIn)
- For Twitter/X: Be concise, witty, use 1-3 hashtags max
- For Instagram: Use storytelling, include 5-15 relevant hashtags at the end, add line breaks for readability
- For LinkedIn: Be professional, thought-provoking, minimal hashtags (3-5), focus on value
- For Facebook: Be conversational, community-focused, ask questions to encourage engagement
- For TikTok: Be trendy, use Gen-Z language, reference popular sounds/trends when relevant
- For Threads: Be casual, conversational, authentic

Always provide:
1. The ready-to-post content (within character limits)
2. Suggested hashtags (formatted for copy-paste)
3. Best time to post suggestion when relevant
4. A brief tip for maximizing engagement on that platform

Be creative and help users stand out on social media!`,
      messages: await convertToModelMessages(formattedMessages as UIMessage[]),
      abortSignal: req.signal,
    });

    console.log("[v0] StreamText result created, returning response");

    return result.toUIMessageStreamResponse({
      originalMessages: messages,
      consumeSseStream: consumeStream,
    });
  } catch (error: any) {
    console.error(
      "[v0] Chat API error:",
      error?.message || error,
      error?.stack,
    );
    return new Response(
      JSON.stringify({ error: "Failed to generate response" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      },
    );
  }
}
