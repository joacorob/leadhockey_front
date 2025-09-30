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

// Step components placeholders (to be implemented in their own files later)
function MetadataStep({
  data,
  onChange,
  items,
  onAddItemsClick,
  updateItem,
}: {
  data: Partial<PracticePlan>
  onChange: (d: Partial<PracticePlan>) => void
  items: PracticePlanItem[]
  onAddItemsClick: () => void
  updateItem: (idx: number, partial: Partial<PracticePlanItem>) => void
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
          <h2 className="text-sm font-medium text-gray-700 uppercase tracking-wide">Training stages</h2>
          <Button variant="link" size="sm" onClick={onAddItemsClick}>
            + Add Stage Item
          </Button>
        </div>
        {items.length === 0 ? (
          <p className="text-gray-500 text-sm">No items added yet.</p>
        ) : (
          <ul className="space-y-2">
            {items.map((it, idx) => (
              <li key={idx} className="flex items-center gap-3 p-2 border rounded">
                <img src={it.thumbnail_url ?? "https://placehold.co/80"} alt="thumb" className="w-16 h-16 object-cover rounded" />
                <span className="text-sm flex-1">{it.title ?? `Item ${it.itemId}`}</span>
                <span className="text-xs text-gray-400 uppercase mr-2">{it.itemType}</span>
                <Input
                  type="time"
                  value={it.startTime ?? ""}
                  onChange={(e) => handleTimeChange(idx, e.target.value)}
                  className="w-24 h-8 text-xs"
                />
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

  const updateItem = (idx: number, partial: Partial<PracticePlanItem>) => {
    setItems((prev) => {
      const copy = [...prev]
      copy[idx] = { ...copy[idx], ...partial }
      return copy
    })
  }

  const handleSave = async () => {
    const payload = { ...planData, items }
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
          />
        </main>
        {/* Modal placeholder */}
        <ItemSelectModal
          open={isModalOpen}
          onOpenChange={setModalOpen}
          onAdd={(newItems) => setItems((prev) => [...prev, ...newItems])}
        />
      </div>
    </div>
  )
}
