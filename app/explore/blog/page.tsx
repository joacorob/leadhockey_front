"use client"

import { Sidebar } from "@/components/layout/sidebar"
import { Header } from "@/components/layout/header"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Image from "next/image"
import { Calendar, User, ArrowRight } from 'lucide-react'

export default function BlogPage() {
  const blogPosts = [
    {
      id: "1",
      title: "The Evolution of Modern Hockey Tactics",
      excerpt: "Explore how hockey tactics have evolved over the past decade and what it means for today's players.",
      author: "Coach Williams",
      date: "July 8, 2025",
      category: "Tactics",
      image: "/hockey-team-training.png",
      readTime: "5 min read"
    },
    {
      id: "2",
      title: "Mental Preparation for Big Games",
      excerpt: "Learn the psychological techniques used by professional players to perform under pressure.",
      author: "Dr. Sarah Mitchell",
      date: "July 5, 2025", 
      category: "Psychology",
      image: "/hockey-player-training.png",
      readTime: "7 min read"
    },
    {
      id: "3",
      title: "Nutrition Tips for Hockey Players",
      excerpt: "Discover the optimal nutrition strategies to fuel your performance on and off the field.",
      author: "Nutritionist Alex Chen",
      date: "July 3, 2025",
      category: "Nutrition",
      image: "/youth-hockey-training.png", 
      readTime: "4 min read"
    },
    {
      id: "4",
      title: "Equipment Guide: Choosing the Right Stick",
      excerpt: "A comprehensive guide to selecting the perfect hockey stick for your playing style.",
      author: "Equipment Expert Mike Johnson",
      date: "July 1, 2025",
      category: "Equipment",
      image: "/junior-hockey-training.png",
      readTime: "6 min read"
    }
  ]

  const handlePostClick = (postId: string) => {
    console.log("Reading blog post:", postId)
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-7xl mx-auto">
            <h1 className="text-2xl font-bold text-gray-900 mb-6">BLOG</h1>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {blogPosts.map((post) => (
                <Card 
                  key={post.id} 
                  className="border-0 shadow-lg hover:shadow-xl transition-shadow cursor-pointer group"
                  onClick={() => handlePostClick(post.id)}
                >
                  <div className="relative aspect-video">
                    <Image
                      src={post.image || "/placeholder.svg"}
                      alt={post.title}
                      fill
                      className="object-cover rounded-t-lg"
                    />
                    <div className="absolute top-4 left-4">
                      <Badge variant="secondary">{post.category}</Badge>
                    </div>
                  </div>
                  
                  <CardContent className="p-6">
                    <h3 className="font-semibold text-lg mb-2 group-hover:text-blue-600 transition-colors">
                      {post.title}
                    </h3>
                    <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                      {post.excerpt}
                    </p>
                    
                    <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1">
                          <User className="w-3 h-3" />
                          {post.author}
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {post.date}
                        </div>
                      </div>
                      <span>{post.readTime}</span>
                    </div>
                    
                    <div className="flex items-center text-blue-600 text-sm font-medium group-hover:gap-2 transition-all">
                      Read more
                      <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
