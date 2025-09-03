import { google } from "@ai-sdk/google"
import { streamText } from "ai"

export const maxDuration = 30

export async function POST(req: Request) {
  const { messages, agentId, systemPrompt } = await req.json()

  const result = streamText({
    // Requires env var: GOOGLE_GENERATIVE_AI_API_KEY
    model: google("gemini-1.5-flash"),
    system: systemPrompt || "You are a helpful AI assistant.",
    messages,
  })

  return result.toDataStreamResponse()
}
