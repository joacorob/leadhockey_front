import { NextRequest, NextResponse } from "next/server"
import { authOptions } from "@/lib/auth"
import { getServerSession } from "next-auth"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    const accessToken: string | undefined = (session as any)?.accessToken

    const backendUrl = `${process.env.LEAD_BACKEND}/api/v1/drills/${params.id}`
    const externalResponse = await fetch(backendUrl, {
      headers: {
        accept: "application/json",
        ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      },
    })
    const data = await externalResponse.json()
    return NextResponse.json(data, { status: externalResponse.status })
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    const accessToken: string | undefined = (session as any)?.accessToken

    const backendUrl = `${process.env.LEAD_BACKEND}/api/v1/drills/${params.id}`
    const externalResponse = await fetch(backendUrl, {
      method: "DELETE",
      headers: {
        accept: "application/json",
        ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      },
    })
    const data = await externalResponse.json()
    return NextResponse.json(data, { status: externalResponse.status })
  } catch (e) {
    console.error("drills proxy DELETE error", e)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
