"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import type { DrillFrame } from "@/app/create/drill/page"
import { Plus, Copy, Trash2, Download, Play, Pause, SkipBack, SkipForward, Pencil, Settings } from "lucide-react"
import { useState } from "react"

interface FrameControlsProps {
  frames: DrillFrame[]
  currentFrameIndex: number
  onFrameChange: (index: number) => void
  onAddFrame: () => void
  onDuplicateFrame: () => void
  onRemoveFrame: (index: number) => void
  onUpdateFrameName: (index: number, name: string) => void
  onDownloadAll: () => void // still for PDF export
  onPreviewVideo?: () => void
  speed?: "slow" | "regular" | "fast"
  onChangeSpeed?: (speed: "slow" | "regular" | "fast") => void
  selectedCount: number
  onDeleteSelected: () => void
  readOnly?: boolean
  isGenerating?: boolean
}

export function FrameControls({
  frames,
  currentFrameIndex,
  onFrameChange,
  onAddFrame,
  onDuplicateFrame,
  onRemoveFrame,
  onUpdateFrameName,
  onDownloadAll,
  selectedCount,
  onDeleteSelected,
  onPreviewVideo,
  speed = "regular",
  onChangeSpeed,
  isGenerating = false,
  readOnly = false,
}: FrameControlsProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [showSpeedMenu, setShowSpeedMenu] = useState(false)
  const [editingFrame, setEditingFrame] = useState<number | null>(null)

  const playFrames = () => {
    if (isPlaying) {
      setIsPlaying(false)
      return
    }

    setIsPlaying(true)
    let frameIndex = 0

    const interval = setInterval(() => {
      frameIndex = (frameIndex + 1) % frames.length
      onFrameChange(frameIndex)

      if (frameIndex === 0 && frames.length > 1) {
        // Completed one full cycle
        setIsPlaying(false)
        clearInterval(interval)
      }
    }, 2000) // 2 seconds per frame
  }

  const handleFrameNameSubmit = (index: number, name: string) => {
    onUpdateFrameName(index, name)
    setEditingFrame(null)
  }

  return (
    <Card className="mt-6">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <h3 className="text-sm font-medium text-gray-700">FRAMES</h3>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onFrameChange(Math.max(0, currentFrameIndex - 1))}
                disabled={currentFrameIndex === 0}
              >
                <SkipBack className="w-4 h-4" />
              </Button>

              <Button variant="outline" size="sm" onClick={playFrames}>
                {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={() => onFrameChange(Math.min(frames.length - 1, currentFrameIndex + 1))}
                disabled={currentFrameIndex === frames.length - 1}
              >
                <SkipForward className="w-4 h-4" />
              </Button>
              {!readOnly && (
                <>
                  <Button variant="outline" size="sm" onClick={onDuplicateFrame} title="Duplicate Frame">
                    <Copy className="w-4 h-4" />
                  </Button>
                  <Button variant="outline" size="sm" onClick={onAddFrame} title="Add Frame">
                    <Plus className="w-4 h-4" />
                  </Button>
                </>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            {!readOnly && selectedCount > 0 && (
              <Button variant="destructive" size="sm" onClick={onDeleteSelected}>
                <Trash2 className="w-4 h-4 mr-1" />
                Delete ({selectedCount})
              </Button>
            )}

            {!readOnly && (
              <>
                <Button variant="default" size="sm" onClick={onPreviewVideo} disabled={isGenerating}>
                  {isGenerating ? (
                    <span className="flex items-center gap-1">
                      <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"/></svg>
                      Generating…
                    </span>
                  ) : (
                    <>
                      <Play className="w-4 h-4 mr-1" />Preview Video
                    </>
                  )}
                </Button>

                <div className="relative">
                  <Button variant="ghost" size="icon" onClick={() => setShowSpeedMenu(!showSpeedMenu)} title="Animation Speed">
                    <Settings className="w-4 h-4" />
                  </Button>
                  {showSpeedMenu && (
                    <div className="absolute right-0 mt-2 w-40 bg-white border rounded shadow z-10 p-2 text-sm">
                      <button className={`w-full text-left px-2 py-1 rounded ${speed==='slow'?'bg-blue-100':''}`} onClick={()=>{onChangeSpeed && onChangeSpeed('slow'); setShowSpeedMenu(false)}}>
                        Slow
                      </button>
                      <button className={`w-full text-left px-2 py-1 rounded ${speed==='regular'?'bg-blue-100':''}`} onClick={()=>{onChangeSpeed && onChangeSpeed('regular'); setShowSpeedMenu(false)}}>
                        Regular
                      </button>
                      <button className={`w-full text-left px-2 py-1 rounded ${speed==='fast'?'bg-blue-100':''}`} onClick={()=>{onChangeSpeed && onChangeSpeed('fast'); setShowSpeedMenu(false)}}>
                        Fast
                      </button>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Frame Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-2">
          {frames.map((frame, index) => (
            <div
              key={frame.id}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg border cursor-pointer min-w-0 ${
                index === currentFrameIndex
                  ? "bg-blue-100 border-blue-300 text-blue-700"
                  : "bg-white border-gray-200 hover:bg-gray-50"
              }`}
              onClick={() => onFrameChange(index)}
            >
              {editingFrame === index ? (
                !readOnly && (
                  <Input
                    defaultValue={frame.name}
                    className="h-6 text-xs min-w-[80px]"
                    onBlur={(e) => handleFrameNameSubmit(index, e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        handleFrameNameSubmit(index, e.currentTarget.value)
                      }
                      if (e.key === "Escape") {
                        setEditingFrame(null)
                      }
                    }}
                    autoFocus
                    onFocus={(e) => e.target.select()}
                  />
                )
              ) : (
                <div className="flex items-center gap-1">
                  <span
                    className="text-xs font-medium truncate"
                    onDoubleClick={() => !readOnly && setEditingFrame(index)}
                  >
                    {frame.name}
                  </span>
                  {!readOnly && (
                    <button
                      className="p-0 m-0 text-gray-500 hover:text-gray-700"
                      onClick={(e) => {
                        e.stopPropagation()
                        setEditingFrame(index)
                      }}
                      title="Rename"
                    >
                      <Pencil className="w-3 h-3" />
                    </button>
                  )}
                </div>
              )}

              <span className="text-xs text-gray-500">({frame.elements.length})</span>

              {!readOnly && frames.length > 1 && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-4 w-4 p-0 hover:bg-red-100"
                  onClick={(e) => {
                    e.stopPropagation()
                    onRemoveFrame(index)
                  }}
                >
                  <Trash2 className="w-3 h-3 text-red-500" />
                </Button>
              )}
            </div>
          ))}
        </div>

        {/* Frame Info */}
        <div className="mt-3 text-xs text-gray-500">
          Frame {currentFrameIndex + 1} of {frames.length} • {frames[currentFrameIndex].elements.length} elements
          {selectedCount > 0 && ` • ${selectedCount} selected`}
        </div>
      </CardContent>
    </Card>
  )
}