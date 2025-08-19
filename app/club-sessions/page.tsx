"use client"

import { Sidebar } from "@/components/layout/sidebar"
import { Header } from "@/components/layout/header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar, Clock, Users, MapPin, Play } from 'lucide-react'

export default function ClubSessionsPage() {
  const upcomingSessions = [
    {
      id: "session-1",
      title: "Advanced Passing Techniques",
      date: "July 10, 2025",
      time: "6:00 PM - 7:30 PM",
      location: "Field A",
      coach: "Coach Williams",
      participants: 12,
      maxParticipants: 15,
      status: "confirmed",
      description: "Focus on precision passing and ball control under pressure"
    },
    {
      id: "session-2", 
      title: "Defensive Positioning Workshop",
      date: "July 12, 2025",
      time: "7:00 PM - 8:30 PM",
      location: "Field B",
      coach: "Arthur De Sloover",
      participants: 8,
      maxParticipants: 12,
      status: "open",
      description: "Learn advanced defensive positioning and tackling techniques"
    }
  ]

  const pastSessions = [
    {
      id: "past-1",
      title: "Penalty Corner Masterclass",
      date: "July 5, 2025",
      time: "6:00 PM - 7:30 PM",
      location: "Field A",
      coach: "Alexander Hendrickx",
      participants: 15,
      status: "completed",
      recording: true
    },
    {
      id: "past-2",
      title: "Goalkeeping Fundamentals",
      date: "July 3, 2025", 
      time: "7:00 PM - 8:30 PM",
      location: "Field C",
      coach: "Vincent Vanasch",
      participants: 6,
      status: "completed",
      recording: true
    }
  ]

  const handleJoinSession = (sessionId: string) => {
    console.log("Joining session:", sessionId)
  }

  const handleWatchRecording = (sessionId: string) => {
    console.log("Watching recording:", sessionId)
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-6xl mx-auto space-y-6">
            {/* Page Header */}
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Club Sessions</h1>
              <p className="text-gray-600">Join live training sessions with professional coaches</p>
            </div>

            {/* Upcoming Sessions */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Upcoming Sessions</h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {upcomingSessions.map((session) => (
                  <Card key={session.id} className="border-0 shadow-lg">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-lg">{session.title}</CardTitle>
                          <p className="text-sm text-gray-600 mt-1">{session.description}</p>
                        </div>
                        <Badge variant={session.status === 'confirmed' ? 'default' : 'secondary'}>
                          {session.status}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-gray-500" />
                          {session.date}
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-gray-500" />
                          {session.time}
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-gray-500" />
                          {session.location}
                        </div>
                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4 text-gray-500" />
                          {session.participants}/{session.maxParticipants} players
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between pt-2 border-t">
                        <div>
                          <p className="text-sm font-medium">Coach: {session.coach}</p>
                        </div>
                        <Button 
                          onClick={() => handleJoinSession(session.id)}
                          disabled={session.participants >= session.maxParticipants}
                        >
                          {session.participants >= session.maxParticipants ? 'Full' : 'Join Session'}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Past Sessions */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Past Sessions</h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {pastSessions.map((session) => (
                  <Card key={session.id} className="border-0 shadow-lg">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <CardTitle className="text-lg">{session.title}</CardTitle>
                        <Badge variant="outline">Completed</Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-gray-500" />
                          {session.date}
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-gray-500" />
                          {session.time}
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-gray-500" />
                          {session.location}
                        </div>
                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4 text-gray-500" />
                          {session.participants} players
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between pt-2 border-t">
                        <div>
                          <p className="text-sm font-medium">Coach: {session.coach}</p>
                        </div>
                        {session.recording && (
                          <Button 
                            variant="outline"
                            onClick={() => handleWatchRecording(session.id)}
                            className="flex items-center gap-2"
                          >
                            <Play className="w-4 h-4" />
                            Watch Recording
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Session Guidelines */}
            <Card>
              <CardHeader>
                <CardTitle>Session Guidelines</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <ul className="text-sm space-y-1 text-gray-600">
                  <li>• Please arrive 10 minutes before the session starts</li>
                  <li>• Bring your own equipment (stick, shin guards, mouthguard)</li>
                  <li>• Sessions may be recorded for educational purposes</li>
                  <li>• Cancellations must be made at least 2 hours in advance</li>
                  <li>• Contact your coach if you have any questions</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  )
}
