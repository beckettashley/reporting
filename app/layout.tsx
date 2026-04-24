import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { OnboardingProvider } from '@/lib/onboarding-context'
import PortalSidebar from '@/components/portal/sidebar'
import './globals.css'

const geist = Geist({ subsets: ["latin"], variable: "--font-sans" });
const geistMono = Geist_Mono({ subsets: ["latin"], variable: "--font-mono" });

export const metadata: Metadata = {
  title: 'Merchant Portal | Velocity',
  description: 'Manage your funnels, experiments, and products.',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`${geist.variable} ${geistMono.variable} font-sans antialiased`}>
        <OnboardingProvider>
          <div className="min-h-screen bg-background">
            <PortalSidebar />
            <div className="lg:pl-64 pt-12 lg:pt-0">
              <main className="min-h-screen">{children}</main>
            </div>
          </div>
        </OnboardingProvider>
        <Analytics />
      </body>
    </html>
  )
}
