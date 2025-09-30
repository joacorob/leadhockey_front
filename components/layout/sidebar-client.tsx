'use client'

import Link from 'next/link'
import Image from 'next/image'
import { ChevronDown, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useEffect, useState } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'

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
  description?: string
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
      title: 'LEARN',
      description: "Explore LEAD's educational content",
      children: [
        // categorías desde la API
        ...categories.map((c) => ({ title: c.name, href: `/watch?category=${c.id}` })),
        { title: 'My playlists', href: '/watch/playlists' },
        { title: 'My favourites', href: '/watch/favourites' },
      ],
    },
    {
      title: 'CREATE',
      description: 'Build your own drills and sessions',
      children: [
        { title: 'Create drill', href: '/create/drill' },
        { title: 'Create training', href: '/create/train' },
        { title: 'Create club training', href: '/create/club-training' },
      ],
    },
    {
      title: 'TRAIN',
      description: 'Your training tools & planning',
      children: [
        { title: 'My drills', href: '/train/drills' },
        { title: 'My trainings', href: '/train/trainings' },
        { title: 'Club trainings', href: '/train/club-trainings' },
      ],
    },
    {
      title: 'COACH',
      description: 'Coaching tools & team management',
      children: [
        { title: 'Coaching board', href: '/coach/board' },
        { title: 'Team management', href: '/coach/team-management' },
      ],
    },
    {
      title: 'EXPLORE',
      description: 'Discover more & get inspired',
      children: [
        { title: 'All videos', href: '/explore' },
        { title: 'Players & coaches', href: '/explore/players' },
        { title: 'Blog', href: '/explore/blog' },
      ],
    },
  ]  

  const pathname = usePathname()
  const searchParams = useSearchParams()

  // Helper to check if a given href matches current location (including query params)
  const isHrefActive = (href?: string) => {
    if (!href) return false

    // Split the incoming href in path and query parts
    const [hrefPath, hrefQuery] = href.split('?')

    // First, path must match exactly
    if (pathname !== hrefPath) return false

    // If the href has no query string, consider it active as long as path matches
    if (!hrefQuery) return true

    // Otherwise compare the query strings (order sensitive but our links are generated consistently)
    const currentQuery = searchParams?.toString() ?? ''
    return currentQuery === hrefQuery
  }

  // Recursively determine if an item or any of its children are active
  const isItemActive = (item: SidebarItem): boolean => {
    if (isHrefActive(item.href)) return true
    return item.children ? item.children.some(isItemActive) : false
  }

  const renderSidebarItem = (item: SidebarItem, level = 0): JSX.Element => {
    const hasChildren = item.children && item.children.length > 0
    const active = isItemActive(item)

    if (!hasChildren) {
      return (
        <Link
          key={item.title}
          href={item.href || '#'}
          className={cn(
            'block px-4 py-3 text-sm hover:bg-white/10 transition-colors',
            active ? 'bg-white/20 text-white' : 'text-white',
            level === 0 && 'font-medium text-xs uppercase tracking-wider',
            level > 0 && 'pl-8 text-white/80'
          )}
        >
          {item.title}
        </Link>
      )
    }

    const defaultOpen = level === 0 && (['CREATE', 'TRAIN'].includes(item.title) || active)

    return (
      <details key={item.title} className="group" open={defaultOpen}>
        <summary
          className={cn(
            'w-full flex items-center justify-between px-4 py-3 text-left text-sm font-medium hover:bg-white/10 transition-colors cursor-pointer select-none',
            active ? 'bg-white/20 text-white' : 'text-white',
            level === 0 && 'text-xs uppercase tracking-wider'
          )}
        >
          <div className="flex flex-col">
            <span>{item.title}</span>
            {item.description && (
              <span className="text-white/60 text-[11px] font-normal normal-case tracking-normal">
                {item.description}
              </span>
            )}
          </div>
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
    <aside className="w-64 bg-lead-blue h-screen flex flex-col min-h-screen overflow-y-auto">
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
