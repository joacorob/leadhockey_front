"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Home, Search, Calendar, Settings, Heart, CreditCard, User, LogOut, Bell } from "lucide-react"

interface MobileNavProps {
  isOpen: boolean
  onClose: () => void
}

export function MobileNav({ isOpen, onClose }: MobileNavProps) {
  const handleLogout = () => {
    alert("This is a demo - logout functionality would be implemented here")
    onClose()
  }

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="right" className="w-80">
        <SheetHeader>
          <SheetTitle>Menu</SheetTitle>
        </SheetHeader>

        <div className="flex flex-col space-y-4 mt-6">
          {/* Navigation Links */}
          <div className="space-y-2">
            <Link
              href="/"
              className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-100 transition-colors"
              onClick={onClose}
            >
              <Home className="w-5 h-5" />
              <span>Home</span>
            </Link>

            <Link
              href="/explore"
              className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-100 transition-colors"
              onClick={onClose}
            >
              <Search className="w-5 h-5" />
              <span>Explore</span>
            </Link>

            <Link
              href="/programs"
              className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-100 transition-colors"
              onClick={onClose}
            >
              <Calendar className="w-5 h-5" />
              <span>Programs</span>
            </Link>

            <Link
              href="/about"
              className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-100 transition-colors"
              onClick={onClose}
            >
              <User className="w-5 h-5" />
              <span>About</span>
            </Link>

            <Link
              href="/contact"
              className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-100 transition-colors"
              onClick={onClose}
            >
              <Bell className="w-5 h-5" />
              <span>Contact</span>
            </Link>
          </div>

          <hr className="my-4" />

          {/* User Actions */}
          <div className="space-y-2">
            <Link
              href="/settings"
              className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-100 transition-colors"
              onClick={onClose}
            >
              <User className="w-5 h-5" />
              <span>Profile</span>
            </Link>

            <Link
              href="/favourites"
              className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-100 transition-colors"
              onClick={onClose}
            >
              <Heart className="w-5 h-5" />
              <span>Favourites</span>
            </Link>

            <Link
              href="/billing"
              className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-100 transition-colors"
              onClick={onClose}
            >
              <CreditCard className="w-5 h-5" />
              <span>Billing</span>
            </Link>

            <Link
              href="/settings"
              className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-100 transition-colors"
              onClick={onClose}
            >
              <Settings className="w-5 h-5" />
              <span>Settings</span>
            </Link>
          </div>

          <hr className="my-4" />

          {/* Logout */}
          <Button variant="ghost" className="justify-start p-3 h-auto" onClick={handleLogout}>
            <LogOut className="w-5 h-5 mr-3" />
            Log out
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  )
}
