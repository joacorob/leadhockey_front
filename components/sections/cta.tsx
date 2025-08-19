"use client"

import { Button } from "@/components/ui/button"
import { ArrowRight } from 'lucide-react'
import Link from "next/link"
import { motion } from "framer-motion"

export function CTA() {
  return (
    <section className="section-padding bg-primary text-primary-foreground">
      <div className="max-w-4xl mx-auto container-padding text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="space-y-6"
        >
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold">
            Ready to Elevate Your Game?
          </h2>
          <p className="text-lg opacity-90 max-w-2xl mx-auto">
            Join thousands of players who have transformed their hockey skills with LEAD Hockey. 
            Start your journey today with a free trial.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" variant="secondary" asChild>
              <Link href="/pricing" className="flex items-center gap-2">
                Start Free Trial
                <ArrowRight className="w-4 h-4" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild className="border-white text-white hover:bg-white hover:text-primary">
              <Link href="/contact">
                Contact Sales
              </Link>
            </Button>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
