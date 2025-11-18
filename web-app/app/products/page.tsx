'use client'

import { useState, useEffect } from 'react'
import { Navbar } from '../components/NavBar'

type CategorySummary = {
  category: string
  numPurchases: number
  totalQuantity: number
  totalAmount: number
}

type TimeSeriesPoint = {
  month: string
  totalQuantity: number
  totalAmount: number
  numReturns: number
}

type SummaryResponse = {
  categories: string[]
  summaryByCategory: CategorySummary[]
}

type SeriesResponse = {
  category: string
  series: TimeSeriesPoint[]
}

export default function ProductsPage() {
  const [summary, setSummary] = useState<CategorySummary[]>([])
  const [categories, setCategories] = useState<string[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string>('')
  const [series, setSeries] = useState<TimeSeriesPoint[]>([])
  const [loading, setLoading] = useState(false)
  const [err, setErr] = useState<string | null>(null)

  // Fetch summary on mount
  useEffect(() => {
    fetchSummary()
  }, [])

  // Fetch series when category changes
  useEffect(() => {
    if (selectedCategory) {
      fetchSeries(selectedCategory)
    }
  }, [selectedCategory])

  async function fetchSummary() {
    setLoading(true)
    setErr(null)
    try {
      const res = await fetch('/api/products', { cache: 'no-store' })
      const json: SummaryResponse = await res.json()
      console.log('Summary data:', json)
      if (!res.ok) {
        throw new Error('Failed to load summary')
      }
      setSummary(json.summaryByCategory || [])
      setCategories(json.categories || [])
      if (json.categories.length > 0) {
        setSelectedCategory(json.categories[0])
      }
    } catch (error) {
      console.error('Error fetching summary:', error)
      setErr(error instanceof Error ? error.message : 'Failed to load')
    }
    setLoading(false)
  }

  async function fetchSeries(category: string) {
    try {
      const res = await fetch(`/api/products?category=${encodeURIComponent(category)}`, {
        cache: 'no-store',
      })
      const json: SeriesResponse = await res.json()
      console.log('Series data for', category, ':', json)
      if (!res.ok) {
        throw new Error('Failed to load series')
      }
      setSeries(json.series || [])
    } catch (error) {
      console.error('Error fetching series:', error)
    }
  }

  // Calculate max values for scaling
  const maxAmount = Math.max(...summary.map((s) => s.totalAmount), 1)
  const maxQuantity = Math.max(...series.map((s) => s.totalQuantity), 1)
  const maxSeriesAmount = Math.max(...series.map((s) => s.totalAmount), 1)
  const maxReturns = Math.max(...series.map((s) => s.numReturns), 1)

  return (
    <div className="min-h-screen bg-zinc-50 font-sans text-black dark:bg-black dark:text-zinc-50">
      <Navbar />

      <main className="mx-auto max-w-7xl px-6 py-10">
        <h1 className="mb-2 text-3xl font-semibold">Product Dashboard</h1>
        <p className="mb-8 text-sm text-zinc-600 dark:text-zinc-400">
          Sales analytics by product category
        </p>

        {err && <p className="mb-4 text-sm text-red-500">{err}</p>}
        
        {/* Summary stats */}
        {summary.length > 0 && (
          <div className="mb-6 grid grid-cols-3 gap-4">
            <div className="rounded-lg border border-black/10 bg-white p-4 dark:border-white/15 dark:bg-zinc-900">
              <div className="text-sm text-zinc-600 dark:text-zinc-400">Total Categories</div>
              <div className="text-2xl font-bold">{summary.length}</div>
            </div>
            <div className="rounded-lg border border-black/10 bg-white p-4 dark:border-white/15 dark:bg-zinc-900">
              <div className="text-sm text-zinc-600 dark:text-zinc-400">Total Purchases</div>
              <div className="text-2xl font-bold">
                {summary.reduce((acc, s) => acc + s.numPurchases, 0).toLocaleString()}
              </div>
            </div>
            <div className="rounded-lg border border-black/10 bg-white p-4 dark:border-white/15 dark:bg-zinc-900">
              <div className="text-sm text-zinc-600 dark:text-zinc-400">Total Revenue</div>
              <div className="text-2xl font-bold">
                ${summary.reduce((acc, s) => acc + s.totalAmount, 0).toLocaleString()}
              </div>
            </div>
          </div>
        )}

        {loading ? (
          <div className="text-center text-zinc-600 dark:text-zinc-400">Loading...</div>
        ) : (
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Left side: Bar chart - Sales per Category */}
            <div className="rounded-lg border border-black/10 bg-white p-6 dark:border-white/15 dark:bg-zinc-900">
              <h2 className="mb-4 text-xl font-semibold">Sales per Category</h2>
              {summary.length === 0 ? (
                <div className="flex h-64 items-center justify-center text-zinc-500">
                  No data available
                </div>
              ) : (
                <div className="flex h-64 items-end justify-around gap-4 px-4">
                  {summary.map((item, idx) => {
                    const heightPercent = (item.totalAmount / maxAmount) * 100
                    const heightPx = Math.max((heightPercent / 100) * 240, 10) // 240px = h-64 minus some padding
                    return (
                      <div key={idx} className="flex flex-col items-center gap-2" style={{ width: '80px' }}>
                        <div className="flex w-full flex-col items-center">
                          <div
                            className="w-16 rounded-t bg-blue-500 transition-all hover:bg-blue-600 cursor-pointer"
                            style={{ height: `${heightPx}px` }}
                            title={`$${item.totalAmount.toFixed(2)}\n${item.numPurchases} purchases`}
                          />
                        </div>
                        <span className="text-xs font-medium text-center">{item.category}</span>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

            {/* Right side: Category selector and line charts */}
            <div className="flex flex-col gap-6">
              {/* Category dropdown */}
              <div className="rounded-lg border border-black/10 bg-white p-4 dark:border-white/15 dark:bg-zinc-900">
                <label className="mb-2 block text-sm font-semibold">Category:</label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full rounded-md border border-black/10 bg-white px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-black dark:border-white/15 dark:bg-zinc-800 dark:focus:ring-white"
                >
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              {/* Line chart 1: Returns per Month */}
              {/* <div className="rounded-lg border border-black/10 bg-white p-6 dark:border-white/15 dark:bg-zinc-900">
                <h3 className="mb-4 text-sm font-semibold">Returns per Month ({selectedCategory})</h3>
                {series.length === 0 ? (
                  <div className="flex h-32 items-center justify-center text-zinc-500 text-sm">
                    No time series data available
                  </div>
                ) : series.length === 1 ? (
                  <div className="flex h-32 items-center justify-center text-zinc-500 text-sm">
                    Only one data point - need at least 2 points for a line chart
                  </div>
                ) : (
                  <div className="relative h-32 border-l border-b border-zinc-200 dark:border-zinc-700">
                    <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none">
                      <polyline
                        points={series
                          .map((point, idx) => {
                            const x = (idx / (series.length - 1)) * 100
                            const y = 100 - (point.numReturns / maxReturns) * 90
                            return `${x},${y}`
                          })
                          .join(' ')}
                        fill="none"
                        stroke="#ef4444"
                        strokeWidth="2"
                        vectorEffect="non-scaling-stroke"
                      />
                    </svg>
                    <div className="mt-2 text-xs text-zinc-500">
                      Total returns: {series.reduce((sum, p) => sum + p.numReturns, 0)}
                    </div>
                  </div>
                )}
              </div> */}

              {/* Line chart 2: Quantity over time */}
              <div className="rounded-lg border border-black/10 bg-white p-6 dark:border-white/15 dark:bg-zinc-900">
                <h3 className="mb-4 text-sm font-semibold">Quantity per Month ({selectedCategory})</h3>
                {series.length === 0 ? (
                  <div className="flex h-32 items-center justify-center text-zinc-500 text-sm">
                    No time series data available
                  </div>
                ) : series.length === 1 ? (
                  <div className="flex h-32 items-center justify-center text-zinc-500 text-sm">
                    Only one data point - need at least 2 points for a line chart
                  </div>
                ) : (
                  <div className="relative h-32 border-l border-b border-zinc-200 dark:border-zinc-700">
                    <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none">
                      <polyline
                        points={series
                          .map((point, idx) => {
                            const x = (idx / (series.length - 1)) * 100
                            const y = 100 - (point.totalQuantity / maxQuantity) * 90
                            return `${x},${y}`
                          })
                          .join(' ')}
                        fill="none"
                        stroke="#22c55e"
                        strokeWidth="2"
                        vectorEffect="non-scaling-stroke"
                      />
                    </svg>
                  </div>
                )}
              </div>

              {/* Line chart 3: Amount over time */}
              <div className="rounded-lg border border-black/10 bg-white p-6 dark:border-white/15 dark:bg-zinc-900">
                <h3 className="mb-4 text-sm font-semibold">Revenue per Month ({selectedCategory})</h3>
                {series.length === 0 ? (
                  <div className="flex h-32 items-center justify-center text-zinc-500 text-sm">
                    No time series data available
                  </div>
                ) : series.length === 1 ? (
                  <div className="flex h-32 items-center justify-center text-zinc-500 text-sm">
                    Only one data point - need at least 2 points for a line chart
                  </div>
                ) : (
                  <div className="relative h-32 border-l border-b border-zinc-200 dark:border-zinc-700">
                    <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none">
                      <polyline
                        points={series
                          .map((point, idx) => {
                            const x = (idx / (series.length - 1)) * 100
                            const y = 100 - (point.totalAmount / maxSeriesAmount) * 90
                            return `${x},${y}`
                          })
                          .join(' ')}
                        fill="none"
                        stroke="#a855f7"
                        strokeWidth="2"
                        vectorEffect="non-scaling-stroke"
                      />
                    </svg>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
