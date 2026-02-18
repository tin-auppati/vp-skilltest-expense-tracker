import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Link from 'next/link'
import DarkModeToggle from './components/Darkmodetoggle'

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
        <nav className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 sticky top-0 z-10">
          <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
            <Link href="/" className="text-xl font-bold text-sky-600 dark:text-sky-400">
              💰 Expense Tracker
            </Link>
            <div className="flex items-center gap-6">
              <Link
                href="/"
                className="text-slate-600 dark:text-slate-300 hover:text-sky-600 dark:hover:text-sky-400 font-medium transition-colors"
              >
                Dashboard
              </Link>
              <Link
                href="/expenses"
                className="text-slate-600 dark:text-slate-300 hover:text-sky-600 dark:hover:text-sky-400 font-medium transition-colors"
              >
                รายจ่าย
              </Link>
              <Link
                href="/categories"
                className="text-slate-600 dark:text-slate-300 hover:text-sky-600 dark:hover:text-sky-400 font-medium transition-colors"
              >
                หมวดหมู่
              </Link>
              <DarkModeToggle />
            </div>
          </div>
        </nav>
        <main className="max-w-6xl mx-auto px-4 py-8 bg-slate-50 dark:bg-slate-800 min-h-screen">
          {children}
        </main>
      </body>
    </html>
  )
}