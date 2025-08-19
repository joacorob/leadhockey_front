import { Metadata } from 'next'
import { SectionHeading } from '@/components/ui/section-heading'
import { Card, CardContent } from '@/components/ui/card'
import Image from 'next/image'
import { Users, Target, Trophy, Heart } from 'lucide-react'

export const metadata: Metadata = {
  title: 'About Us - LEAD Hockey',
  description: 'Learn about LEAD Hockey\'s mission to transform hockey training through innovative technology and expert coaching.',
}

export default function About() {
  const values = [
    {
      icon: Users,
      title: 'Community First',
      description: 'We believe in building a supportive community where players help each other grow.'
    },
    {
      icon: Target,
      title: 'Excellence',
      description: 'We strive for excellence in everything we do, from content quality to user experience.'
    },
    {
      icon: Trophy,
      title: 'Results Driven',
      description: 'Our success is measured by the improvement and achievements of our players.'
    },
    {
      icon: Heart,
      title: 'Passion',
      description: 'Our love for hockey drives us to create the best training platform possible.'
    }
  ]

  const team = [
    {
      name: 'Mike Johnson',
      role: 'Founder & CEO',
      bio: 'Former NHL player with 15 years of professional experience.',
      image: '/hockey-coach-headshot.png'
    },
    {
      name: 'Sarah Williams',
      role: 'Head of Training',
      bio: 'Olympic gold medalist and certified coaching instructor.',
      image: '/female-hockey-coach-headshot.png'
    },
    {
      name: 'David Chen',
      role: 'Technical Director',
      bio: 'Sports technology expert with 10+ years in athlete development.',
      image: '/tech-director-headshot.png'
    }
  ]

  return (
    <div className="pt-16">
      {/* Hero Section */}
      <section className="section-padding bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="max-w-4xl mx-auto container-padding text-center">
          <SectionHeading
            title="About LEAD Hockey"
            subtitle="We're on a mission to revolutionize hockey training through innovative technology and world-class coaching expertise."
            className="mb-8"
          />
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            Founded by former NHL players and coaching professionals, LEAD Hockey combines decades of 
            on-ice experience with cutting-edge training methodologies to help players at every level 
            reach their full potential.
          </p>
        </div>
      </section>

      {/* Story Section */}
      <section className="section-padding bg-white">
        <div className="max-w-7xl mx-auto container-padding">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold mb-6">Our Story</h2>
              <div className="space-y-4 text-muted-foreground">
                <p>
                  LEAD Hockey was born from a simple observation: traditional hockey training 
                  methods weren't keeping pace with the modern game. Players needed access to 
                  professional-level instruction, personalized feedback, and flexible training 
                  schedules that fit their busy lives.
                </p>
                <p>
                  Our founders, having experienced the highest levels of professional hockey, 
                  recognized the gap between elite training and what was available to the 
                  average player. They set out to democratize access to world-class hockey 
                  instruction through technology.
                </p>
                <p>
                  Today, LEAD Hockey serves over 10,000 active players worldwide, from youth 
                  beginners to professional athletes, all united by their passion for 
                  improvement and love of the game.
                </p>
              </div>
            </div>
            <div className="relative">
              <Image
                src="/hockey-team-training.png"
                alt="Hockey training session"
                width={600}
                height={500}
                className="rounded-lg shadow-lg"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="section-padding bg-slate-50">
        <div className="max-w-7xl mx-auto container-padding">
          <SectionHeading
            title="Our Values"
            subtitle="The principles that guide everything we do"
            className="mb-16"
          />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <Card key={index} className="text-center border-0 shadow-lg">
                <CardContent className="p-6">
                  <div className="flex justify-center mb-4">
                    <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                      <value.icon className="w-6 h-6 text-primary" />
                    </div>
                  </div>
                  <h3 className="text-lg font-semibold mb-2">{value.title}</h3>
                  <p className="text-muted-foreground text-sm">{value.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="section-padding bg-white">
        <div className="max-w-7xl mx-auto container-padding">
          <SectionHeading
            title="Meet Our Team"
            subtitle="The experts behind LEAD Hockey's success"
            className="mb-16"
          />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {team.map((member, index) => (
              <Card key={index} className="text-center border-0 shadow-lg">
                <CardContent className="p-6">
                  <Image
                    src={member.image || "/placeholder.svg"}
                    alt={member.name}
                    width={200}
                    height={200}
                    className="w-32 h-32 rounded-full mx-auto mb-4 object-cover"
                  />
                  <h3 className="text-xl font-semibold mb-1">{member.name}</h3>
                  <p className="text-primary font-medium mb-3">{member.role}</p>
                  <p className="text-muted-foreground text-sm">{member.bio}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
