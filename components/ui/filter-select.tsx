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
    <Select value={value} onValueChange={onValueChange}>
      <SelectTrigger className={className}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="">All {placeholder}</SelectItem>
        {options.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
