"use client"

import { Sidebar } from "@/components/layout/sidebar"
import { Header } from "@/components/layout/header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Target, Calendar, Users, Play, BookOpen, Award } from "lucide-react"
import Link from "next/link"

export default function MyTrainPage() {
  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />

      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />

        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-7xl mx-auto space-y-6">
            {/* Page Header */}
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">My Training</h1>
              <p className="text-gray-600">Track your progress and manage your training activities</p>
            </div>

            {/* Training Overview */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card className="border-0 shadow-lg">
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-blue-600">32</div>
                  <p className="text-sm text-gray-600">Sessions Completed</p>
                </CardContent>
              </Card>
              <Card className="border-0 shadow-lg">
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-green-600">6</div>
                  <p className="text-sm text-gray-600">Upcoming Sessions</p>
                </CardContent>
              </Card>
              <Card className="border-0 shadow-lg">
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-purple-600">24</div>
                  <p className="text-sm text-gray-600">Hours Trained</p>
                </CardContent>
              </Card>
              <Card className="border-0 shadow-lg">
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-orange-600">92%</div>
                  <p className="text-sm text-gray-600">Skill Progress</p>
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions */}
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle>Training Activities</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Link href="/my/drills">
                    <Button
                      className="h-auto p-6 flex flex-col items-center gap-3 bg-transparent w-full"
                      variant="outline"
                    >
                      <Target className="w-8 h-8 text-blue-600" />
                      <div className="text-center">
                        <span className="font-medium">My Drills</span>
                        <p className="text-xs text-gray-600 mt-1">Practice individual skills</p>
                      </div>
                    </Button>
                  </Link>
                  <Link href="/my/trainings">
                    <Button
                      className="h-auto p-6 flex flex-col items-center gap-3 bg-transparent w-full"
                      variant="outline"
                    >
                      <Calendar className="w-8 h-8 text-green-600" />
                      <div className="text-center">
                        <span className="font-medium">My Trainings</span>
                        <p className="text-xs text-gray-600 mt-1">Personal training sessions</p>
                      </div>
                    </Button>
                  </Link>
                  <Link href="/train/club-sessions">
                    <Button
                      className="h-auto p-6 flex flex-col items-center gap-3 bg-transparent w-full"
                      variant="outline"
                    >
                      <Users className="w-8 h-8 text-purple-600" />
                      <div className="text-center">
                        <span className="font-medium">Club Sessions</span>
                        <p className="text-xs text-gray-600 mt-1">Join club training</p>
                      </div>
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                    <Play className="w-5 h-5 text-blue-600" />
                    <div className="flex-1">
                      <p className="font-medium text-sm">Completed Ball Control Fundamentals</p>
                      <p className="text-xs text-gray-600">2 hours ago</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                    <BookOpen className="w-5 h-5 text-green-600" />
                    <div className="flex-1">
                      <p className="font-medium text-sm">Created new drill: Quick Passes</p>
                      <p className="text-xs text-gray-600">1 day ago</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg">
                    <Award className="w-5 h-5 text-purple-600" />
                    <div className="flex-1">
                      <p className="font-medium text-sm">Achieved 90% accuracy in passing drills</p>
                      <p className="text-xs text-gray-600">3 days ago</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  )
}
