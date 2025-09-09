"use client"

import { useState, useEffect } from "react"
import { Sidebar } from "@/components/layout/sidebar"
import { Header } from "@/components/layout/header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CreditCard, Calendar, Download, AlertCircle, CheckCircle, X } from 'lucide-react'

export default function BillingPage() {
  const [showCancelDialog, setShowCancelDialog] = useState(false)
  const [showUpgradeDialog, setShowUpgradeDialog] = useState(false)
  const [userInfo, setUserInfo] = useState<any>(null)

  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const res = await fetch("/api/me")
        const json = await res.json()
        if (json.success) {
          console.log(json.data)
          setUserInfo(json.data)
        } else {
          console.error(json.error)
        }
      } catch (error) {
        console.error(error)
      }
    }

    fetchUserInfo()
  }, [])

  const isPremium = userInfo?.data?.tier === "premium"
  const stripeSub = userInfo?.data?.stripeSubscription

  const currentPlan = isPremium && stripeSub ? {
    name: "Premium Plan",
    price: stripeSub.amount / 100,
    period: stripeSub.interval,
    status: stripeSub.status,
    nextBilling: new Date(stripeSub.currentPeriodEnd * 1000).toLocaleDateString(),
    features: [
      "Unlimited access to all content",
      "Monthly 1-on-1 coaching sessions",
      "Priority support",
    ],
  } : {
    name: "Free Plan",
    price: 0,
    period: "-",
    status: "inactive",
    nextBilling: "-",
    features: [
      "Limited access to videos",
      "Ads included",
    ],
  }

  const billingHistory = [
    {
      id: "inv_001",
      date: "July 8, 2025",
      amount: 59.00,
      status: "paid",
      description: "Pro Plan - Monthly"
    },
    {
      id: "inv_002", 
      date: "June 8, 2025",
      amount: 59.00,
      status: "paid",
      description: "Pro Plan - Monthly"
    },
    {
      id: "inv_003",
      date: "May 8, 2025", 
      amount: 59.00,
      status: "paid",
      description: "Pro Plan - Monthly"
    }
  ]

  const paymentMethod = {
    type: "Visa",
    last4: "4242",
    expiry: "12/26"
  }

  const handleCancelSubscription = async () => {
    try {
      const res = await fetch("/api/stripe/create-portal", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      })

      if (!res.ok) throw new Error("Failed to create billing portal session")

      const { url } = await res.json()

      setShowCancelDialog(false)

      if (url) {
        window.location.href = url as string
      }
    } catch (error) {
      console.error(error)
    }
  }

  const handleUpgrade = async (plan: string) => {
    try {
      const res = await fetch("/api/stripe/create-checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ tier: 'premium' }),
      })

      if (!res.ok) throw new Error("Failed to create checkout session")

      const { url } = await res.json()

      // Close dialog before redirecting
      setShowUpgradeDialog(false)

      // Redirect user to Stripe Checkout
      if (url) {
        window.location.href = url as string
      }
    } catch (error) {
      console.error(error)
      // Optionally show toast or notification here
    }
  }

  const handleDownloadInvoice = (invoiceId: string) => {
    console.log("Downloading invoice:", invoiceId)
    // Handle invoice download
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-4xl mx-auto space-y-6">
            {/* Page Header */}
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Billing & Subscription</h1>
              <p className="text-gray-600">Manage your subscription, payment methods, and billing history</p>
            </div>

            {/* Current Plan */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Current Plan</span>
                  <Badge variant={currentPlan.status === 'active' ? 'default' : 'secondary'}>
                    {currentPlan.status === 'active' ? 'Active' : 'Inactive'}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold">{currentPlan.name}</h3>
                    <p className="text-2xl font-bold text-primary">
                      ${currentPlan.price}
                      <span className="text-sm font-normal text-gray-600">/{currentPlan.period}</span>
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600">Next billing date</p>
                    <p className="font-medium">{currentPlan.nextBilling}</p>
                  </div>
                </div>

                <Separator />

                <div>
                  <h4 className="font-medium mb-2">Plan Features</h4>
                  <ul className="space-y-1">
                    {currentPlan.features.map((feature, index) => (
                      <li key={index} className="flex items-center gap-2 text-sm">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="flex gap-3">
                  {!isPremium && (
                    <Button onClick={() => handleUpgrade('premium')}>Upgrade to Premium</Button>
                  )}
                  {isPremium && (
                    <Button variant="outline" onClick={() => setShowCancelDialog(true)}>
                      Manage Subscription
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Payment Method */}
            {/* <Card>
              <CardHeader>
                <CardTitle>Payment Method</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-6 bg-blue-600 rounded flex items-center justify-center">
                      <CreditCard className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <p className="font-medium">{paymentMethod.type} ending in {paymentMethod.last4}</p>
                      <p className="text-sm text-gray-600">Expires {paymentMethod.expiry}</p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">Update</Button>
                </div>
              </CardContent>
            </Card> */}

            {/* Billing History */}
            {/* <Card>
              <CardHeader>
                <CardTitle>Billing History</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {billingHistory.map((invoice) => (
                    <div key={invoice.id} className="flex items-center justify-between py-3 border-b last:border-b-0">
                      <div>
                        <p className="font-medium">{invoice.description}</p>
                        <p className="text-sm text-gray-600">{invoice.date}</p>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="font-medium">${invoice.amount.toFixed(2)}</p>
                          <Badge variant={invoice.status === 'paid' ? 'default' : 'secondary'} className="text-xs">
                            {invoice.status}
                          </Badge>
                        </div>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleDownloadInvoice(invoice.id)}
                        >
                          <Download className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card> */}

            {/* Billing Information */}
            {/* <Card>
              <CardHeader>
                <CardTitle>Billing Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="email">Billing Email</Label>
                    <Input id="email" defaultValue="user@example.com" />
                  </div>
                  <div>
                    <Label htmlFor="company">Company (Optional)</Label>
                    <Input id="company" placeholder="Your company name" />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="address">Address</Label>
                  <Input id="address" placeholder="Street address" />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="city">City</Label>
                    <Input id="city" placeholder="City" />
                  </div>
                  <div>
                    <Label htmlFor="state">State/Province</Label>
                    <Input id="state" placeholder="State" />
                  </div>
                  <div>
                    <Label htmlFor="zip">ZIP/Postal Code</Label>
                    <Input id="zip" placeholder="ZIP code" />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="country">Country</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select country" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="us">United States</SelectItem>
                      <SelectItem value="ca">Canada</SelectItem>
                      <SelectItem value="uk">United Kingdom</SelectItem>
                      <SelectItem value="au">Australia</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <Button>Update Billing Information</Button>
              </CardContent>
            </Card> */}
          </div>
        </main>
      </div>
    </div>
  )
}
