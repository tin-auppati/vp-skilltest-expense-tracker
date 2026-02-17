import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Link from 'next/link'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Expense Tracker',
  description: 'Track your expenses with ease',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="th">
      <body className={inter.className}>
        <nav className="bg-white border-b border-slate-200 sticky top-0 z-10">
          <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
            <Link href="/" className="text-xl font-bold text-sky-600">
              💰 Expense Tracker
            </Link>
            <div className="flex gap-6">
              <Link
                href="/"
                className="text-slate-600 hover:text-sky-600 font-medium transition-colors"
              >
                Dashboard
              </Link>
              <Link
                href="/expenses"
                className="text-slate-600 hover:text-sky-600 font-medium transition-colors"
              >
                รายจ่าย
              </Link>
              <Link
                href="/categories"
                className="text-slate-600 hover:text-sky-600 font-medium transition-colors"
              >
                หมวดหมู่
              </Link>
            </div>
          </div>
        </nav>
        <main className="max-w-6xl mx-auto px-4 py-8">
          {children}
        </main>
      </body>
    </html>
  )
}
