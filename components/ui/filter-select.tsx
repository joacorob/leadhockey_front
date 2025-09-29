"use client"

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface FilterOption {
  value: string
  label: string
}

interface FilterSelectProps {
  placeholder: string
  options: FilterOption[]
  value?: string
  onValueChange: (value: string) => void
  className?: string
}

export function FilterSelect({ 
  placeholder, 
  options, 
  value, 
  onValueChange,
  className 
}: FilterSelectProps) {
  return (
    <Select value={value || 'all'} onValueChange={(val) => onValueChange(val === 'all' ? '' : val)}>
      <SelectTrigger className={className}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {/* The "All" option uses value="all" because Radix Select forbids empty string values. */}
        <SelectItem value="all">All {placeholder}</SelectItem>
        {options.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
