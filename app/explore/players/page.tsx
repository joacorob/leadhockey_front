"use client"

import { Sidebar } from "@/components/layout/sidebar"
import { Header } from "@/components/layout/header"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Image from "next/image"
import { User, Video, Trophy } from 'lucide-react'

export default function PlayersPage() {
  const players = [
    {
      id: "1",
      name: "Arthur Van Doren",
      role: "Defender",
      country: "Belgium",
      avatar: "/hockey-coach-headshot.png",
      videos: 15,
      achievements: ["Olympic Gold", "World Cup Winner"],
      specialties: ["Defense", "Ball Control", "Passing"]
    },
    {
      id: "2", 
      name: "Alexander Hendrickx",
      role: "Forward",
      country: "Belgium",
      avatar: "/hockey-player-headshot.png",
      videos: 12,
      achievements: ["Olympic Gold", "Top Scorer"],
      specialties: ["Penalty Corners", "Shooting", "Set Pieces"]
    },
    {
      id: "3",
      name: "Eva De Goede",
      role: "Midfielder",
      country: "Netherlands", 
      avatar: "/female-hockey-player-headshot.png",
      videos: 18,
      achievements: ["Olympic Champion", "World Player"],
      specialties: ["Midfield Play", "Ball Control", "Leadership"]
    },
    {
      id: "4",
      name: "Vincent Vanasch",
      role: "Goalkeeper",
      country: "Belgium",
      avatar: "/hockey-coach-headshot.png", 
      videos: 8,
      achievements: ["Olympic Gold", "Best Goalkeeper"],
      specialties: ["Goalkeeping", "Saves", "Distribution"]
    }
  ]

  const handlePlayerClick = (playerId: string) => {
    console.log("Viewing player:", playerId)
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-7xl mx-auto">
            <h1 className="text-2xl font-bold text-gray-900 mb-6">PLAYERS & COACHES</h1>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {players.map((player) => (
                <Card 
                  key={player.id} 
                  className="border-0 shadow-lg hover:shadow-xl transition-shadow cursor-pointer"
                  onClick={() => handlePlayerClick(player.id)}
                >
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-4 mb-4">
                      <Image
                        src={player.avatar || "/placeholder.svg"}
                        alt={player.name}
                        width={60}
                        height={60}
                        className="rounded-full object-cover"
                      />
                      <div>
                        <h3 className="font-semibold text-lg">{player.name}</h3>
                        <p className="text-sm text-gray-600">{player.role} • {player.country}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4 mb-4 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <Video className="w-4 h-4" />
                        {player.videos} videos
                      </div>
                      <div className="flex items-center gap-1">
                        <Trophy className="w-4 h-4" />
                        {player.achievements.length} titles
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <div>
                        <p className="text-xs font-medium text-gray-700 mb-2">ACHIEVEMENTS</p>
                        <div className="flex flex-wrap gap-1">
                          {player.achievements.map((achievement, index) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              {achievement}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      
                      <div>
                        <p className="text-xs font-medium text-gray-700 mb-2">SPECIALTIES</p>
                        <div className="flex flex-wrap gap-1">
                          {player.specialties.map((specialty, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {specialty}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
