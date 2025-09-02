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
import { Bot, Settings, Sparkles, Code, Eye, Download, Play, Image, Palette } from "lucide-react"
import Link from "next/link"

const GEMINI_MODELS = [
  { id: "gemini-1.5-pro", name: "Gemini 1.5 Pro", description: "Most capable model for complex tasks" },
  { id: "gemini-1.5-flash", name: "Gemini 1.5 Flash", description: "Fast model for quick generations" },
  { id: "gemini-pro", name: "Gemini Pro", description: "Balanced performance and speed" },
  { id: "gemini-pro-vision", name: "Gemini Pro Vision", description: "Multimodal model with vision capabilities" }
]

const GENERATION_TYPES = [
  { id: "component", name: "UI Component", icon: Palette, description: "Generate React components" },
  { id: "page", name: "Full Page", icon: Code, description: "Generate complete pages" },
  { id: "app", name: "Full App", icon: Bot, description: "Generate entire applications" },
  { id: "image", name: "UI Design", icon: Image, description: "Generate UI mockups and designs" }
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

  const handleGenerate = async () => {
    if (!apiKey || !selectedModel || !prompt) {
      alert("Please provide API key, select a model, and enter a prompt")
      return
    }

    setIsGenerating(true)
    try {
      if (generationType === "image") {
        // Generate UI design specification and code
        const response = await fetch("/api/generate-image", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            apiKey,
            prompt,
            style: "modern"
          })
        })

        const data = await response.json()
        if (data.error) {
          alert(`Error: ${data.error}`)
        } else {
          setDesignSpec(data.designSpec)
          setGeneratedCode(data.code)
        }
      } else {
        // Generate code directly
        const response = await fetch("/api/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            apiKey,
            model: selectedModel,
            prompt,
            type: generationType
          })
        })

        const data = await response.json()
        if (data.error) {
          alert(`Error: ${data.error}`)
        } else {
          setGeneratedCode(data.code)
          setDesignSpec("") // Clear design spec for code generation
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
              <Link href="/">
                <Button variant="ghost">Back to Hub</Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="flex h-[calc(100vh-4rem)]">
        {/* Left Panel - Generation Controls */}
        <div className="w-80 bg-white border-r flex flex-col">
          <div className="p-4 border-b">
            <h2 className="text-lg font-semibold mb-4">Generate UI</h2>
            
            {/* Generation Type Selection */}
            <div className="space-y-3 mb-4">
              <Label>Generation Type</Label>
              <div className="grid grid-cols-2 gap-2">
                {GENERATION_TYPES.map((type) => {
                  const Icon = type.icon
                  return (
                    <Button
                      key={type.id}
                      variant={generationType === type.id ? "default" : "outline"}
                      size="sm"
                      onClick={() => setGenerationType(type.id)}
                      className="h-auto p-3 flex flex-col items-center"
                    >
                      <Icon className="h-4 w-4 mb-1" />
                      <span className="text-xs">{type.name}</span>
                    </Button>
                  )
                })}
              </div>
            </div>

            {/* Prompt Input */}
            <div className="space-y-2 mb-4">
              <Label htmlFor="prompt">Describe what you want to build</Label>
              <Textarea
                id="prompt"
                placeholder="e.g., Create a modern login form with email and password fields, styled with Tailwind CSS"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                rows={4}
              />
            </div>

            {/* API Status */}
            <div className="mb-4">
              <div className="flex items-center space-x-2">
                <div className={`w-2 h-2 rounded-full ${apiKey && selectedModel ? 'bg-green-500' : 'bg-red-500'}`} />
                <span className="text-sm text-gray-600">
                  {apiKey && selectedModel ? `Ready (${selectedModel})` : 'Configure API key'}
                </span>
              </div>
            </div>

            {/* Generate Button */}
            <Button 
              onClick={handleGenerate} 
              disabled={!apiKey || !selectedModel || !prompt || isGenerating}
              className="w-full"
            >
              {isGenerating ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  Generate
                </>
              )}
            </Button>
          </div>

          {/* Quick Examples */}
          <div className="p-4 flex-1 overflow-y-auto">
            <h3 className="text-sm font-medium mb-3">Quick Examples</h3>
            <div className="space-y-2">
              {[
                "Create a beautiful hero section with gradient background",
                "Build a responsive pricing table with 3 tiers",
                "Design a modern contact form with validation",
                "Create a dashboard with sidebar navigation",
                "Build a landing page for a SaaS product"
              ].map((example, i) => (
                <Button
                  key={i}
                  variant="ghost"
                  size="sm"
                  className="w-full text-left h-auto p-2 text-xs"
                  onClick={() => setPrompt(example)}
                >
                  {example}
                </Button>
              ))}
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
              </TabsList>
            </div>

            <TabsContent value="editor" className="flex-1 mt-0">
              <CodeEditor
                code={generatedCode}
                onChange={handleCodeChange}
                language="typescript"
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
                    language="typescript"
                  />
                </div>
                <div className="flex-1">
                  <Preview code={generatedCode} />
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}