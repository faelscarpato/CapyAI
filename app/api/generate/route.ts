import { GoogleGenerativeAI } from "@google/generative-ai"
import { NextRequest, NextResponse } from "next/server"

export const maxDuration = 60

const SYSTEM_PROMPTS = {
  component: `You are an expert React/TypeScript developer. Generate a single React component based on the user's request.

Rules:
- Use TypeScript with proper types
- Use Tailwind CSS for styling
- Make it responsive and accessible
- Include proper imports
- Export default the component
- Use modern React patterns (hooks, functional components)
- Add helpful comments for complex logic

Format your response as clean, production-ready code that can be directly used.`,

  page: `You are an expert Next.js developer. Generate a complete page component based on the user's request.

Rules:
- Use Next.js 15 App Router patterns
- Use TypeScript with proper types
- Use Tailwind CSS for styling
- Make it responsive and accessible
- Include proper imports and metadata
- Use modern React patterns
- Include multiple sections if needed (header, main, footer)
- Add helpful comments

Format your response as a complete Next.js page component.`,

  app: `You are an expert full-stack developer. Generate a complete Next.js application structure based on the user's request.

Rules:
- Use Next.js 15 App Router
- Use TypeScript with proper types
- Use Tailwind CSS for styling
- Include multiple components and pages
- Add routing and navigation
- Include proper file structure
- Use modern React patterns
- Add helpful comments

Format your response as multiple files with clear file paths and complete code for each file.`,

  image: `You are a UI/UX designer. Generate a detailed description of the UI design based on the user's request.

Rules:
- Describe layout, colors, typography, spacing
- Include specific Tailwind CSS classes
- Mention accessibility considerations
- Describe responsive behavior
- Include component hierarchy
- Suggest modern design patterns

Then generate the React component code that implements this design.`
}

export async function POST(req: NextRequest) {
  try {
    const { apiKey, model, prompt, type = "component" } = await req.json()

    if (!apiKey || !model || !prompt) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const genAI = new GoogleGenerativeAI(apiKey)
    const geminiModel = genAI.getGenerativeModel({ model })

    const systemPrompt = SYSTEM_PROMPTS[type as keyof typeof SYSTEM_PROMPTS] || SYSTEM_PROMPTS.component
    const fullPrompt = `${systemPrompt}\n\nUser Request: ${prompt}`

    const result = await geminiModel.generateContent(fullPrompt)
    const response = await result.response
    let generatedText = response.text()

    // Extract code from response if it's wrapped in markdown
    const codeMatch = generatedText.match(/```(?:tsx?|javascript|jsx?)?\n([\s\S]*?)\n?```/)
    if (codeMatch) {
      generatedText = codeMatch[1]
    }

    // Clean up the code
    generatedText = generatedText.trim()

    return NextResponse.json({ 
      code: generatedText,
      model,
      type 
    })

  } catch (error: any) {
    console.error("Generation error:", error)
    return NextResponse.json({ 
      error: error.message || "Failed to generate code" 
    }, { status: 500 })
  }
}