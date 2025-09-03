"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { ArrowRight, Bot, Sparkles, Users, Zap } from "lucide-react"

const featuredAgents = [
  {
    id: "writing-assistant",
    name: "Writing Assistant",
    description: "Professional writing helper for emails, documents, and creative content",
    image: "/placeholder.svg?height=200&width=300",
    category: "Productivity",
    featured: true,
  },
  {
    id: "code-reviewer",
    name: "Code Reviewer",
    description: "Expert code analysis and optimization suggestions for developers",
    image: "/placeholder.svg?height=200&width=300",
    category: "Development",
    featured: true,
  },
  {
    id: "data-analyst",
    name: "Data Analyst",
    description: "Transform raw data into actionable insights and visualizations",
    image: "/placeholder.svg?height=200&width=300",
    category: "Analytics",
    featured: true,
  },
]

const latestAgents = [
  {
    id: "language-tutor",
    name: "Language Tutor",
    description: "Personalized language learning with conversation practice",
    image: "/placeholder.svg?height=200&width=300",
    category: "Education",
    isNew: true,
  },
  {
    id: "fitness-coach",
    name: "Fitness Coach",
    description: "Customized workout plans and nutrition guidance",
    image: "/placeholder.svg?height=200&width=300",
    category: "Health",
    isNew: true,
  },
  {
    id: "travel-planner",
    name: "Travel Planner",
    description: "Create detailed itineraries and travel recommendations",
    image: "/placeholder.svg?height=200&width=300",
    category: "Travel",
    isNew: true,
  },
  {
    id: "recipe-chef",
    name: "Recipe Chef",
    description: "Discover recipes based on ingredients and dietary preferences",
    image: "/placeholder.svg?height=200&width=300",
    category: "Food",
    isNew: true,
  },
]

function AgentCard({ agent, showBadge = false }: { agent: any; showBadge?: boolean }) {
  return (
    <Card className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
      <CardHeader className="p-0">
        <div className="relative overflow-hidden rounded-t-lg">
          <Image
            src={agent.image || "/placeholder.svg"}
            alt={agent.name}
            width={300}
            height={200}
            className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
          />
          {showBadge && agent.isNew && (
            <Badge className="absolute top-2 right-2 bg-green-500 hover:bg-green-600">New</Badge>
          )}
          {showBadge && agent.featured && (
            <Badge className="absolute top-2 right-2 bg-blue-500 hover:bg-blue-600">Featured</Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-2">
          <CardTitle className="text-lg">{agent.name}</CardTitle>
          <Badge variant="outline">{agent.category}</Badge>
        </div>
        <CardDescription className="text-sm text-gray-600">{agent.description}</CardDescription>
      </CardContent>
      <CardFooter className="p-4 pt-0">
        <Link href={`/chat/${agent.id}`} className="w-full">
          <Button className="w-full group-hover:bg-primary/90 transition-colors">
            Launch Chat
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </Link>
      </CardFooter>
    </Card>
  )
}

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <Bot className="h-8 w-8 text-blue-600" />
              <span className="text-xl font-bold text-gray-900">AI Agents Hub</span>
            </div>
            <div className="flex space-x-4">
              <Link href="/">
                <Button variant="ghost">Home</Button>
              </Link>
              <Link href="/catalog">
                <Button variant="ghost">Catalog</Button>
              </Link>
              <Link href="/v0">
                <Button variant="default">v0 Clone</Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            Discover Powerful
            <span className="text-blue-600 block">AI Agents</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Access a curated collection of specialized AI agents designed to enhance your productivity, creativity, and
            problem-solving capabilities. Each agent is ready to assist you with specific tasks.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/v0">
              <Button size="lg" className="text-lg px-8 py-3">
                Try v0 Clone - Generate UI with AI
                <Sparkles className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/catalog">
              <Button size="lg" variant="outline" className="text-lg px-8 py-3 bg-transparent">
                Explore AI Agents
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div className="flex flex-col items-center">
              <Bot className="h-12 w-12 text-blue-600 mb-4" />
              <h3 className="text-3xl font-bold text-gray-900">50+</h3>
              <p className="text-gray-600">AI Agents Available</p>
            </div>
            <div className="flex flex-col items-center">
              <Users className="h-12 w-12 text-green-600 mb-4" />
              <h3 className="text-3xl font-bold text-gray-900">10K+</h3>
              <p className="text-gray-600">Active Users</p>
            </div>
            <div className="flex flex-col items-center">
              <Zap className="h-12 w-12 text-purple-600 mb-4" />
              <h3 className="text-3xl font-bold text-gray-900">1M+</h3>
              <p className="text-gray-600">Conversations</p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Agents */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Featured Agents</h2>
            <p className="text-lg text-gray-600">
              Our most popular and powerful AI agents, handpicked for their exceptional capabilities
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredAgents.map((agent) => (
              <AgentCard key={agent.id} agent={agent} showBadge />
            ))}
          </div>
        </div>
      </section>

      {/* Latest Agents */}
      <section className="py-16 bg-white px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Latest Agents</h2>
            <p className="text-lg text-gray-600">Recently added agents with cutting-edge capabilities</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {latestAgents.map((agent) => (
              <AgentCard key={agent.id} agent={agent} showBadge />
            ))}
          </div>
          <div className="text-center mt-12">
            <Link href="/catalog">
              <Button size="lg" variant="outline">
                View All Agents
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <Bot className="h-8 w-8 text-blue-400" />
              <span className="text-xl font-bold">AI Agents Hub</span>
            </div>
            <p className="text-gray-400 mb-4">Empowering productivity through intelligent AI agents</p>
            <p className="text-sm text-gray-500">© 2024 AI Agents Hub. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
