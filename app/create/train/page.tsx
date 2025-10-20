"use client"

import { useState } from "react"
import { Sidebar } from "@/components/layout/sidebar"
import { Header } from "@/components/layout/header"
import { Button } from "@/components/ui/button"
import { PracticePlan, PracticePlanItem } from "@/lib/types/practice-plan"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { ItemSelectModal } from "@/components/practice-plan/item-select-modal"
import { ImageDropzone } from "@/components/ui/image-dropzone"
import { Trash2, ArrowUp, ArrowDown } from "lucide-react"

// Step components placeholders (to be implemented in their own files later)
function MetadataStep({
  data,
  onChange,
  items,
  onAddItemsClick,
  updateItem,
  removeItem,
  moveItem,
}: {
  data: Partial<PracticePlan>
  onChange: (d: Partial<PracticePlan>) => void
  items: PracticePlanItem[]
  onAddItemsClick: () => void
  updateItem: (idx: number, partial: Partial<PracticePlanItem>) => void
  removeItem: (idx: number) => void
  moveItem: (idx: number, dir: -1 | 1) => void
}) {
  const handleTimeChange = (idx: number, value: string) => {
    if (!value) {
      updateItem(idx, { startTime: null })
      return
    }
    const [h, m] = value.split(":")
    if (isNaN(Number(h)) || isNaN(Number(m))) return
    updateItem(idx, { startTime: value })
  }
  return (
    <div className="space-y-8">
      {/* Training details */}
      <div className="bg-white rounded-lg p-6 shadow-sm">
        <h2 className="text-sm font-medium text-gray-700 mb-4 uppercase tracking-wide">Training details</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Training title</label>
            <Input
              placeholder="Enter training title"
              value={data.title ?? ""}
              onChange={(e) => onChange({ title: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Training description</label>
            <Textarea
              placeholder="Enter training description"
              value={data.description ?? ""}
              onChange={(e) => onChange({ description: e.target.value })}
              rows={3}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Training thumbnail</label>
            <ImageDropzone
              onImageSelect={(base64) => onChange({ thumbnail: base64 } as any)}
              onRemove={() => onChange({ thumbnail: null } as any)}
              currentImage={(data as any).thumbnail}
              maxSizeMB={5}
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
              <Input
                type="date"
                value={(data as any).date ?? new Date().toISOString().slice(0, 10)}
                onChange={(e) => onChange({ ...(data as any), date: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <RadioGroup
                value={data.status ?? "draft"}
                onValueChange={(v) => onChange({ status: v as any })}
                className="flex items-center space-x-6 mt-2"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="published" id="published" />
                  <Label htmlFor="published" className="text-sm">Published</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="draft" id="draft" />
                  <Label htmlFor="draft" className="text-sm">Not published</Label>
                </div>
              </RadioGroup>
            </div>
          </div>
        </div>
      </div>

      {/* Training stages */}
      <div className="bg-white rounded-lg p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-medium text-gray-700 uppercase tracking-wide">Training videos</h2>
          <Button variant="link" size="sm" onClick={onAddItemsClick}>
            + Add Video
          </Button>
        </div>
        {items.length === 0 ? (
          <p className="text-gray-500 text-sm">No items added yet.</p>
        ) : (
          <ul className="space-y-2">
            {items.map((it, idx) => (
              <li key={idx} className="flex items-start gap-3 p-2 border rounded">
                <img src={it.thumbnail_url ?? "https://placehold.co/80"} alt="thumb" className="w-16 h-16 object-cover rounded" />
                <div className="flex flex-col flex-1">
                  <span className="text-sm">{it.title ?? `Item ${it.itemId}`}</span>
                  <Input
                    type="time"
                    value={it.startTime ?? ""}
                    onChange={(e) => handleTimeChange(idx, e.target.value)}
                    className="w-24 h-8 text-xs mt-1"
                  />
                </div>
                <span className="text-xs text-gray-400 uppercase self-start mr-1">{it.itemType}</span>
                <div className="flex flex-col self-start mr-1">
                  <button onClick={() => moveItem(idx, -1)} disabled={idx === 0} className="text-gray-400 hover:text-gray-600 disabled:opacity-30" aria-label="Move up">
                    <ArrowUp size={14} />
                  </button>
                  <button onClick={() => moveItem(idx, 1)} disabled={idx === items.length - 1} className="text-gray-400 hover:text-gray-600 disabled:opacity-30" aria-label="Move down">
                    <ArrowDown size={14} />
                  </button>
                </div>
                <button onClick={() => removeItem(idx)} aria-label="Remove" className="text-gray-400 hover:text-red-600 self-start">
                  <Trash2 size={16} />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}

function SelectItemsStep({ items, setItems }: { items: PracticePlanItem[]; setItems: (items: PracticePlanItem[]) => void }) {
  return <div className="p-4">Item selection modal TODO</div>
}

function ArrangeStep({ items, setItems }: { items: PracticePlanItem[]; setItems: (items: PracticePlanItem[]) => void }) {
  return <div className="p-4">Drag-and-drop arrange list TODO</div>
}

function ReviewStep({ plan, onSave }: { plan: Partial<PracticePlan>; onSave: () => void }) {
  return (
    <div className="p-4">
      Review summary TODO
      <Button onClick={onSave} className="mt-4">Save plan</Button>
    </div>
  )
}

export default function CreateTrainingPage() {
  const [planData, setPlanData] = useState<Partial<PracticePlan>>({ status: "draft" })
  const [items, setItems] = useState<PracticePlanItem[]>([])
  const [isModalOpen, setModalOpen] = useState(false)

  const moveItem = (idx: number, direction: -1 | 1) => {
    setItems((prev) => {
      const newIdx = idx + direction
      if (newIdx < 0 || newIdx >= prev.length) return prev
      const copy = [...prev]
      const temp = copy[idx]
      copy[idx] = copy[newIdx]
      copy[newIdx] = temp
      return copy
    })
  }

  const removeItem = (idx: number) => {
    setItems((prev) => prev.filter((_, i) => i !== idx))
  }

  const updateItem = (idx: number, partial: Partial<PracticePlanItem>) => {
    setItems((prev) => {
      const copy = [...prev]
      copy[idx] = { ...copy[idx], ...partial }
      return copy
    })
  }

  const handleSave = async () => {
    // Build payload with thumbnail support
    const payload: any = { 
      title: planData.title,
      description: planData.description,
      status: planData.status || "draft",
      items 
    }
    
    // Include thumbnail if present (Base64 or null)
    if ((planData as any).thumbnail !== undefined) {
      payload.thumbnail = (planData as any).thumbnail
    }
    
    try {
      const res = await fetch("/api/practice-plans", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Failed")
      alert("Practice plan created")
    } catch (e: any) {
      alert(e.message)
    }
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Header />
        <main className="flex-1 overflow-y-auto p-6">
          <div className="flex justify-between mb-4">
            <h1 className="text-2xl font-bold">CREATE TRAINING</h1>
            <Button onClick={handleSave} className="bg-green-600 text-white">Save training</Button>
          </div>
          <MetadataStep
            data={planData}
            onChange={(d) => setPlanData((p) => ({ ...p, ...d }))}
            items={items}
            onAddItemsClick={() => setModalOpen(true)}
            updateItem={updateItem}
            removeItem={removeItem}
            moveItem={moveItem}
          />
        </main>
        {/* Modal placeholder */}
        <ItemSelectModal
          open={isModalOpen}
          onOpenChange={setModalOpen}
          onAdd={(newItems) =>
            setItems((prev) => {
              const existingKeys = new Set(prev.map((it) => `${it.itemType}-${it.itemId}`))
              const deduped = newItems.filter((it) => !existingKeys.has(`${it.itemType}-${it.itemId}`))
              return [...prev, ...deduped]
            })
          }
        />
      </div>
    </div>
  )
}
