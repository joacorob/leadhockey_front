'use client'

import * as React from 'react'

import { SessionProvider as NextSessionProvider } from "next-auth/react"

export default function SessionProvider({
  children,
  session,
}: {
  children: React.ReactNode
  session: any
}) {
  return (
    <NextSessionProvider session={session}>
      {children}
    </NextSessionProvider>
  )
}



