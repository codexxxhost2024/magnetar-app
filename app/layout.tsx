import type { Metadata } from "next"
import ClientLayout from "./client-layout"
import type React from "react"
import { Toaster } from "@/components/ui/toaster"

export const metadata: Metadata = {
  title: "Magnetar",
  description: "Magnetar Mobile Web App",
  viewport: "width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no",
  manifest: "/manifest.json",
  themeColor: "#B30000",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "/",
    title: "Magnetar",
    description: "Magnetar Mobile Web App",
    siteName: "Magnetar",
  },
  twitter: {
    card: "summary_large_image",
    title: "Magnetar",
    description: "Magnetar Mobile Web App",
  },
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
      </head>
      <body>
        <ClientLayout>{children}</ClientLayout>
        <Toaster />
      </body>
    </html>
  )
}



import './globals.css'