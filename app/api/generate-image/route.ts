import { GoogleGenerativeAI } from "@google/generative-ai"
import { NextRequest, NextResponse } from "next/server"

export const maxDuration = 60

export async function POST(req: NextRequest) {
  try {
    const { apiKey, prompt, style = "modern" } = await req.json()

    if (!apiKey || !prompt) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const genAI = new GoogleGenerativeAI(apiKey)
    const model = genAI.getGenerativeModel({ model: "gemini-pro-vision" })

    // Since Gemini doesn't directly generate images, we'll generate detailed descriptions
    // that can be used with other image generation services or as design specifications
    const imagePrompt = `Create a detailed UI/UX design specification for: ${prompt}

Please provide:
1. **Layout Description**: Detailed layout structure and component positioning
2. **Color Palette**: Specific colors with hex codes (${style} style)
3. **Typography**: Font families and sizes for different elements  
4. **Spacing & Sizing**: Margins, padding, and component dimensions
5. **Visual Elements**: Icons, buttons, forms, cards styling
6. **Responsive Behavior**: How it adapts to different screen sizes
7. **Interactive States**: Hover, focus, active states
8. **Accessibility**: ARIA labels and keyboard navigation

Then provide the complete React/TypeScript component code that implements this design using Tailwind CSS.

Style: ${style}
Make it modern, professional, and visually appealing.`

    const result = await model.generateContent(imagePrompt)
    const response = await result.response
    let generatedText = response.text()

    // Extract code from response if it's wrapped in markdown
    const codeMatch = generatedText.match(/```(?:tsx?|javascript|jsx?)?\n([\s\S]*?)\n?```/)
    const designSpec = generatedText.split('```')[0] // Get design specification part
    
    return NextResponse.json({ 
      designSpec,
      code: codeMatch ? codeMatch[1].trim() : generatedText,
      style
    })

  } catch (error: any) {
    console.error("Image generation error:", error)
    return NextResponse.json({ 
      error: error.message || "Failed to generate design" 
    }, { status: 500 })
  }
}