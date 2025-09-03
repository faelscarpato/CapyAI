import { GoogleGenerativeAI } from "@google/generative-ai"
import { NextRequest, NextResponse } from "next/server"

export const maxDuration = 60

export async function POST(req: NextRequest) {
  try {
    const { apiKey, model, prompt, type = "component", options } = await req.json()

    if (!apiKey || !model || !prompt) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const css = options?.cssFramework || 'tailwind'
    const icons = options?.iconSet || 'fontawesome'
    const anim = options?.animationLib || 'animatecss'
    const siteType = options?.siteType || 'website'
    const format = options?.format || 'single-html'

    const cdnHints = (() => {
      const lines: string[] = []
      if (css === 'tailwind') lines.push('- Tailwind: <script src="https://cdn.tailwindcss.com"></script>')
      if (css === 'bootstrap') lines.push('- Bootstrap 5 CSS: <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5/dist/css/bootstrap.min.css"> and JS: <script src="https://cdn.jsdelivr.net/npm/bootstrap@5/dist/js/bootstrap.bundle.min.js"></script>')
      if (css === 'bulma') lines.push('- Bulma: <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bulma@0.9.4/css/bulma.min.css">')
      if (css === 'materialize') lines.push('- Materialize: <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/materialize/1.0.0/css/materialize.min.css"> and JS: <script src="https://cdnjs.cloudflare.com/ajax/libs/materialize/1.0.0/js/materialize.min.js"></script>')
      if (icons === 'fontawesome') lines.push('- Font Awesome: <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.2/css/all.min.css">')
      if (icons === 'lucide') lines.push('- Lucide: <script src="https://unpkg.com/lucide@latest"></script> (use <i data-lucide="icon-name"></i> and lucide.createIcons())')
      if (icons === 'material-icons') lines.push('- Material Icons: <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet">')
      if (anim === 'animatecss') lines.push('- Animate.css: <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/animate.css/4.1.1/animate.min.css">')
      if (anim === 'aos') lines.push('- AOS: <link rel="stylesheet" href="https://unpkg.com/aos@2.3.4/dist/aos.css"> and <script src="https://unpkg.com/aos@2.3.4/dist/aos.js"></script> then AOS.init()')
      return lines.join('\n')
    })()

    const SINGLE_HTML_DIRECTIVE = `You are a senior frontend engineer and designer. Your task is to generate a SINGLE, PRODUCTION-READY HTML document that looks polished and modern.

Thinking first:
- Before output, reason about structure, responsiveness (mobile-first), semantics, accessibility (labels/ARIA/contrast), and performance. Improve class names, CSS variables, and motion.
- Then output ONLY the final code with no explanations and NO markdown fences.

Output format:
- One file: <!DOCTYPE html> <html> <head> <body>
- Include CSS and JS in this file: use <style> and <script> tags.
- Add meta tags (viewport, charset, theme-color, og basics where reasonable).
- Provide a cohesive color scheme using CSS variables (:root --color-*). Prefer system fonts for performance.

Frameworks/CDNs (use only what is requested):
- CSS: ${css} (none|tailwind|bootstrap|bulma|materialize).
- Icons: ${icons} (none|fontawesome|lucide|material-icons).
- Animations: ${anim} (none|animatecss|aos). Add the relevant <link>/<script> tags and minimal usage.

Requirements:
- Type: ${siteType} (website: marketing-site structure; webapp: app-like layout with header/sidebar and stateful UI).
- Mobile-first layout, then enhance for md+.
- Keyboard navigation, skip-link, focus styles. Use role attributes where needed.
- JS for interactions (menu toggle, theme switch, tabs/accordion/forms as relevant). No bundlers.
- Avoid external frameworks not requested. Keep assets as placeholders where needed.
- Keep the code neat with comments for key sections.
`

    const genAI = new GoogleGenerativeAI(apiKey)
    const imageOnlyModels = new Set([
      'models/gemini-2.0-flash-preview-image-generation',
      'models/gemini-2.5-flash-image-preview',
    ])
    const modelToUse = imageOnlyModels.has(model) ? 'models/gemini-2.5-flash' : model
    const geminiModel = genAI.getGenerativeModel({ model: modelToUse })

    const basePrompt = format === 'single-html' ? SINGLE_HTML_DIRECTIVE : ''
    const fullPrompt = `${basePrompt}\n\nUser Request:\n${prompt}`

    const result = await geminiModel.generateContentStream(fullPrompt)

    const encoder = new TextEncoder()
    const stream = new ReadableStream<Uint8Array>({
      start(controller) {
        ;(async () => {
          try {
            for await (const chunk of result.stream) {
              // Stream plain text; strip code fences if any appear
              const text = chunk.text().replace(/```/g, "")
              controller.enqueue(encoder.encode(text))
            }
            controller.close()
          } catch (e) {
            controller.error(e)
          }
        })()
      },
    })

    return new NextResponse(stream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-cache",
        "X-Model-Used": modelToUse,
      },
    })
  } catch (error: any) {
    console.error("Generation stream error:", error)
    return NextResponse.json(
      {
        error: error.message || "Failed to stream generated code",
      },
      { status: 500 },
    )
  }
}
