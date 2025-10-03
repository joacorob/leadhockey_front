import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    const token = (session as any)?.accessToken as string | undefined

    const { searchParams } = new URL(request.url)
    const url = new URL(`${process.env.LEAD_BACKEND}/api/v1/favorites`)
    searchParams.forEach((v, k) => url.searchParams.append(k, v))

    const res = await fetch(url.toString(), {
      headers: {
        accept: "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    })
    const data = await res.json()
    return NextResponse.json(data, { status: res.status })
  } catch (e) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
