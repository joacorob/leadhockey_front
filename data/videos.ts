export interface Video {
  id: string
  title: string
  duration: string
  thumbnail: string
  coach: string
  category: string
  tags: string[]
  description: string
  isEliminating?: boolean
}

export const continueWatchingVideos: Video[] = [
  {
    id: "1",
    title: "Pull Back",
    duration: "01:04",
    thumbnail: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-PQij6hNhBewQsqnRBElPBKa2TRrHgC.png",
    coach: "Arthur Van Doren",
    category: "Ball Control",
    tags: ["eliminating", "basic"],
    description: "Master the pull back technique for better ball control",
    isEliminating: true
  },
  {
    id: "2",
    title: "Right Foot High Ball",
    duration: "00:58",
    thumbnail: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-PQij6hNhBewQsqnRBElPBKa2TRrHgC.png",
    coach: "Arthur Van Doren",
    category: "Ball Control",
    tags: ["high ball", "right foot"],
    description: "Technique for controlling high balls with your right foot"
  },
  {
    id: "3",
    title: "Left Foot BH Pass",
    duration: "00:46",
    thumbnail: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-PQij6hNhBewQsqnRBElPBKa2TRrHgC.png",
    coach: "Arthur Van Doren",
    category: "Passing",
    tags: ["backhand", "left foot"],
    description: "Backhand passing technique with left foot positioning"
  },
  {
    id: "4",
    title: "Jab Tackle",
    duration: "01:22",
    thumbnail: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-PQij6hNhBewQsqnRBElPBKa2TRrHgC.png",
    coach: "Arthur De Sloover",
    category: "Defense",
    tags: ["tackle", "defense"],
    description: "Effective jab tackle technique for defensive play"
  },
  {
    id: "5",
    title: "Right-Left Acceleration",
    duration: "00:55",
    thumbnail: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-PQij6hNhBewQsqnRBElPBKa2TRrHgC.png",
    coach: "Tiago de Sousa",
    category: "Movement",
    tags: ["acceleration", "agility"],
    description: "Improve your acceleration with right-left movement patterns"
  }
]

export const clubSessions: Video[] = [
  {
    id: "6",
    title: "Team Passing Drill",
    duration: "15:30",
    thumbnail: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-PQij6hNhBewQsqnRBElPBKa2TRrHgC.png",
    coach: "Club Coach",
    category: "Team Training",
    tags: ["team", "passing", "drill"],
    description: "Complete team passing drill session"
  },
  {
    id: "7",
    title: "Defensive Positioning",
    duration: "12:45",
    thumbnail: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-PQij6hNhBewQsqnRBElPBKa2TRrHgC.png",
    coach: "Club Coach",
    category: "Defense",
    tags: ["defense", "positioning", "team"],
    description: "Learn proper defensive positioning in team play"
  }
]

export const allVideos: Video[] = [
  ...continueWatchingVideos,
  ...clubSessions,
  {
    id: "8",
    title: "Advanced Dribbling",
    duration: "03:20",
    thumbnail: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-PQij6hNhBewQsqnRBElPBKa2TRrHgC.png",
    coach: "Pro Coach",
    category: "Ball Control",
    tags: ["dribbling", "advanced"],
    description: "Advanced dribbling techniques for elite players"
  },
  {
    id: "9",
    title: "Penalty Corner Setup",
    duration: "05:15",
    thumbnail: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-PQij6hNhBewQsqnRBElPBKa2TRrHgC.png",
    coach: "Specialist Coach",
    category: "Set Pieces",
    tags: ["penalty corner", "setup"],
    description: "Master penalty corner setup and execution"
  }
]
