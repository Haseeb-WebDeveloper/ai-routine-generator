import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET() {
  try {
    const { data: campaigns, error } = await supabase
      .from('campaigns')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ campaigns })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { name, description, template_id, selected_users, scheduled_at } = await request.json()

    if (!name || !template_id || !selected_users || selected_users.length === 0) {
      return NextResponse.json({ 
        error: 'Name, template, and at least one recipient are required' 
      }, { status: 400 })
    }

    const { data: campaign, error } = await supabase
      .from('campaigns')
      .insert({
        name,
        description,
        template_id,
        selected_users,
        status: 'draft',
        scheduled_at: scheduled_at || null
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ campaign })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
