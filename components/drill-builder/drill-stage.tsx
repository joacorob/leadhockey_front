import { Stage, Layer, Image as KonvaImage, Circle, Rect, Arrow, Text as KonvaText, Transformer, Line, RegularPolygon, Group } from "react-konva"
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
  interactive?: boolean // new
}

export const DrillStage = React.forwardRef<any, DrillStageProps>(function DrillStage({
  elements,
  selectedElements,
  onAddElement,
  onUpdateElement,
  onRemoveElement,
  onSelectionChange,
  onMoveSelected,
  interactive = true,
}: DrillStageProps, externalRef) {
  // Load field image once
  const [fieldImage] = useImage("/field_drag.png")

  // Fixed stage dimensions (px)
  const width = 900
  const height = 600

  const stageRef = React.useRef<any>(null)

  // Refs to Konva nodes of elements
  const nodeRefs = React.useRef(new Map<string, any>())
  // Generic transformer to handle movement, player and selected equipment (cones)
  const transformerRef = React.useRef<any>(null)
  // Separate transformer for movement elements to control resize & rotate
  // expose nodeRefs via stageRef for external access (e.g., GIF export)
  React.useEffect(() => {
    if (stageRef.current) {
      ;(stageRef.current as any).nodeRefs = nodeRefs.current
    }
  }, [elements])
  // Flag to show transformer explicitly via double-click
  const [showTransformer, setShowTransformer] = React.useState(false)

  // Determine which elements can be transformed / rotated
  const isTransformable = (el?: DrillElement) => {
    if (!el) return false
    if (el.type === "movement" || el.type === "player") return true
    if (el.type === "equipment") {
      return (
        el.subType === "cone" ||
        el.subType === "cone-orange" ||
        el.subType === "cone-blue" ||
        el.subType === "circle" ||
        el.subType === "square"
      )
    }
    return false
  }

  const isRotatable = isTransformable // same rule for now; adjust if needed

  // Update transformer nodes when selection changes or visibility toggles
  React.useEffect(() => {
    const canShow = showTransformer && selectedElements.length > 0 && selectedElements.every((id) => {
      const el = elements.find((e) => e.id === id)
      return isTransformable(el)
    })

    if (transformerRef.current) {
      if (!canShow) {
        transformerRef.current.nodes([])
        transformerRef.current.getLayer()?.batchDraw()
      } else {
        const nodes = selectedElements.map((id) => nodeRefs.current.get(id)).filter(Boolean)
        transformerRef.current.nodes(nodes)

        const allowRotation = selectedElements.every((id) => {
          const el = elements.find((e) => e.id === id)
          return isRotatable(el)
        })
        transformerRef.current.rotateEnabled(allowRotation)

        // Cones: allow rotate only, disable resize
        const noResizeSet = new Set(["cone","cone-orange","cone-blue","circle","square"])
        const allNoResize = selectedElements.length > 0 && selectedElements.every((id) => {
          const el = elements.find((e) => e.id === id)
          return el?.type === "equipment" && noResizeSet.has(el.subType as string)
        })

        transformerRef.current.resizeEnabled(!allNoResize)
        transformerRef.current.enabledAnchors(allNoResize ? [] : ["middle-left","middle-right","top-center","bottom-center"])

        transformerRef.current.getLayer()?.batchDraw()
      }
    }
  }, [selectedElements, elements, showTransformer])

  // For group dragging delta calculations
  const dragAnchor = React.useRef<{ x: number; y: number } | null>(null)

  const [{ isOver }, drop] = useDrop(
    () => ({
      accept: "drill-item",
      drop: (item: any, monitor) => {
        if (!interactive) return
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
        isOver: interactive ? monitor.isOver() : false,
      }),
    }),
    [onAddElement, interactive],
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
    if(process.env.NODE_ENV!=='production') console.log('handleClick', id)
    if (selectedElements.includes(id)) return // keep selection
    onSelectionChange([id])
    setShowTransformer(false)
  }

  const handleDoubleClick = (id: string, e:any) => {
    e.evt.cancelBubble = true
    if(process.env.NODE_ENV!=='production') console.log('handleDoubleClick', id)
    if(!selectedElements.includes(id)){
      onSelectionChange([id])
    }
    setShowTransformer(true)
  }

  const renderElement = (el: DrillElement) => {
    const commonProps = {
      x: el.x,
      y: el.y,
      draggable: interactive && !(showTransformer && selectedElements.includes(el.id)),
      onDragStart: handleDragStart,
      onDragMove: (e: any) => handleDragMove(el.id, e),
      onDragEnd: (e: any) => handleDragEnd(el.id, e),
      onClick: (e: any) => handleClick(el.id, e),
      onDblClick: (e:any)=> handleDoubleClick(el.id,e),
    }

    const isSel = selectedElements.includes(el.id)
    // Common outline props for selected state
    const selOutline = isSel
      ? { stroke: "black", strokeWidth: 4 }
      : {}
    const selShadow = isSel
      ? { shadowEnabled: true, shadowColor: "black", shadowBlur: 4, shadowOpacity: 1, shadowOffset: { x: 0, y: 0 } }
      : {}

    // attach ref to node
    const setNodeRef = (node: any) => {
      if (node) nodeRefs.current.set(el.id, node)
    }

    switch (el.type) {
      case "player": {
        const radius = (el.size || 1) * 12
        const fontSize = 14 * (el.size || 1)
        return (
          <Group
            key={el.id}
            {...commonProps}
            ref={setNodeRef}
            onTransformEnd={(e: any) => {
              const node = e.target
              const scale = node.scaleX()
              node.scale({ x: 1, y: 1 })
              onUpdateElement(el.id, { size: (el.size || 1) * scale })
            }}
          >
            <Circle
              radius={radius}
              fill={el.color || "#2563eb"}
              stroke={isSel ? "black" : undefined}
              strokeWidth={isSel ? 4 : 0}
            />
            <KonvaText
              text={String(el.text || el.label || "")}
              fontSize={fontSize}
              fill="#ffffff"
              width={radius * 2}
              align="center"
              verticalAlign="middle"
              offsetX={radius}
              offsetY={fontSize / 2}
            />
          </Group>
        )
      }
      case "equipment": {
        const size = (el.size || 1) * 12
        const onTransformEnd = (e: any) => {
          const node = e.target
          const scale = node.scaleX()
          node.scale({ x: 1, y: 1 })
          onUpdateElement(el.id, { size: (el.size || 1) * scale })
        }

        switch (el.subType) {
          case "cone":
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
                {...selOutline}
                {...selShadow}
              />
            )
          case "circle":
            return (
              <Circle
                key={el.id}
                {...commonProps}
                ref={setNodeRef}
                radius={size}
                fill={el.color || "#ffffff"}
                stroke="#1f2937"
                strokeWidth={2}
                rotation={el.rotation || 0}
                onTransformEnd={(e: any) => {
                  const node = e.target
                  const scale = node.scaleX()
                  const rot = node.rotation()
                  node.scale({ x: 1, y: 1 })
                  onUpdateElement(el.id, { size: (el.size || 1) * scale, rotation: rot })
                }}
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
                fill={el.color || "#ffffff"}
                stroke="#1f2937"
                strokeWidth={2}
                rotation={el.rotation || 0}
                onTransformEnd={(e: any) => {
                  const node = e.target
                  const scale = node.scaleX()
                  const rot = node.rotation()
                  node.scale({ x: 1, y: 1 })
                  onUpdateElement(el.id, { size: (el.size || 1) * scale, rotation: rot })
                }}
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
                stroke={isSel ? "black" : undefined}
                strokeWidth={isSel ? 2 : 0}
                onTransformEnd={onTransformEnd}
                {...selShadow}
              />
            )
          default:
            return null
        }
      }
      case "movement": {
        const color = el.color || "#e11d48"
        const sizeF = el.size || 1
        switch (el.subType) {
          case "arrow":
            return (
              <Arrow
                key={el.id}
                {...commonProps}
                ref={setNodeRef}
                points={[0, 0, 40 * sizeF, 0]}
                pointerLength={8 * sizeF}
                pointerWidth={8 * sizeF}
                hitStrokeWidth={12}
                fill={color}
                stroke={color}
                strokeWidth={3}
                rotation={el.rotation || 0}
                {...selShadow}
              />
            )
          case "dotted-line":
            return (
              <Line key={el.id}
                {...commonProps}
                ref={setNodeRef}
                points={[0, 0, 40 * sizeF, 0]}
                stroke={color}
                strokeWidth={3}
                dash={[6, 6]}
                hitStrokeWidth={12}
                rotation={el.rotation || 0}
                {...selShadow}
              />
            )
          case "curved-line":
            return (
              <Line key={el.id}
                {...commonProps}
                ref={setNodeRef}
                points={[0, 0, 20 * sizeF, -20 * sizeF, 40 * sizeF, 0]}
                stroke={color}
                strokeWidth={3}
                tension={0.5}
                bezier={true}
                hitStrokeWidth={12}
                rotation={el.rotation || 0}
                {...selShadow}
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
            {...selOutline}
            {...selShadow}
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
    <div ref={(node)=>{ if(node) interactive && drop(node); }} className={isOver ? "ring-2 ring-yellow-400 rounded-lg" : ""}>
      <Stage
        ref={(node)=>{stageRef.current=node; if(externalRef){ if(typeof externalRef==='function'){externalRef(node);} else {externalRef.current=node}} }}
        width={width}
        height={height}
        className="border rounded-lg shadow"
        tabIndex={0}
        onClick={(e:any)=>{
          if(!interactive) return
          // Only clear selection when clicking on empty stage
          const stage = e.target.getStage()
          if(e.target === stage){
            onSelectionChange([])
            setShowTransformer(false)
          }
        }}
      >
      {/* Background */}
      <Layer listening={false}>
        {fieldImage && <KonvaImage image={fieldImage} width={width} height={height} />}
      </Layer>

      {/* Elements */}
      <Layer>
        {elements.map((el) => renderElement(el))}
        {/* Transformer for movement elements */}
        <Transformer
          ref={transformerRef}
          rotationEnabled={true}
          resizeEnabled={true}
          enabledAnchors={["middle-left","middle-right","top-center","bottom-center"]}
          boundBoxFunc={(oldBox, newBox)=>{
            // prevent negative width
            if(newBox.width<5){ return oldBox }
            return newBox
          }}
          onTransformEnd={(e:any)=>{
            const tr = transformerRef.current
            if(!tr) return
            const nodes = tr.nodes() || []
            nodes.forEach((n:any)=>{
              let foundId: string | null = null
              nodeRefs.current.forEach((val,key)=>{ if(val===n){ foundId=key }})
              if(!foundId) return
              const id = foundId
              const el = elements.find((el)=>el.id===id)
              if(!el) return

              const scaleX = n.scaleX()
              const rotation = n.rotation()

              n.scale({x:1,y:1})

              // update size proportional to horizontal scale only (scaleX)
              const newSize = (el.size || 1) * scaleX

              onUpdateElement(id,{size:newSize,rotation})
            })
            tr.getLayer()?.batchDraw()
            setShowTransformer(false)
          }}
        />
      </Layer>
      </Stage>
    </div>
  )
})
