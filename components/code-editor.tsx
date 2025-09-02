"use client"

import { Editor } from "@monaco-editor/react"
import { useTheme } from "next-themes"

interface CodeEditorProps {
  code: string
  onChange: (value: string) => void
  language?: string
  height?: string
}

export function CodeEditor({ 
  code, 
  onChange, 
  language = "typescript", 
  height = "100%" 
}: CodeEditorProps) {
  const { theme } = useTheme()

  return (
    <div className="h-full bg-gray-50">
      <Editor
        height={height}
        defaultLanguage={language}
        value={code}
        onChange={(value) => onChange(value || "")}
        theme={theme === "dark" ? "vs-dark" : "vs"}
        options={{
          minimap: { enabled: false },
          fontSize: 14,
          lineNumbers: "on",
          roundedSelection: false,
          scrollBeyondLastLine: false,
          automaticLayout: true,
          tabSize: 2,
          insertSpaces: true,
          wordWrap: "on",
          contextmenu: true,
          selectOnLineNumbers: true,
          smoothScrolling: true,
          cursorBlinking: "blink",
          cursorSmoothCaretAnimation: "on",
          renderLineHighlight: "line",
          scrollbar: {
            vertical: "visible",
            horizontal: "visible",
            useShadows: false,
            verticalHasArrows: false,
            horizontalHasArrows: false,
          },
        }}
      />
    </div>
  )
}