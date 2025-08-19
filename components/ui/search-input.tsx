"use client"

import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Search, X } from 'lucide-react'
import { Button } from "@/components/ui/button"

interface SearchInputProps {
  placeholder?: string
  onSearch: (query: string) => void
  debounceMs?: number
  className?: string
}

export function SearchInput({ 
  placeholder = "Search...", 
  onSearch, 
  debounceMs = 300,
  className 
}: SearchInputProps) {
  const [query, setQuery] = useState("")

  useEffect(() => {
    const timer = setTimeout(() => {
      onSearch(query)
    }, debounceMs)

    return () => clearTimeout(timer)
  }, [query, onSearch, debounceMs])

  const clearSearch = () => {
    setQuery("")
    onSearch("")
  }

  return (
    <div className={`relative ${className}`}>
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
      <Input
        type="text"
        placeholder={placeholder}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="pl-10 pr-10"
      />
      {query && (
        <Button
          variant="ghost"
          size="sm"
          onClick={clearSearch}
          className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
        >
          <X className="w-4 h-4 text-gray-400" />
        </Button>
      )}
    </div>
  )
}
