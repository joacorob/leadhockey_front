import { type NextRequest, NextResponse } from "next/server"

const mockSubtitles: Record<string, any[]> = {
  s1: [
    {
      id: "sub1",
      sessionId: "s1",
      language: "en",
      label: "English",
      format: "vtt",
      url: "/subtitles/session-s1-en.vtt",
      uploadedAt: "2024-01-15T10:00:00Z",
    },
    {
      id: "sub2",
      sessionId: "s1",
      language: "es",
      label: "Spanish",
      format: "vtt",
      url: "/subtitles/session-s1-es.vtt",
      uploadedAt: "2024-01-15T10:30:00Z",
    },
  ],
  s2: [
    {
      id: "sub3",
      sessionId: "s2",
      language: "en",
      label: "English",
      format: "srt",
      url: "/subtitles/session-s2-en.srt",
      uploadedAt: "2024-01-14T11:00:00Z",
    },
  ],
}

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const sessionId = params.id

    // Simulate database lookup delay
    await new Promise((resolve) => setTimeout(resolve, 200))

    const subtitles = mockSubtitles[sessionId] || []

    return NextResponse.json(subtitles)
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const sessionId = params.id
    const body = await request.json()
    const { language, label, format, url } = body

    if (!language || !label || !url) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Simulate processing delay
    await new Promise((resolve) => setTimeout(resolve, 400))

    const newSubtitle = {
      id: `sub${Date.now()}`,
      sessionId,
      language,
      label,
      format: format || "vtt",
      url,
      uploadedAt: new Date().toISOString(),
    }

    if (!mockSubtitles[sessionId]) {
      mockSubtitles[sessionId] = []
    }
    mockSubtitles[sessionId].push(newSubtitle)

    return NextResponse.json(newSubtitle, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
