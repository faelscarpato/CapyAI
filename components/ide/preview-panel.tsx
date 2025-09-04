"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { RefreshCw, ExternalLink, Maximize2, Minimize2, Smartphone, Tablet, Monitor } from "lucide-react"

interface PreviewPanelProps {
  code: string
  isRunning?: boolean
}

export function PreviewPanel({ code, isRunning = false }: PreviewPanelProps) {
  const [isMaximized, setIsMaximized] = useState(false)
  const [deviceMode, setDeviceMode] = useState<"desktop" | "tablet" | "mobile">("desktop")
  const [isRefreshing, setIsRefreshing] = useState(false)
  const iframeRef = useRef<HTMLIFrameElement>(null)

  const refreshPreview = () => {
    setIsRefreshing(true)
    setTimeout(() => {
      setIsRefreshing(false)
      updatePreview()
    }, 1000)
  }

  const updatePreview = () => {
    if (iframeRef.current) {
      const previewDoc = iframeRef.current.contentDocument
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
                body { 
                  margin: 0; 
                  padding: 20px; 
                  font-family: system-ui, -apple-system, sans-serif;
                  background: white;
                }
                * { box-sizing: border-box; }
              </style>
            </head>
            <body>
              <div id="root">
                <div class="p-8">
                  <h1 class="text-4xl font-bold mb-4 text-gray-900">AI Dashboard</h1>
                  <p class="text-gray-600 mb-6">Welcome to your AI-powered dashboard</p>
                  <button class="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-colors">
                    Get Started
                  </button>
                  <div class="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div class="bg-gray-50 p-6 rounded-lg">
                      <h3 class="font-semibold mb-2">Analytics</h3>
                      <p class="text-gray-600">Track your performance</p>
                    </div>
                    <div class="bg-gray-50 p-6 rounded-lg">
                      <h3 class="font-semibold mb-2">Reports</h3>
                      <p class="text-gray-600">Generate insights</p>
                    </div>
                    <div class="bg-gray-50 p-6 rounded-lg">
                      <h3 class="font-semibold mb-2">Settings</h3>
                      <p class="text-gray-600">Configure your app</p>
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
  }

  useEffect(() => {
    updatePreview()
  }, [code])

  const getDeviceClass = () => {
    switch (deviceMode) {
      case "mobile":
        return "w-80 h-[600px]"
      case "tablet":
        return "w-[768px] h-[600px]"
      default:
        return "w-full h-full"
    }
  }

  return (
    <div className={`h-full bg-white ${isMaximized ? "fixed inset-0 z-50" : ""}`}>
      {/* Preview Toolbar */}
      <div className="bg-gray-100 px-4 py-2 flex items-center justify-between border-b">
        <div className="flex items-center space-x-2">
          {/* Browser Controls */}
          <div className="flex space-x-1">
            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
            <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
          </div>

          {/* URL Bar */}
          <div className="bg-white px-3 py-1 rounded text-sm text-gray-600 border">localhost:3000</div>
        </div>

        <div className="flex items-center space-x-2">
          {/* Device Mode Selector */}
          <div className="flex border rounded">
            <Button
              variant={deviceMode === "desktop" ? "default" : "ghost"}
              size="sm"
              onClick={() => setDeviceMode("desktop")}
            >
              <Monitor className="h-4 w-4" />
            </Button>
            <Button
              variant={deviceMode === "tablet" ? "default" : "ghost"}
              size="sm"
              onClick={() => setDeviceMode("tablet")}
            >
              <Tablet className="h-4 w-4" />
            </Button>
            <Button
              variant={deviceMode === "mobile" ? "default" : "ghost"}
              size="sm"
              onClick={() => setDeviceMode("mobile")}
            >
              <Smartphone className="h-4 w-4" />
            </Button>
          </div>

          {/* Preview Controls */}
          <Button variant="ghost" size="sm" onClick={refreshPreview} disabled={isRefreshing}>
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
          </Button>

          <Button variant="ghost" size="sm" onClick={() => setIsMaximized(!isMaximized)}>
            {isMaximized ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
          </Button>

          <Button variant="ghost" size="sm">
            <ExternalLink className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Preview Content */}
      <div className="h-[calc(100%-48px)] flex items-center justify-center bg-gray-50">
        {isRunning ? (
          <div className="flex items-center space-x-2 text-gray-500">
            <RefreshCw className="h-5 w-5 animate-spin" />
            <span>Building preview...</span>
          </div>
        ) : (
          <div className={`${getDeviceClass()} border border-gray-300 rounded-lg overflow-hidden bg-white shadow-lg`}>
            <iframe
              ref={iframeRef}
              className="w-full h-full"
              title="Preview"
              sandbox="allow-scripts allow-same-origin"
            />
          </div>
        )}
      </div>
    </div>
  )
}
