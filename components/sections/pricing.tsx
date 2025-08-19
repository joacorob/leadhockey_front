"use client"

import { SectionHeading } from "@/components/ui/section-heading"
import { PricingCard } from "@/components/ui/pricing-card"
import { motion } from "framer-motion"
import { pricingData } from "@/data/pricing"

export function Pricing() {
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
            title={pricingData.sectionTitle}
            subtitle={pricingData.sectionSubtitle}
            className="mb-16"
          />
        </motion.div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          {pricingData.plans.map((plan, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
            >
              <PricingCard {...plan} />
            </motion.div>
          ))}
        </div>
        
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <p className="text-muted-foreground">{pricingData.guarantee}</p>
        </motion.div>
      </div>
    </section>
  )
}
