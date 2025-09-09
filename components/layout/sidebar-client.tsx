'use client'

import Link from 'next/link'
import Image from 'next/image'
import { ChevronDown, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useEffect, useState } from 'react'

interface Category {
  id: number
  name: string
}

interface SidebarClientProps {
  categories?: Category[]
}

interface SidebarItem {
  title: string
  href?: string
  children?: SidebarItem[]
}

export default function SidebarClient({ categories: initialCategories }: SidebarClientProps) {
  const [categories, setCategories] = useState<Category[]>(initialCategories ?? [])

  useEffect(() => {
    if (initialCategories?.length) return // ya vino del server (por si acaso)
    ;(async () => {
      try {
        const res = await fetch('/api/categories')
        if (!res.ok) return
        const json = await res.json()
        // The API can return the items in two possible shapes:
        // 1. { success: true, data: { items: [...] } }
        // 2. { success: true, data: { data: { items: [...] } } }  <-- when we proxy the backend response directly
        // We try the deepest path first and gracefully fall back so the sidebar fills regardless of the shape.
        const items =
          (json?.data?.data?.items as Category[]) ??
          (json?.data?.items as Category[]) ??
          []

        setCategories(items)
      } catch (e) {
        console.error('fetch categories client error', e)
      }
    })()
  }, [])

  const sidebarItems: SidebarItem[] = [
    {
      title: 'MY LEAD',
      href: '/dashboard',
    },
    {
      title: 'WATCH',
      children: [
        { title: 'All Videos', href: '/watch' },
        ...categories.map((c) => ({ title: c.name, href: `/watch?category=${c.id}` })),
        { title: 'Favorites', href: '/watch/favorites' },
      ],
    },
    {
      title: 'CREATE',
      children: [
        { title: 'Build a drill', href: '/create/drill' },
        { title: 'Build a session', href: '/create/session' },
      ],
    },
    {
      title: 'TRAIN',
      children: [
        { title: 'My drills', href: '/train/drills' },
        { title: 'My sessions', href: '/train/sessions' },
        { title: 'Club sessions', href: '/train/club-sessions' },
      ],
    },
    {
      title: 'EXPLORE',
      children: [
        { title: 'All videos', href: '/explore' },
        { title: 'Players & coaches', href: '/explore/players' },
        { title: 'Blog', href: '/explore/blog' },
      ],
    },
  ]

  const renderSidebarItem = (item: SidebarItem, level = 0): JSX.Element => {
    const hasChildren = item.children && item.children.length > 0

    if (!hasChildren) {
      return (
        <Link
          key={item.title}
          href={item.href || '#'}
          className={cn(
            'block px-4 py-3 text-sm text-white hover:bg-white/10 transition-colors',
            level === 0 && 'font-medium text-xs uppercase tracking-wider',
            level > 0 && 'pl-8 text-white/80'
          )}
        >
          {item.title}
        </Link>
      )
    }


    return (
      <details key={item.title} className="group" open={level === 0 && ['CREATE', 'TRAIN'].includes(item.title)}>
        <summary
          className={cn(
            'w-full flex items-center justify-between px-4 py-3 text-left text-sm font-medium text-white hover:bg-white/10 transition-colors cursor-pointer select-none',
            level === 0 && 'text-xs uppercase tracking-wider'
          )}
        >
          <span>{item.title}</span>
          <ChevronRight className="w-4 h-4 group-open:hidden" />
          <ChevronDown className="w-4 h-4 hidden group-open:block" />
        </summary>
        <div className="bg-black/20">
          {item.children?.map((child) => renderSidebarItem(child, level + 1))}
        </div>
      </details>
    )
  }

  return (
    <aside className="w-64 bg-lead-blue h-screen flex flex-col">
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
        {sidebarItems.map((item) => renderSidebarItem(item))}
      </nav>

      {/* Bottom section */}
      <div className="p-4 border-t border-white/10">
        <p className="text-xs text-white/60">Build your own drills and sessions</p>
      </div>
    </aside>
  )
}
