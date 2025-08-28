// Next.js (app router) API route that proxies remote video assets.
// It forwards Range requests so the browser can seek within the video
// and adds an Access-Control-Allow-Origin header to bypass CORS issues.

import { NextRequest } from "next/server"

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl
  const remoteUrl = searchParams.get("url")
  if (!remoteUrl) {
    return new Response("Missing 'url' query parameter", { status: 400 })
  }

  // Forward the Range header (and maybe If-Modified-Since) so the remote server
  // can respond with partial content, enabling video seeking.
  const headers: HeadersInit = {}
  const range = req.headers.get("range")
  if (range) headers["Range"] = range
  const ifModifiedSince = req.headers.get("if-modified-since")
  if (ifModifiedSince) headers["If-Modified-Since"] = ifModifiedSince

  // Fetch the remote resource.
  const remoteResponse = await fetch(remoteUrl, {
    headers,
  })

  // Clone headers from the remote response that are important for media playback
  const responseHeaders = new Headers()
  // Preserve content type / length / range headers if present
  const copyHeader = (name: string) => {
    const value = remoteResponse.headers.get(name)
    if (value) responseHeaders.set(name, value)
  }
  ;["Content-Type", "Content-Length", "Accept-Ranges", "Content-Range"].forEach(copyHeader)

  // Add caching if desired (optional)
  if (!responseHeaders.has("Cache-Control")) {
    responseHeaders.set("Cache-Control", "public, max-age=86400")
  }

  // Allow any origin (you can restrict this in prod)
  responseHeaders.set("Access-Control-Allow-Origin", "*")
  responseHeaders.set("Access-Control-Allow-Headers", "Range")
  responseHeaders.set("Access-Control-Expose-Headers", "Content-Range, Accept-Ranges")

  return new Response(remoteResponse.body, {
    status: remoteResponse.status,
    headers: responseHeaders,
  })
}
