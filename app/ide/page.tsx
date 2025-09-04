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
} from "lucide-react"
import Link from "next/link"

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
        content: `import { Button } from "@/components/ui/button"\n\nexport default function HomePage() {\n  return (\n    <div className="p-8">\n      <h1 className="text-4xl font-bold">AI Dashboard</h1>\n      <Button>Get Started</Button>\n    </div>\n  )\n}`,
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
    code: `import React from 'react'\n\ninterface Props {\n  // Define your props here\n}\n\nexport default function Component({ }: Props) {\n  return (\n    <div>\n      {/* Your component JSX */}\n    </div>\n  )\n}`,
  },
  {
    name: "Next.js Page",
    code: `export default function Page() {\n  return (\n    <div className="container mx-auto p-8">\n      <h1 className="text-4xl font-bold">Page Title</h1>\n    </div>\n  )\n}`,
  },
  {
    name: "API Route",
    code: `import { NextRequest, NextResponse } from 'next/server'\n\nexport async function GET(request: NextRequest) {\n  return NextResponse.json({ message: 'Hello World' })\n}\n\nexport async function POST(request: NextRequest) {\n  const body = await request.json()\n  return NextResponse.json({ received: body })\n}`,
  },
]

// Mock chat messages
const initialMessages = [
  {
    id: "welcome",
    role: "assistant" as const,
    content:
      "Hello! I'm your AI coding assistant. I can help you write code, debug issues, explain concepts, and build amazing applications. What would you like to work on today?",
  },
]

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

  // Chat state
  const [messages, setMessages] = useState(initialMessages)
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const previewRef = useRef<HTMLIFrameElement>(null)
  const editorRef = useRef<HTMLTextAreaElement>(null)

  // Handle chat input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value)
  }

  // Handle chat submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim()) return

    const userMessage = {
      id: Date.now().toString(),
      role: "user" as const,
      content: input.trim(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsLoading(true)

    // Simulate AI response
    setTimeout(() => {
      const aiMessage = {
        id: (Date.now() + 1).toString(),
        role: "assistant" as const,
        content: `I can help you with that! Based on your question "${userMessage.content}", here are some suggestions for your code...`,
      }
      setMessages((prev) => [...prev, aiMessage])
      setIsLoading(false)
    }, 1000)
  }

  // Auto-save functionality
  useEffect(() => {
    const timer = setTimeout(() => {
      // Auto-save logic here
      console.log("Auto-saving...")
    }, 2000)
    return () => clearTimeout(timer)
  }, [code])

  const handleRunCode = () => {
    setIsRunning(true)
    // Simulate code execution
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
                <script src="https://unpkg.com/react@18/umd/react.development.js"></script>
                <script src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"></script>
                <script src="https://cdn.tailwindcss.com"></script>
                <style>body { margin: 0; padding: 20px; font-family: system-ui; }</style>
              </head>
              <body>
                <div id="root">
                  <div class="p-8">
                    <h1 class="text-4xl font-bold mb-4">AI Dashboard</h1>
                    <button class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
                      Get Started
                    </button>
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

  const toggleFolder = (folderName: string) => {
    setExpandedFolders((prev) =>
      prev.includes(folderName) ? prev.filter((f) => f !== folderName) : [...prev, folderName],
    )
  }

  // Quick chat actions
  const handleQuickAction = (action: string) => {
    setInput(action)
  }

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Top Navigation */}
      <header className="bg-white border-b border-gray-200 px-4 py-2 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link href="/" className="flex items-center space-x-2">
            <Bot className="h-6 w-6 text-blue-600" />
            <span className="font-bold text-lg">v0 IDE</span>
          </Link>
          <Separator orientation="vertical" className="h-6" />
          <div className="flex items-center space-x-2">
            <Badge variant="outline">{selectedProject.name}</Badge>
            <Button variant="ghost" size="sm">
              <GitBranch className="h-4 w-4 mr-1" />
              main
            </Button>
          </div>
        </div>

        <div className="flex items-center space-x-2">
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
          <Button onClick={handleRunCode} disabled={isRunning} className="bg-green-600 hover:bg-green-700">
            {isRunning ? <RefreshCw className="h-4 w-4 mr-1 animate-spin" /> : <Play className="h-4 w-4 mr-1" />}
            {isRunning ? "Running..." : "Run"}
          </Button>
        </div>
      </header>

      {/* Main IDE Layout */}
      <div className="flex-1 flex">
        <ResizablePanelGroup direction="horizontal">
          {/* Left Sidebar - File Explorer */}
          {showFileExplorer && (
            <>
              <ResizablePanel defaultSize={20} minSize={15} maxSize={30}>
                <div className="h-full bg-white border-r border-gray-200">
                  {/* File Explorer Header */}
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

                  {/* Project Selector */}
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

                  {/* File Tree */}
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
              {/* Editor Tabs */}
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
                      {/* Code Editor */}
                      <div className="flex-1 relative">
                        <textarea
                          ref={editorRef}
                          value={code}
                          onChange={(e) => setCode(e.target.value)}
                          className="w-full h-full p-4 pl-16 font-mono text-sm border-none outline-none resize-none bg-gray-900 text-gray-100"
                          placeholder="Start coding..."
                          spellCheck={false}
                        />

                        {/* Line numbers */}
                        <div className="absolute left-0 top-0 w-12 h-full bg-gray-800 border-r border-gray-700 flex flex-col text-gray-400 text-xs font-mono pt-4">
                          {code.split("\n").map((_, index) => (
                            <div key={index} className="h-5 flex items-center justify-end pr-2">
                              {index + 1}
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Code Templates Sidebar */}
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
                        <iframe ref={previewRef} className="w-full h-[calc(100%-48px)]" title="Preview" />
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
                  {/* Chat Header */}
                  <div className="p-4 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Bot className="h-5 w-5 text-blue-600" />
                        <h3 className="font-semibold">AI Assistant</h3>
                      </div>
                      <Button variant="ghost" size="sm" onClick={() => setShowChat(false)}>
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">Ask me anything about your code</p>
                  </div>

                  {/* Chat Messages */}
                  <ScrollArea className="flex-1 p-4">
                    <div className="space-y-4">
                      {messages.map((message) => (
                        <div
                          key={message.id}
                          className={`flex items-start space-x-3 ${
                            message.role === "user" ? "flex-row-reverse space-x-reverse" : ""
                          }`}
                        >
                          <Avatar className="h-8 w-8">
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

                  {/* Chat Input */}
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

                    {/* Quick Actions */}
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
      </div>

      {/* Status Bar */}
      <footer className="bg-blue-600 text-white px-4 py-1 text-xs flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <span>Line 1, Column 1</span>
          <span>TypeScript React</span>
          <span>UTF-8</span>
          <span>LF</span>
        </div>
        <div className="flex items-center space-x-4">
          <span className="flex items-center">
            <div className="w-2 h-2 bg-green-400 rounded-full mr-1"></div>
            Connected
          </span>
          <span>Auto-save: On</span>
        </div>
      </footer>
    </div>
  )
}
