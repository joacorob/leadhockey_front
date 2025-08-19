"use client"

import { useState } from "react"
import { Sidebar } from "@/components/layout/sidebar"
import { Header } from "@/components/layout/header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { VideoDropzone } from "@/components/ui/video-dropzone"
import { Calendar, Plus, Video, HelpCircle, Trash2 } from 'lucide-react'

interface SessionStage {
  id: string
  title: string
  subtitle: string
  videos: File[]
  questions: string[]
}

export default function BuildSessionPage() {
  const [sessionData, setSessionData] = useState({
    title: "",
    description: "",
    date: "07/08/2025",
    status: "not-published",
    year: "2025",
    week: "Week 22",
    group: "All groups",
    teams: "Teams"
  })

  const [stages, setStages] = useState<SessionStage[]>([
    {
      id: "stage-1",
      title: "",
      subtitle: "",
      videos: [],
      questions: []
    }
  ])

  const [showVideoDropzone, setShowVideoDropzone] = useState<string | null>(null)

  const updateSessionData = (field: string, value: string) => {
    setSessionData(prev => ({ ...prev, [field]: value }))
  }

  const updateStage = (stageId: string, field: string, value: string) => {
    setStages(prev => prev.map(stage => 
      stage.id === stageId ? { ...stage, [field]: value } : stage
    ))
  }

  const addStage = () => {
    const newStage: SessionStage = {
      id: `stage-${Date.now()}`,
      title: "",
      subtitle: "",
      videos: [],
      questions: []
    }
    setStages(prev => [...prev, newStage])
  }

  const removeStage = (stageId: string) => {
    if (stages.length > 1) {
      setStages(prev => prev.filter(stage => stage.id !== stageId))
    }
  }

  const addVideoToStage = (stageId: string, files: File[]) => {
    setStages(prev => prev.map(stage => 
      stage.id === stageId 
        ? { ...stage, videos: [...stage.videos, ...files] }
        : stage
    ))
    setShowVideoDropzone(null)
  }

  const addQuestionToStage = (stageId: string) => {
    const question = prompt("Enter your question:")
    if (question) {
      setStages(prev => prev.map(stage => 
        stage.id === stageId 
          ? { ...stage, questions: [...stage.questions, question] }
          : stage
      ))
    }
  }

  const saveSession = () => {
    const session = {
      ...sessionData,
      stages,
      createdAt: new Date().toISOString()
    }
    console.log("Saving session:", session)
    alert("Session saved successfully!")
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-6xl mx-auto p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
              <h1 className="text-2xl font-bold text-gray-900">BUILD A SESSION</h1>
              <Button onClick={saveSession} className="bg-green-500 hover:bg-green-600">
                Save session
              </Button>
            </div>

            <div className="space-y-8">
              {/* Session Details */}
              <div className="bg-white rounded-lg p-6">
                <h2 className="text-sm font-medium text-gray-700 mb-4 uppercase tracking-wide">
                  SESSION DETAILS
                </h2>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Session title
                    </label>
                    <Input
                      placeholder="Enter session title"
                      value={sessionData.title}
                      onChange={(e) => updateSessionData('title', e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Session description
                    </label>
                    <Textarea
                      placeholder="Enter session description"
                      value={sessionData.description}
                      onChange={(e) => updateSessionData('description', e.target.value)}
                      rows={3}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Date
                      </label>
                      <div className="relative">
                        <Input
                          value={sessionData.date}
                          onChange={(e) => updateSessionData('date', e.target.value)}
                          className="pr-10"
                        />
                        <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Status
                      </label>
                      <RadioGroup 
                        value={sessionData.status} 
                        onValueChange={(value) => updateSessionData('status', value)}
                        className="flex items-center space-x-6 mt-2"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="published" id="published" />
                          <Label htmlFor="published" className="text-sm">Published</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="not-published" id="not-published" />
                          <Label htmlFor="not-published" className="text-sm">Not published</Label>
                        </div>
                      </RadioGroup>
                    </div>
                  </div>
                </div>
              </div>

              {/* Filters */}
              <div className="bg-white rounded-lg p-6">
                <h2 className="text-sm font-medium text-gray-700 mb-4 uppercase tracking-wide">
                  FILTERS
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Year
                    </label>
                    <Select value={sessionData.year} onValueChange={(value) => updateSessionData('year', value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="2024">2024</SelectItem>
                        <SelectItem value="2025">2025</SelectItem>
                        <SelectItem value="2026">2026</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Week
                    </label>
                    <Select value={sessionData.week} onValueChange={(value) => updateSessionData('week', value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Array.from({ length: 52 }, (_, i) => (
                          <SelectItem key={i + 1} value={`Week ${i + 1}`}>
                            Week {i + 1}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Group
                    </label>
                    <Select value={sessionData.group} onValueChange={(value) => updateSessionData('group', value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="All groups">All groups</SelectItem>
                        <SelectItem value="Group A">Group A</SelectItem>
                        <SelectItem value="Group B">Group B</SelectItem>
                        <SelectItem value="Group C">Group C</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Teams
                    </label>
                    <Select value={sessionData.teams} onValueChange={(value) => updateSessionData('teams', value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Teams">Teams</SelectItem>
                        <SelectItem value="Team 1">Team 1</SelectItem>
                        <SelectItem value="Team 2">Team 2</SelectItem>
                        <SelectItem value="Team 3">Team 3</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Session Stages */}
              <div className="bg-white rounded-lg p-6">
                <h2 className="text-sm font-medium text-gray-700 mb-4 uppercase tracking-wide">
                  SESSION STAGES
                </h2>
                
                <div className="space-y-6">
                  {stages.map((stage, index) => (
                    <div key={stage.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm font-medium text-gray-700">
                          Stage {index + 1} title
                        </h3>
                        {stages.length > 1 && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeStage(stage.id)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                      
                      <div className="space-y-4">
                        <Input
                          placeholder="Enter stage title"
                          value={stage.title}
                          onChange={(e) => updateStage(stage.id, 'title', e.target.value)}
                        />

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Stage subtitle
                          </label>
                          <Input
                            placeholder="Enter stage subtitle"
                            value={stage.subtitle}
                            onChange={(e) => updateStage(stage.id, 'subtitle', e.target.value)}
                          />
                        </div>

                        {/* Videos */}
                        {stage.videos.length > 0 && (
                          <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700">
                              Videos ({stage.videos.length})
                            </label>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                              {stage.videos.map((video, videoIndex) => (
                                <div key={videoIndex} className="bg-gray-50 p-2 rounded text-sm">
                                  {video.name}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Questions */}
                        {stage.questions.length > 0 && (
                          <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700">
                              Questions ({stage.questions.length})
                            </label>
                            <div className="space-y-1">
                              {stage.questions.map((question, questionIndex) => (
                                <div key={questionIndex} className="bg-gray-50 p-2 rounded text-sm">
                                  {question}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setShowVideoDropzone(stage.id)}
                            className="bg-green-500 text-white hover:bg-green-600 border-green-500"
                          >
                            <Video className="w-4 h-4 mr-2" />
                            Add video
                          </Button>
                          
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => addQuestionToStage(stage.id)}
                          >
                            <HelpCircle className="w-4 h-4 mr-2" />
                            Add question
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-6 text-center">
                  <Button
                    onClick={addStage}
                    className="bg-blue-500 hover:bg-blue-600"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add new stage
                  </Button>
                </div>
              </div>

              {/* Bottom Actions */}
              <div className="flex justify-end gap-3 pb-6">
                <Button variant="outline">
                  Cancel
                </Button>
                <Button onClick={saveSession} className="bg-green-500 hover:bg-green-600">
                  Save session
                </Button>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Video Dropzone Modal */}
      {showVideoDropzone && (
        <VideoDropzone
          onUpload={(files) => addVideoToStage(showVideoDropzone, files)}
          onClose={() => setShowVideoDropzone(null)}
        />
      )}
    </div>
  )
}
