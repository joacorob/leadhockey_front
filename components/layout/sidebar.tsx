import Link from "next/link"
import Image from "next/image"
import { ChevronDown, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"
import { getServerAuthSession } from "@/lib/getServerAuthSession"
import { authOptions } from "@/lib/auth"
import { getServerSession } from "next-auth"


interface SidebarItem {
  title: string
  href?: string
  children?: SidebarItem[]
}

const sidebarItems: SidebarItem[] = [
  {
    title: "MY LEAD",
    href: "/dashboard",
  },
  {
    title: "WATCH",
    children: [
      { title: "All Videos", href: "/watch" },
      { title: "Favorites", href: "/watch/favorites" },
    ],
  },
  {
    title: "CREATE",
    children: [
      { title: "Build a drill", href: "/create/drill" },
      { title: "Build a session", href: "/create/session" },
    ],
  },
  {
    title: "TRAIN",
    children: [
      { title: "My drills", href: "/train/drills" },
      { title: "My sessions", href: "/train/sessions" },
      { title: "Club sessions", href: "/train/club-sessions" },
    ],
  },
  {
    title: "EXPLORE",
    children: [
      { title: "All videos", href: "/explore" },
      { title: "Players & coaches", href: "/explore/players" },
      { title: "Blog", href: "/explore/blog" },
    ],
  },
]

// todo: obtener categorias

async function getCategories() {
  try {
    
    console.log(`${process.env.NEXTAUTH_URL}/api/categories`, 'ACAAA')
    const res = await fetch(`${process.env.NEXTAUTH_URL}/api/categories`, { next: { revalidate: 60 } })
    const data = await res.json()
    console.log(data)
   
    return data.data
    // return 'nada'
  } catch (error) {
    console.log(error)
    return 'error'
  }
}

export async function Sidebar() {
  const renderSidebarItem = (item: SidebarItem, level = 0) => {
    const hasChildren = item.children && item.children.length > 0

    if (!hasChildren) {
      return (
        <Link
          key={item.title}
          href={item.href || "#"}
          className={cn(
            "block px-4 py-3 text-sm text-white hover:bg-white/10 transition-colors",
            level === 0 && "font-medium text-xs uppercase tracking-wider",
            level > 0 && "pl-8 text-white/80"
          )}
        >
          {item.title}
        </Link>
      )
    }

    return (
      <details key={item.title} className="group" open={level === 0 && ["CREATE", "TRAIN"].includes(item.title)}>
        <summary
          className={cn(
            "w-full flex items-center justify-between px-4 py-3 text-left text-sm font-medium text-white hover:bg-white/10 transition-colors cursor-pointer select-none",
            level === 0 && "text-xs uppercase tracking-wider"
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

  const categories = await getCategories()
  console.log(categories)

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
