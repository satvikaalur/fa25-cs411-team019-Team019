'use client'

import Link from 'next/link'
import { Navbar } from './components/NavBar'

export default function Home() {
  return (
    <div className="min-h-screen bg-zinc-50 bg-[radial-gradient(circle_at_1px_1px,#e5e7eb_1px,transparent_0)] bg-[length:28px_28px] font-sans text-black dark:bg-black dark:bg-[radial-gradient(circle_at_1px_1px,#27272a_1px,transparent_0)] dark:text-zinc-50">
      <Navbar />

      <main className="mx-auto flex max-w-5xl flex-col items-center px-6 py-16">
        <div className="mb-10 text-center">
          <p className="text-sm uppercase tracking-[0.4em] text-zinc-500">
            welcome back to
          </p>
          <h1 className="mt-3 text-4xl font-semibold tracking-[0.2em] md:text-5xl">
            INSIGHTEDGE
          </h1>
        </div>

        <div className="w-full max-w-3xl rounded-2xl border border-zinc-300 bg-white/80 p-10 shadow-lg backdrop-blur dark:border-zinc-700 dark:bg-zinc-900/80">
          <div className="flex flex-col items-center gap-6 md:flex-row md:justify-center">
            <Link href="/products" className="w-full md:w-auto">
              <div className="block w-full max-w-xs rounded-xl border border-gray-200 bg-white p-6 text-left shadow-md transition-transform transition-shadow duration-200 hover:-translate-y-0.5 hover:shadow-lg dark:border-zinc-700 dark:bg-zinc-900">
                <h5 className="mb-1 text-xl font-semibold tracking-tight">
                  Product Dashboard
                </h5>
              </div>
            </Link>

            <Link href="/purchases" className="w-full md:w-auto">
              <div className="block w-full max-w-xs rounded-xl border border-gray-200 bg-white p-6 text-left shadow-md transition-transform transition-shadow duration-200 hover:-translate-y-0.5 hover:shadow-lg dark:border-zinc-700 dark:bg-zinc-900">
                <h5 className="mb-1 text-xl font-semibold tracking-tight">
                  Recent Purchases
                </h5>
              </div>
            </Link>
          </div>
        </div>
      </main>
    </div>
  )
}
