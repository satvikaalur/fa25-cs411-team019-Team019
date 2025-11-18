// Work on Employee backend logic here
import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function GET(req: Request) {
  const q = new URL(req.url).searchParams.get('q')?.trim()
  let query = supabase.from('employee').select('*')
  if (q && q.length) query = query.or(`empname.ilike.%${q}%`)
  const { data, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json(data)
}

export async function PATCH(req: Request) {
  try {
    const body = await req.json()
    const { empname, newRole } = body

    if (!empname || !newRole) {
      return NextResponse.json({ error: 'Missing employee name or newRole' }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('employee')
      .update({ emptitle: newRole })
      .eq('empname', empname)
      .select()

    if (error) return NextResponse.json({ error: error.message }, { status: 400 })

    return NextResponse.json({ success: true, updated: data })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
