"use client"
import { usePaginatedApi } from "@/lib/hooks/use-api"
import { SearchInput } from "@/components/ui/search-input"
import { Pagination } from "@/components/ui/pagination"
import { DrillThumbnail } from "@/components/drill-builder/drill-thumbnail"
import Link from "next/link"
import { useState } from "react"
import { Sidebar } from "@/components/layout/sidebar"
import { Header } from "@/components/layout/header"

interface Drill {
  id:number;
  title:string;
  frames:any[]
  thumbnail_url?:string; // URL or base64 string
}

export default function DrillsIndex(){
  const [search,setSearch]=useState("")
  const {
    data: drills,
    pagination,
    loading,
    error,
    updateParams,
    goToPage,
    nextPage,
    prevPage
  } = usePaginatedApi<Drill>("/drills", { search })

  const handleSearch=(q:string)=>{
    setSearch(q)
    updateParams({search:q})
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Header />
        <main className="flex-1 p-6 overflow-auto">
          <h1 className="text-3xl font-bold mb-6">Drills</h1>
          <div className="mb-6 max-w-md">
            <SearchInput placeholder="Search drills..." onSearch={handleSearch} />
          </div>
          {error && <p className="text-red-500">{error}</p>}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {loading ? (
              Array.from({length:8}).map((_,i)=>(<div key={i} className="h-44 bg-gray-200 animate-pulse rounded"/>))
            ) : (
              (Array.isArray(drills)?drills:[]).map(d=> (
                <Link key={d.id} href={`/drills/${d.id}`} className="border rounded-lg p-3 hover:shadow transition">
                  {d.thumbnail_url ? (
                    <img
                      src={d.thumbnail_url.startsWith('http')?d.thumbnail_url:`data:image/png;base64,${d.thumbnail_url}`}
                      alt={d.title}
                      className="w-full h-44 object-cover rounded"
                    />
                  ) : (
                    <div className="flex items-center justify-center w-full h-44 rounded" style={{backgroundColor:'#1e3a8a'}}>
                      <img src="https://uploadthingy.s3.us-west-1.amazonaws.com/nzVf7cqEycpaU4k9WPUBYZ/LEAD_logo.png" alt="LEAD" className="w-24 h-24 object-contain" />
                    </div>
                  )}
                  <h2 className="mt-2 font-semibold truncate">{d.title}</h2>
                </Link>
              ))
            )}
          </div>

          {!loading && drills.length===0 && <p className="text-gray-500 mt-12 text-center">No drills found</p>}

          {/* Pagination */}
          {!loading && (!pagination || pagination.totalPages>1) && (
            <div className="mt-8">
              {/* eslint-disable-next-line @typescript-eslint/ban-ts-comment */}
              {/* @ts-ignore */}
              <Pagination
                currentPage={pagination?.page || 1}
                totalPages={pagination?.totalPages || 1}
                hasNext={pagination?.hasNext || false}
                hasPrev={pagination?.hasPrev || false}
                onPageChange={goToPage}
                onNext={nextPage}
                onPrev={prevPage}
              />
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
