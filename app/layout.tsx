import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Navigation from '@/components/Navigation'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'OS Tracker - Open Source Contribution Tracker',
  description: 'Track and celebrate open-source contributions from students across your college',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} flex min-h-screen flex-col bg-black`}>        
        <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
          <div className="absolute top-[-32%] left-[-12%] h-[480px] w-[480px] rounded-full bg-indigo-400/12 blur-[140px]" />
          <div className="absolute top-[12%] right-[-18%] h-[520px] w-[520px] rounded-full bg-pink-300/12 blur-[180px]" />
          <div className="absolute bottom-[-28%] left-1/2 h-[420px] w-[420px] -translate-x-1/2 rounded-full bg-sky-300/10 blur-[160px]" />
        </div>
        <Navigation />
        <main className="flex-grow">
          {children}
        </main>
      </body>
    </html>
  )
}
