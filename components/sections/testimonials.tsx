"use client"

import { SectionHeading } from "@/components/ui/section-heading"
import { TestimonialCard } from "@/components/ui/testimonial-card"
import { motion } from "framer-motion"
import { testimonialsData } from "@/data/testimonials"

export function Testimonials() {
  return (
    <section className="section-padding bg-slate-50">
      <div className="max-w-7xl mx-auto container-padding">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <SectionHeading
            title={testimonialsData.sectionTitle}
            subtitle={testimonialsData.sectionSubtitle}
            className="mb-16"
          />
        </motion.div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {testimonialsData.testimonials.map((testimonial, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
            >
              <TestimonialCard {...testimonial} />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
