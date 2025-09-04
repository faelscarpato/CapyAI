"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Folder, FolderOpen, File, Plus, Search, MoreHorizontal, ChevronRight, ChevronDown } from "lucide-react"

interface FileNode {
  name: string
  type: "file" | "folder"
  children?: FileNode[]
  content?: string
}

interface FileExplorerProps {
  files: FileNode[]
  onFileSelect: (file: FileNode) => void
  selectedFile?: FileNode
}

export function FileExplorer({ files, onFileSelect, selectedFile }: FileExplorerProps) {
  const [expandedFolders, setExpandedFolders] = useState<string[]>(["root"])
  const [searchQuery, setSearchQuery] = useState("")

  const toggleFolder = (path: string) => {
    setExpandedFolders((prev) => (prev.includes(path) ? prev.filter((p) => p !== path) : [...prev, path]))
  }

  const renderFileNode = (node: FileNode, path = "", depth = 0) => {
    const fullPath = path ? `${path}/${node.name}` : node.name
    const isExpanded = expandedFolders.includes(fullPath)
    const isSelected = selectedFile?.name === node.name

    if (node.type === "folder") {
      return (
        <div key={fullPath}>
          <div
            className={`flex items-center space-x-2 p-1 rounded cursor-pointer hover:bg-gray-100 ${
              isSelected ? "bg-blue-50 text-blue-600" : ""
            }`}
            style={{ paddingLeft: `${depth * 16 + 8}px` }}
            onClick={() => toggleFolder(fullPath)}
          >
            {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
            {isExpanded ? <FolderOpen className="h-4 w-4" /> : <Folder className="h-4 w-4" />}
            <span className="text-sm">{node.name}</span>
          </div>
          {isExpanded && node.children && (
            <div>{node.children.map((child) => renderFileNode(child, fullPath, depth + 1))}</div>
          )}
        </div>
      )
    }

    return (
      <div
        key={fullPath}
        className={`flex items-center space-x-2 p-1 rounded cursor-pointer hover:bg-gray-100 ${
          isSelected ? "bg-blue-50 text-blue-600" : ""
        }`}
        style={{ paddingLeft: `${depth * 16 + 24}px` }}
        onClick={() => onFileSelect(node)}
      >
        <File className="h-4 w-4" />
        <span className="text-sm">{node.name}</span>
      </div>
    )
  }

  const filteredFiles = files.filter((file) => file.name.toLowerCase().includes(searchQuery.toLowerCase()))

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-3 border-b border-gray-200">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-semibold text-sm">Explorer</h3>
          <div className="flex space-x-1">
            <Button variant="ghost" size="sm">
              <Plus className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </div>
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

      {/* File Tree */}
      <ScrollArea className="flex-1">
        <div className="p-2">{filteredFiles.map((file) => renderFileNode(file))}</div>
      </ScrollArea>
    </div>
  )
}
