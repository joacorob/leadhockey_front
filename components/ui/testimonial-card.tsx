"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Star } from 'lucide-react'
import Image from "next/image"

interface TestimonialCardProps {
  name: string
  role: string
  avatar: string
  content: string
  rating: number
}

export function TestimonialCard({ name, role, avatar, content, rating }: TestimonialCardProps) {
  return (
    <Card className="border-0 shadow-lg">
      <CardContent className="p-6">
        <div className="flex items-center space-x-1 mb-4">
          {[...Array(rating)].map((_, i) => (
            <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
          ))}
        </div>
        <blockquote className="text-muted-foreground mb-4">
          "{content}"
        </blockquote>
        <div className="flex items-center space-x-3">
          <Image
            src={avatar || "/placeholder.svg"}
            alt={name}
            width={40}
            height={40}
            className="rounded-full"
          />
          <div>
            <div className="font-semibold">{name}</div>
            <div className="text-sm text-muted-foreground">{role}</div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
