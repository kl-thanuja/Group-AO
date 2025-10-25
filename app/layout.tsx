import type React from "react"
import { DM_Sans, Geist, Geist_Mono } from "next/font/google"
import "./globals.css"

const dmSans = DM_Sans({ subsets:['latin']});
// const dmSans = Poppins({ weight:['100','200','300','400','500','600','700','800','900']});

export const metadata = {
  title: "SyncHub - Modern Communication Platform",
  description: "Premium SaaS platform for seamless team collaboration",
    generator: 'v0.app'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${dmSans.className} font-sans`}>{children}</body>
    </html>
  )
}
