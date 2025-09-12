'use client'
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import SidebarClient from "./sidebar-client"

export const dynamic = 'force-dynamic'


async function getCategories() {
  try {
    const session: any = await getServerSession(authOptions)
    const accessToken: string | undefined = session?.accessToken

    if (!accessToken) {
      console.warn("No access token found in session")
      return null
    }

    const res = await fetch(`${process.env.LEAD_BACKEND}/api/v1/categories`, {
      headers: {
        accept: "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      cache: "no-store",
    })

    if (!res.ok) {
      console.error("Backend categories responded", res.status)
      return null
    }

    const json = await res.json()
    return json?.data?.items ?? null
  } catch (error) {
    console.error("getCategories error", error)
    return null
  }
}

export async function Sidebar() {
  const categories = await getCategories()
  console.log(JSON.stringify(categories, null, 2) , 'categories')
  const safeCategories = categories ?? []
  return <SidebarClient categories={safeCategories} />
}
