'use client'

import Image from 'next/image'
import { useState } from 'react'

type Row = Record<string, any>

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
            <a className="opacity-70 hover:opacity-100" href="#">purchases</a>
            <a className="opacity-70 hover:opacity-100" href="#">products</a>
            <a className="opacity-70 hover:opacity-100" href="#">marketing</a>
            <span className="rounded-full bg-black px-3 py-1 text-white dark:bg-white dark:text-black">customers</span>
            <a className="opacity-70 hover:opacity-100" href="#">employees</a>
          </nav>
        </div>
      </header>

      <main className="mx-auto flex max-w-5xl flex-col gap-6 px-6 py-10">
        <div className="flex items-center gap-3">
          <input
            value={q}
            onChange={e => setQ(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && fetchCustomers(q)}
            placeholder="Search customers by name or email"
            className="w-full rounded-md border border-black/10 bg-white px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-black dark:border-white/15 dark:bg-zinc-900 dark:focus:ring-white"
          />
          <button
            onClick={() => fetchCustomers(q)}
            className="rounded-md bg-black px-4 py-2 text-sm text-white transition-colors hover:bg-[#383838] dark:bg-white dark:text-black dark:hover:bg-[#ddd]"
          >
            {loading ? 'Searching…' : 'Search'}
          </button>
          <button
            onClick={() => { setQ(''); fetchCustomers(); }}
            className="rounded-md border border-black/10 px-4 py-2 text-sm hover:bg-black/5 dark:border-white/15 dark:hover:bg-white/10"
          >
            Load all
          </button>
        </div>

        {err && <p className="text-sm text-red-500">{err}</p>}

        <div className="overflow-x-auto rounded-lg border border-black/10 dark:border-white/15">
          {rows.length === 0 ? (
            <div className="px-4 py-10 text-sm text-zinc-600 dark:text-zinc-400">No customers</div>
          ) : (
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="bg-zinc-100 dark:bg-zinc-900">
                  {cols.map(c => (
                    <th key={c} className="border-b border-black/10 px-3 py-2 text-left font-semibold dark:border-white/15">
                      {c}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((r, i) => (
                  <tr key={i} className="hover:bg-zinc-50 dark:hover:bg-zinc-900/40">
                    {cols.map(c => (
                      <td key={c} className="border-b border-black/5 px-3 py-2 dark:border-white/10">
                        {r[c] === null || r[c] === undefined
                          ? ''
                          : typeof r[c] === 'object'
                          ? JSON.stringify(r[c])
                          : String(r[c])}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </main>
    </div>
  )
}
