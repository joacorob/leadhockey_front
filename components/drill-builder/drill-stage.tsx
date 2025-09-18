import { Stage, Layer, Image as KonvaImage, Circle, Rect, Arrow, Text as KonvaText, Transformer, Line, RegularPolygon } from "react-konva"
import { useDrop } from "react-dnd"
import useImage from "use-image"
import type { DrillElement } from "@/app/create/drill/page"
import React from "react"

interface DrillStageProps {
  elements: DrillElement[]
  selectedElements: string[]
  onAddElement: (element: Omit<DrillElement, "id">) => void
  onUpdateElement: (id: string, updates: Partial<DrillElement>) => void
  onRemoveElement: (id: string) => void
  onSelectionChange: (ids: string[]) => void
  onMoveSelected: (dx: number, dy: number) => void
}

export const DrillStage = React.forwardRef<any, DrillStageProps>(function DrillStage({
  elements,
  selectedElements,
  onAddElement,
  onUpdateElement,
  onRemoveElement,
  onSelectionChange,
  onMoveSelected,
}: DrillStageProps, externalRef) {
  // Load field image once
  const [fieldImage] = useImage("/field_drag.png")

  // Fixed stage dimensions (px)
  const width = 900
  const height = 600

  const stageRef = React.useRef<any>(null)

  // Refs to Konva nodes of elements
  const nodeRefs = React.useRef(new Map<string, any>())
  const transformerRef = React.useRef<any>(null)

  // Update transformer nodes when selection changes
  React.useEffect(() => {
    if (!transformerRef.current) return
    const nodes = selectedElements.map((id) => nodeRefs.current.get(id)).filter(Boolean)
    transformerRef.current.nodes(nodes)
    transformerRef.current.getLayer()?.batchDraw()
  }, [selectedElements])

  // For group dragging delta calculations
  const dragAnchor = React.useRef<{ x: number; y: number } | null>(null)

  const [{ isOver }, drop] = useDrop(
    () => ({
      accept: "drill-item",
      drop: (item: any, monitor) => {
        if (!stageRef.current) return
        const client = monitor.getClientOffset()
        if (!client) return

        // Calculate coordinates relative to stage top-left
        const rect = stageRef.current.container().getBoundingClientRect()
        const x = client.x - rect.left
        const y = client.y - rect.top

        console.log("Drop item", item)
        onAddElement({
          type: item.type,
          subType: item.subType,
          x,
          y,
          color: item.color,
          size: item.size,
          label: item.label,
          text: item.label === "Text" ? "Sample Text" : item.label === "Note" ? "Note" : undefined,
        })
      },
      collect: (monitor) => ({
        isOver: monitor.isOver(),
      }),
    }),
    [onAddElement],
  )

  const handleDragEnd = (id: string, e: any) => {
    const { x, y } = e.target.position()
    onUpdateElement(id, { x, y })
  }

  const handleDragStart = (e: any) => {
    dragAnchor.current = { x: e.target.x(), y: e.target.y() }
  }

  const handleDragMove = (id: string, e: any) => {
    if (selectedElements.length > 1) {
      const prev = dragAnchor.current
      if (!prev) return
      const dx = e.target.x() - prev.x
      const dy = e.target.y() - prev.y
      if (dx === 0 && dy === 0) return
      dragAnchor.current = { x: e.target.x(), y: e.target.y() }
      onMoveSelected(dx, dy)
    }
  }

  const handleClick = (id: string, e: any) => {
    e.evt.cancelBubble = true
    if (selectedElements.includes(id)) return // keep selection
    onSelectionChange([id])
  }

  const renderElement = (el: DrillElement) => {
    const commonProps = {
      x: el.x,
      y: el.y,
      draggable: true,
      onDragStart: handleDragStart,
      onDragMove: (e: any) => handleDragMove(el.id, e),
      onDragEnd: (e: any) => handleDragEnd(el.id, e),
      onClick: (e: any) => handleClick(el.id, e),
    }

    const isSel = selectedElements.includes(el.id)

    // attach ref to node
    const setNodeRef = (node: any) => {
      if (node) nodeRefs.current.set(el.id, node)
    }

    switch (el.type) {
      case "player":
        return (
          <Circle
            key={el.id}
            {...commonProps}
            radius={(el.size || 1) * 12}
            fill={el.color || "#2563eb"}
            stroke={isSel ? "yellow" : "black"}
            strokeWidth={isSel ? 4 : 1}
            ref={setNodeRef}
            onTransformEnd={(e: any) => {
              const node = e.target
              const scale = node.scaleX()
              node.scale({ x: 1, y: 1 })
              onUpdateElement(el.id, { size: (el.size || 1) * scale })
            }}
          />
        )
      case "equipment": {
        const size = (el.size || 1) * 12
        const onTransformEnd = (e: any) => {
          const node = e.target
          const scale = node.scaleX()
          node.scale({ x: 1, y: 1 })
          onUpdateElement(el.id, { size: (el.size || 1) * scale })
        }

        switch (el.subType) {
          case "cone-orange":
          case "cone-blue":
            return (
              <RegularPolygon
                key={el.id}
                {...commonProps}
                ref={setNodeRef}
                sides={3}
                radius={size}
                fill={el.color}
                rotation={180}
                offset={{ x: 0, y: size / 2 }}
                onTransformEnd={onTransformEnd}
              />
            )
          case "circle":
            return (
              <Circle
                key={el.id}
                {...commonProps}
                ref={setNodeRef}
                radius={size}
                fill="#ffffff"
                stroke="#1f2937"
                strokeWidth={2}
                onTransformEnd={onTransformEnd}
              />
            )
          case "square":
            return (
              <Rect key={el.id}
                {...commonProps}
                ref={setNodeRef}
                width={size * 2}
                height={size * 2}
                offset={{ x: size, y: size }}
                fill="#ffffff"
                stroke="#1f2937"
                strokeWidth={2}
                onTransformEnd={onTransformEnd}
              />
            )
          case "line":
            return (
              <Rect key={el.id}
                {...commonProps}
                ref={setNodeRef}
                width={size * 3}
                height={4}
                offset={{ x: (size * 3) / 2, y: 2 }}
                fill={el.color || "#000000"}
                onTransformEnd={onTransformEnd}
              />
            )
          default:
            return null
        }
      }
      case "movement": {
        const color = el.color || "#e11d48"
        switch (el.subType) {
          case "arrow":
            return (
              <Arrow
                key={el.id}
                {...commonProps}
                ref={setNodeRef}
                points={[0, 0, 40, 0]}
                pointerLength={8}
                pointerWidth={8}
                fill={color}
                stroke={color}
                strokeWidth={3}
              />
            )
          case "dotted-line":
            return (
              <Line key={el.id}
                {...commonProps}
                ref={setNodeRef}
                points={[0, 0, 40, 0]}
                stroke={color}
                strokeWidth={3}
                dash={[6, 6]}
              />
            )
          case "curved-line":
            return (
              <Line key={el.id}
                {...commonProps}
                ref={setNodeRef}
                points={[0, 0, 20, -20, 40, 0]}
                stroke={color}
                strokeWidth={3}
                tension={0.5}
                bezier={true}
              />
            )
          default:
            return null
        }
      }
      case "text":
        return (
          <KonvaText key={el.id}
            {...commonProps}
            text={el.text || "Text"}
            fontSize={14 * (el.size || 1)}
            fill={el.color || "#000"}
            ref={setNodeRef}
            onTransformEnd={(e: any) => {
              const node = e.target
              const scale = node.scaleX()
              node.scale({ x: 1, y: 1 })
              onUpdateElement(el.id, { size: (el.size || 1) * scale })
            }}
          />
        )
      default:
        return null
    }
  }

  return (
    <div ref={(node)=>{ if(node) drop(node); }} className={isOver ? "ring-2 ring-yellow-400 rounded-lg" : ""}>
      <Stage ref={(node)=>{stageRef.current=node; if(externalRef){ if(typeof externalRef==='function'){externalRef(node);} else {externalRef.current=node}} }} width={width} height={height} className="border rounded-lg shadow" tabIndex={0} onClick={() => onSelectionChange([])}>
      {/* Background */}
      <Layer listening={false}>
        {fieldImage && <KonvaImage image={fieldImage} width={width} height={height} />}
      </Layer>

      {/* Elements */}
      <Layer>
        {elements.map((el) => renderElement(el))}
        {/* Transformer for selected nodes */}
        <Transformer ref={transformerRef} rotateEnabled={false} />
      </Layer>
      </Stage>
    </div>
  )
})
