// app/api/products/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

type PurchaseRow = {
  purchDate: string        // date
  quantity: number
  amount: number
  category: string | null
}

export async function GET(req: NextRequest) {
  const url = new URL(req.url)
  const category = url.searchParams.get('category')?.trim() || ''

  // Only grab the columns we need for the dashboard
  let query = supabase
    .from('purchase')
    .select('purchdate, quantity, amount, category')

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

  // If a category is specified: group by date for that category
  const byDate: Record<
    string,
    { totalQuantity: number; totalAmount: number }
  > = {}

  for (const row of rows) {
    const dateKey = row.purchDate // assuming it's already 'YYYY-MM-DD'
    if (!byDate[dateKey]) {
      byDate[dateKey] = { totalQuantity: 0, totalAmount: 0 }
    }
    byDate[dateKey].totalQuantity += row.quantity ?? 0
    byDate[dateKey].totalAmount += Number(row.amount ?? 0)
  }

  const series = Object.entries(byDate)
    .map(([date, agg]) => ({ date, ...agg }))
    .sort((a, b) => a.date.localeCompare(b.date))

  return NextResponse.json({ category, series })
}
