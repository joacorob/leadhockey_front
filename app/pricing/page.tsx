import { Metadata } from 'next'
import { Pricing } from '@/components/sections/pricing'
import { FAQ } from '@/components/sections/faq'
import { CTA } from '@/components/sections/cta'

export const metadata: Metadata = {
  title: 'Pricing - LEAD Hockey',
  description: 'Choose the perfect training plan for your hockey development. Flexible pricing options for every player.',
}

export default function PricingPage() {
  return (
    <div className="pt-16">
      <Pricing />
      <FAQ />
      <CTA />
    </div>
  )
}
