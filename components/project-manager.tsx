"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Folder, Save, Download, Trash2, FileText, Calendar } from "lucide-react"

interface Project {
  id: string
  name: string
  description: string
  code: string
  type: string
  createdAt: Date
  updatedAt: Date
}

interface ProjectManagerProps {
  currentCode: string
  onLoadProject: (code: string) => void
}

export function ProjectManager({ currentCode, onLoadProject }: ProjectManagerProps) {
  const [projects, setProjects] = useState<Project[]>([])
  const [showSaveDialog, setShowSaveDialog] = useState(false)
  const [showLoadDialog, setShowLoadDialog] = useState(false)
  const [projectName, setProjectName] = useState("")
  const [projectDescription, setProjectDescription] = useState("")

  const saveProject = () => {
    if (!projectName.trim() || !currentCode.trim()) return

    const newProject: Project = {
      id: Date.now().toString(),
      name: projectName,
      description: projectDescription,
      code: currentCode,
      type: "component", // Could be dynamic based on generation type
      createdAt: new Date(),
      updatedAt: new Date()
    }

    const updatedProjects = [...projects, newProject]
    setProjects(updatedProjects)
    
    // Save to localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('v0-projects', JSON.stringify(updatedProjects))
    }
    
    setProjectName("")
    setProjectDescription("")
    setShowSaveDialog(false)
  }

  const loadProject = (project: Project) => {
    onLoadProject(project.code)
    setShowLoadDialog(false)
  }

  const deleteProject = (projectId: string) => {
    const updatedProjects = projects.filter(p => p.id !== projectId)
    setProjects(updatedProjects)
    if (typeof window !== 'undefined') {
      localStorage.setItem('v0-projects', JSON.stringify(updatedProjects))
    }
  }

  const exportProject = (project: Project) => {
    const dataStr = JSON.stringify(project, null, 2)
    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement('a')
    link.href = url
    link.download = `${project.name}.json`
    link.click()
  }

  // Load projects from localStorage on component mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('v0-projects')
      if (saved) {
        try {
          const parsedProjects = JSON.parse(saved).map((p: any) => ({
            ...p,
            createdAt: new Date(p.createdAt),
            updatedAt: new Date(p.updatedAt)
          }))
          setProjects(parsedProjects)
        } catch (error) {
          console.error('Error loading projects:', error)
        }
      }
    }
  }, [])

  return (
    <div className="flex space-x-2">
      {/* Save Project */}
      <Dialog open={showSaveDialog} onOpenChange={setShowSaveDialog}>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm" disabled={!currentCode.trim()}>
            <Save className="h-4 w-4 mr-2" />
            Save
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Save Project</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="projectName">Project Name</Label>
              <Input
                id="projectName"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                placeholder="My awesome component"
              />
            </div>
            <div>
              <Label htmlFor="projectDescription">Description (optional)</Label>
              <Input
                id="projectDescription"
                value={projectDescription}
                onChange={(e) => setProjectDescription(e.target.value)}
                placeholder="A brief description of this project"
              />
            </div>
            <Button onClick={saveProject} disabled={!projectName.trim()}>
              Save Project
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Load Projects */}
      <Dialog open={showLoadDialog} onOpenChange={setShowLoadDialog}>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm">
            <Folder className="h-4 w-4 mr-2" />
            Load
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Load Project</DialogTitle>
          </DialogHeader>
          <div className="max-h-96 overflow-y-auto">
            {projects.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Folder className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No saved projects yet</p>
              </div>
            ) : (
              <div className="grid gap-4">
                {projects.map((project) => (
                  <Card key={project.id} className="cursor-pointer hover:shadow-md transition-shadow">
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">{project.name}</CardTitle>
                        <div className="flex space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation()
                              exportProject(project)
                            }}
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation()
                              deleteProject(project.id)
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      <CardDescription>{project.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Badge variant="outline">{project.type}</Badge>
                          <span className="text-sm text-gray-500 flex items-center">
                            <Calendar className="h-3 w-3 mr-1" />
                            {project.updatedAt.toLocaleDateString()}
                          </span>
                        </div>
                        <Button onClick={() => loadProject(project)}>
                          <FileText className="h-4 w-4 mr-2" />
                          Load
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}