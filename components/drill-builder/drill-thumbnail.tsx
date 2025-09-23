"use client"
import { Stage, Layer, Arrow, Circle, Rect, Line, RegularPolygon, Text as KonvaText } from "react-konva"
import type { DrillElement } from "@/app/create/drill/page"

interface Props {
  element?: DrillElement
  width?: number
  height?: number
}

export function DrillThumbnail({ element, width = 160, height = 100 }: Props) {
  const render = () => {
    if (!element) return null
    const el = element
    const color = el.color || "#e11d48"
    const sizeF = el.size || 1
    switch (el.type) {
      case "player":
        return <Circle x={el.x * width} y={el.y * height} radius={8 * sizeF} fill={color} stroke="black" strokeWidth={1} />
      case "equipment":
        switch (el.subType) {
          case "cone-orange":
          case "cone-blue":
            return <RegularPolygon x={el.x * width} y={el.y * height} sides={3} radius={8 * sizeF} fill={color} rotation={180} />
          case "circle":
            return <Circle x={el.x * width} y={el.y * height} radius={8 * sizeF} stroke={color} />
          case "square":
            return <Rect x={el.x * width - 8} y={el.y * height - 8} width={16*sizeF} height={16*sizeF} stroke={color} />
          case "line":
            return <Rect x={el.x * width - 16} y={el.y * height - 1} width={32*sizeF} height={2} fill={color} />
          default:
            return null
        }
      case "movement":
        switch (el.subType) {
          case "arrow":
            return <Arrow points={[el.x*width, el.y*height, el.x*width+40*sizeF, el.y*height]} pointerLength={6} pointerWidth={6} stroke={color} fill={color} strokeWidth={2} />
          case "dotted-line":
            return <Line points={[el.x*width, el.y*height, el.x*width+40*sizeF, el.y*height]} stroke={color} strokeWidth={2} dash={[4,4]} />
          case "curved-line":
            return <Line points={[el.x*width, el.y*height, el.x*width+20*sizeF, el.y*height-20*sizeF, el.x*width+40*sizeF, el.y*height]} stroke={color} strokeWidth={2} tension={0.5} bezier />
          default:
            return null
        }
      case "text":
        return <KonvaText x={el.x*width} y={el.y*height} text={el.text||"T"} fontSize={10} fill={color} />
      default:
        return null
    }
  }

  return (
    <Stage width={width} height={height} className="border rounded bg-gray-50">
      <Layer>
        {render()}
      </Layer>
    </Stage>
  )
}
