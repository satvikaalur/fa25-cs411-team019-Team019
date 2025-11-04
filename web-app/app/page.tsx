'use client'

import Image from "next/image";
import { useState } from "react";

export default function Home() {
  const [rows, setRows] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [err, setErr] = useState<string | null>(null)

  async function loadCustomers() {
    setLoading(true)
    setErr(null)
    const res = await fetch('/api/customer', { cache: 'no-store' })
    const json = await res.json()
    if (!res.ok || !Array.isArray(json)) {
      setErr(typeof json?.error === 'string' ? json.error : 'Failed to load')
      setRows([])
    } else {
      setRows(json)
    }
    setLoading(false)
  }

  const cols = rows.length ? Object.keys(rows[0]) : []

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex min-h-screen w-full max-w-3xl flex-col items-center justify-between py-32 px-16 bg-white dark:bg-black sm:items-start">
        <Image className="dark:invert" src="/next.svg" alt="Next.js logo" width={100} height={20} priority />
        <div className="flex flex-col items-center gap-6 text-center sm:items-start sm:text-left">
          <h1 className="max-w-xs text-3xl font-semibold leading-10 tracking-tight text-black dark:text-zinc-50">Hello World!</h1>
          <p className="max-w-md text-lg leading-8 text-zinc-600 dark:text-zinc-400">CS411</p>
        </div>
        <div className="flex gap-4">
          <button
            onClick={loadCustomers}
            className="flex h-12 items-center justify-center gap-2 rounded-full bg-foreground px-5 text-background transition-colors hover:bg-[#383838] dark:hover:bg-[#ccc]"
          >
            {loading ? 'Loading…' : 'Load Customers'}
          </button>
        </div>

        {err && <p className="mt-6 text-sm text-red-500">{err}</p>}

        <div className="mt-8 w-full overflow-x-auto">
          {rows.length === 0 ? (
            <p className="text-sm text-zinc-700 dark:text-zinc-300">No customers found</p>
          ) : (
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr>
                  {cols.map(c => (
                    <th key={c} className="border-b px-2 py-2 text-left font-semibold text-zinc-800 dark:text-zinc-200">
                      {c}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((r, i) => (
                  <tr key={i} className="hover:bg-zinc-50 dark:hover:bg-zinc-900/40">
                    {cols.map(c => (
                      <td key={c} className="border-b px-2 py-2 text-zinc-700 dark:text-zinc-300">
                        {String(r[c] ?? '')}
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