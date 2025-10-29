import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Calendar } from 'lucide-react'
import dynamic from "next/dynamic"
import 'react-quill/dist/quill.snow.css'
import { useMemo, useState, useEffect, useRef } from "react"
import { useApi } from "@/lib/hooks/use-api"
import type { Filter } from "@/lib/types/api"

interface DrillFormProps {
  data: {
    title: string
    date: string
    coach: string
    // Deprecated legacy fields kept for backward-compat state shape
    gameplay: string
    ageGroup: string
    level: string
    players: string
    // New dynamic filters payload
    filterOptionIds?: Array<number | string>
    description: string
  }
  onChange: (data: any) => void
}

const ReactQuill = dynamic(()=>import('react-quill'),{ssr:false})

export function DrillForm({ data, onChange }: DrillFormProps) {
  const updateField = (field: string, value: string) => {
    onChange({ ...data, [field]: value })
  }

  // Load dynamic filters by default drill category (same logic as watch)
  const DEFAULT_DRILL_CATEGORY_ID = process.env.NEXT_PUBLIC_DEFAULT_DRILL_CATEGORY_ID || "2"
  const { data: filtersResponse, loading: filtersLoading, error: filtersError } = useApi<{ success: boolean; data: any }>(
    "/filters",
    { categoryId: DEFAULT_DRILL_CATEGORY_ID },
  )

  const filters: Filter[] = useMemo(() => {
    if (!filtersResponse) return []
    const list = Array.isArray((filtersResponse as any).data?.data)
      ? (filtersResponse as any).data.data
      : Array.isArray((filtersResponse as any).data)
      ? (filtersResponse as any).data
      : []
    return list as Filter[]
  }, [filtersResponse])

  // Track selections per filter.code; store option ids to align with backend expectation
  const [activeSelections, setActiveSelections] = useState<Record<string, string | string[] | number | null>>({})

  // Whenever active selections change, compute filterOptionIds and propagate to parent state
  useEffect(() => {
    if (filters.length === 0) return
    
    const optionIds: Array<number | string> = []
    filters.forEach((f) => {
      const val = activeSelections[f.code]
      if (val === undefined || val === null || val === "") return
      if (f.ui_type === "checkbox") {
        if (Array.isArray(val)) {
          val.forEach((id) => optionIds.push(id))
        }
      } else if (f.ui_type === "select") {
        optionIds.push(val as any)
      } else if (f.ui_type === "number") {
        // number inputs typically don't map to predefined option IDs; skip adding to filterOptionIds
      }
    })
    
    // Only update if the filterOptionIds have actually changed
    const currentIds = data.filterOptionIds || []
    const idsAsStrings = optionIds.map(String).sort()
    const currentAsStrings = currentIds.map(String).sort()
    const hasChanged = idsAsStrings.length !== currentAsStrings.length || 
                       idsAsStrings.some((id, idx) => id !== currentAsStrings[idx])
    
    if (hasChanged) {
      console.log('[DrillForm] Updating filterOptionIds:', optionIds)
      onChange({ ...data, filterOptionIds: optionIds })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeSelections, filters.length])

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6 items-start">
      {/* Left side – details */}
      <div className="space-y-4">
        {/* Session Title */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Session Title</label>
          <Input value={data.title} onChange={(e)=>updateField('title',e.target.value)} />
        </div>

        {/* Date & Coach (two columns on md) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
            <div className="relative">
              <Input value={data.date} onChange={(e)=>updateField('date',e.target.value)} className="pr-10" />
              <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Coach Name</label>
            <Input value={data.coach} onChange={(e)=>updateField('coach',e.target.value)} />
          </div>
        </div>

        {/* Dynamic Filters (always visible) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtersLoading && (
            <div className="col-span-full text-sm text-gray-500">Loading filters…</div>
          )}
          {filtersError && (
            <div className="col-span-full text-sm text-red-600">Failed to load filters</div>
          )}
          {!filtersLoading && !filtersError && filters.map((filter) => (
            <div key={filter.id} className="flex flex-col">
              <label className="block text-sm font-medium text-gray-700 mb-1">{filter.label}</label>
              {filter.ui_type === "select" && (
                <Select
                  value={(activeSelections[filter.code] as string) || ""}
                  onValueChange={(val) =>
                    setActiveSelections((prev) => ({ ...prev, [filter.code]: val }))
                  }
                >
                  <SelectTrigger><SelectValue placeholder={`Select ${filter.label}`} /></SelectTrigger>
                  <SelectContent>
                    {filter.options.map((opt) => (
                      <SelectItem key={opt.id} value={String(opt.id)}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}

              {filter.ui_type === "checkbox" && (
                <div className="flex flex-wrap gap-2">
                  {filter.options.map((opt) => {
                    const current = activeSelections[filter.code]
                    const checked = Array.isArray(current) && (current as any[]).includes(String(opt.id))
                    return (
                      <label key={opt.id} className="flex items-center gap-1 text-sm">
                        <Checkbox
                          checked={checked}
                          onCheckedChange={(c) =>
                            setActiveSelections((prev) => {
                              const raw = Array.isArray(prev[filter.code]) ? ([...prev[filter.code] as any[]]) : []
                              if (c) {
                                if (!raw.includes(String(opt.id))) raw.push(String(opt.id))
                              } else {
                                const idx = raw.indexOf(String(opt.id))
                                if (idx >= 0) raw.splice(idx, 1)
                              }
                              return { ...prev, [filter.code]: raw }
                            })
                          }
                        />
                        {opt.label}
                      </label>
                    )
                  })}
                </div>
              )}

              {filter.ui_type === "number" && (
                <Input
                  type="number"
                  value={(activeSelections[filter.code] as number | string | undefined) ?? ""}
                  onChange={(e) =>
                    setActiveSelections((prev) => ({ ...prev, [filter.code]: Number(e.target.value) }))
                  }
                />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Right side – description */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
        <ReactQuill value={data.description} onChange={(val)=>updateField('description',val)} theme="snow" className="bg-white" />
      </div>
    </div>
  )
}
