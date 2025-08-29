// Next.js (app router) API route that proxies remote files (e.g. PDFs)
// Similar to video-proxy but adds Content-Disposition so the browser downloads the file
// and sets permissive CORS headers to bypass cross-origin restrictions.

import { NextRequest } from "next/server"

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl
  const remoteUrl = searchParams.get("url")
  const fileName = searchParams.get("name") ?? "file"

  if (!remoteUrl) {
    return new Response("Missing 'url' query parameter", { status: 400 })
  }

  // Forward Range header if present (useful for large downloads / resumes)
  const headers: HeadersInit = {}
  const range = req.headers.get("range")
  if (range) headers["Range"] = range

  const remoteResponse = await fetch(remoteUrl, { headers })

  // Copy important headers
  const responseHeaders = new Headers()
  const copyHeader = (name: string) => {
    const value = remoteResponse.headers.get(name)
    if (value) responseHeaders.set(name, value)
  }
  ;["Content-Type", "Content-Length", "Accept-Ranges", "Content-Range"].forEach(copyHeader)

  // Suggest download filename
  responseHeaders.set(
    "Content-Disposition",
    `attachment; filename="${fileName.replace(/\"/g, "")}"`
  )

  // Caching (optional)
  if (!responseHeaders.has("Cache-Control")) {
    responseHeaders.set("Cache-Control", "public, max-age=86400")
  }

  // CORS
  responseHeaders.set("Access-Control-Allow-Origin", "*")
  responseHeaders.set("Access-Control-Allow-Headers", "Range")
  responseHeaders.set("Access-Control-Expose-Headers", "Content-Range, Accept-Ranges")

  return new Response(remoteResponse.body, {
    status: remoteResponse.status,
    headers: responseHeaders,
  })
}
