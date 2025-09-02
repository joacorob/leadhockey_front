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

  const contentType = remoteResponse.headers.get("Content-Type") || ""
  const isM3U8 = contentType.includes("application/vnd.apple.mpegurl") || contentType.includes("application/x-mpegURL") || remoteUrl.endsWith(".m3u8")

  // Track if we end up rewriting the playlist so we can adjust headers later
  let wasRewritten = false;

  let body: BodyInit | null = remoteResponse.body

  // If playlist, rewrite segment URIs so they point back to this proxy
  if (isM3U8) {
    const text = await remoteResponse.text()
    const base = remoteUrl.split("/").slice(0, -1).join("/") + "/"
    const rewritten = text
      .split("\n")
      .map((line) => {
        if (line.trim() === "") return line

        // Handle attribute directives (#EXT-X-KEY:URI="..." or #EXT-X-MAP:URI="...")
        if (line.startsWith("#EXT") && line.includes("URI=")) {
          return line.replace(/URI="(.*?)"/, (_match, uri) => {
            const abs = /^https?:\/\//i.test(uri) ? uri : base + uri
            return `URI="/api/video-proxy?url=${encodeURIComponent(abs)}"`
          })
        }

        // Skip other comments
        if (line.startsWith("#")) return line

        // Segment URI line
        const trimmed = line.trim()
        const abs = /^https?:\/\//i.test(trimmed) ? trimmed : base + trimmed
        return `/api/video-proxy?url=${encodeURIComponent(abs)}`
      })
      .join("\n")

    body = rewritten
    wasRewritten = true
  }

  // Clone headers from the remote response that are important for media playback
  const responseHeaders = new Headers()
  // Preserve content type / length / range headers if present
  const copyHeader = (name: string) => {
    const value = remoteResponse.headers.get(name)
    if (value) responseHeaders.set(name, value)
  }
  ;["Content-Type", "Content-Length", "Accept-Ranges", "Content-Range"].forEach(copyHeader)

  // If we rewrote the playlist, the original Content-Length is no longer valid
  if (wasRewritten) {
    responseHeaders.delete("Content-Length")
  }

  // Add caching if desired (optional)
  if (!responseHeaders.has("Cache-Control")) {
    responseHeaders.set("Cache-Control", "public, max-age=86400")
  }

  // Allow any origin (you can restrict this in prod)
  responseHeaders.set("Access-Control-Allow-Origin", "*")
  responseHeaders.set("Access-Control-Allow-Headers", "Range")
  responseHeaders.set("Access-Control-Expose-Headers", "Content-Range, Accept-Ranges")

  // After cloning headers, ensure we have a proper Content-Type for video/mp4 etc.
  if (!responseHeaders.get("Content-Type") || responseHeaders.get("Content-Type") === "application/octet-stream") {
    const ext = remoteUrl.split('.').pop()?.toLowerCase()
    const mime = ext === 'mp4' ? 'video/mp4' : ext === 'm4v' ? 'video/x-m4v' : ext === 'webm' ? 'video/webm' : undefined
    if (mime) responseHeaders.set('Content-Type', mime)
  }

  return new Response(body, {
    status: remoteResponse.status,
    headers: responseHeaders,
  })
}
