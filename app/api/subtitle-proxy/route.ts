import { NextRequest } from "next/server";

// Proxy for subtitle files (VTT/SRT) to bypass CORS restrictions.
// Usage: /api/subtitle-proxy?url=<encoded-remote-url>
export async function GET(req: NextRequest) {
  const remoteUrl = req.nextUrl.searchParams.get("url");
  if (!remoteUrl) {
    return new Response("Missing 'url' query parameter", { status: 400 });
  }

  // Fetch remote subtitle (simple GET; Range not necessary but could be forwarded)
  const remoteRes = await fetch(remoteUrl);

  // Prepare response headers
  const headers = new Headers();
  const remoteCT = remoteRes.headers.get("Content-Type");
  if (remoteCT) headers.set("Content-Type", remoteCT);

  // If remote didn't send a specific Content-Type or sent octet-stream, infer from extension
  if (!remoteCT || remoteCT === "application/octet-stream") {
    const ext = remoteUrl.split(".").pop()?.toLowerCase();
    const mime = ext === "vtt" ? "text/vtt" : ext === "srt" ? "application/x-subrip" : undefined;
    if (mime) headers.set("Content-Type", mime);
  }

  // Cache for 1 day (adjust as needed)
  headers.set("Cache-Control", "public, max-age=86400");
  // Allow CORS for all origins (restrict in production if desired)
  headers.set("Access-Control-Allow-Origin", "*");

  return new Response(remoteRes.body, {
    status: remoteRes.status,
    headers,
  });
}
