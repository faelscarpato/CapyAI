"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { 
  Rocket, 
  Download, 
  Copy, 
  ExternalLink, 
  Github, 
  Globe, 
  FileText,
  CheckCircle,
  AlertCircle 
} from "lucide-react"

interface DeploymentPanelProps {
  code: string
  projectName?: string
}

export function DeploymentPanel({ code, projectName = "my-project" }: DeploymentPanelProps) {
  const [showDeployDialog, setShowDeployDialog] = useState(false)
  const [deploymentStatus, setDeploymentStatus] = useState<'idle' | 'deploying' | 'success' | 'error'>('idle')
  const [deploymentUrl, setDeploymentUrl] = useState("")
  const [exportFormat, setExportFormat] = useState("react")

  const handleExportCode = (format: string) => {
    let content = ""
    let filename = ""
    let mimeType = "text/plain"

    switch (format) {
      case "react":
        content = code
        filename = `${projectName}.tsx`
        mimeType = "text/typescript"
        break
      case "html":
        content = generateHTMLVersion(code)
        filename = `${projectName}.html`
        mimeType = "text/html"
        break
      case "zip":
        content = generateProjectZip(code)
        filename = `${projectName}.zip`
        mimeType = "application/zip"
        break
    }

    const blob = new Blob([content], { type: mimeType })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    link.click()
    URL.revokeObjectURL(url)
  }

  const generateHTMLVersion = (reactCode: string) => {
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${projectName}</title>
    <script src="https://unpkg.com/react@18/umd/react.development.js"></script>
    <script src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"></script>
    <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
    <script src="https://cdn.tailwindcss.com"></script>
    <style>
        body { margin: 0; font-family: -apple-system, BlinkMacSystemFont, sans-serif; }
    </style>
</head>
<body>
    <div id="root"></div>
    
    <script type="text/babel">
        ${reactCode.replace(/import.*?from.*?['"](.*?)['"];?\n?/g, '').replace(/export default/g, '')}
        
        const componentName = '${extractComponentName(reactCode)}';
        const ComponentToRender = window[componentName] || Component;
        ReactDOM.render(React.createElement(ComponentToRender), document.getElementById('root'));
    </script>
</body>
</html>`
  }

  const generateProjectZip = (reactCode: string) => {
    // This would need a proper zip library, but for now return project structure as text
    return `Project Structure for ${projectName}:

/package.json
/src/
  /components/
    Component.tsx
/public/
  index.html

=== package.json ===
{
  "name": "${projectName}",
  "version": "1.0.0",
  "dependencies": {
    "react": "^18.0.0",
    "react-dom": "^18.0.0"
  }
}

=== src/components/Component.tsx ===
${reactCode}

=== public/index.html ===
${generateHTMLVersion(reactCode)}`
  }

  const extractComponentName = (code: string) => {
    const match = code.match(/(?:function|const)\s+([A-Z][a-zA-Z0-9]*)/);
    return match ? match[1] : 'Component';
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  const simulateDeployment = () => {
    setDeploymentStatus('deploying')
    
    // Simulate deployment process
    setTimeout(() => {
      setDeploymentStatus('success')
      setDeploymentUrl(`https://${projectName}-${Math.random().toString(36).substr(2, 9)}.vercel.app`)
    }, 3000)
  }

  return (
    <Dialog open={showDeployDialog} onOpenChange={setShowDeployDialog}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" disabled={!code.trim()}>
          <Rocket className="h-4 w-4 mr-2" />
          Deploy
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>Deploy & Export</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="export" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="export">Export Code</TabsTrigger>
            <TabsTrigger value="deploy">Deploy Online</TabsTrigger>
          </TabsList>

          <TabsContent value="export" className="space-y-4">
            <div className="grid gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Export Options</CardTitle>
                  <CardDescription>Download your generated code in different formats</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Button 
                      variant="outline" 
                      className="h-auto p-4 flex flex-col items-center"
                      onClick={() => handleExportCode("react")}
                    >
                      <FileText className="h-6 w-6 mb-2" />
                      <span className="font-medium">React/TSX</span>
                      <span className="text-xs text-gray-500">Original component</span>
                    </Button>
                    
                    <Button 
                      variant="outline" 
                      className="h-auto p-4 flex flex-col items-center"
                      onClick={() => handleExportCode("html")}
                    >
                      <Globe className="h-6 w-6 mb-2" />
                      <span className="font-medium">HTML</span>
                      <span className="text-xs text-gray-500">Standalone HTML file</span>
                    </Button>
                    
                    <Button 
                      variant="outline" 
                      className="h-auto p-4 flex flex-col items-center"
                      onClick={() => handleExportCode("zip")}
                    >
                      <Download className="h-6 w-6 mb-2" />
                      <span className="font-medium">Project</span>
                      <span className="text-xs text-gray-500">Full project structure</span>
                    </Button>
                  </div>
                  
                  <div className="flex items-center space-x-2 pt-4 border-t">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => copyToClipboard(code)}
                    >
                      <Copy className="h-4 w-4 mr-2" />
                      Copy Code
                    </Button>
                    <span className="text-sm text-gray-500">Copy to clipboard</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="deploy" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Deploy to Web</CardTitle>
                <CardDescription>Deploy your component to the internet</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {deploymentStatus === 'idle' && (
                  <div className="space-y-4">
                    <Alert>
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>
                        This is a demo deployment simulation. In a real implementation, this would deploy to platforms like Vercel, Netlify, or GitHub Pages.
                      </AlertDescription>
                    </Alert>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <Button 
                        variant="outline" 
                        className="h-auto p-4 flex flex-col items-center"
                        onClick={simulateDeployment}
                      >
                        <Rocket className="h-6 w-6 mb-2" />
                        <span className="font-medium">Vercel</span>
                        <span className="text-xs text-gray-500">Deploy instantly</span>
                      </Button>
                      
                      <Button 
                        variant="outline" 
                        className="h-auto p-4 flex flex-col items-center"
                        onClick={simulateDeployment}
                      >
                        <Globe className="h-6 w-6 mb-2" />
                        <span className="font-medium">Netlify</span>
                        <span className="text-xs text-gray-500">Static hosting</span>
                      </Button>
                      
                      <Button 
                        variant="outline" 
                        className="h-auto p-4 flex flex-col items-center"
                        onClick={simulateDeployment}
                      >
                        <Github className="h-6 w-6 mb-2" />
                        <span className="font-medium">GitHub Pages</span>
                        <span className="text-xs text-gray-500">Free hosting</span>
                      </Button>
                    </div>
                  </div>
                )}

                {deploymentStatus === 'deploying' && (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <h3 className="text-lg font-medium mb-2">Deploying...</h3>
                    <p className="text-gray-500">This usually takes 30-60 seconds</p>
                  </div>
                )}

                {deploymentStatus === 'success' && (
                  <div className="text-center py-8">
                    <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2">Deployment Successful!</h3>
                    <p className="text-gray-500 mb-4">Your component is now live</p>
                    
                    <div className="bg-gray-50 p-4 rounded-lg mb-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-mono">{deploymentUrl}</span>
                        <div className="flex space-x-2">
                          <Button size="sm" variant="outline" onClick={() => copyToClipboard(deploymentUrl)}>
                            <Copy className="h-4 w-4" />
                          </Button>
                          <Button size="sm" onClick={() => window.open(deploymentUrl, '_blank')}>
                            <ExternalLink className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}