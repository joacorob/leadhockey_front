import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

const BACKEND_BASE = process.env.LEAD_BACKEND

if (!BACKEND_BASE) {
  throw new Error("LEAD_BACKEND env var is not defined")
}

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const { id } = params

  // Retrieve bearer token from session (optional)
  const session = await getServerSession(authOptions)
  const token: string | undefined = (session as any)?.accessToken

  const backendUrl = `${BACKEND_BASE}/api/v1/sessions/${id}/like`

  const res = await fetch(backendUrl, {
    headers: {
      accept: "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  })

  const data = await res.json().catch(() => ({}))

  return NextResponse.json(data, { status: res.status })
}

export async function POST(_req: NextRequest, { params }: { params: { id: string } }) {
  const { id } = params
  const session = await getServerSession(authOptions)
  const token: string | undefined = (session as any)?.accessToken

  const backendUrl = `${BACKEND_BASE}/api/v1/sessions/${id}/like`

  const res = await fetch(backendUrl, {
    method: "POST",
    headers: {
      accept: "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  })

  const data = await res.json().catch(() => ({}))

  return NextResponse.json(data, { status: res.status })
}
