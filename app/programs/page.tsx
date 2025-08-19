import { Metadata } from 'next'
import { SectionHeading } from '@/components/ui/section-heading'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Clock, Users, Target, Trophy } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Programs - LEAD Hockey',
  description: 'Explore our comprehensive hockey training programs designed for players of all skill levels.',
}

export default function Programs() {
  const programs = [
    {
      title: 'Youth Development',
      description: 'Foundational skills training for young players ages 6-12',
      image: '/youth-hockey-training.png',
      duration: '8 weeks',
      participants: '12-15 players',
      level: 'Beginner',
      features: [
        'Basic skating fundamentals',
        'Stick handling basics',
        'Introduction to game rules',
        'Fun, engaging activities',
        'Safety-first approach'
      ],
      price: '$199'
    },
    {
      title: 'Junior Skills',
      description: 'Advanced skill development for teenage players ages 13-17',
      image: '/junior-hockey-training.png',
      duration: '12 weeks',
      participants: '10-12 players',
      level: 'Intermediate',
      features: [
        'Advanced skating techniques',
        'Shooting accuracy training',
        'Tactical awareness',
        'Position-specific skills',
        'Mental game development'
      ],
      price: '$349'
    },
    {
      title: 'Elite Performance',
      description: 'Professional-level training for competitive players',
      image: '/elite-hockey-training.png',
      duration: '16 weeks',
      participants: '6-8 players',
      level: 'Advanced',
      features: [
        'NHL-level techniques',
        'Video analysis sessions',
        'Personalized training plans',
        'Mental performance coaching',
        'Nutrition guidance'
      ],
      price: '$599'
    },
    {
      title: 'Goaltender Specialist',
      description: 'Specialized training program for goalkeepers',
      image: '/placeholder-mm0ew.png',
      duration: '10 weeks',
      participants: '4-6 goalies',
      level: 'All Levels',
      features: [
        'Positioning fundamentals',
        'Reaction time training',
        'Equipment optimization',
        'Mental toughness',
        'Game situation practice'
      ],
      price: '$449'
    }
  ]

  return (
    <div className="pt-16">
      {/* Hero Section */}
      <section className="section-padding bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="max-w-4xl mx-auto container-padding text-center">
          <SectionHeading
            title="Training Programs"
            subtitle="Comprehensive hockey development programs tailored to every skill level and age group"
            className="mb-8"
          />
        </div>
      </section>

      {/* Programs Grid */}
      <section className="section-padding bg-white">
        <div className="max-w-7xl mx-auto container-padding">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {programs.map((program, index) => (
              <Card key={index} className="border-0 shadow-lg overflow-hidden">
                <div className="relative h-48">
                  <Image
                    src={program.image || "/placeholder.svg"}
                    alt={program.title}
                    fill
                    className="object-cover"
                  />
                  <div className="absolute top-4 right-4">
                    <Badge variant="secondary">{program.level}</Badge>
                  </div>
                </div>
                <CardHeader>
                  <CardTitle className="text-xl">{program.title}</CardTitle>
                  <p className="text-muted-foreground">{program.description}</p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {program.duration}
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      {program.participants}
                    </div>
                  </div>
                  
                  <ul className="space-y-2">
                    {program.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-center gap-2 text-sm">
                        <Target className="w-4 h-4 text-green-500 flex-shrink-0" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  
                  <div className="flex items-center justify-between pt-4 border-t">
                    <div className="text-2xl font-bold text-primary">{program.price}</div>
                    <Button asChild>
                      <Link href="/contact">Enroll Now</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="section-padding bg-primary text-primary-foreground">
        <div className="max-w-4xl mx-auto container-padding text-center">
          <h2 className="text-3xl font-bold mb-4">Not Sure Which Program is Right for You?</h2>
          <p className="text-lg opacity-90 mb-8">
            Our expert coaches can help you choose the perfect training program based on your current skill level and goals.
          </p>
          <Button size="lg" variant="secondary" asChild>
            <Link href="/contact">Get Personalized Recommendation</Link>
          </Button>
        </div>
      </section>
    </div>
  )
}
