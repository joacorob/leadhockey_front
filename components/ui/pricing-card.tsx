"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Check } from 'lucide-react'
import { cn } from "@/lib/utils"

interface PricingCardProps {
  name: string
  price: number
  period: string
  description: string
  features: string[]
  cta: string
  popular?: boolean
}

export function PricingCard({ 
  name, 
  price, 
  period, 
  description, 
  features, 
  cta, 
  popular = false 
}: PricingCardProps) {
  return (
    <Card className={cn(
      "relative border-2 transition-all duration-300 hover:shadow-xl",
      popular ? "border-primary shadow-lg scale-105" : "border-border hover:border-primary/50"
    )}>
      {popular && (
        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
          <span className="bg-primary text-primary-foreground px-3 py-1 rounded-full text-sm font-medium">
            Most Popular
          </span>
        </div>
      )}
      <CardHeader className="text-center pb-4">
        <h3 className="text-xl font-bold">{name}</h3>
        <div className="mt-2">
          <span className="text-4xl font-bold">${price}</span>
          <span className="text-muted-foreground">/{period}</span>
        </div>
        <p className="text-muted-foreground mt-2">{description}</p>
      </CardHeader>
      <CardContent className="space-y-4">
        <ul className="space-y-3">
          {features.map((feature, index) => (
            <li key={index} className="flex items-start space-x-3">
              <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
              <span className="text-sm">{feature}</span>
            </li>
          ))}
        </ul>
        <Button 
          className={cn(
            "w-full mt-6",
            popular ? "bg-primary hover:bg-primary/90" : ""
          )}
          variant={popular ? "default" : "outline"}
        >
          {cta}
        </Button>
      </CardContent>
    </Card>
  )
}
