"use client"

import { Calendar } from 'lucide-react'

export function ClubNews() {
  return (
    <div className="mb-8">
      <h2 className="text-xl font-bold text-gray-900 mb-4">CLUB NEWS</h2>
      
      <div className="bg-white rounded-lg p-6 shadow-sm">
        <h3 className="text-lg font-semibold mb-2">Welcome to the new season!</h3>
        
        <div className="flex items-center text-sm text-gray-500 mb-4">
          <Calendar className="w-4 h-4 mr-2" />
          July 5, 2025
        </div>
        
        <p className="text-gray-700 leading-relaxed">
          We have exciting updates to share with all club members. The new training schedule has been posted in the Club Sessions section. Make sure to check your assigned training times. Additionally, the annual club tournament will be held on October 15-17. Registration is now open through your profile page.
        </p>
      </div>
    </div>
  )
}
