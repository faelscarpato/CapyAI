"use client"

import { ReactNode } from "react"

interface SplitProps {
  children: ReactNode
  direction?: "horizontal" | "vertical"
  className?: string
}

export function Split({ 
  children, 
  direction = "horizontal", 
  className = "" 
}: SplitProps) {
  return (
    <div 
      className={`flex ${direction === "vertical" ? "flex-col" : "flex-row"} ${className}`}
    >
      {children}
    </div>
  )
}