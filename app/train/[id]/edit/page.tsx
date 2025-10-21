"use client"

import { useState, useEffect } from "react"
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
import { useParams, useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"

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
              currentImage={(data as any).thumbnail || (data as any).thumbnailUrl}
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

export default function EditTrainingPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const { toast } = useToast()
  
  const [isLoading, setIsLoading] = useState(true)
  const [planData, setPlanData] = useState<Partial<PracticePlan>>({ status: "draft" })
  const [items, setItems] = useState<PracticePlanItem[]>([])
  const [isModalOpen, setModalOpen] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  // Load existing practice plan on mount
  useEffect(() => {
    async function loadPlan() {
      try {
        setIsLoading(true)
        const res = await fetch(`/api/practice-plans/${id}`)
        const response = await res.json()
        
        if (!res.ok) {
          throw new Error(response.error || response.message || "Failed to load training plan")
        }

        const rawPlan = response.data || response
        
        // Map backend data to form
        setPlanData({
          title: rawPlan.title,
          description: rawPlan.description,
          status: rawPlan.status || "draft",
          thumbnailUrl: rawPlan.thumbnailUrl, // Store existing URL
        } as any)

        // Map items (backend returns enriched items with element data)
        const mappedItems: PracticePlanItem[] = (rawPlan.items || []).map((it: any) => ({
          id: it.id,
          practicePlanId: it.practicePlanId,
          itemType: it.itemType,
          itemId: it.itemId,
          position: it.position,
          startTime: it.startTime,
          title: it.title || it.element?.title,
          thumbnail_url: it.thumbnail_url || it.element?.thumbnail || it.element?.thumbnailUrl,
        }))
        
        setItems(mappedItems)
      } catch (e: any) {
        toast({
          title: "Error",
          description: e.message,
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    loadPlan()
  }, [id, toast])

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
    setIsSaving(true)
    try {
      // Build payload according to doc
      const payload: any = { 
        title: planData.title,
        description: planData.description,
        status: planData.status || "draft",
        items: items.map((it, idx) => ({
          itemType: it.itemType,
          itemId: it.itemId,
          startTime: it.startTime || null,
          // position is auto-assigned by backend per doc
        }))
      }
      
      // Handle thumbnail per doc:
      // - undefined: don't touch
      // - null: delete
      // - base64: upload
      // - URL: use directly
      if ((planData as any).thumbnail !== undefined) {
        payload.thumbnail = (planData as any).thumbnail
      }
      
      const res = await fetch(`/api/practice-plans/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
      
      const data = await res.json()
      
      if (!res.ok) {
        throw new Error(data.error || "Failed to update training plan")
      }
      
      toast({ title: "Training plan updated successfully" })
      router.push(`/train/${id}`)
    } catch (e: any) {
      toast({
        title: "Error",
        description: e.message,
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex h-screen bg-gray-50">
        <Sidebar />
        <div className="flex-1 flex flex-col">
          <Header />
          <main className="flex-1 flex items-center justify-center">
            <div className="flex flex-col items-center gap-4 text-gray-600">
              <svg className="w-8 h-8 animate-spin" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
              </svg>
              <span>Loading training plan…</span>
            </div>
          </main>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Header />
        <main className="flex-1 overflow-y-auto p-6">
          <div className="flex justify-between mb-4">
            <h1 className="text-2xl font-bold">EDIT TRAINING</h1>
            <Button 
              onClick={handleSave} 
              className="bg-green-600 text-white"
              disabled={isSaving}
            >
              {isSaving ? (
                <span className="flex items-center gap-2">
                  <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                  </svg>
                  Saving changes…
                </span>
              ) : (
                "Save changes"
              )}
            </Button>
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

