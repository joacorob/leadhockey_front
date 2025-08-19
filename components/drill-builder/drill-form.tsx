import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from 'lucide-react'

interface DrillFormProps {
  data: {
    title: string
    date: string
    coach: string
    gameplay: string
    ageGroup: string
    level: string
    players: string
  }
  onChange: (data: any) => void
}

export function DrillForm({ data, onChange }: DrillFormProps) {
  const updateField = (field: string, value: string) => {
    onChange({ ...data, [field]: value })
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      {/* Session Title */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Session Title
        </label>
        <Input
          value={data.title}
          onChange={(e) => updateField('title', e.target.value)}
          className="w-full"
        />
      </div>

      {/* Date */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Date
        </label>
        <div className="relative">
          <Input
            value={data.date}
            onChange={(e) => updateField('date', e.target.value)}
            className="w-full pr-10"
          />
          <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
        </div>
      </div>

      {/* Coach Name */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Coach Name
        </label>
        <Input
          value={data.coach}
          onChange={(e) => updateField('coach', e.target.value)}
          className="w-full"
        />
      </div>

      {/* Dropdowns Row */}
      <div className="md:col-span-3 grid grid-cols-2 md:grid-cols-4 gap-4">
        <Select value={data.gameplay} onValueChange={(value) => updateField('gameplay', value)}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Gameplay">Gameplay</SelectItem>
            <SelectItem value="Passing">Passing</SelectItem>
            <SelectItem value="Shooting">Shooting</SelectItem>
            <SelectItem value="Defense">Defense</SelectItem>
          </SelectContent>
        </Select>

        <Select value={data.ageGroup} onValueChange={(value) => updateField('ageGroup', value)}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Age group">Age group</SelectItem>
            <SelectItem value="U12">Under 12</SelectItem>
            <SelectItem value="U16">Under 16</SelectItem>
            <SelectItem value="U18">Under 18</SelectItem>
            <SelectItem value="Adult">Adult</SelectItem>
          </SelectContent>
        </Select>

        <Select value={data.level} onValueChange={(value) => updateField('level', value)}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="All levels">All levels</SelectItem>
            <SelectItem value="Beginner">Beginner</SelectItem>
            <SelectItem value="Intermediate">Intermediate</SelectItem>
            <SelectItem value="Advanced">Advanced</SelectItem>
          </SelectContent>
        </Select>

        <Select value={data.players} onValueChange={(value) => updateField('players', value)}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Available players">Available players</SelectItem>
            <SelectItem value="1-5">1-5 players</SelectItem>
            <SelectItem value="6-10">6-10 players</SelectItem>
            <SelectItem value="11+">11+ players</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}
