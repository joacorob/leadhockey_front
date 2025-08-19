"use client"

import { cn } from "@/lib/utils"

interface SectionHeadingProps {
  title: string
  subtitle?: string
  centered?: boolean
  className?: string
}

export function SectionHeading({ 
  title, 
  subtitle, 
  centered = true, 
  className 
}: SectionHeadingProps) {
  return (
    <div className={cn(
      "space-y-4",
      centered && "text-center",
      className
    )}>
      <h2 className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
        {title}
      </h2>
      {subtitle && (
        <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
          {subtitle}
        </p>
      )}
    </div>
  )
}
