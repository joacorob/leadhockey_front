"use client";

import { useEffect, useRef } from "react";
import videojs from "video.js";
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

  return <div data-vjs-player ref={wrapperRef} className="w-full h-full" />;
}
