'use client'

import Image from 'next/image'
import { useState } from 'react'

type Row = Record<string, string>

export default function Home() {
  const [rows, setRows] = useState<Row[]>([])
  const [q, setQ] = useState('')
  const [loading, setLoading] = useState(false)
  const [err, setErr] = useState<string | null>(null)

  async function fetchCustomers(query?: string) {
    setLoading(true)
    setErr(null)
    const url = query && query.trim().length ? `/api/customer?q=${encodeURIComponent(query.trim())}` : '/api/customer'
    const res = await fetch(url, { cache: 'no-store' })
    const json = await res.json()
    if (!res.ok || !Array.isArray(json)) {
      setErr(typeof json?.error === 'string' ? json.error : 'Failed to load')
      setRows([])
    } else {
      setRows(json)
    }
    setLoading(false)
  }

  const preferred = ['customer_id','email','custname','age','gender','created_at','updated_at']
  const cols = rows.length
    ? [...preferred.filter(k => k in rows[0]), ...Object.keys(rows[0]).filter(k => !preferred.includes(k))]
    : []

  return (
    <div className="min-h-screen bg-zinc-50 font-sans text-black dark:bg-black dark:text-zinc-50">
      <header className="sticky top-0 z-10 border-b border-black/10 bg-white/80 backdrop-blur dark:border-white/10 dark:bg-black/60">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <Image className="dark:invert" src="/next.svg" alt="Logo" width={72} height={16} />
            <span className="text-lg font-semibold">InsightEdge</span>
          </div>
          <nav className="flex items-center gap-5 text-sm">
            <a className="opacity-70 hover:opacity-100" href="/purchases">purchases</a>
            <a className="opacity-70 hover:opacity-100" href="/products">products</a>
            <a className="opacity-70 hover:opacity-100" href="/marketing">marketing</a>
            <span className="rounded-full bg-black px-3 py-1 text-white dark:bg-white dark:text-black">customers</span>
            <a className="opacity-70 hover:opacity-100" href="/employees">employees</a>
          </nav>
        </div>
      </header>

      <main className="mx-auto flex max-w-5xl flex-col gap-6 px-6 py-10 items-center">
        <div className="flex items-center justify-center gap-3">
          <h1 className="text-4xl md:text-5xl text-center tracking-wide"> Welcome to Insight Edge!
          </h1>
        </div>
        <div className="border-2 border-gray-300 dark:border-gray-700 rounded-xl p-8 shadow-lg bg-white dark:bg-zinc-900">
          <div className="flex space-x-7">
            <a href="/products" className="click">
              <button className="block w-64 p-6 border border-gray-200 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 ease-in-out text-left">
                <h5 className="mb-2 text-2xl font-bold tracking-tight text-gray-900 dark:text-white">Mini Product Dashboard</h5>
              </button>
            </a>
            <a href="/purchases" className="click">
              <button className="block w-64 p-6 border border-gray-200 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 ease-in-out text-left">
                <h5 className="mb-2 text-2xl font-bold tracking-tight text-gray-900 dark:text-white">Recent Purchases</h5>
              </button>
            </a>
          </div>
        </div>
      </main>
    </div>
  )
}
