import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { UserEmail } from '@/types/admin'

export async function GET() {
  try {
    const { data: users, error } = await supabase
      .from('user_emails')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ users })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { emails } = await request.json()

    if (!emails || !Array.isArray(emails)) {
      return NextResponse.json({ error: 'Emails array is required' }, { status: 400 })
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    const validEmails = emails.filter((email: string) => emailRegex.test(email))
    
    if (validEmails.length === 0) {
      return NextResponse.json({ error: 'No valid emails provided' }, { status: 400 })
    }

    // Check for existing emails
    const { data: existingUsers } = await supabase
      .from('user_emails')
      .select('email')
      .in('email', validEmails)

    const existingEmails = existingUsers?.map(user => user.email) || []
    const newEmails = validEmails.filter(email => !existingEmails.includes(email))

    if (newEmails.length === 0) {
      return NextResponse.json({ 
        message: 'All emails already exist',
        existing: existingEmails.length
      })
    }

    // Generate unique links for new emails
    const usersToInsert = newEmails.map((email: string) => ({
      email,
      is_active: true,
      quiz_completed: false,
      unique_link: `${process.env.NEXT_PUBLIC_APP_URL}/quiz?email=${encodeURIComponent(email)}&token=${btoa(email + Date.now())}`
    }))

    const { data: insertedUsers, error } = await supabase
      .from('user_emails')
      .insert(usersToInsert)
      .select()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({
      message: 'Users added successfully',
      added: insertedUsers?.length || 0,
      existing: existingEmails.length,
      users: insertedUsers
    })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
