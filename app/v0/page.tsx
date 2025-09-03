"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Split } from "@/components/ui/split-pane"
import { CodeEditor } from "@/components/code-editor"
import { Preview } from "@/components/preview"
import { ProjectManager } from "@/components/project-manager"
import { DeploymentPanel } from "@/components/deployment-panel"
import { Bot, Settings, Sparkles, Code, Eye, Play, Palette, Send } from "lucide-react"
import Link from "next/link"

const GEMINI_MODELS = [
  { id: "models/gemini-2.5-flash-image-preview", name: "Gemini 2.5 Flash Image Preview", description: "Fast, preview image + code" },
  { id: "models/gemini-2.5-pro", name: "Gemini 2.5 Pro", description: "Most capable for complex tasks" },
  { id: "models/gemini-2.5-flash", name: "Gemini 2.5 Flash", description: "Fast generation for UI code" },
  { id: "models/gemini-2.5-flash-lite", name: "Gemini 2.5 Flash Lite", description: "Lightweight, cost-efficient" },
  { id: "models/gemini-2.0-flash-preview-image-generation", name: "Gemini 2.0 Flash Preview Image Gen", description: "Preview image generation" },
  { id: "models/gemini-2.0-flash", name: "Gemini 2.0 Flash", description: "General fast generation" },
  { id: "models/gemini-2.0-flash-lite", name: "Gemini 2.0 Flash Lite", description: "Lightweight fast generation" },
]

const GENERATION_TYPES = [
  { id: "component", name: "UI Component", icon: Palette, description: "Generate React components" },
  { id: "page", name: "Full Page", icon: Code, description: "Generate complete pages" },
  { id: "app", name: "Full App", icon: Bot, description: "Generate entire applications" },
]

export default function V0Page() {
  const [apiKey, setApiKey] = useState("")
  const [selectedModel, setSelectedModel] = useState("")
  const [prompt, setPrompt] = useState("")
  const [generatedCode, setGeneratedCode] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)
  const [generationType, setGenerationType] = useState("component")
  const [showSettings, setShowSettings] = useState(false)
  const [designSpec, setDesignSpec] = useState("")
  const [messages, setMessages] = useState<{ role: 'user' | 'assistant'; content: string }[]>([])
  const [chatInput, setChatInput] = useState("")
  const [siteType, setSiteType] = useState<'website' | 'webapp'>('website')
  const [cssFramework, setCssFramework] = useState<'none' | 'tailwind' | 'bootstrap' | 'bulma' | 'materialize'>('tailwind')
  const [iconSet, setIconSet] = useState<'none' | 'fontawesome' | 'lucide' | 'material-icons'>('fontawesome')
  const [animationLib, setAnimationLib] = useState<'none' | 'animatecss' | 'aos'>('animatecss')

  const handleGenerate = async () => {
    if (!apiKey || !selectedModel) {
      alert("Please provide API key and select a model")
      return
    }

    setIsGenerating(true)
    try {
      {
        const historyText = messages.map(m => `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.content}`).join('\n')
        const basePrompt = (prompt && prompt.trim().length > 0) ? prompt : (historyText || 'Crie uma página inicial moderna.')
        // Live stream code directly
        const response = await fetch("/api/generate/stream", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ 
            apiKey, 
            model: selectedModel, 
            prompt: basePrompt, 
            type: generationType,
            options: { siteType, cssFramework, iconSet, animationLib, format: 'single-html' }
          })
        })

        if (!response.body) {
          // Fallback to non-streaming
          const fallback = await fetch("/api/generate", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ apiKey, model: selectedModel, prompt: basePrompt, type: generationType, options: { siteType, cssFramework, iconSet, animationLib, format: 'single-html' } })
          })
          const data = await fallback.json()
          if (data.error) alert(`Error: ${data.error}`)
          else setGeneratedCode(data.code)
          setDesignSpec("")
        } else {
          const reader = response.body.getReader()
          const decoder = new TextDecoder()
          setGeneratedCode("")
          setDesignSpec("")
          while (true) {
            const { done, value } = await reader.read()
            if (done) break
            const chunk = decoder.decode(value)
            // Filter out markdown fences just in case
            const clean = chunk.replaceAll("```", "")
            setGeneratedCode(prev => prev + clean)
          }
        }
      }
    } catch (error) {
      alert(`Error: ${error}`)
    }
    setIsGenerating(false)
  }

  const handleCodeChange = (value: string) => {
    setGeneratedCode(value)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center space-x-2">
              <Bot className="h-8 w-8 text-blue-600" />
              <span className="text-xl font-bold text-gray-900">v0 Clone</span>
            </Link>
            <div className="flex items-center space-x-4">
              <ProjectManager 
                currentCode={generatedCode}
                onLoadProject={(code) => setGeneratedCode(code)}
              />
              <DeploymentPanel 
                code={generatedCode}
                projectName="my-component"
              />
              <Dialog open={showSettings} onOpenChange={setShowSettings}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Settings className="h-4 w-4 mr-2" />
                    Settings
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle>API Configuration</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="apiKey">Google AI Studio API Key</Label>
                      <Input
                        id="apiKey"
                        type="password"
                        placeholder="Enter your API key"
                        value={apiKey}
                        onChange={(e) => setApiKey(e.target.value)}
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Get your API key from{" "}
                        <a href="https://makersuite.google.com/app/apikey" target="_blank" className="text-blue-600">
                          Google AI Studio
                        </a>
                      </p>
                    </div>
                    <div>
                      <Label htmlFor="model">Gemini Model</Label>
                      <Select value={selectedModel} onValueChange={setSelectedModel}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a model" />
                        </SelectTrigger>
                        <SelectContent>
                          {GEMINI_MODELS.map((model) => (
                            <SelectItem key={model.id} value={model.id}>
                              <div>
                                <div className="font-medium">{model.name}</div>
                                <div className="text-xs text-gray-500">{model.description}</div>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
              <Link href="/studio">
                <Button variant="outline" size="sm">Studio</Button>
              </Link>
              <Link href="/">
                <Button variant="ghost">Back to Hub</Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>
      
      <div className="flex flex-col md:flex-row h-[calc(100vh-4rem)]">
        {/* Chat Panel */}
        <div className="w-full md:w-[380px] lg:w-[440px] bg-white border-b md:border-b-0 md:border-r flex flex-col">
          <div className="p-4 border-b">
            <h2 className="text-lg font-semibold">CapyIDE Chat</h2>
            <p className="text-xs text-gray-500 mt-1">Converse para gerar código ({generationType})</p>
            <div className="mt-3 grid grid-cols-3 gap-2">
              {GENERATION_TYPES.map((type) => {
                const Icon = type.icon
                const active = generationType === type.id
                return (
                  <Button key={type.id} size="sm" variant={active ? 'default' : 'outline'} onClick={() => setGenerationType(type.id)} className="h-8">
                    <Icon className="h-3 w-3 mr-1" />
                    <span className="text-xs">{type.name.split(' ')[0]}</span>
                  </Button>
                )
              })}
            </div>
            {/* Advanced options: site type + frameworks */}
            <div className="mt-3 space-y-3">
              <div>
                <Label className="text-xs">Tipo</Label>
                <div className="mt-1 grid grid-cols-2 gap-2">
                  <Button size="sm" variant={siteType==='website'?'default':'outline'} className="h-8" onClick={()=>setSiteType('website')}>Website</Button>
                  <Button size="sm" variant={siteType==='webapp'?'default':'outline'} className="h-8" onClick={()=>setSiteType('webapp')}>WebApp</Button>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <div>
                  <Label className="text-xs">CSS</Label>
                  <Select value={cssFramework} onValueChange={(v:any)=>setCssFramework(v)}>
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue placeholder="CSS" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      <SelectItem value="tailwind">Tailwind (CDN)</SelectItem>
                      <SelectItem value="bootstrap">Bootstrap 5</SelectItem>
                      <SelectItem value="bulma">Bulma</SelectItem>
                      <SelectItem value="materialize">Materialize</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-xs">Icons</Label>
                  <Select value={iconSet} onValueChange={(v:any)=>setIconSet(v)}>
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue placeholder="ÍIcons" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      <SelectItem value="fontawesome">Font Awesome</SelectItem>
                      <SelectItem value="lucide">Lucide</SelectItem>
                      <SelectItem value="material-icons">Material Icons</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-xs">Animações</Label>
                  <Select value={animationLib} onValueChange={(v:any)=>setAnimationLib(v)}>
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue placeholder="Animações" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      <SelectItem value="animatecss">Animate.css</SelectItem>
                      <SelectItem value="aos">AOS</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.length === 0 && (
              <div className="text-sm text-gray-500">O que vamos gerar hoje?</div>
            )}
            {messages.map((m, idx) => (
              <div key={idx} className={`rounded-lg p-3 text-sm ${m.role === 'user' ? 'bg-blue-50 text-gray-900 ml-auto max-w-[85%]' : 'bg-gray-50 text-gray-800 mr-auto max-w-[90%]'}`}>
                {m.content}
              </div>
            ))}
          </div>

          <div className="p-3 border-t bg-white">
            <div className="flex items-center gap-2">
              <input
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="Descreva o que deseja criar..."
                className="flex-1 text-sm rounded-md border px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
              />
              <Button
                size="sm"
                onClick={async () => {
                  if (!apiKey || !selectedModel || !chatInput.trim()) {
                    alert('Configure API key, modelo e escreva o prompt')
                    return
                  }
                  const userMsg = { role: 'user' as const, content: chatInput.trim() }
                  setMessages((prev) => [...prev, userMsg, { role: 'assistant', content: 'Gerando código...' }])
                  setChatInput('')
                  setIsGenerating(true)
                  try {
                    const history = [...messages, userMsg]
                    const historyText = history.map(m => `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.content}`).join('\n')
                    const instruction = `\n\nGere um único arquivo HTML completo (<!DOCTYPE html> + <html> + <head> + <body>) com CSS e JS embutidos (tags <style> e <script>). Mobile-first, acessível e pronto para produção.\n\nPreferências:\n- Tipo: ${siteType}\n- CSS: ${cssFramework}\n- ÍIcons: ${iconSet}\n- Animações: ${animationLib}\n\nRegras:\n- Inclua os CDNs necessários no <head> de acordo com as preferências.\n- Use semântica, ARIA e navegação por teclado.\n- Evite cercas de markdown.\n- Antes de imprimir, pense e melhore: organização, tokens CSS (variáveis), layouts responsivos, microinterações, performance.\n- Entregue somente o código final, sem explicações.`
                    const res = await fetch('/api/generate/stream', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ apiKey, model: selectedModel, prompt: historyText + instruction, type: generationType, options: { siteType, cssFramework, iconSet, animationLib, format: 'single-html' } })
                    })
                    if (!res.body) {
                      const fb = await fetch('/api/generate', {
                        method: 'POST', headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ apiKey, model: selectedModel, prompt: historyText + instruction, type: generationType, options: { siteType, cssFramework, iconSet, animationLib, format: 'single-html' } })
                      })
                      const data = await fb.json()
                      if (data.error) throw new Error(data.error)
                      setGeneratedCode(data.code)
                    } else {
                      setGeneratedCode('')
                      const reader = res.body.getReader()
                      const decoder = new TextDecoder()
                      while (true) {
                        const { done, value } = await reader.read()
                        if (done) break
                        const chunk = decoder.decode(value)
                        const clean = chunk.replaceAll('```', '')
                        setGeneratedCode(prev => prev + clean)
                      }
                    }
                    setMessages((prev) => {
                      const copy = [...prev]
                      copy[copy.length - 1] = { role: 'assistant', content: 'Código atualizado no editor.' }
                      return copy
                    })
                  } catch (e: any) {
                    setMessages((prev) => {
                      const copy = [...prev]
                      copy[copy.length - 1] = { role: 'assistant', content: `Erro: ${e.message}` }
                      return copy
                    })
                  }
                  setIsGenerating(false)
                }}
                disabled={isGenerating}
                className="shrink-0"
                aria-label="Enviar"
              >
                <Send className={`h-4 w-4 ${isGenerating ? 'opacity-50' : ''}`} />
              </Button>
            </div>
            <div className="flex items-center justify-between mt-2">
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <span className={`w-2 h-2 rounded-full ${apiKey && selectedModel ? 'bg-green-500' : 'bg-red-500'}`} />
                <span>{apiKey && selectedModel ? `API pronta (${selectedModel})` : 'Configure a API'}</span>
              </div>
              <Button variant="ghost" size="sm" onClick={handleGenerate} disabled={!apiKey || !selectedModel || isGenerating}>
                <Sparkles className="h-4 w-4 mr-1" /> Sugerir
              </Button>
            </div>
          </div>
        </div>

        {/* Right Panel - Code Editor and Preview */}
        <div className="flex-1 flex flex-col">
          <Tabs defaultValue="editor" className="flex-1 flex flex-col">
            <div className="border-b px-4">
              <TabsList>
                <TabsTrigger value="editor" className="flex items-center">
                  <Code className="h-4 w-4 mr-2" />
                  Code
                </TabsTrigger>
                <TabsTrigger value="preview" className="flex items-center">
                  <Eye className="h-4 w-4 mr-2" />
                  Preview
                </TabsTrigger>
                <TabsTrigger value="split" className="flex items-center">
                  <Play className="h-4 w-4 mr-2" />
                  Split View
                </TabsTrigger>
                {designSpec && (
                  <TabsTrigger value="design" className="flex items-center">
                    <Palette className="h-4 w-4 mr-2" />
                    Design Spec
                  </TabsTrigger>
                )}
              </TabsList>
            </div>

            <TabsContent value="editor" className="flex-1 mt-0">
              <CodeEditor
                code={generatedCode}
                onChange={handleCodeChange}
                language="html"
              />
            </TabsContent>

            <TabsContent value="preview" className="flex-1 mt-0">
              <Preview code={generatedCode} />
            </TabsContent>

            <TabsContent value="split" className="flex-1 mt-0">
              <div className="flex h-full">
                <div className="flex-1 border-r">
                  <CodeEditor
                    code={generatedCode}
                    onChange={handleCodeChange}
                    language="html"
                  />
                </div>
                <div className="flex-1">
                  <Preview code={generatedCode} />
                </div>
              </div>
            </TabsContent>

            {/* Design Specification Tab (only show for image generation) */}
            {designSpec && (
              <TabsContent value="design" className="flex-1 mt-0 p-4 overflow-y-auto">
                <div className="max-w-4xl mx-auto">
                  <h3 className="text-lg font-semibold mb-4">Design Specification</h3>
                  <div className="prose prose-sm max-w-none">
                    <pre className="whitespace-pre-wrap text-sm bg-gray-50 p-4 rounded-lg">
                      {designSpec}
                    </pre>
                  </div>
                </div>
              </TabsContent>
            )}
          </Tabs>
        </div>
      </div>
    </div>
  )
}


