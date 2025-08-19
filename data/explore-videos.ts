export interface ExploreVideo {
  id: string
  title: string
  duration: string
  thumbnail: string
  coach: string
  category: string
  tags: string[]
  description: string
  uploadDate: string
}

export const exploreVideos: ExploreVideo[] = [
  {
    id: "explore-1",
    title: "Tomahawk Shot",
    duration: "01:18",
    thumbnail: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-PQij6hNhBewQsqnRBElPBKa2TRrHgC.png",
    coach: "Arthur Van Doren",
    category: "Shooting",
    tags: ["tomahawk", "shooting", "technique"],
    description: "Master the tomahawk shot technique for powerful scoring opportunities",
    uploadDate: "2024-07-01"
  },
  {
    id: "explore-2",
    title: "Jab Tackle",
    duration: "01:22",
    thumbnail: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-PQij6hNhBewQsqnRBElPBKa2TRrHgC.png",
    coach: "Arthur De Sloover",
    category: "Defense",
    tags: ["tackle", "defense", "jab"],
    description: "Effective jab tackle technique for defensive play",
    uploadDate: "2024-07-02"
  },
  {
    id: "explore-3",
    title: "Penalty Corner Drag Flick",
    duration: "01:26",
    thumbnail: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-PQij6hNhBewQsqnRBElPBKa2TRrHgC.png",
    coach: "Alexander Hendrickx",
    category: "Set Pieces",
    tags: ["penalty corner", "drag flick", "shooting"],
    description: "Perfect your penalty corner drag flick technique",
    uploadDate: "2024-07-03"
  },
  {
    id: "explore-4",
    title: "Team Defense Drill",
    duration: "12:45",
    thumbnail: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-PQij6hNhBewQsqnRBElPBKa2TRrHgC.png",
    coach: "Coach Williams",
    category: "Team Training",
    tags: ["defense", "team", "drill"],
    description: "Comprehensive team defense drill for better coordination",
    uploadDate: "2024-07-04"
  },
  {
    id: "explore-5",
    title: "Left Foot BH Pass",
    duration: "00:46",
    thumbnail: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-PQij6hNhBewQsqnRBElPBKa2TRrHgC.png",
    coach: "Andrew Van Doren",
    category: "Passing",
    tags: ["backhand", "passing", "left foot"],
    description: "Backhand passing technique with left foot positioning",
    uploadDate: "2024-07-05"
  },
  {
    id: "explore-6",
    title: "One-on-One with Goalkeeper",
    duration: "01:05",
    thumbnail: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-PQij6hNhBewQsqnRBElPBKa2TRrHgC.png",
    coach: "Vincent Vanasch",
    category: "Goalkeeping",
    tags: ["goalkeeper", "one-on-one", "saves"],
    description: "Goalkeeper techniques for one-on-one situations",
    uploadDate: "2024-07-06"
  },
  {
    id: "explore-7",
    title: "Reverse Stick Hit",
    duration: "00:59",
    thumbnail: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-PQij6hNhBewQsqnRBElPBKa2TRrHgC.png",
    coach: "Eva De Goede",
    category: "Ball Control",
    tags: ["reverse stick", "hitting", "technique"],
    description: "Master the reverse stick hit for versatile play",
    uploadDate: "2024-07-07"
  },
  {
    id: "explore-8",
    title: "Passing Circuit",
    duration: "08:22",
    thumbnail: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-PQij6hNhBewQsqnRBElPBKa2TRrHgC.png",
    coach: "Coach Williams",
    category: "Passing",
    tags: ["passing", "circuit", "training"],
    description: "Complete passing circuit for skill development",
    uploadDate: "2024-07-08"
  }
]

export const categories = [
  "All categories",
  "Ball Control", 
  "Passing", 
  "Defense", 
  "Shooting",
  "Set Pieces",
  "Team Training",
  "Goalkeeping"
]

export const coaches = [
  "All players & coaches",
  "Arthur Van Doren",
  "Arthur De Sloover", 
  "Alexander Hendrickx",
  "Coach Williams",
  "Andrew Van Doren",
  "Vincent Vanasch",
  "Eva De Goede"
]

export const timeFilters = [
  "All time",
  "This week",
  "This month", 
  "Last 3 months",
  "This year"
]
