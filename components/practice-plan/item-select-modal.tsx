"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"
import { usePaginatedApi } from "@/lib/hooks/use-api"
import { useState, useEffect, useRef } from "react"
import { PracticePlanItem } from "@/lib/types/practice-plan"

interface BackendItem {
  id: number
  title: string
  thumbnail_url: string
}

type TabKey = "drills" | "videos" | "favourites"

export function ItemSelectModal({
  open,
  onOpenChange,
  onAdd,
}: {
  open: boolean
  onOpenChange: (v: boolean) => void
  onAdd: (items: PracticePlanItem[]) => void
}) {
  const [tab, setTab] = useState<TabKey>("drills")
  const [search, setSearch] = useState("")
  const listRef = useRef<HTMLDivElement>(null)
  const endpointMap: Record<TabKey, string> = {
    drills: "/drills",
    videos: "/videos",
    favourites: "/favourites",
  }
  const { data = [], loading, pagination, nextPage } = usePaginatedApi<BackendItem>(endpointMap[tab], { q: search })

  const [selected, setSelected] = useState<Record<number, BackendItem>>({})

  useEffect(() => {
    setSelected({}) // reset when tab changes
    setSearch("")
    // scroll top
    listRef.current?.scrollTo({ top: 0 })
  }, [tab])

  const toggle = (item: BackendItem) => {
    setSelected((prev) => {
      const copy = { ...prev }
      if (copy[item.id]) delete copy[item.id]
      else copy[item.id] = item
      return copy
    })
  }

  const handleAdd = () => {
    const items: PracticePlanItem[] = Object.values(selected).map((it, idx) => ({
      id: 0,
      practicePlanId: 0,
      itemType: tab === "drills" ? "DRILL" : tab === "videos" ? "VIDEO_SESSION" : "FAVOURITE",
      itemId: it.id,
      position: 0,
      startTime: null,
      title: it.title,
      thumbnail_url: it.thumbnail_url,
    }))
    onAdd(items)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Add items to training</DialogTitle>
        </DialogHeader>
        <Tabs defaultValue="drills" value={tab} onValueChange={(v) => setTab(v as TabKey)} className="mb-4">
          <TabsList>
            <TabsTrigger value="drills">Drills</TabsTrigger>
            <TabsTrigger value="videos">Video Sessions</TabsTrigger>
            <TabsTrigger value="favourites">My favourites</TabsTrigger>
          </TabsList>
        </Tabs>
        <div className="mb-4 flex gap-2">
          <Input placeholder="Search" value={search} onChange={(e) => setSearch(e.target.value)} />
          <Button variant="secondary" onClick={() => {}}>Search</Button>
        </div>
        <div
          className="h-80 overflow-y-auto space-y-3 pr-2"
          ref={listRef}
          onScroll={(e) => {
            const el = e.currentTarget
            if (el.scrollTop + el.clientHeight >= el.scrollHeight - 50 && !loading && pagination.hasNext) {
              nextPage()
            }
          }}
        >
          {data.length === 0 && !loading ? (
            <p className="text-center text-sm text-gray-500 pt-10">No items found.</p>
          ) : (
            data.map((item) => { const thumb = (item as any).thumbnail_url || (item as any).thumbnail || "https://placehold.co/80"; return (
              <div key={item.id} className="flex items-center gap-3 border p-2 rounded">
                <img src={thumb} alt="thumb" className="w-14 h-14 object-cover rounded" />
                <div className="flex-1 text-sm">{item.title}</div>
                <Checkbox checked={!!selected[item.id]} onCheckedChange={() => toggle(item)} />
              </div>
            ); })
          )}
          {loading && <p className="text-center text-sm text-gray-400">Loading…</p>}
        </div>
        <div className="pt-4 flex justify-end gap-2">
          <Button variant="secondary" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleAdd} disabled={Object.keys(selected).length === 0}>Add to training</Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
