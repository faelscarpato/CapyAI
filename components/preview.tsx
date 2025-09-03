"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"

interface PreviewProps {
  code: string
}

export function Preview({ code }: PreviewProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const refreshPreview = useCallback(() => {
    if (!code.trim()) return
    
    setIsLoading(true)
    setError(null)

    try {
      // Detect if the code is a full HTML document; if so, render it directly.
      const isFullHtml = /<!DOCTYPE html>|<html[\s\S]*?>/i.test(code)
      const htmlContent = isFullHtml ? code : `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Preview</title>
  <script src="https://unpkg.com/react@18/umd/react.development.js"></script>
  <script src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"></script>
  <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    body { margin: 0; padding: 20px; font-family: -apple-system, BlinkMacSystemFont, sans-serif; }
    .error { color: red; background: #fee; padding: 10px; border-radius: 4px; margin: 10px 0; }
  </style>
</head>
<body>
  <div id="root"></div>
  
  <script type="text/babel">
    try {
      // Transform the component code to handle imports and exports
      let transformedCode = \`${code}\`;
      
      // Remove import statements (they're not needed in this context)
      transformedCode = transformedCode.replace(/import.*?from.*?['"](.*?)['"];?\\n?/g, '');
      
      // Handle export default
      transformedCode = transformedCode.replace(/export default function/g, 'function');
      transformedCode = transformedCode.replace(/export default/g, '');
      
      // Extract component name
      const componentMatch = transformedCode.match(/function\\s+([A-Z][a-zA-Z0-9]*)/);
      const componentName = componentMatch ? componentMatch[1] : 'Component';
      
      // Compile TypeScript/JSX to JS and evaluate
      const compiled = Babel.transform(transformedCode, { presets: ['typescript', 'react'] }).code;
      eval(compiled);

      // Ensure the component is available on window for ReactDOM.render
      try {
        if (!window[componentName]) {
          window[componentName] = eval(componentName);
        }
      } catch (_) {}
      
      // Render the component
      const element = React.createElement(window[componentName] || window.Component || (() => React.createElement('div', null, 'Component not found')));
      ReactDOM.render(element, document.getElementById('root'));
      
    } catch (error) {
      document.getElementById('root').innerHTML = \`
        <div class="error">
          <strong>Preview Error:</strong><br>
          \${error.message}
          <details style="margin-top: 10px;">
            <summary>Stack Trace</summary>
            <pre style="font-size: 12px; margin-top: 10px;">\${error.stack}</pre>
          </details>
        </div>
      \`;
      console.error('Preview error:', error);
    }
  </script>
</body>
</html>`

      if (iframeRef.current) {
        const iframe = iframeRef.current
        iframe.srcdoc = htmlContent
        
        iframe.onload = () => {
          setIsLoading(false)
        }
        
        iframe.onerror = () => {
          setError("Failed to load preview")
          setIsLoading(false)
        }
      }
    } catch (err: any) {
      setError(err.message)
      setIsLoading(false)
    }
  }, [code])

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      refreshPreview()
    }, 500) // Debounce updates

    return () => clearTimeout(timeoutId)
  }, [code, refreshPreview])

  if (!code.trim()) {
    return (
      <div className="h-full flex items-center justify-center bg-gray-50">
        <div className="text-center text-gray-500">
          <div className="text-4xl mb-4">👋</div>
          <h3 className="text-lg font-medium mb-2">Ready to preview</h3>
          <p className="text-sm">Generate some code to see the live preview here</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col bg-gray-50">
      <div className="border-b bg-white px-4 py-2 flex items-center justify-between">
        <span className="text-sm font-medium text-gray-700">Live Preview</span>
        <Button
          variant="outline"
          size="sm"
          onClick={refreshPreview}
          disabled={isLoading}
        >
          <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
        </Button>
      </div>
      
      {error && (
        <Alert className="m-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      <div className="flex-1 relative">
        {isLoading && (
          <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-10">
            <div className="flex items-center space-x-2 text-gray-600">
              <RefreshCw className="h-4 w-4 animate-spin" />
              <span>Loading preview...</span>
            </div>
          </div>
        )}
        <iframe
          ref={iframeRef}
          className="w-full h-full border-0"
          sandbox="allow-scripts"
          title="Component Preview"
        />
      </div>
    </div>
  )
}
