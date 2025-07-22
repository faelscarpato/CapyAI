"use client"

import { useChat } from "@ai-sdk/react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { ArrowLeft, Bot, Send, User } from "lucide-react"
import { useParams } from "next/navigation"
import { useEffect, useRef } from "react"

const agentData: Record<string, any> = {
  "writing-assistant": {
    name: "Writing Assistant",
    description: "Professional writing helper for emails, documents, and creative content",
    avatar: "/placeholder.svg?height=40&width=40",
    category: "Productivity",
    systemPrompt:
      "You are a professional writing assistant. Help users with emails, documents, creative writing, and editing. Provide clear, well-structured, and engaging content.",
  },
  "code-reviewer": {
    name: "Code Reviewer",
    description: "Expert code analysis and optimization suggestions for developers",
    avatar: "/placeholder.svg?height=40&width=40",
    category: "Development",
    systemPrompt:
      "You are an expert code reviewer and software engineer. Analyze code for bugs, performance issues, best practices, and provide optimization suggestions.",
  },
  "data-analyst": {
    name: "Data Analyst",
    description: "Transform raw data into actionable insights and visualizations",
    avatar: "/placeholder.svg?height=40&width=40",
    category: "Analytics",
    systemPrompt:
      "You are a data analyst expert. Help users analyze data, create insights, suggest visualizations, and interpret statistical information.",
  },
  "language-tutor": {
    name: "Language Tutor",
    description: "Personalized language learning with conversation practice",
    avatar: "/placeholder.svg?height=40&width=40",
    category: "Education",
    systemPrompt:
      "You are a friendly language tutor. Help users learn languages through conversation, grammar explanations, vocabulary building, and cultural insights.",
  },
  "fitness-coach": {
    name: "Fitness Coach",
    description: "Customized workout plans and nutrition guidance",
    avatar: "/placeholder.svg?height=40&width=40",
    category: "Health",
    systemPrompt:
      "You are a certified fitness coach and nutritionist. Provide workout plans, nutrition advice, and health guidance tailored to individual goals and fitness levels.",
  },
  "travel-planner": {
    name: "Travel Planner",
    description: "Create detailed itineraries and travel recommendations",
    avatar: "/placeholder.svg?height=40&width=40",
    category: "Travel",
    systemPrompt:
      "You are an experienced travel planner. Help users create itineraries, find accommodations, suggest activities, and provide travel tips for destinations worldwide.",
  },
}

export default function ChatPage() {
  const params = useParams()
  const agentId = params.agentId as string
  const agent = agentData[agentId] || agentData["writing-assistant"]
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat({
    api: "/api/chat",
    initialMessages: [
      {
        id: "welcome",
        role: "assistant",
        content: `Hello! I'm ${agent.name}. ${agent.description} How can I help you today?`,
      },
    ],
    body: {
      agentId: agentId,
      systemPrompt: agent.systemPrompt,
    },
  })

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Link href="/catalog">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Catalog
                </Button>
              </Link>
              <div className="flex items-center space-x-3">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={agent.avatar || "/placeholder.svg"} alt={agent.name} />
                  <AvatarFallback>
                    <Bot className="h-4 w-4" />
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h1 className="font-semibold text-gray-900">{agent.name}</h1>
                  <Badge variant="outline" className="text-xs">
                    {agent.category}
                  </Badge>
                </div>
              </div>
            </div>
            <Link href="/">
              <Button variant="ghost">
                <Bot className="h-4 w-4 mr-2" />
                AI Agents Hub
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Chat Interface */}
      <div className="max-w-4xl mx-auto p-4">
        <Card className="h-[calc(100vh-12rem)]">
          <CardHeader className="border-b">
            <CardTitle className="flex items-center space-x-2">
              <Avatar className="h-6 w-6">
                <AvatarImage src={agent.avatar || "/placeholder.svg"} alt={agent.name} />
                <AvatarFallback>
                  <Bot className="h-3 w-3" />
                </AvatarFallback>
              </Avatar>
              <span>Chat with {agent.name}</span>
            </CardTitle>
          </CardHeader>

          <CardContent className="flex flex-col h-full p-0">
            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex items-start space-x-3 ${
                    message.role === "user" ? "flex-row-reverse space-x-reverse" : ""
                  }`}
                >
                  <Avatar className="h-8 w-8 flex-shrink-0">
                    {message.role === "user" ? (
                      <>
                        <AvatarFallback>
                          <User className="h-4 w-4" />
                        </AvatarFallback>
                      </>
                    ) : (
                      <>
                        <AvatarImage src={agent.avatar || "/placeholder.svg"} alt={agent.name} />
                        <AvatarFallback>
                          <Bot className="h-4 w-4" />
                        </AvatarFallback>
                      </>
                    )}
                  </Avatar>
                  <div
                    className={`max-w-[70%] rounded-lg p-3 ${
                      message.role === "user" ? "bg-blue-500 text-white" : "bg-gray-100 text-gray-900"
                    }`}
                  >
                    <div className="whitespace-pre-wrap">
                      {message.parts?.map((part, i) => {
                        if (part.type === "text") {
                          return <span key={i}>{part.text}</span>
                        }
                        return null
                      }) || message.content}
                    </div>
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex items-start space-x-3">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={agent.avatar || "/placeholder.svg"} alt={agent.name} />
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
              <div ref={messagesEndRef} />
            </div>

            {/* Input Form */}
            <div className="border-t p-4">
              <form onSubmit={handleSubmit} className="flex space-x-2">
                <Input
                  value={input}
                  onChange={handleInputChange}
                  placeholder={`Message ${agent.name}...`}
                  className="flex-1"
                  disabled={isLoading}
                />
                <Button type="submit" disabled={isLoading || !input.trim()}>
                  <Send className="h-4 w-4" />
                </Button>
              </form>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
