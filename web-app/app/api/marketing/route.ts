import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function GET(req: NextRequest) {
  // Fetch all email lists
  const { data, error } = await supabase
    .from('EmailList')
    .select('listId, listTitle, createdDate')
    .order('createdDate', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { action } = body

  if (action === 'refreshAll') {
    const { error } = await supabase.rpc('RefreshAllEmailLists')
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ message: 'All lists refreshed successfully' })
  }

  if (action === 'createUserList') {
    const { listTitle, minDate, minSpend, categories, hasReturned } = body
    if (!listTitle) return NextResponse.json({ error: 'listTitle is required' }, { status: 400 })

    const { error } = await supabase.rpc('CreateOrUpdateUserList', {
      p_listTitle: listTitle,
      p_minDate: minDate || null,
      p_minSpend: minSpend || null,
      p_categories: categories || null,
      p_hasReturned: hasReturned ?? null,
    })

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ message: 'User list created/updated successfully' })
  }

  if (action === 'getCustomersByList') {
    const { listId } = body
    if (!listId) return NextResponse.json({ error: 'listId is required' }, { status: 400 })

    const { data, error } = await supabase
      .from('CustomerEmailList')
      .select('Customer(custName,email)')
      .eq('listId', listId)

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    const customers = data.map((row: any) => row.Customer)
    return NextResponse.json(customers)
  }

  return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
}