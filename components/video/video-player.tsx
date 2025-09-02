"use client";

import { useEffect, useRef, useState } from "react";
import videojs from "video.js";
import { Parser as M3U8Parser } from "m3u8-parser";
import "video.js/dist/video-js.css";

type VideoJsPlayer = any;

interface Subtitle {
  url: string;
  label: string;
  language: string;
  /** Optional: format to hint MIME type */
  format?: "vtt" | "srt";
}

interface VideoPlayerProps {
  /** Video source URL */
  videoUrl: string;
  /** Preview image */
  poster?: string;
  /** Autoplay on load */
  autoplay?: boolean;
  /** Show default Video.js controls */
  controls?: boolean;
  /** Enable fluid (responsive) layout */
  fluid?: boolean;
  /** Extra Video.js options */
  options?: Record<string, unknown>;
  /** Subtitle tracks */
  subtitles?: Subtitle[];
}

export function VideoPlayer({
  videoUrl,
  poster,
  autoplay = false,
  controls = true,
  fluid = true,
  options = {},
  subtitles = [],
}: VideoPlayerProps) {
  // If consumer did not provide subtitles, we will attempt to detect them from
  // an HLS manifest automatically using `m3u8-parser`.
  const [autoSubs, setAutoSubs] = useState<Subtitle[]>([]);

  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const playerRef = useRef<VideoJsPlayer | null>(null);
  console.log("Subtitles", subtitles);

  // Helper to infer MIME type from url
  const inferMimeType = (url: string): string | undefined => {
    try {
      const u = new URL(url, typeof window !== "undefined" ? window.location.href : "http://localhost");
      // If proxy pattern ?url=remote, inspect remote ext
      const searchUrl = u.searchParams.get("url");
      const path = searchUrl ?? u.pathname;
      const ext = path.split(".").pop()?.toLowerCase();
      switch (ext) {
        case "mp4":
          return "video/mp4";
        case "m4v":
          return "video/x-m4v";
        case "webm":
          return "video/webm";
        case "m3u8":
          return "application/x-mpegURL";
        default:
          return undefined;
      }
    } catch {
      return undefined;
    }
  };

  const buildSource = (url: string) => {
    const mime = inferMimeType(url);
    return mime ? { src: url, type: mime } : { src: url };
  };

  // Initialise player once
  useEffect(() => {
    if (!playerRef.current && wrapperRef.current) {
      const videoEl = document.createElement("video-js");
      videoEl.classList.add(
        "vjs-big-play-centered",
        "w-full",
        "h-full",
        "rounded-lg",
        "overflow-hidden"
      );

      wrapperRef.current.appendChild(videoEl);

      const sourceObj = buildSource(videoUrl);
      playerRef.current = videojs(videoEl, {
        autoplay,
        controls,
        fluid,
        poster,
        preload: "auto",
        sources: [sourceObj],
        ...options,
      });

      const vjs = playerRef.current as VideoJsPlayer;
      subtitles.forEach((track, idx) => {
        console.log("Adding subtitle", track);
        vjs.addRemoteTextTrack(
          {
            kind: "subtitles",
            src: track.url,
            srclang: track.language,
            label: track.label,
            default: idx === 0,
            type: track.format === "srt" ? "application/x-subrip" : "text/vtt",
          },
          false
        );
      });
    }
  }, [autoplay, controls, fluid, poster, options, videoUrl, subtitles]);

  // Update source if videoUrl changes
  useEffect(() => {
    const player = playerRef.current as VideoJsPlayer;
    if (player && videoUrl) {
      console.log("Updating video source", videoUrl);
      player.src([buildSource(videoUrl)]);
      if (autoplay) player.play();
    }
  }, [videoUrl, autoplay]);

  // Update subtitles when prop changes
  useEffect(() => {
    const vjs = playerRef.current as VideoJsPlayer;
    if (vjs) {
      const existing = vjs.remoteTextTracks?.();
      if (existing) {
        for (let i = existing.length - 1; i >= 0; i--) {
          vjs.removeRemoteTextTrack(existing[i]);
        }
      }
      subtitles.forEach((track, idx) => {
        vjs.addRemoteTextTrack(
          {
            kind: "subtitles",
            src: track.url,
            srclang: track.language,
            label: track.label,
            default: idx === 0,
            type: track.format === "srt" ? "application/x-subrip" : "text/vtt",
          },
          false
        );
      });
    }
  }, [subtitles]);

  // ---------------------------------------------------------------------
  // Auto-detect subtitles from an HLS master playlist (if any)
  // ---------------------------------------------------------------------
  useEffect(() => {
    // Only attempt if the caller did not supply subtitles explicitly
    if (subtitles.length > 0) return;

    const isM3U8 = videoUrl.endsWith(".m3u8") || videoUrl.includes(".m3u8?");
    if (!isM3U8) return;

    const fetchAndParse = async () => {
      try {
        const res = await fetch(videoUrl, { cache: "no-store" });
        if (!res.ok) return;
        const text = await res.text();

        const parser = new M3U8Parser();
        parser.push(text);
        parser.end();

        const { mediaGroups } = parser.manifest as any;
        const subsGroup = mediaGroups?.SUBTITLES ?? {};

        const collected: Subtitle[] = [];

        Object.values(subsGroup).forEach((group: any) => {
          Object.values(group).forEach((def: any) => {
            if (def?.uri) {
              const abs = new URL(def.uri, videoUrl).toString();
              collected.push({
                url: abs,
                label: def?.name ?? def?.language ?? "Subtitle",
                language: def?.language ?? "und",
                // Attempt to infer format from URI extension
                format: abs.endsWith(".srt") ? "srt" : "vtt",
              });
            }
          });
        });

        setAutoSubs(collected);
      } catch (err) {
        console.error("Failed to auto-detect subtitles", err);
      }
    };

    fetchAndParse();
  }, [videoUrl, subtitles]);

  // Dispose player on unmount
  useEffect(() => {
    const player = playerRef.current as VideoJsPlayer;
    return () => {
      if (player && !player.isDisposed?.()) {
        player.dispose();
        playerRef.current = null;
      }
    };
  }, []);

  // Merge explicitly provided subtitles with auto-detected ones (avoid dups)
  const effectiveSubs = subtitles.length > 0 ? subtitles : autoSubs;

  // Ensure we refresh the player whenever effectiveSubs changes
  useEffect(() => {
    const vjs = playerRef.current as VideoJsPlayer;
    if (!vjs) return;

    // Remove existing
    const existing = vjs.remoteTextTracks?.();
    if (existing) {
      for (let i = existing.length - 1; i >= 0; i--) {
        vjs.removeRemoteTextTrack(existing[i]);
      }
    }

    effectiveSubs.forEach((track, idx) => {
      vjs.addRemoteTextTrack(
        {
          kind: "subtitles",
          src: track.url,
          srclang: track.language,
          label: track.label,
          default: idx === 0,
          type: track.format === "srt" ? "application/x-subrip" : "text/vtt",
        },
        false
      );
    });
  }, [effectiveSubs]);

  return <div data-vjs-player ref={wrapperRef} className="w-full h-full" />;
}
