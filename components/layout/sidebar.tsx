"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { ChevronDown, ChevronRight } from 'lucide-react'
import { cn } from "@/lib/utils"

interface SidebarItem {
  title: string
  href?: string
  children?: SidebarItem[]
  isActive?: boolean
}

const sidebarItems: SidebarItem[] = [
  {
    title: "MY LEAD",
    href: "/dashboard"
  },
  {
    title: "WATCH",
    children: [
      { title: "All Videos", href: "/watch" },
      { title: "Favorites", href: "/watch/favorites" }
    ]
  },
  {
    title: "CREATE",
    children: [
      { title: "Build a drill", href: "/create/drill" },
      { title: "Build a session", href: "/create/session" }
    ]
  },
  {
    title: "TRAIN",
    children: [
      { title: "My drills", href: "/train/drills" },
      { title: "My sessions", href: "/train/sessions" },
      { title: "Club sessions", href: "/train/club-sessions" }
    ]
  },
  {
    title: "EXPLORE",
    children: [
      { title: "All videos", href: "/explore" },
      { title: "Players & coaches", href: "/explore/players" },
      { title: "Blog", href: "/explore/blog" }
    ]
  }
]

export function Sidebar() {
  const [expandedItems, setExpandedItems] = useState<string[]>(["CREATE", "TRAIN"])

  const toggleExpanded = (title: string) => {
    setExpandedItems(prev => 
      prev.includes(title) 
        ? prev.filter(item => item !== title)
        : [...prev, title]
    )
  }

  const renderSidebarItem = (item: SidebarItem, level = 0) => {
    const hasChildren = item.children && item.children.length > 0
    const isExpanded = expandedItems.includes(item.title)

    return (
      <div key={item.title}>
        {hasChildren ? (
          <button
            onClick={() => toggleExpanded(item.title)}
            className={cn(
              "w-full flex items-center justify-between px-4 py-3 text-left text-sm font-medium text-white hover:bg-white/10 transition-colors",
              level === 0 && "text-xs uppercase tracking-wider"
            )}
          >
            <span>{item.title}</span>
            {isExpanded ? (
              <ChevronDown className="w-4 h-4" />
            ) : (
              <ChevronRight className="w-4 h-4" />
            )}
          </button>
        ) : (
          <Link
            href={item.href || "#"}
            className={cn(
              "block px-4 py-3 text-sm text-white hover:bg-white/10 transition-colors",
              level === 0 && "font-medium text-xs uppercase tracking-wider",
              level > 0 && "pl-8 text-white/80"
            )}
          >
            {item.title}
          </Link>
        )}
        
        {hasChildren && isExpanded && (
          <div className="bg-black/20">
            {item.children?.map(child => renderSidebarItem(child, level + 1))}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="w-64 bg-lead-blue h-screen flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-white/10">
        <Image
          src="https://uploadthingy.s3.us-west-1.amazonaws.com/nzVf7cqEycpaU4k9WPUBYZ/LEAD_logo.png"
          alt="LEAD"
          width={80}
          height={32}
          className="brightness-0 invert"
        />
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4">
        {sidebarItems.map(item => renderSidebarItem(item))}
      </nav>

      {/* Bottom section */}
      <div className="p-4 border-t border-white/10">
        <p className="text-xs text-white/60">Build your own drills and sessions</p>
      </div>
    </div>
  )
}
