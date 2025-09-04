"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import {
  Bot,
  Code,
  Eye,
  FileText,
  Plus,
  Save,
  Share,
  Download,
  Play,
  RefreshCw,
  Maximize2,
  Minimize2,
  X,
  Send,
  User,
  ExternalLink,
  GitBranch,
  History,
  Zap,
  Sparkles,
  Terminal,
  Search,
  File,
  Database,
  Settings,
  Menu,
  Smartphone,
  Tablet,
  Monitor,
  Key,
  AlertCircle,
} from "lucide-react"
import Link from "next/link"
import { Alert, AlertDescription } from "@/components/ui/alert"

// Mock data for projects and files
const mockProjects = [
  {
    id: "1",
    name: "AI Dashboard",
    description: "Modern dashboard with AI components",
    lastModified: "2 hours ago",
    files: [
      {
        name: "app/page.tsx",
        type: "file",
        content: `import { Button } from "@/components/ui/button"\n\nexport default function HomePage() {\n  return (\n    <div className="p-4 md:p-8">\n      <h1 className="text-2xl md:text-4xl font-bold">AI Dashboard</h1>\n      <Button className="mt-4">Get Started</Button>\n    </div>\n  )\n}`,
      },
      { name: "components/dashboard.tsx", type: "file", content: "// Dashboard component" },
      {
        name: "styles/globals.css",
        type: "file",
        content: "@tailwind base;\n@tailwind components;\n@tailwind utilities;",
      },
    ],
  },
  {
    id: "2",
    name: "E-commerce Store",
    description: "Full-stack e-commerce application",
    lastModified: "1 day ago",
    files: [
      { name: "app/page.tsx", type: "file", content: "// E-commerce homepage" },
      { name: "components/product-card.tsx", type: "file", content: "// Product card component" },
    ],
  },
]

const codeTemplates = [
  {
    name: "React Component",
    code: `import React from 'react'\n\ninterface Props {\n  // Define your props here\n}\n\nexport default function Component({ }: Props) {\n  return (\n    <div className="p-4">\n      {/* Your component JSX */}\n    </div>\n  )\n}`,
  },
  {
    name: "Next.js Page",
    code: `export default function Page() {\n  return (\n    <div className="container mx-auto p-4 md:p-8">\n      <h1 className="text-2xl md:text-4xl font-bold">Page Title</h1>\n    </div>\n  )\n}`,
  },
  {
    name: "API Route",
    code: `import { NextRequest, NextResponse } from 'next/server'\n\nexport async function GET(request: NextRequest) {\n  return NextResponse.json({ message: 'Hello World' })\n}\n\nexport async function POST(request: NextRequest) {\n  const body = await request.json()\n  return NextResponse.json({ received: body })\n}`,
  },
]

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
}

export default function IDEPage() {
  const [selectedProject, setSelectedProject] = useState(mockProjects[0])
  const [selectedFile, setSelectedFile] = useState(selectedProject.files[0])
  const [code, setCode] = useState(selectedFile.content)
  const [isPreviewMaximized, setIsPreviewMaximized] = useState(false)
  const [activeTab, setActiveTab] = useState("editor")
  const [showFileExplorer, setShowFileExplorer] = useState(true)
  const [showChat, setShowChat] = useState(true)
  const [isRunning, setIsRunning] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [expandedFolders, setExpandedFolders] = useState<string[]>(["root"])
  const [isMobile, setIsMobile] = useState(false)
  const [previewMode, setPreviewMode] = useState<"desktop" | "tablet" | "mobile">("desktop")

  // API Configuration
  const [apiKey, setApiKey] = useState("")
  const [selectedModel, setSelectedModel] = useState("gemini-1.5-flash")
  const [isApiConfigOpen, setIsApiConfigOpen] = useState(false)
  const [apiError, setApiError] = useState("")

  // Chat state
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content:
        "Hello! I'm your AI coding assistant powered by Google's Gemini. I can help you write code, debug issues, explain concepts, and build amazing applications. Please configure your Google AI Studio API key to get started.",
    },
  ])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const previewRef = useRef<HTMLIFrameElement>(null)
  const editorRef = useRef<HTMLTextAreaElement>(null)

  // Check if mobile on mount
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
      if (window.innerWidth < 768) {
        setShowFileExplorer(false)
        setShowChat(false)
      }
    }

    checkMobile()
    window.addEventListener("resize", checkMobile)
    return () => window.removeEventListener("resize", checkMobile)
  }, [])

  // Load API key from localStorage
  useEffect(() => {
    const savedApiKey = localStorage.getItem("gemini-api-key")
    const savedModel = localStorage.getItem("gemini-model")
    if (savedApiKey) {
      setApiKey(savedApiKey)
    }
    if (savedModel) {
      setSelectedModel(savedModel)
    }
  }, [])

  // Save API configuration
  const saveApiConfig = () => {
    if (!apiKey.trim()) {
      setApiError("Please enter a valid API key")
      return
    }

    localStorage.setItem("gemini-api-key", apiKey)
    localStorage.setItem("gemini-model", selectedModel)
    setApiError("")
    setIsApiConfigOpen(false)
  }

  // Call Gemini API
  const callGeminiAPI = async (userMessage: string) => {
    if (!apiKey) {
      throw new Error("API key not configured")
    }

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${selectedModel}:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: `You are an expert coding assistant. Help with this request: ${userMessage}\n\nContext: The user is working on a ${selectedProject.name} project with the following code:\n\n${code}\n\nProvide helpful, concise responses focused on coding assistance.`,
                },
              ],
            },
          ],
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 1024,
          },
        }),
      },
    )

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error?.message || "Failed to get response from Gemini")
    }

    const data = await response.json()
    return data.candidates[0]?.content?.parts[0]?.text || "Sorry, I couldn't generate a response."
  }

  // Handle chat input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value)
  }

  // Handle chat submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim()) return

    if (!apiKey) {
      setIsApiConfigOpen(true)
      return
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input.trim(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsLoading(true)

    try {
      const response = await callGeminiAPI(userMessage.content)

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: response,
      }

      setMessages((prev) => [...prev, aiMessage])
    } catch (error) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: `Error: ${error instanceof Error ? error.message : "Something went wrong"}. Please check your API key and try again.`,
      }
      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  // Auto-save functionality
  useEffect(() => {
    const timer = setTimeout(() => {
      console.log("Auto-saving...")
    }, 2000)
    return () => clearTimeout(timer)
  }, [code])

  const handleRunCode = () => {
    setIsRunning(true)
    setTimeout(() => {
      setIsRunning(false)
      if (previewRef.current) {
        const previewDoc = previewRef.current.contentDocument
        if (previewDoc) {
          previewDoc.open()
          previewDoc.write(`
            <!DOCTYPE html>
            <html>
              <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <script src="https://unpkg.com/react@18/umd/react.development.js"></script>
                <script src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"></script>
                <script src="https://cdn.tailwindcss.com"></script>
                <style>
                  body { margin: 0; padding: 16px; font-family: system-ui; }
                  @media (min-width: 768px) { body { padding: 20px; } }
                </style>
              </head>
              <body>
                <div id="root">
                  <div class="p-4 md:p-8">
                    <h1 class="text-2xl md:text-4xl font-bold mb-4">AI Dashboard</h1>
                    <p class="text-gray-600 mb-4 md:mb-6">Welcome to your responsive AI dashboard</p>
                    <button class="bg-blue-500 text-white px-4 py-2 md:px-6 md:py-3 rounded-lg hover:bg-blue-600 transition-colors w-full md:w-auto">
                      Get Started
                    </button>
                    <div class="mt-6 md:mt-8 grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
                      <div class="bg-gray-50 p-4 md:p-6 rounded-lg">
                        <h3 class="font-semibold mb-2">Analytics</h3>
                        <p class="text-gray-600 text-sm">Track performance</p>
                      </div>
                      <div class="bg-gray-50 p-4 md:p-6 rounded-lg">
                        <h3 class="font-semibold mb-2">Reports</h3>
                        <p class="text-gray-600 text-sm">Generate insights</p>
                      </div>
                      <div class="bg-gray-50 p-4 md:p-6 rounded-lg">
                        <h3 class="font-semibold mb-2">Settings</h3>
                        <p class="text-gray-600 text-sm">Configure app</p>
                      </div>
                    </div>
                  </div>
                </div>
              </body>
            </html>
          `)
          previewDoc.close()
        }
      }
    }, 1000)
  }

  const handleFileSelect = (file: any) => {
    setSelectedFile(file)
    setCode(file.content)
  }

  const insertTemplate = (template: any) => {
    setCode(template.code)
  }

  const handleQuickAction = (action: string) => {
    setInput(action)
  }

  const getPreviewClass = () => {
    switch (previewMode) {
      case "mobile":
        return "w-80 h-[600px] mx-auto"
      case "tablet":
        return "w-[768px] h-[600px] mx-auto max-w-full"
      default:
        return "w-full h-full"
    }
  }

  // API Configuration Modal
  const ApiConfigModal = () => (
    <Dialog open={isApiConfigOpen} onOpenChange={setIsApiConfigOpen}>
      <DialogContent className="w-[95vw] max-w-md mx-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Key className="h-5 w-5" />
            <span>Configure Gemini API</span>
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="api-key">Google AI Studio API Key</Label>
            <Input
              id="api-key"
              type="password"
              placeholder="Enter your API key..."
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              className="mt-1"
            />
            <p className="text-xs text-gray-500 mt-1">
              Get your API key from{" "}
              <a
                href="https://aistudio.google.com/app/apikey"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500 hover:underline"
              >
                Google AI Studio
              </a>
            </p>
          </div>

          <div>
            <Label htmlFor="model-select">Model</Label>
            <Select value={selectedModel} onValueChange={setSelectedModel}>
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="gemini-1.5-flash">Gemini 1.5 Flash</SelectItem>
                <SelectItem value="gemini-2.0-flash-exp">Gemini 2.0 Flash (Experimental)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {apiError && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{apiError}</AlertDescription>
            </Alert>
          )}

          <div className="flex space-x-2">
            <Button onClick={saveApiConfig} className="flex-1">
              Save Configuration
            </Button>
            <Button variant="outline" onClick={() => setIsApiConfigOpen(false)}>
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )

  // Mobile Navigation
  const MobileNav = () => (
    <div className="md:hidden flex items-center space-x-2">
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="ghost" size="sm">
            <Menu className="h-4 w-4" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-80 p-0">
          <div className="h-full bg-white">
            {/* File Explorer in Mobile */}
            <div className="p-3 border-b border-gray-200">
              <h3 className="font-semibold text-sm mb-2">Explorer</h3>
              <div className="relative">
                <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search files..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8 h-8 text-sm"
                />
              </div>
            </div>

            <div className="p-3 border-b border-gray-200">
              <select
                className="w-full p-2 border rounded text-sm"
                value={selectedProject.id}
                onChange={(e) => {
                  const project = mockProjects.find((p) => p.id === e.target.value)
                  if (project) {
                    setSelectedProject(project)
                    setSelectedFile(project.files[0])
                    setCode(project.files[0].content)
                  }
                }}
              >
                {mockProjects.map((project) => (
                  <option key={project.id} value={project.id}>
                    {project.name}
                  </option>
                ))}
              </select>
            </div>

            <ScrollArea className="flex-1">
              <div className="p-2">
                {selectedProject.files.map((file, index) => (
                  <div
                    key={index}
                    className={`flex items-center space-x-2 p-2 rounded cursor-pointer hover:bg-gray-100 ${
                      selectedFile.name === file.name ? "bg-blue-50 text-blue-600" : ""
                    }`}
                    onClick={() => handleFileSelect(file)}
                  >
                    <File className="h-4 w-4" />
                    <span className="text-sm">{file.name}</span>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>
        </SheetContent>
      </Sheet>

      <Sheet>
        <SheetTrigger asChild>
          <Button variant="ghost" size="sm">
            <Bot className="h-4 w-4" />
          </Button>
        </SheetTrigger>
        <SheetContent side="right" className="w-80 p-0">
          <div className="h-full bg-white flex flex-col">
            {/* Chat in Mobile */}
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Bot className="h-5 w-5 text-blue-600" />
                  <h3 className="font-semibold">AI Assistant</h3>
                </div>
                <Button variant="ghost" size="sm" onClick={() => setIsApiConfigOpen(true)}>
                  <Settings className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-sm text-gray-600 mt-1">
                Model: {selectedModel === "gemini-2.0-flash-exp" ? "Gemini 2.0 Flash" : "Gemini 1.5 Flash"}
              </p>
            </div>

            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex items-start space-x-3 ${
                      message.role === "user" ? "flex-row-reverse space-x-reverse" : ""
                    }`}
                  >
                    <Avatar className="h-8 w-8 flex-shrink-0">
                      {message.role === "user" ? (
                        <AvatarFallback>
                          <User className="h-4 w-4" />
                        </AvatarFallback>
                      ) : (
                        <AvatarFallback>
                          <Bot className="h-4 w-4" />
                        </AvatarFallback>
                      )}
                    </Avatar>
                    <div
                      className={`max-w-[80%] rounded-lg p-3 ${
                        message.role === "user" ? "bg-blue-500 text-white" : "bg-gray-100 text-gray-900"
                      }`}
                    >
                      <div className="whitespace-pre-wrap text-sm">{message.content}</div>
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="flex items-start space-x-3">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback>
                        <Bot className="h-4 w-4" />
                      </AvatarFallback>
                    </Avatar>
                    <div className="bg-gray-100 rounded-lg p-3">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                        <div
                          className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                          style={{ animationDelay: "0.1s" }}
                        ></div>
                        <div
                          className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                          style={{ animationDelay: "0.2s" }}
                        ></div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>

            <div className="p-4 border-t border-gray-200">
              <form onSubmit={handleSubmit} className="flex space-x-2">
                <Input
                  value={input}
                  onChange={handleInputChange}
                  placeholder="Ask about your code..."
                  className="flex-1"
                  disabled={isLoading}
                />
                <Button type="submit" disabled={isLoading || !input.trim()}>
                  <Send className="h-4 w-4" />
                </Button>
              </form>

              <div className="flex flex-wrap gap-2 mt-3">
                <Button variant="outline" size="sm" onClick={() => handleQuickAction("Explain this code")}>
                  <Sparkles className="h-3 w-3 mr-1" />
                  Explain
                </Button>
                <Button variant="outline" size="sm" onClick={() => handleQuickAction("Find bugs in this code")}>
                  <Search className="h-3 w-3 mr-1" />
                  Debug
                </Button>
                <Button variant="outline" size="sm" onClick={() => handleQuickAction("Optimize this code")}>
                  <Zap className="h-3 w-3 mr-1" />
                  Optimize
                </Button>
              </div>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  )

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Top Navigation */}
      <header className="bg-white border-b border-gray-200 px-2 md:px-4 py-2 flex items-center justify-between">
        <div className="flex items-center space-x-2 md:space-x-4">
          <Link href="/" className="flex items-center space-x-2">
            <Bot className="h-5 w-5 md:h-6 md:w-6 text-blue-600" />
            <span className="font-bold text-sm md:text-lg">v0 IDE</span>
          </Link>
          <Separator orientation="vertical" className="h-4 md:h-6 hidden sm:block" />
          <div className="hidden sm:flex items-center space-x-2">
            <Badge variant="outline" className="text-xs">
              {selectedProject.name}
            </Badge>
            <Button variant="ghost" size="sm" className="hidden md:flex">
              <GitBranch className="h-4 w-4 mr-1" />
              main
            </Button>
          </div>
        </div>

        <div className="flex items-center space-x-1 md:space-x-2">
          <MobileNav />

          <div className="hidden md:flex items-center space-x-2">
            <Button variant="ghost" size="sm">
              <History className="h-4 w-4 mr-1" />
              History
            </Button>
            <Button variant="ghost" size="sm">
              <Share className="h-4 w-4 mr-1" />
              Share
            </Button>
            <Button variant="ghost" size="sm">
              <Download className="h-4 w-4 mr-1" />
              Export
            </Button>
          </div>

          <Button variant="ghost" size="sm" onClick={() => setIsApiConfigOpen(true)}>
            <Settings className="h-4 w-4" />
          </Button>

          <Button
            onClick={handleRunCode}
            disabled={isRunning}
            className="bg-green-600 hover:bg-green-700 text-xs md:text-sm"
          >
            {isRunning ? (
              <RefreshCw className="h-3 w-3 md:h-4 md:w-4 mr-1 animate-spin" />
            ) : (
              <Play className="h-3 w-3 md:h-4 md:w-4 mr-1" />
            )}
            <span className="hidden sm:inline">{isRunning ? "Running..." : "Run"}</span>
          </Button>
        </div>
      </header>

      {/* Main IDE Layout */}
      <div className="flex-1 flex">
        {isMobile ? (
          // Mobile Layout
          <div className="w-full flex flex-col">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
              <div className="bg-white border-b border-gray-200 px-2">
                <TabsList className="grid w-full grid-cols-3 h-10">
                  <TabsTrigger value="editor" className="text-xs">
                    <Code className="h-3 w-3 mr-1" />
                    Code
                  </TabsTrigger>
                  <TabsTrigger value="preview" className="text-xs">
                    <Eye className="h-3 w-3 mr-1" />
                    Preview
                  </TabsTrigger>
                  <TabsTrigger value="terminal" className="text-xs">
                    <Terminal className="h-3 w-3 mr-1" />
                    Terminal
                  </TabsTrigger>
                </TabsList>
              </div>

              <TabsContent value="editor" className="flex-1 m-0">
                <div className="h-full flex flex-col">
                  <div className="bg-white border-b border-gray-200 px-2 py-1 flex items-center justify-between">
                    <Badge variant="outline" className="text-xs">
                      {selectedFile.name}
                    </Badge>
                    <Button variant="ghost" size="sm">
                      <Save className="h-3 w-3" />
                    </Button>
                  </div>
                  <div className="flex-1 relative">
                    <textarea
                      ref={editorRef}
                      value={code}
                      onChange={(e) => setCode(e.target.value)}
                      className="w-full h-full p-2 pl-8 font-mono text-xs border-none outline-none resize-none bg-gray-900 text-gray-100"
                      placeholder="Start coding..."
                      spellCheck={false}
                    />
                    <div className="absolute left-0 top-0 w-6 h-full bg-gray-800 border-r border-gray-700 flex flex-col text-gray-400 text-xs font-mono pt-2">
                      {code.split("\n").map((_, index) => (
                        <div key={index} className="h-4 flex items-center justify-end pr-1 leading-4">
                          {index + 1}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="preview" className="flex-1 m-0">
                <div className="h-full bg-white flex flex-col">
                  <div className="bg-gray-100 px-2 py-1 flex items-center justify-between border-b text-xs">
                    <span className="text-gray-600">localhost:3000</span>
                    <div className="flex items-center space-x-1">
                      <Button
                        variant={previewMode === "mobile" ? "default" : "ghost"}
                        size="sm"
                        onClick={() => setPreviewMode("mobile")}
                        className="p-1"
                      >
                        <Smartphone className="h-3 w-3" />
                      </Button>
                      <Button
                        variant={previewMode === "tablet" ? "default" : "ghost"}
                        size="sm"
                        onClick={() => setPreviewMode("tablet")}
                        className="p-1"
                      >
                        <Tablet className="h-3 w-3" />
                      </Button>
                      <Button
                        variant={previewMode === "desktop" ? "default" : "ghost"}
                        size="sm"
                        onClick={() => setPreviewMode("desktop")}
                        className="p-1"
                      >
                        <Monitor className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                  <div className="flex-1 overflow-auto p-2">
                    {isRunning ? (
                      <div className="flex items-center justify-center h-full text-gray-500">
                        <RefreshCw className="h-5 w-5 animate-spin mr-2" />
                        <span className="text-sm">Building preview...</span>
                      </div>
                    ) : (
                      <div
                        className={`${getPreviewClass()} border border-gray-300 rounded-lg overflow-hidden bg-white shadow-sm`}
                      >
                        <iframe ref={previewRef} className="w-full h-full min-h-[400px]" title="Preview" />
                      </div>
                    )}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="terminal" className="flex-1 m-0">
                <div className="h-full bg-gray-900 text-green-400 font-mono p-2 text-xs">
                  <div className="mb-2">
                    <span className="text-blue-400">user@v0-ide</span>
                    <span className="text-white">:</span>
                    <span className="text-yellow-400">~/project</span>
                    <span className="text-white">$ </span>
                  </div>
                  <div className="text-gray-300">
                    <div>npm run dev</div>
                    <div className="text-green-400">✓ Ready on http://localhost:3000</div>
                    <div className="text-green-400">✓ Compiled successfully</div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        ) : (
          // Desktop Layout
          <ResizablePanelGroup direction="horizontal">
            {/* Left Sidebar - File Explorer */}
            {showFileExplorer && (
              <>
                <ResizablePanel defaultSize={20} minSize={15} maxSize={30}>
                  <div className="h-full bg-white border-r border-gray-200">
                    <div className="p-3 border-b border-gray-200">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold text-sm">Explorer</h3>
                        <Button variant="ghost" size="sm">
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="relative">
                        <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                          placeholder="Search files..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="pl-8 h-8 text-sm"
                        />
                      </div>
                    </div>

                    <div className="p-3 border-b border-gray-200">
                      <select
                        className="w-full p-2 border rounded text-sm"
                        value={selectedProject.id}
                        onChange={(e) => {
                          const project = mockProjects.find((p) => p.id === e.target.value)
                          if (project) {
                            setSelectedProject(project)
                            setSelectedFile(project.files[0])
                            setCode(project.files[0].content)
                          }
                        }}
                      >
                        {mockProjects.map((project) => (
                          <option key={project.id} value={project.id}>
                            {project.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <ScrollArea className="flex-1">
                      <div className="p-2">
                        {selectedProject.files.map((file, index) => (
                          <div
                            key={index}
                            className={`flex items-center space-x-2 p-2 rounded cursor-pointer hover:bg-gray-100 ${
                              selectedFile.name === file.name ? "bg-blue-50 text-blue-600" : ""
                            }`}
                            onClick={() => handleFileSelect(file)}
                          >
                            <File className="h-4 w-4" />
                            <span className="text-sm">{file.name}</span>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </div>
                </ResizablePanel>
                <ResizableHandle />
              </>
            )}

            {/* Main Editor Area */}
            <ResizablePanel defaultSize={showChat ? 50 : 70}>
              <div className="h-full flex flex-col">
                <div className="bg-white border-b border-gray-200">
                  <Tabs value={activeTab} onValueChange={setActiveTab}>
                    <div className="flex items-center justify-between px-4 py-2">
                      <TabsList className="grid w-auto grid-cols-3">
                        <TabsTrigger value="editor" className="flex items-center space-x-1">
                          <Code className="h-4 w-4" />
                          <span>Editor</span>
                        </TabsTrigger>
                        <TabsTrigger value="preview" className="flex items-center space-x-1">
                          <Eye className="h-4 w-4" />
                          <span>Preview</span>
                        </TabsTrigger>
                        <TabsTrigger value="terminal" className="flex items-center space-x-1">
                          <Terminal className="h-4 w-4" />
                          <span>Terminal</span>
                        </TabsTrigger>
                      </TabsList>

                      <div className="flex items-center space-x-2">
                        <Badge variant="outline" className="text-xs">
                          {selectedFile.name}
                        </Badge>
                        <Button variant="ghost" size="sm">
                          <Save className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    <TabsContent value="editor" className="m-0">
                      <div className="h-[calc(100vh-140px)] flex">
                        <div className="flex-1 relative">
                          <textarea
                            ref={editorRef}
                            value={code}
                            onChange={(e) => setCode(e.target.value)}
                            className="w-full h-full p-4 pl-16 font-mono text-sm border-none outline-none resize-none bg-gray-900 text-gray-100"
                            placeholder="Start coding..."
                            spellCheck={false}
                          />
                          <div className="absolute left-0 top-0 w-12 h-full bg-gray-800 border-r border-gray-700 flex flex-col text-gray-400 text-xs font-mono pt-4">
                            {code.split("\n").map((_, index) => (
                              <div key={index} className="h-5 flex items-center justify-end pr-2">
                                {index + 1}
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="w-64 bg-white border-l border-gray-200 p-4">
                          <h4 className="font-semibold mb-3">Templates</h4>
                          <div className="space-y-2">
                            {codeTemplates.map((template, index) => (
                              <Button
                                key={index}
                                variant="outline"
                                size="sm"
                                className="w-full justify-start text-left bg-transparent"
                                onClick={() => insertTemplate(template)}
                              >
                                <Zap className="h-4 w-4 mr-2" />
                                {template.name}
                              </Button>
                            ))}
                          </div>

                          <Separator className="my-4" />

                          <h4 className="font-semibold mb-3">Quick Actions</h4>
                          <div className="space-y-2">
                            <Button variant="outline" size="sm" className="w-full justify-start bg-transparent">
                              <Plus className="h-4 w-4 mr-2" />
                              New Component
                            </Button>
                            <Button variant="outline" size="sm" className="w-full justify-start bg-transparent">
                              <FileText className="h-4 w-4 mr-2" />
                              New Page
                            </Button>
                            <Button variant="outline" size="sm" className="w-full justify-start bg-transparent">
                              <Database className="h-4 w-4 mr-2" />
                              Add API Route
                            </Button>
                          </div>
                        </div>
                      </div>
                    </TabsContent>

                    <TabsContent value="preview" className="m-0">
                      <div className="h-[calc(100vh-140px)] bg-white">
                        <div className="h-full border border-gray-200 rounded-lg overflow-hidden">
                          <div className="bg-gray-100 px-4 py-2 flex items-center justify-between border-b">
                            <div className="flex items-center space-x-2">
                              <div className="flex space-x-1">
                                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                                <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                              </div>
                              <span className="text-sm text-gray-600">localhost:3000</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <div className="flex border rounded">
                                <Button
                                  variant={previewMode === "desktop" ? "default" : "ghost"}
                                  size="sm"
                                  onClick={() => setPreviewMode("desktop")}
                                >
                                  <Monitor className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant={previewMode === "tablet" ? "default" : "ghost"}
                                  size="sm"
                                  onClick={() => setPreviewMode("tablet")}
                                >
                                  <Tablet className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant={previewMode === "mobile" ? "default" : "ghost"}
                                  size="sm"
                                  onClick={() => setPreviewMode("mobile")}
                                >
                                  <Smartphone className="h-4 w-4" />
                                </Button>
                              </div>
                              <Button variant="ghost" size="sm">
                                <RefreshCw className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setIsPreviewMaximized(!isPreviewMaximized)}
                              >
                                {isPreviewMaximized ? (
                                  <Minimize2 className="h-4 w-4" />
                                ) : (
                                  <Maximize2 className="h-4 w-4" />
                                )}
                              </Button>
                              <Button variant="ghost" size="sm">
                                <ExternalLink className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                          <div className="h-[calc(100%-48px)] flex items-center justify-center bg-gray-50">
                            {isRunning ? (
                              <div className="flex items-center space-x-2 text-gray-500">
                                <RefreshCw className="h-5 w-5 animate-spin" />
                                <span>Building preview...</span>
                              </div>
                            ) : (
                              <div
                                className={`${getPreviewClass()} border border-gray-300 rounded-lg overflow-hidden bg-white shadow-lg`}
                              >
                                <iframe ref={previewRef} className="w-full h-full" title="Preview" />
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </TabsContent>

                    <TabsContent value="terminal" className="m-0">
                      <div className="h-[calc(100vh-140px)] bg-gray-900 text-green-400 font-mono p-4">
                        <div className="mb-2">
                          <span className="text-blue-400">user@v0-ide</span>
                          <span className="text-white">:</span>
                          <span className="text-yellow-400">~/project</span>
                          <span className="text-white">$ </span>
                        </div>
                        <div className="text-gray-300">
                          <div>npm run dev</div>
                          <div className="text-green-400">✓ Ready on http://localhost:3000</div>
                          <div className="text-green-400">✓ Compiled successfully</div>
                        </div>
                      </div>
                    </TabsContent>
                  </Tabs>
                </div>
              </div>
            </ResizablePanel>

            {/* Right Sidebar - AI Chat */}
            {showChat && (
              <>
                <ResizableHandle />
                <ResizablePanel defaultSize={30} minSize={25} maxSize={40}>
                  <div className="h-full bg-white border-l border-gray-200 flex flex-col">
                    <div className="p-4 border-b border-gray-200">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Bot className="h-5 w-5 text-blue-600" />
                          <h3 className="font-semibold">AI Assistant</h3>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Button variant="ghost" size="sm" onClick={() => setIsApiConfigOpen(true)}>
                            <Settings className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => setShowChat(false)}>
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">
                        Model: {selectedModel === "gemini-2.0-flash-exp" ? "Gemini 2.0 Flash" : "Gemini 1.5 Flash"}
                      </p>
                    </div>

                    <ScrollArea className="flex-1 p-4">
                      <div className="space-y-4">
                        {messages.map((message) => (
                          <div
                            key={message.id}
                            className={`flex items-start space-x-3 ${
                              message.role === "user" ? "flex-row-reverse space-x-reverse" : ""
                            }`}
                          >
                            <Avatar className="h-8 w-8 flex-shrink-0">
                              {message.role === "user" ? (
                                <AvatarFallback>
                                  <User className="h-4 w-4" />
                                </AvatarFallback>
                              ) : (
                                <AvatarFallback>
                                  <Bot className="h-4 w-4" />
                                </AvatarFallback>
                              )}
                            </Avatar>
                            <div
                              className={`max-w-[80%] rounded-lg p-3 ${
                                message.role === "user" ? "bg-blue-500 text-white" : "bg-gray-100 text-gray-900"
                              }`}
                            >
                              <div className="whitespace-pre-wrap text-sm">{message.content}</div>
                            </div>
                          </div>
                        ))}
                        {isLoading && (
                          <div className="flex items-start space-x-3">
                            <Avatar className="h-8 w-8">
                              <AvatarFallback>
                                <Bot className="h-4 w-4" />
                              </AvatarFallback>
                            </Avatar>
                            <div className="bg-gray-100 rounded-lg p-3">
                              <div className="flex space-x-1">
                                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                                <div
                                  className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                                  style={{ animationDelay: "0.1s" }}
                                ></div>
                                <div
                                  className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                                  style={{ animationDelay: "0.2s" }}
                                ></div>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </ScrollArea>

                    <div className="p-4 border-t border-gray-200">
                      <form onSubmit={handleSubmit} className="flex space-x-2">
                        <Input
                          value={input}
                          onChange={handleInputChange}
                          placeholder="Ask about your code..."
                          className="flex-1"
                          disabled={isLoading}
                        />
                        <Button type="submit" disabled={isLoading || !input.trim()}>
                          <Send className="h-4 w-4" />
                        </Button>
                      </form>

                      <div className="flex flex-wrap gap-2 mt-3">
                        <Button variant="outline" size="sm" onClick={() => handleQuickAction("Explain this code")}>
                          <Sparkles className="h-3 w-3 mr-1" />
                          Explain
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => handleQuickAction("Find bugs in this code")}>
                          <Search className="h-3 w-3 mr-1" />
                          Debug
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => handleQuickAction("Optimize this code")}>
                          <Zap className="h-3 w-3 mr-1" />
                          Optimize
                        </Button>
                      </div>
                    </div>
                  </div>
                </ResizablePanel>
              </>
            )}
          </ResizablePanelGroup>
        )}
      </div>

      {/* Status Bar */}
      <footer className="bg-blue-600 text-white px-2 md:px-4 py-1 text-xs flex items-center justify-between">
        <div className="flex items-center space-x-2 md:space-x-4">
          <span>Line 1, Column 1</span>
          <span className="hidden sm:inline">TypeScript React</span>
          <span className="hidden md:inline">UTF-8</span>
          <span className="hidden md:inline">LF</span>
        </div>
        <div className="flex items-center space-x-2 md:space-x-4">
          <span className="flex items-center">
            <div className="w-2 h-2 bg-green-400 rounded-full mr-1"></div>
            <span className="hidden sm:inline">Connected</span>
          </span>
          <span className="hidden md:inline">Auto-save: On</span>
        </div>
      </footer>

      <ApiConfigModal />
    </div>
  )
}
