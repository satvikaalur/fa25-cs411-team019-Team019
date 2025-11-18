// app/api/products/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

type PurchaseRow = {
  purchdate: string        
  quantity: number
  amount: number
  category: string | null
  purchaseId: number
}

type ReturnRow = {
  returnDate: string
  purchaseId: number
}

export async function GET(req: NextRequest) {
  const url = new URL(req.url)
  const category = url.searchParams.get('category')?.trim() || ''

  // Only grab the columns we need for the dashboard
  let query = supabase
    .from('purchase')
    .select('purchaseid, purchdate, quantity, amount, category')

  if (category) {
    query = query.eq('category', category)
  }

  const { data, error } = await query

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }

  const rows = (data ?? []) as PurchaseRow[]

  // If no specific category: return summary across all categories
  if (!category) {
    const byCategory: Record<
      string,
      { numPurchases: number; totalQuantity: number; totalAmount: number }
    > = {}

    for (const row of rows) {
      const cat = row.category ?? 'Uncategorized'
      if (!byCategory[cat]) {
        byCategory[cat] = {
          numPurchases: 0,
          totalQuantity: 0,
          totalAmount: 0,
        }
      }
      byCategory[cat].numPurchases += 1
      byCategory[cat].totalQuantity += row.quantity ?? 0
      byCategory[cat].totalAmount += Number(row.amount ?? 0)
    }

    const categories = Object.keys(byCategory)
    const summaryByCategory = categories.map((cat) => ({
      category: cat,
      ...byCategory[cat],
    }))

    return NextResponse.json({ categories, summaryByCategory })
  }

  // If a category is specified: group by MONTH for that category
  const byMonth: Record<
    string,
    { totalQuantity: number; totalAmount: number }
  > = {}

  for (const row of rows) {
    // Extract year-month from the date (YYYY-MM-DD -> YYYY-MM)
    const monthKey = row.purchdate.substring(0, 7) // Takes 'YYYY-MM' part only
    if (!byMonth[monthKey]) {
      byMonth[monthKey] = { totalQuantity: 0, totalAmount: 0 }
    }
    byMonth[monthKey].totalQuantity += row.quantity ?? 0
    byMonth[monthKey].totalAmount += Number(row.amount ?? 0)
  }

  // Fetch returns data for this category
  const { data: returnsData } = await supabase
    .from('Returns')
    .select('returnDate, purchaseId')
  
  const returnRows = (returnsData ?? []) as ReturnRow[]
  
  // Get purchase IDs for this category
  const categoryPurchaseIds = new Set(rows.map(r => r.purchaseId))
  
  // Count returns by month for this category
  const returnsByMonth: Record<string, number> = {}
  for (const ret of returnRows) {
    if (categoryPurchaseIds.has(ret.purchaseId)) {
      const monthKey = ret.returnDate.substring(0, 7)
      returnsByMonth[monthKey] = (returnsByMonth[monthKey] || 0) + 1
    }
  }

  const series = Object.entries(byMonth)
    .map(([month, agg]) => ({ 
      month, 
      totalQuantity: agg.totalQuantity,
      totalAmount: agg.totalAmount,
      numReturns: returnsByMonth[month] || 0
    }))
    .sort((a, b) => a.month.localeCompare(b.month))

  return NextResponse.json({ category, series })
}
