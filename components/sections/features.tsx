"use client"

import { SectionHeading } from "@/components/ui/section-heading"
import { FeatureCard } from "@/components/ui/feature-card"
import { motion } from "framer-motion"
import { featuresData } from "@/data/features"
import * as Icons from "lucide-react"

export function Features() {
  return (
    <section className="section-padding bg-white">
      <div className="max-w-7xl mx-auto container-padding">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <SectionHeading
            title={featuresData.sectionTitle}
            subtitle={featuresData.sectionSubtitle}
            className="mb-16"
          />
        </motion.div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {featuresData.features.map((feature, index) => {
            const IconComponent = Icons[feature.icon as keyof typeof Icons] as any
            
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <FeatureCard
                  icon={IconComponent}
                  title={feature.title}
                  description={feature.description}
                />
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
