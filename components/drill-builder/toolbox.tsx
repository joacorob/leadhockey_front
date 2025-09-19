"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Slider } from "@/components/ui/slider"
import { DraggableItem } from "./draggable-item"
import { Trash2, Palette, Maximize2, Settings } from "lucide-react"
import type { DrillElement } from "@/app/create/drill/page"
import { useState } from "react"
import { Input } from "@/components/ui/input"

interface ToolboxProps {
  onClearCanvas: () => void
  selectedElement?: DrillElement | null
  onUpdateSelected?: (updates: Partial<DrillElement>) => void
  playerCounters?: { [key: string]: number }
  onUpdatePlayerCounters?: (counters: { [key: string]: number }) => void
}

export function Toolbox({
  onClearCanvas,
  selectedElement,
  onUpdateSelected,
  playerCounters = {},
  onUpdatePlayerCounters,
}: ToolboxProps) {
  // Which team icon is currently being configured in the presets panel
  const [activePlayer, setActivePlayer] = useState<"team1" | "team2">("team1")

  // Independent presets for each team
  const [playerPresets, setPlayerPresets] = useState({
    team1: { size: 1, color: "#ef4444" }, // red default
    team2: { size: 1, color: "#3b82f6" }, // blue default
  })

  const [showPresets, setShowPresets] = useState(false)

  // Convenience getters for currently active team preset
  const presetSize = playerPresets[activePlayer].size
  const presetColor = playerPresets[activePlayer].color

  const updateActivePreset = (updates: Partial<{ size: number; color: string }>) => {
    setPlayerPresets((prev) => ({
      ...prev,
      [activePlayer]: {
        ...prev[activePlayer],
        ...updates,
      },
    }))
  }

  // Two separate teams so each keeps its own numbering.
  const playerItems = [
    {
      type: "player",
      subType: "team1",
      color: playerPresets.team1.color,
      label: (playerCounters.team1 || 0) + 1,
      size: playerPresets.team1.size,
    },
    {
      type: "player",
      subType: "team2",
      color: playerPresets.team2.color,
      label: (playerCounters.team2 || 0) + 1,
      size: playerPresets.team2.size,
    },
    { type: "player", subType: "coach", color: "#000000", label: "C", size: presetSize },
  ]

  const equipmentItems = [
    { type: "equipment", subType: "cone-orange", color: presetColor },
    { type: "equipment", subType: "cone-blue", color: presetColor },
    { type: "equipment", subType: "line", color: presetColor },
    { type: "equipment", subType: "circle", color: presetColor },
    { type: "equipment", subType: "square", color: presetColor },
  ]

  const movementItems = [
    { type: "movement", subType: "arrow", color: presetColor },
    { type: "movement", subType: "dotted-line", color: presetColor },
    { type: "movement", subType: "curved-line", color: presetColor },
  ]

  const textItems = [
    { type: "text", subType: "text", label: "Text", color: presetColor },
    { type: "text", subType: "note", label: "Note", color: presetColor },
  ]

  const colorPalette = [
    "#ef4444",
    "#f97316",
    "#f59e0b",
    "#eab308",
    "#84cc16",
    "#22c55e",
    "#10b981",
    "#14b8a6",
    "#06b6d4",
    "#0ea5e9",
    "#3b82f6",
    "#6366f1",
    "#8b5cf6",
    "#a855f7",
    "#d946ef",
    "#ec4899",
    "#f43f5e",
    "#000000",
    "#6b7280",
    "#ffffff",
  ]

  const handleSizeChange = (value: number[]) => {
    if (onUpdateSelected && selectedElement) {
      onUpdateSelected({ size: value[0] })
    }
  }

  const handleColorChange = (color: string) => {
    if (onUpdateSelected && selectedElement) {
      onUpdateSelected({ color })
    }
  }

  const handlePresetSizeChange = (value: number[]) => {
    updateActivePreset({ size: value[0] })
  }

  const handlePresetColorChange = (color: string) => {
    updateActivePreset({ color })
  }

  return (
    <Card className="min-h-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium">TOOLBOX</CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowPresets(!showPresets)}
            className="text-xs text-gray-500 hover:text-gray-700"
          >
            <Settings className="w-3 h-3 mr-1" />
            Presets
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-6 pb-8">
        {showPresets && (
          <div className="border-t pt-4">
            <h3 className="text-xs font-medium text-gray-700 mb-3 uppercase tracking-wide flex items-center gap-2">
              <Settings className="w-3 h-3" />
              Element Presets
            </h3>

            <div className="mb-4">
              <label className="text-xs text-gray-600 mb-2 block">Default Size: {presetSize.toFixed(1)}x</label>
              <Slider
                value={[presetSize]}
                onValueChange={handlePresetSizeChange}
                min={0.5}
                max={3}
                step={0.1}
                className="w-full"
              />
            </div>

            <div className="mb-4">
              <label className="text-xs text-gray-600 mb-2 block flex items-center gap-2">
                <Palette className="w-3 h-3" />
                Default Color
              </label>
              <div className="grid grid-cols-5 gap-1">
                {colorPalette.map((color) => (
                  <button
                    key={color}
                    onClick={() => handlePresetColorChange(color)}
                    className={`w-6 h-6 rounded border-2 ${
                      presetColor === color ? "border-gray-800" : "border-gray-300"
                    }`}
                    style={{ backgroundColor: color }}
                    title={color}
                  />
                ))}
              </div>
            </div>
          </div>
        )}

        {selectedElement && (
          <div className="border-t pt-4">
            <h3 className="text-xs font-medium text-gray-700 mb-3 uppercase tracking-wide flex items-center gap-2">
              <Maximize2 className="w-3 h-3" />
              Element Controls
            </h3>

            <div className="mb-4">
              <label className="text-xs text-gray-600 mb-2 block">
                Size: {selectedElement.size?.toFixed(1) || "1.0"}x
              </label>
              <Slider
                value={[selectedElement.size || 1]}
                onValueChange={handleSizeChange}
                min={0.5}
                max={3}
                step={0.1}
                className="w-full"
              />
            </div>

            <div className="mb-4">
              <label className="text-xs text-gray-600 mb-2 block flex items-center gap-2">
                <Palette className="w-3 h-3" />
                Color
              </label>
              <div className="grid grid-cols-5 gap-1">
                {colorPalette.map((color) => (
                  <button
                    key={color}
                    onClick={() => handleColorChange(color)}
                    className={`w-6 h-6 rounded border-2 ${
                      selectedElement.color === color ? "border-gray-800" : "border-gray-300"
                    }`}
                    style={{ backgroundColor: color }}
                    title={color}
                  />
                ))}
              </div>
            </div>

            {selectedElement.type === "text" && (
              <div className="mb-4">
                <label className="text-xs text-gray-600 mb-2 block">Text Content</label>
                <Input
                  value={selectedElement.text || ""}
                  onChange={(e) => onUpdateSelected && onUpdateSelected({ text: e.target.value })}
                  className="h-8 text-xs"
                />
              </div>
            )}

            <Button
              onClick={() => onUpdateSelected && onUpdateSelected({ id: "DELETE" })}
              variant="destructive"
              size="sm"
              className="w-full flex items-center gap-2"
            >
              <Trash2 className="w-3 h-3" />
              Delete Element
            </Button>
          </div>
        )}

        <div>
          <h3 className="text-xs font-medium text-gray-700 mb-3 uppercase tracking-wide">PLAYERS</h3>
          <div className="flex gap-2">
            {playerItems.map((item, index) => (
              <div key={index} onClick={() => setActivePlayer(item.subType as "team1" | "team2")} className={activePlayer===item.subType?"ring-2 ring-yellow-400 rounded-full":""}>
                <DraggableItem
                  type={item.type}
                  subType={item.subType}
                  color={item.color}
                  label={item.label.toString()}
                  size={item.size}
                >
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold cursor-grab active:cursor-grabbing"
                    style={{ backgroundColor: item.color }}
                  >
                    {item.label}
                  </div>
                </DraggableItem>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-xs font-medium text-gray-700 mb-3 uppercase tracking-wide">EQUIPMENT</h3>
          <div className="flex gap-2 flex-wrap">
            {equipmentItems.map((item, index) => (
              <DraggableItem key={index} type={item.type} subType={item.subType} color={item.color} size={presetSize}>
                <div className="cursor-grab active:cursor-grabbing">
                  {item.subType === "cone-orange" && (
                    <div className="w-0 h-0 border-l-[8px] border-r-[8px] border-b-[14px] border-l-transparent border-r-transparent border-b-orange-500" />
                  )}
                  {item.subType === "cone-blue" && (
                    <div className="w-0 h-0 border-l-[8px] border-r-[8px] border-b-[14px] border-l-transparent border-r-transparent border-b-blue-500" />
                  )}
                  {item.subType === "line" && <div className="w-8 h-1 bg-black" />}
                  {item.subType === "circle" && (
                    <div className="w-6 h-6 rounded-full border-2 border-gray-800 bg-white" />
                  )}
                  {item.subType === "square" && <div className="w-6 h-6 border-2 border-gray-800 bg-white" />}
                </div>
              </DraggableItem>
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-xs font-medium text-gray-700 mb-3 uppercase tracking-wide">MOVEMENT</h3>
          <div className="flex gap-2">
            {movementItems.map((item, index) => (
              <DraggableItem key={index} type={item.type} subType={item.subType} color={item.color}>
                <div className="cursor-grab active:cursor-grabbing">
                  {item.subType === "arrow" && (
                    <svg width="24" height="16" viewBox="0 0 24 16" className="text-black">
                      <path d="M0 8h20m-4-4l4 4-4 4" stroke="currentColor" strokeWidth="2" fill="none" />
                    </svg>
                  )}
                  {item.subType === "dotted-line" && (
                    <svg width="24" height="4" viewBox="0 0 24 4" className="text-black">
                      <path d="M0 2h4m2 0h4m2 0h4m2 0h4" stroke="currentColor" strokeWidth="2" strokeDasharray="2,2" />
                    </svg>
                  )}
                  {item.subType === "curved-line" && (
                    <svg width="24" height="16" viewBox="0 0 24 16" className="text-black">
                      <path d="M0 8c6-6 18-6 24 0" stroke="currentColor" strokeWidth="2" fill="none" />
                    </svg>
                  )}
                </div>
              </DraggableItem>
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-xs font-medium text-gray-700 mb-3 uppercase tracking-wide">TEXT</h3>
          <div className="flex gap-2">
            {textItems.map((item, index) => (
              <DraggableItem key={index} type={item.type} subType={item.subType} label={item.label} color={item.color} size={presetSize}>
                <Button
                  variant="outline"
                  size="sm"
                  className="cursor-grab active:cursor-grabbing text-xs bg-transparent"
                >
                  {item.label}
                </Button>
              </DraggableItem>
            ))}
          </div>
        </div>

        <div className="pt-4">
          <Button onClick={onClearCanvas} variant="destructive" className="w-full flex items-center gap-2">
            <Trash2 className="w-4 h-4" />
            Clear Canvas
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
