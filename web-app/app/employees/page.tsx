'use client'

import { useState } from 'react'
import { Navbar } from '../components/NavBar'

type Row = Record<string, string>

export default function Home() {
  const [rows, setRows] = useState<Row[]>([])
  const [q, setQ] = useState('')
  const [loading, setLoading] = useState(false)
  const [err, setErr] = useState<string | null>(null)

  async function fetchEmployees(query?: string) {
    setLoading(true)
    setErr(null)
    const url = query && query.trim().length ? `/api/employee?q=${encodeURIComponent(query.trim())}` : '/api/employee'
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

  const preferred = ['employeeid','empname','emptitle','tenure']
  const cols = rows.length
    ? [...preferred.filter(k => k in rows[0]), ...Object.keys(rows[0]).filter(k => !preferred.includes(k))]
    : []

  return (
    <div className="min-h-screen bg-zinc-50 font-sans text-black dark:bg-black dark:text-zinc-50">
      <Navbar />

      <main className="mx-auto flex max-w-5xl flex-col gap-6 px-6 py-10">
        <div className="flex items-center gap-3">
          <input
            value={q}
            onChange={e => setQ(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && fetchEmployees(q)}
            placeholder="Search employees by name"
            className="w-full rounded-md border border-black/10 bg-white px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-black dark:border-white/15 dark:bg-zinc-900 dark:focus:ring-white"
          />
          <button
            onClick={() => fetchEmployees(q)}
            className="rounded-md bg-black px-4 py-2 text-sm text-white transition-colors hover:bg-[#383838] dark:bg-white dark:text-black dark:hover:bg-[#ddd]"
          >
            {loading ? 'Searching…' : 'Search'}
          </button>
          <button
            onClick={() => { setQ(''); fetchEmployees(); }}
            className="rounded-md border border-black/10 px-4 py-2 text-sm hover:bg-black/5 dark:border-white/15 dark:hover:bg-white/10"
          >
            Load all
          </button>
        </div>

        {err && <p className="text-sm text-red-500">{err}</p>}

        <div className="overflow-x-auto rounded-lg border border-black/10 dark:border-white/15">
          {rows.length === 0 ? (
            <div className="px-4 py-10 text-sm text-zinc-600 dark:text-zinc-400">No employees</div>
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
                        {c === 'emptitle' ? (
                          <select
                            value={r.emptitle}
                            onChange={async e => {
                              const newRole = e.target.value
                              const res = await fetch('/api/employee', {
                                method: 'PATCH',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({
                                  empname: r.empname,
                                  newRole: newRole        
                                })
                              })
                            
                              const json = await res.json()
                              if (json.error) {
                                alert('Error: ' + json.error)
                              } else {
                                setRows(prev =>
                                  prev.map(row =>
                                    row.empname === r.empname ? { ...row, emptitle: newRole } : row
                                  )
                                )
                                // fetchEmployees() // refresh the table
                              }
                            }}
                            className="rounded border px-2 py-1 text-sm"
                          >
                            <option value="Agent">Agent</option>
                            <option value="Supervisor">Supervisor</option>
                            <option value="Manager">Manager</option>
                          </select>
                        ) : (
                          r[c] ?? ''
                        )}
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
