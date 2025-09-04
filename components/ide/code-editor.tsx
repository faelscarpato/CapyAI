"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Play, Square, RefreshCw, Copy, Maximize2, Minimize2 } from "lucide-react"

interface CodeEditorProps {
  value: string
  onChange: (value: string) => void
  language?: string
  theme?: "dark" | "light"
  readOnly?: boolean
}

export function CodeEditor({
  value,
  onChange,
  language = "typescript",
  theme = "dark",
  readOnly = false,
}: CodeEditorProps) {
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [fontSize, setFontSize] = useState(14)
  const editorRef = useRef<HTMLTextAreaElement>(null)

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Tab") {
      e.preventDefault()
      const start = e.currentTarget.selectionStart
      const end = e.currentTarget.selectionEnd
      const newValue = value.substring(0, start) + "  " + value.substring(end)
      onChange(newValue)

      // Set cursor position after the inserted spaces
      setTimeout(() => {
        if (editorRef.current) {
          editorRef.current.selectionStart = editorRef.current.selectionEnd = start + 2
        }
      }, 0)
    }
  }

  const formatCode = () => {
    // Simple code formatting
    const formatted = value
      .split("\n")
      .map((line) => line.trim())
      .join("\n")
    onChange(formatted)
  }

  const copyToClipboard = () => {
    navigator.clipboard.writeText(value)
  }

  return (
    <div className={`relative h-full ${isFullscreen ? "fixed inset-0 z-50" : ""}`}>
      {/* Editor Toolbar */}
      <div className="flex items-center justify-between p-2 bg-gray-800 border-b border-gray-700">
        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="sm" className="text-gray-300 hover:text-white">
            <Play className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" className="text-gray-300 hover:text-white">
            <Square className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" className="text-gray-300 hover:text-white">
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="sm" className="text-gray-300 hover:text-white" onClick={formatCode}>
            Format
          </Button>
          <Button variant="ghost" size="sm" className="text-gray-300 hover:text-white" onClick={copyToClipboard}>
            <Copy className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="text-gray-300 hover:text-white"
            onClick={() => setIsFullscreen(!isFullscreen)}
          >
            {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      {/* Code Editor */}
      <div className="relative h-[calc(100%-48px)]">
        {/* Line Numbers */}
        <div className="absolute left-0 top-0 w-12 h-full bg-gray-900 border-r border-gray-700 flex flex-col text-gray-500 text-sm font-mono overflow-hidden">
          {value.split("\n").map((_, index) => (
            <div key={index} className="h-6 flex items-center justify-end pr-2 leading-6">
              {index + 1}
            </div>
          ))}
        </div>

        {/* Editor Textarea */}
        <textarea
          ref={editorRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          className={`
            w-full h-full pl-14 pr-4 py-2 
            font-mono text-sm leading-6
            bg-gray-900 text-gray-100 
            border-none outline-none resize-none
            ${readOnly ? "cursor-not-allowed" : ""}
          `}
          style={{ fontSize: `${fontSize}px` }}
          placeholder="Start coding..."
          spellCheck={false}
          readOnly={readOnly}
        />

        {/* Syntax Highlighting Overlay (simplified) */}
        <div className="absolute inset-0 pointer-events-none pl-14 pr-4 py-2 font-mono text-sm leading-6 overflow-hidden">
          {/* This would contain syntax highlighting logic */}
        </div>
      </div>
    </div>
  )
}
