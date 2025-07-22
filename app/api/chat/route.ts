import { openai } from "@ai-sdk/openai"
import { streamText } from "ai"

export const maxDuration = 30

export async function POST(req: Request) {
  const { messages, agentId, systemPrompt } = await req.json()

  const result = streamText({
    model: openai("gpt-4o"),
    system: systemPrompt || "You are a helpful AI assistant.",
    messages,
  })

  return result.toDataStreamResponse()
}
