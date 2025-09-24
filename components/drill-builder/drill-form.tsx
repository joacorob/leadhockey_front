import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from 'lucide-react'
import dynamic from "next/dynamic"
import 'react-quill/dist/quill.snow.css'

interface DrillFormProps {
  data: {
    title: string
    date: string
    coach: string
    gameplay: string
    ageGroup: string
    level: string
    players: string
    description: string
  }
  onChange: (data: any) => void
}

const ReactQuill = dynamic(()=>import('react-quill'),{ssr:false})

export function DrillForm({ data, onChange }: DrillFormProps) {
  const updateField = (field: string, value: string) => {
    onChange({ ...data, [field]: value })
  }

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

        {/* Dropdowns */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {/* Gameplay */}
          <Select value={data.gameplay} onValueChange={(v)=>updateField('gameplay',v)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="Gameplay">Gameplay</SelectItem>
              <SelectItem value="Passing">Passing</SelectItem>
              <SelectItem value="Shooting">Shooting</SelectItem>
              <SelectItem value="Defense">Defense</SelectItem>
            </SelectContent>
          </Select>

          {/* AgeGroup */}
          <Select value={data.ageGroup} onValueChange={(v)=>updateField('ageGroup',v)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="Age group">Age group</SelectItem>
              <SelectItem value="U12">Under 12</SelectItem>
              <SelectItem value="U16">Under 16</SelectItem>
              <SelectItem value="U18">Under 18</SelectItem>
              <SelectItem value="Adult">Adult</SelectItem>
            </SelectContent>
          </Select>

          {/* Level */}
          <Select value={data.level} onValueChange={(v)=>updateField('level',v)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="All levels">All levels</SelectItem>
              <SelectItem value="Beginner">Beginner</SelectItem>
              <SelectItem value="Intermediate">Intermediate</SelectItem>
              <SelectItem value="Advanced">Advanced</SelectItem>
            </SelectContent>
          </Select>

          {/* Players */}
          <Select value={data.players} onValueChange={(v)=>updateField('players',v)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="Available players">Available players</SelectItem>
              <SelectItem value="1-5">1-5 players</SelectItem>
              <SelectItem value="6-10">6-10 players</SelectItem>
              <SelectItem value="11+">11+ players</SelectItem>
            </SelectContent>
          </Select>
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
