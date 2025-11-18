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
                <div className="flex flex-col gap-4">
                  <div className="flex h-64 items-end justify-around gap-4 px-4">
                    {summary.map((item, idx) => {
                      const heightPercent = (item.totalAmount / maxAmount) * 100
                      const heightPx = Math.max((heightPercent / 100) * 200, 20)
                      return (
                        <div key={idx} className="relative flex flex-col items-center gap-2" style={{ width: '80px' }}>
                          {/* Value label above bar */}
                          <div className="mb-1 text-xs font-semibold text-blue-600 dark:text-blue-400">
                            ${(item.totalAmount / 1000).toFixed(0)}k
                          </div>
                          <div className="flex w-full flex-col items-center">
                            <div
                              className="w-16 rounded-t bg-blue-500 transition-all hover:bg-blue-600 cursor-pointer relative group"
                              style={{ height: `${heightPx}px` }}
                            >
                              {/* Tooltip on hover */}
                              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:block bg-black text-white text-xs rounded py-1 px-2 whitespace-nowrap z-10">
                                <div>${item.totalAmount.toLocaleString()}</div>
                                <div>{item.numPurchases} purchases</div>
                                <div>{item.totalQuantity} items</div>
                              </div>
                            </div>
                          </div>
                          <span className="text-xs font-medium text-center capitalize">{item.category}</span>
                        </div>
                      )
                    })}
                  </div>
                  {/* Y-axis label */}
                  <div className="text-xs text-zinc-500 text-center">Total Revenue ($)</div>
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
                  <div className="flex flex-col gap-3">
                    <div className="relative h-48 pl-10 pr-2">
                      {/* Y-axis label */}
                      <div className="absolute left-0 top-1/2 -translate-y-1/2 -rotate-90 text-xs font-medium text-zinc-600 dark:text-zinc-400 origin-center whitespace-nowrap">
                        Quantity
                      </div>
                      
                      {/* Y-axis values */}
                      <div className="absolute left-2 top-0 text-xs text-zinc-500">{maxQuantity}</div>
                      <div className="absolute left-2 bottom-0 text-xs text-zinc-500">0</div>
                      
                      <div className="h-full ml-6 border-l border-b border-zinc-300 dark:border-zinc-700 relative">
                        <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0">
                          {/* Horizontal grid lines */}
                          <line x1="0" y1="25" x2="100" y2="25" stroke="currentColor" strokeWidth="0.3" className="text-zinc-200 dark:text-zinc-800" vectorEffect="non-scaling-stroke" />
                          <line x1="0" y1="50" x2="100" y2="50" stroke="currentColor" strokeWidth="0.3" className="text-zinc-200 dark:text-zinc-800" vectorEffect="non-scaling-stroke" />
                          <line x1="0" y1="75" x2="100" y2="75" stroke="currentColor" strokeWidth="0.3" className="text-zinc-200 dark:text-zinc-800" vectorEffect="non-scaling-stroke" />
                          
                          {/* Area under the line */}
                          <polygon
                            points={`0,100 ${series
                              .map((point, idx) => {
                                const x = (idx / (series.length - 1)) * 100
                                const y = 100 - (point.totalQuantity / maxQuantity) * 90
                                return `${x},${y}`
                              })
                              .join(' ')} 100,100`}
                            fill="#22c55e"
                            fillOpacity="0.1"
                          />
                          
                          {/* Line */}
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
                          
                          {/* Data point dots - show only every 6th point to reduce clutter */}
                          {series.map((point, idx) => {
                            // Show first, last, and every 6th point
                            if (idx === 0 || idx === series.length - 1 || idx % 6 === 0) {
                              const x = (idx / (series.length - 1)) * 100
                              const y = 100 - (point.totalQuantity / maxQuantity) * 90
                              return (
                                <circle key={idx} cx={x} cy={y} r="1.5" fill="#22c55e" stroke="#fff" strokeWidth="1" vectorEffect="non-scaling-stroke" />
                              )
                            }
                            return null
                          })}
                        </svg>
                      </div>
                    </div>
                    
                    {/* X-axis labels */}
                    <div className="flex justify-between pl-16 pr-2 text-xs text-zinc-500">
                      <span>{series[0]?.month}</span>
                      {series.length > 2 && <span>{series[Math.floor(series.length / 2)]?.month}</span>}
                      <span>{series[series.length - 1]?.month}</span>
                    </div>
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
                  <div className="flex flex-col gap-3">
                    <div className="relative h-48 pl-12 pr-2">
                      {/* Y-axis label */}
                      <div className="absolute left-0 top-1/2 -translate-y-1/2 -rotate-90 text-xs font-medium text-zinc-600 dark:text-zinc-400 origin-center whitespace-nowrap">
                        Revenue ($)
                      </div>
                      
                      {/* Y-axis values */}
                      <div className="absolute left-2 top-0 text-xs text-zinc-500">${(maxSeriesAmount / 1000).toFixed(0)}k</div>
                      <div className="absolute left-2 bottom-0 text-xs text-zinc-500">$0</div>
                      
                      <div className="h-full ml-8 border-l border-b border-zinc-300 dark:border-zinc-700 relative">
                        <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0">
                          {/* Horizontal grid lines */}
                          <line x1="0" y1="25" x2="100" y2="25" stroke="currentColor" strokeWidth="0.3" className="text-zinc-200 dark:text-zinc-800" vectorEffect="non-scaling-stroke" />
                          <line x1="0" y1="50" x2="100" y2="50" stroke="currentColor" strokeWidth="0.3" className="text-zinc-200 dark:text-zinc-800" vectorEffect="non-scaling-stroke" />
                          <line x1="0" y1="75" x2="100" y2="75" stroke="currentColor" strokeWidth="0.3" className="text-zinc-200 dark:text-zinc-800" vectorEffect="non-scaling-stroke" />
                          
                          {/* Area under the line */}
                          <polygon
                            points={`0,100 ${series
                              .map((point, idx) => {
                                const x = (idx / (series.length - 1)) * 100
                                const y = 100 - (point.totalAmount / maxSeriesAmount) * 90
                                return `${x},${y}`
                              })
                              .join(' ')} 100,100`}
                            fill="#a855f7"
                            fillOpacity="0.1"
                          />
                          
                          {/* Line */}
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
                          
                          {/* Data point dots - show only every 6th point to reduce clutter */}
                          {series.map((point, idx) => {
                            // Show first, last, and every 6th point
                            if (idx === 0 || idx === series.length - 1 || idx % 6 === 0) {
                              const x = (idx / (series.length - 1)) * 100
                              const y = 100 - (point.totalAmount / maxSeriesAmount) * 90
                              return (
                                <circle key={idx} cx={x} cy={y} r="1.5" fill="#a855f7" stroke="#fff" strokeWidth="1" vectorEffect="non-scaling-stroke" />
                              )
                            }
                            return null
                          })}
                        </svg>
                      </div>
                    </div>
                    
                    {/* X-axis labels */}
                    <div className="flex justify-between pl-20 pr-2 text-xs text-zinc-500">
                      <span>{series[0]?.month}</span>
                      {series.length > 2 && <span>{series[Math.floor(series.length / 2)]?.month}</span>}
                      <span>{series[series.length - 1]?.month}</span>
                    </div>
                    
                    {/* Summary stats */}
                    <div className="mt-2 flex justify-around text-xs border-t border-zinc-200 dark:border-zinc-700 pt-3">
                      <div>
                        <div className="text-zinc-500">Total Revenue</div>
                        <div className="text-lg font-semibold text-purple-600 dark:text-purple-400">
                          ${(series.reduce((sum, p) => sum + p.totalAmount, 0) / 1000).toFixed(1)}k
                        </div>
                      </div>
                      <div>
                        <div className="text-zinc-500">Avg/Month</div>
                        <div className="text-lg font-semibold text-purple-600 dark:text-purple-400">
                          ${((series.reduce((sum, p) => sum + p.totalAmount, 0) / series.length) / 1000).toFixed(1)}k
                        </div>
                      </div>
                      <div>
                        <div className="text-zinc-500">Months</div>
                        <div className="text-lg font-semibold">{series.length}</div>
                      </div>
                    </div>
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
