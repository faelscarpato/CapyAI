"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import Link from "next/link"

const IMAGE_MODELS = [
  { id: "models/gemini-2.5-flash-image-preview", name: "Gemini 2.5 Flash Image Preview" },
  { id: "models/gemini-2.0-flash-preview-image-generation", name: "Gemini 2.0 Flash Preview Image Gen" },
]

export default function StudioPage() {
  const [apiKey, setApiKey] = useState("")
  const [model, setModel] = useState(IMAGE_MODELS[0].id)
  const [prompt, setPrompt] = useState("")
  const [style, setStyle] = useState("modern")
  const [isGenerating, setIsGenerating] = useState(false)
  const [images, setImages] = useState<{mimeType: string, dataUrl: string}[]>([])
  const [error, setError] = useState<string | null>(null)

  const handleGenerate = async () => {
    setError(null)
    setImages([])
    if (!apiKey || !prompt) {
      setError("Informe a API key e um prompt")
      return
    }
    setIsGenerating(true)
    try {
      const res = await fetch("/api/generate-image", {
        method: "POST",
        cache: "no-store",
        credentials: "omit",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          /* consider removing apiKey here if server uses its own key */
          prompt,
          style,
          model,
          output: "image"
        })
      })
      const data = await res.json()
      if (!res.ok || data.error) {
        throw new Error(data.error || `HTTP ${res.status}`)
      }
      setImages(data.images || [])
    } catch (e: any) {
      setError(e.message)
    }
    setIsGenerating(false)
  }

  return (
    <div className="min-h-screen bg-zinc-900 text-zinc-200">
      <header className="border-b border-zinc-800 sticky top-0 bg-zinc-900/80 backdrop-blur">
        <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link href="/" className="font-semibold tracking-tight">CapyUniverse IA</Link>
          <div className="text-sm">API Gemini</div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6 grid gap-6 md:grid-cols-3">
        <Card className="bg-zinc-950 border-zinc-800 md:col-span-1">
          <CardHeader>
            <CardTitle>Gerar Imagem</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="apiKey">Google AI Studio API Key</Label>
              <Input id="apiKey" type="password" value={apiKey} onChange={(e) => setApiKey(e.target.value)} />
            </div>
            <div>
              <Label>Modelo</Label>
              <Select value={model} onValueChange={setModel}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um modelo" />
                </SelectTrigger>
                <SelectContent>
                  {IMAGE_MODELS.map(m => (
                    <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="prompt">Prompt</Label>
              <Textarea id="prompt" rows={6} value={prompt} onChange={(e) => setPrompt(e.target.value)} placeholder="Descreva a imagem que deseja gerar" />
            </div>
            <div>
              <Label htmlFor="style">Estilo</Label>
              <Input id="style" value={style} onChange={(e) => setStyle(e.target.value)} placeholder="modern, cyberpunk, flat, ..." />
            </div>
            <Button onClick={handleGenerate} disabled={isGenerating || !apiKey || !prompt} className="w-full">
              {isGenerating ? "Gerando..." : "Gerar Imagem"}
            </Button>
            {error && <div className="text-red-400 text-sm">{error}</div>}
          </CardContent>
        </Card>

        <div className="md:col-span-2 grid gap-4">
          {images.length === 0 ? (
            <div className="h-96 border border-dashed border-zinc-800 rounded-lg flex items-center justify-center text-zinc-500">
              A imagem gerada aparecerá aqui
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {images.map((img, i) => (
                <Card key={i} className="bg-zinc-950 border-zinc-800 overflow-hidden">
                  <img src={img.dataUrl} alt={`generated-${i}`} className="w-full h-auto" />
                  <CardContent className="flex items-center justify-between p-3">
                    <div className="text-xs text-zinc-400">{img.mimeType}</div>
                    <a download={`image-${i}.png`} href={img.dataUrl} className="text-xs underline">Baixar</a>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

