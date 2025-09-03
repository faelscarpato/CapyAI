import { GoogleGenerativeAI } from "@google/generative-ai"
import { NextRequest, NextResponse } from "next/server"

export const maxDuration = 60

const SINGLE_HTML_DIRECTIVE = (opts: any) => {
  const css = opts?.cssFramework || 'tailwind'
  const icons = opts?.iconSet || 'fontawesome'
  const anim = opts?.animationLib || 'animatecss'
  const hints: string[] = []
  if (css === 'tailwind') hints.push('- Tailwind: <script src="https://cdn.tailwindcss.com"></script>')
  if (css === 'bootstrap') hints.push('- Bootstrap 5 CSS: <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5/dist/css/bootstrap.min.css"> and JS: <script src="https://cdn.jsdelivr.net/npm/bootstrap@5/dist/js/bootstrap.bundle.min.js"></script>')
  if (css === 'bulma') hints.push('- Bulma: <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bulma@0.9.4/css/bulma.min.css">')
  if (css === 'materialize') hints.push('- Materialize: <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/materialize/1.0.0/css/materialize.min.css"> and JS: <script src="https://cdnjs.cloudflare.com/ajax/libs/materialize/1.0.0/js/materialize.min.js"></script>')
  if (icons === 'fontawesome') hints.push('- Font Awesome: <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.2/css/all.min.css">')
  if (icons === 'lucide') hints.push('- Lucide: <script src="https://unpkg.com/lucide@latest"></script> (use <i data-lucide=\"icon-name\"></i> and lucide.createIcons())')
  if (icons === 'material-icons') hints.push('- Material Icons: <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet">')
  if (anim === 'animatecss') hints.push('- Animate.css: <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/animate.css/4.1.1/animate.min.css">')
  if (anim === 'aos') hints.push('- AOS: <link rel="stylesheet" href="https://unpkg.com/aos@2.3.4/dist/aos.css"> and <script src="https://unpkg.com/aos@2.3.4/dist/aos.js"></script> then AOS.init()')
  const cdnHints = hints.join('\n')
  return `You are a senior frontend engineer and designer. Generate a SINGLE, PRODUCTION-READY HTML document.

Think first: plan structure, semantics, accessibility, responsive mobile-first strategy, and visual polish. Improve choices before output. Then output ONLY the final code without explanations or markdown fences.

Output:
- One file: <!DOCTYPE html> with <head> + <body>.
- Inline CSS and JS using <style> and <script>.
- Meta tags (charset, viewport, theme-color) and basic SEO (title/description).
- CSS variables in :root for colors and spacing.

Preferences:
- Type: ${opts?.siteType || 'website'} (website vs webapp layout expectations)
- CSS: ${opts?.cssFramework || 'tailwind'} (none|tailwind|bootstrap|bulma|materialize)
- Icons: ${opts?.iconSet || 'fontawesome'} (none|fontawesome|lucide|material-icons)
- Animations: ${opts?.animationLib || 'animatecss'} (none|animatecss|aos)

Rules:
- Include only the requested CDNs. Avoid other frameworks.
- Provide accessible navigation and focus styles.
- Add small interactive JS behaviors relevant to the request.
- Keep code neatly organized and commented.

Hints / CDNs to use if applicable:
${cdnHints}`
}

export async function POST(req: NextRequest) {
  try {
    const { apiKey, model, prompt, type = "component", options } = await req.json()

    if (!apiKey || !model || !prompt) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const genAI = new GoogleGenerativeAI(apiKey)
    const imageOnlyModels = new Set([
      'models/gemini-2.0-flash-preview-image-generation',
      'models/gemini-2.5-flash-image-preview',
    ])
    const modelToUse = imageOnlyModels.has(model) ? 'models/gemini-2.5-flash' : model
    const geminiModel = genAI.getGenerativeModel({ model: modelToUse })

    const directive = SINGLE_HTML_DIRECTIVE(options)
    const fullPrompt = `${directive}\n\nUser Request:\n${prompt}`

    const result = await geminiModel.generateContent(fullPrompt)
    const response = await result.response
    let generatedText = response.text()

    // Extract code from response if it's wrapped in markdown
    const codeMatch = generatedText.match(/```(?:html|tsx?|javascript|jsx?)?\n([\s\S]*?)\n?```/)
    if (codeMatch) {
      generatedText = codeMatch[1]
    }

    // Clean up the code
    generatedText = generatedText.trim()

    return NextResponse.json({ 
      code: generatedText,
      model: modelToUse,
      type 
    })

  } catch (error: any) {
    console.error("Generation error:", error)
    return NextResponse.json({ 
      error: error.message || "Failed to generate code" 
    }, { status: 500 })
  }
}
