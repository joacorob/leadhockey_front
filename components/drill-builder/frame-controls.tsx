"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import type { DrillFrame } from "@/app/create/drill/page"
import { Plus, Copy, Trash2, Download, Play, Pause, SkipBack, SkipForward } from "lucide-react"
import { useState } from "react"

interface FrameControlsProps {
  frames: DrillFrame[]
  currentFrameIndex: number
  onFrameChange: (index: number) => void
  onAddFrame: () => void
  onDuplicateFrame: () => void
  onRemoveFrame: (index: number) => void
  onUpdateFrameName: (index: number, name: string) => void
  onDownloadAll: () => void
  onExportGif: (opts: { delay: number; width: number }) => void
  selectedCount: number
  onDeleteSelected: () => void
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
  onExportGif,
}: FrameControlsProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [showGifOpts, setShowGifOpts] = useState(false)
  const [gifDelay, setGifDelay] = useState(200)
  const [gifWidth, setGifWidth] = useState(900)
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
            </div>
          </div>

          <div className="flex items-center gap-2">
            {selectedCount > 0 && (
              <Button variant="destructive" size="sm" onClick={onDeleteSelected}>
                <Trash2 className="w-4 h-4 mr-1" />
                Delete ({selectedCount})
              </Button>
            )}

            <Button variant="outline" size="sm" onClick={onDuplicateFrame}>
              <Copy className="w-4 h-4 mr-1" />
              Duplicate
            </Button>

            <Button variant="outline" size="sm" onClick={onAddFrame}>
              <Plus className="w-4 h-4 mr-1" />
              Add Frame
            </Button>

            <Button variant="default" size="sm" onClick={onDownloadAll}>
              <Download className="w-4 h-4 mr-1" />
              Download All
            </Button>

            <Button variant="default" size="sm" onClick={() => setShowGifOpts(!showGifOpts)}>
              <Download className="w-4 h-4 mr-1" />
              GIF Options
            </Button>
          </div>
        </div>
      {showGifOpts && (
        <div className="border-t pt-4 mt-4 grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs text-gray-600 mb-1 block">Delay per frame (ms)</label>
            <Input
              type="number"
              value={gifDelay}
              min={50}
              onChange={(e) => setGifDelay(parseInt(e.target.value, 10) || 0)}
              className="h-8 text-xs"
            />
          </div>
          <div>
            <label className="text-xs text-gray-600 mb-1 block">Width (px)</label>
            <Input
              type="number"
              value={gifWidth}
              min={100}
              onChange={(e) => setGifWidth(parseInt(e.target.value, 10) || 0)}
              className="h-8 text-xs"
            />
          </div>
          <div className="col-span-2 flex justify-end gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setShowGifOpts(false)}
            >
              Cancel
            </Button>
            <Button
              variant="default"
              size="sm"
              onClick={() => {
                setShowGifOpts(false)
                onExportGif({ delay: gifDelay, width: gifWidth })
              }}
            >
              Generate GIF
            </Button>
          </div>
        </div>
      )}

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
              ) : (
                <span className="text-xs font-medium truncate" onDoubleClick={() => setEditingFrame(index)}>
                  {frame.name}
                </span>
              )}

              <span className="text-xs text-gray-500">({frame.elements.length})</span>

              {frames.length > 1 && (
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
