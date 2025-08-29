import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  const url = req.nextUrl.searchParams.get("url");
  const fmtParam = req.nextUrl.searchParams.get("format");
  if (!url) return new Response("Missing 'url'", { status: 400 });

  const ext = url.split(".").pop()?.toLowerCase();
  const format = fmtParam ?? (ext === "srt" ? "srt" : "vtt");

  const remoteRes = await fetch(url);
  if (!remoteRes.ok) {
    return new Response("Failed to fetch subtitle", { status: 502 });
  }

  let body: BodyInit;
  let mime = "text/vtt; charset=utf-8";

  if (format === "srt") {
    const srtText = await remoteRes.text();
    const vttBody =
      "WEBVTT\n\n" +
      srtText
        .replace(/\r+/g, "")
        .split(/\n\n+/)
        .map((block) => block.trim().replace(/(\d{2}:\d{2}:\d{2}),(\d{3})/g, "$1.$2"))
        .join("\n\n");
    body = vttBody;
  } else {
    body = remoteRes.body as any;
  }

  const headers = new Headers({
    "Content-Type": mime,
    "Cache-Control": "public, max-age=86400, immutable",
    "Access-Control-Allow-Origin": "*",
  });

  return new Response(body, { status: 200, headers });
}
