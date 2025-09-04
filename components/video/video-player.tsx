"use client";

import { useEffect, useRef, useState } from "react";
import videojs from "video.js";
// Ensure HLS (m3u8) playback support when using the ESM build of video.js
// eslint-disable-next-line import/no-extraneous-dependencies
import "@videojs/http-streaming";
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

// -----------------------------------------------------------------------------
// Quality selector (manual resolution switcher) -------------------------------
// -----------------------------------------------------------------------------
// We register a custom Video.js component that lists available quality levels
// discovered by the HLS tech (via the `qualityLevels()` API). Users can then
// force-select a specific resolution or return to the default adaptive setting.
// The implementation is self-contained and does **not** rely on any 3rd-party
// plugins so that no extra NPM packages or script tags are required.

// Only register once (during module evaluation) to avoid duplicates in
// Fast-Refresh / Hot-Reload situations.
if (!(videojs as any).hasQualitySelector) {
  const MenuButton = videojs.getComponent("MenuButton");
  const MenuItem = videojs.getComponent("MenuItem");

  class QualityMenuItem extends (MenuItem as any) {
    constructor(player: any, options: any) {
      super(player, options);
      this.height = options.height; // number | 'auto'
      this.label = options.label;
      this.controlText(options.label);
    }

    handleClick() {
      super.handleClick();
      const levels = this.player().qualityLevels();
      if (this.height === "auto") {
        for (let i = 0; i < levels.length; i += 1) {
          levels[i].enabled = true;
        }
      } else {
        for (let i = 0; i < levels.length; i += 1) {
          levels[i].enabled = levels[i].height === this.height;
        }
      }
      // Log to console for debug purposes
      /* eslint-disable no-console */
      console.log(`Switching quality to ${this.label}`);
      /* eslint-enable no-console */
      // Notify selector to update its label
      this.player().trigger("qualitychange", { label: this.label });
    }
  }

  class QualitySelector extends (MenuButton as any) {
    constructor(player: any, options: any) {
      super(player, options);
      this.currentLabel = "Auto";
      this.controlText(this.currentLabel);
      this.addClass("vjs-quality-selector");

      // Aca hay que poner que si adentro de algun hijo (cualquiera) hay un span con la clase vjs-control-text, tiene que tener position relative
      const children = this.el().querySelectorAll(".vjs-control-text");
      children.forEach((child: any) => {
        child.style.position = "relative";
      });

      // Listen for new quality levels & UI updates
      player.qualityLevels().on("addqualitylevel", () => {
        this.update();
      });

      // Listen for explicit quality change events
      player.on("qualitychange", (_e: any, data: any) => {
        if (data?.label) {
          this.currentLabel = data.label;
          this.updateButtonText();
        }
      });

      this.update(); // initial build
      this.updateButtonText();
    }

    updateButtonText() {
      this.controlText(this.currentLabel);
      const span = this.el().querySelector(".vjs-control-text");
      if (span) span.textContent = this.currentLabel;
    }

    // Build items list (unique heights + auto)
    createItems() {
      const player = this.player();
      const levels = player.qualityLevels();
      const heights: number[] = [];
      for (let i = 0; i < levels.length; i += 1) {
        const h = levels[i].height;
        if (h && heights.indexOf(h) === -1) heights.push(h);
      }
      heights.sort((a, b) => b - a); // high → low

      const items: any[] = [];
      items.push(new QualityMenuItem(player, { label: "Auto", height: "auto" }));
      heights.forEach((h) => {
        items.push(
          new QualityMenuItem(player, { label: `${h}p`, height: h })
        );
      });
      return items;
    }
  }

  videojs.registerComponent("QualitySelector", QualitySelector as any);
  (videojs as any).hasQualitySelector = true;
}
// -----------------------------------------------------------------------------
// End Quality selector registration -------------------------------------------

export function VideoPlayer({
  videoUrl,
  poster,
  autoplay = false,
  controls = true,
  fluid = true,
  options = {},
  subtitles = [],
}: VideoPlayerProps) {
  console.log("VideoPlayer", videoUrl);
  // If consumer did not provide subtitles, we will attempt to detect them from
  // an HLS manifest automatically using `m3u8-parser`.
  const [autoSubs, setAutoSubs] = useState<Subtitle[]>([]);

  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const playerRef = useRef<VideoJsPlayer | null>(null);

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

      // Add quality selector button once player is ready
      playerRef.current.ready(() => {
        const vjs = playerRef.current as any;
        try {
          const controlBar = vjs.controlBar;
          const childrenArr = controlBar?.children?.() ?? [];
          const fullscreenIdx = childrenArr.findIndex((c: any) => c?.name && c.name() === "FullscreenToggle");
          const insertIdx = fullscreenIdx > -1 ? fullscreenIdx : undefined;
          controlBar.addChild("QualitySelector", {}, insertIdx);
        } catch (err) {
          console.warn("Failed to add QualitySelector", err);
        }
      });

      const vjs = playerRef.current as VideoJsPlayer;
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
        console.log("Fetching subtitles", videoUrl);
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
