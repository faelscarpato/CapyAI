import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import Link from "next/link"
import Image from "next/image"
import { ArrowRight, Bot, Search } from "lucide-react"

const allAgents = [
  {
    id: "writing-assistant",
    name: "Writing Assistant",
    description: "Professional writing helper for emails, documents, and creative content",
    image: "/placeholder.svg?height=200&width=300",
    category: "Productivity",
  },
  {
    id: "code-reviewer",
    name: "Code Reviewer",
    description: "Expert code analysis and optimization suggestions for developers",
    image: "/placeholder.svg?height=200&width=300",
    category: "Development",
  },
  {
    id: "data-analyst",
    name: "Data Analyst",
    description: "Transform raw data into actionable insights and visualizations",
    image: "/placeholder.svg?height=200&width=300",
    category: "Analytics",
  },
  {
    id: "language-tutor",
    name: "Language Tutor",
    description: "Personalized language learning with conversation practice",
    image: "/placeholder.svg?height=200&width=300",
    category: "Education",
  },
  {
    id: "fitness-coach",
    name: "Fitness Coach",
    description: "Customized workout plans and nutrition guidance",
    image: "/placeholder.svg?height=200&width=300",
    category: "Health",
  },
  {
    id: "travel-planner",
    name: "Travel Planner",
    description: "Create detailed itineraries and travel recommendations",
    image: "/placeholder.svg?height=200&width=300",
    category: "Travel",
  },
  {
    id: "recipe-chef",
    name: "Recipe Chef",
    description: "Discover recipes based on ingredients and dietary preferences",
    image: "/placeholder.svg?height=200&width=300",
    category: "Food",
  },
  {
    id: "financial-advisor",
    name: "Financial Advisor",
    description: "Personal finance management and investment guidance",
    image: "/placeholder.svg?height=200&width=300",
    category: "Finance",
  },
  {
    id: "social-media-manager",
    name: "Social Media Manager",
    description: "Content creation and social media strategy optimization",
    image: "/placeholder.svg?height=200&width=300",
    category: "Marketing",
  },
  {
    id: "research-assistant",
    name: "Research Assistant",
    description: "Academic and professional research with source verification",
    image: "/placeholder.svg?height=200&width=300",
    category: "Research",
  },
  {
    id: "customer-support",
    name: "Customer Support",
    description: "24/7 customer service with intelligent problem resolution",
    image: "/placeholder.svg?height=200&width=300",
    category: "Support",
  },
  {
    id: "creative-designer",
    name: "Creative Designer",
    description: "Design concepts and creative brainstorming assistance",
    image: "/placeholder.svg?height=200&width=300",
    category: "Design",
  },
]

function AgentCard({ agent }: { agent: any }) {
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

export default function CatalogPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center space-x-2">
              <Bot className="h-8 w-8 text-blue-600" />
              <span className="text-xl font-bold text-gray-900">AI Agents Hub</span>
            </Link>
            <div className="flex space-x-4">
              <Link href="/">
                <Button variant="ghost">Home</Button>
              </Link>
              <Link href="/catalog">
                <Button variant="ghost" className="bg-blue-50 text-blue-600">
                  Catalog
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Header */}
      <section className="bg-white py-12 px-4 sm:px-6 lg:px-8 border-b">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">AI Agents Catalog</h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Browse our complete collection of specialized AI agents. Find the perfect assistant for your specific
              needs.
            </p>
          </div>

          {/* Search Bar */}
          <div className="max-w-md mx-auto relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <Input placeholder="Search agents..." className="pl-10 pr-4 py-2 w-full" />
          </div>
        </div>
      </section>

      {/* Agents Grid */}
      <section className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-6">
            <p className="text-gray-600">Showing {allAgents.length} agents</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {allAgents.map((agent) => (
              <AgentCard key={agent.id} agent={agent} />
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
