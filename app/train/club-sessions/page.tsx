"use client"

import { Sidebar } from "@/components/layout/sidebar"
import { Header } from "@/components/layout/header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Calendar, Clock, Users, MapPin, Target, Zap } from "lucide-react"
import { useState } from "react"

export default function ClubSessionsPage() {
  const [completedSessions, setCompletedSessions] = useState<string[]>([])
  const [completedDrills, setCompletedDrills] = useState<string[]>([])

  const plannedSessions = [
    {
      id: "session-1",
      title: "Advanced Passing Techniques",
      date: "July 15, 2025",
      time: "6:00 PM - 7:30 PM",
      location: "Field A",
      targetGroup: "Senior Team",
      participants: 18,
      objectives: ["Improve passing accuracy", "Ball control under pressure", "Quick decision making"],
      equipment: ["Cones", "Balls", "Bibs"],
      status: "planned",
    },
    {
      id: "session-2",
      title: "Defensive Positioning Workshop",
      date: "July 17, 2025",
      time: "7:00 PM - 8:30 PM",
      location: "Field B",
      targetGroup: "Youth Team",
      participants: 12,
      objectives: ["Defensive positioning", "Tackling techniques", "Communication"],
      equipment: ["Cones", "Balls", "Goals"],
      status: "planned",
    },
    {
      id: "session-3",
      title: "Penalty Corner Practice",
      date: "July 20, 2025",
      time: "5:30 PM - 7:00 PM",
      location: "Field A",
      targetGroup: "Mixed Teams",
      participants: 20,
      objectives: ["PC execution", "PC defense", "Goalkeeper positioning"],
      equipment: ["Balls", "Goals", "Protective gear"],
      status: "planned",
    },
  ]

  const plannedDrills = [
    {
      id: "drill-1",
      title: "3v2 Attacking Drill",
      category: "Attack",
      duration: "15 min",
      difficulty: "Intermediate",
      objectives: ["Quick passing", "Creating space", "Finishing"],
      equipment: ["6 cones", "4 balls", "2 goals"],
      description:
        "Players work in groups of 5, focusing on quick passing and movement to create scoring opportunities",
    },
    {
      id: "drill-2",
      title: "Defensive Press Exercise",
      category: "Defense",
      duration: "20 min",
      difficulty: "Advanced",
      objectives: ["Coordinated pressing", "Ball recovery", "Transition"],
      equipment: ["8 cones", "3 balls", "Bibs"],
      description: "Team practices coordinated defensive pressing and quick transition to attack",
    },
    {
      id: "drill-3",
      title: "Ball Control Circuit",
      category: "Skills",
      duration: "12 min",
      difficulty: "Beginner",
      objectives: ["First touch", "Ball control", "Confidence"],
      equipment: ["12 cones", "8 balls"],
      description: "Individual skill development focusing on first touch and ball control under pressure",
    },
    {
      id: "drill-4",
      title: "Penalty Corner Routine",
      category: "Set Pieces",
      duration: "25 min",
      difficulty: "Advanced",
      objectives: ["PC execution", "Timing", "Variations"],
      equipment: ["Balls", "Goals", "Cones"],
      description: "Practice different penalty corner routines and defensive setups",
    },
  ]

  const handleSessionComplete = (sessionId: string) => {
    setCompletedSessions((prev) =>
      prev.includes(sessionId) ? prev.filter((id) => id !== sessionId) : [...prev, sessionId],
    )
  }

  const handleDrillComplete = (drillId: string) => {
    setCompletedDrills((prev) => (prev.includes(drillId) ? prev.filter((id) => id !== drillId) : [...prev, drillId]))
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />

      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />

        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-7xl mx-auto space-y-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Club Sessions & Drills</h1>
              <p className="text-gray-600">Manage training sessions and drill execution for your teams</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card className="border-0 shadow-lg">
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-blue-600">{plannedSessions.length}</div>
                  <p className="text-sm text-gray-600">Planned Sessions</p>
                </CardContent>
              </Card>
              <Card className="border-0 shadow-lg">
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-green-600">{completedSessions.length}</div>
                  <p className="text-sm text-gray-600">Completed Sessions</p>
                </CardContent>
              </Card>
              <Card className="border-0 shadow-lg">
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-purple-600">{plannedDrills.length}</div>
                  <p className="text-sm text-gray-600">Available Drills</p>
                </CardContent>
              </Card>
              <Card className="border-0 shadow-lg">
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-orange-600">{completedDrills.length}</div>
                  <p className="text-sm text-gray-600">Completed Drills</p>
                </CardContent>
              </Card>
            </div>

            <div>
              <h3 className="text-lg font-medium text-gray-800 mb-3 flex items-center gap-2">
                <Target className="w-5 h-5 text-blue-600" />
                Planned Training Sessions
              </h3>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {plannedSessions.map((session) => (
                  <Card key={session.id} className="border-0 shadow-lg">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3">
                          <Checkbox
                            checked={completedSessions.includes(session.id)}
                            onCheckedChange={() => handleSessionComplete(session.id)}
                            className="mt-1"
                          />
                          <div>
                            <CardTitle className="text-base">{session.title}</CardTitle>
                            <p className="text-sm text-gray-600 mt-1">{session.targetGroup}</p>
                          </div>
                        </div>
                        <Badge variant={completedSessions.includes(session.id) ? "default" : "secondary"}>
                          {completedSessions.includes(session.id) ? "Completed" : "Planned"}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-gray-500" />
                          {session.date}
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3 text-gray-500" />
                          {session.time}
                        </div>
                        <div className="flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-gray-500" />
                          {session.location}
                        </div>
                        <div className="flex items-center gap-1">
                          <Users className="w-3 h-3 text-gray-500" />
                          {session.participants} players
                        </div>
                      </div>

                      <div>
                        <p className="text-xs font-medium text-gray-700 mb-1">Objectives:</p>
                        <div className="flex flex-wrap gap-1">
                          {session.objectives.map((objective, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {objective}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      <div>
                        <p className="text-xs font-medium text-gray-700 mb-1">Equipment:</p>
                        <p className="text-xs text-gray-600">{session.equipment.join(", ")}</p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-lg font-medium text-gray-800 mb-3 flex items-center gap-2">
                <Zap className="w-5 h-5 text-green-600" />
                Training Drills
              </h3>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {plannedDrills.map((drill) => (
                  <Card key={drill.id} className="border-0 shadow-lg">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3">
                          <Checkbox
                            checked={completedDrills.includes(drill.id)}
                            onCheckedChange={() => handleDrillComplete(drill.id)}
                            className="mt-1"
                          />
                          <div>
                            <CardTitle className="text-base">{drill.title}</CardTitle>
                            <p className="text-sm text-gray-600 mt-1">{drill.description}</p>
                          </div>
                        </div>
                        <div className="flex flex-col gap-1">
                          <Badge variant="outline" className="text-xs">
                            {drill.category}
                          </Badge>
                          <Badge
                            variant={completedDrills.includes(drill.id) ? "default" : "secondary"}
                            className="text-xs"
                          >
                            {completedDrills.includes(drill.id) ? "Done" : "Todo"}
                          </Badge>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3 text-gray-500" />
                          {drill.duration}
                        </div>
                        <div className="flex items-center gap-1">
                          <Target className="w-3 h-3 text-gray-500" />
                          {drill.difficulty}
                        </div>
                      </div>

                      <div>
                        <p className="text-xs font-medium text-gray-700 mb-1">Objectives:</p>
                        <div className="flex flex-wrap gap-1">
                          {drill.objectives.map((objective, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {objective}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      <div>
                        <p className="text-xs font-medium text-gray-700 mb-1">Equipment:</p>
                        <p className="text-xs text-gray-600">{drill.equipment.join(", ")}</p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
