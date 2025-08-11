import { NextRequest, NextResponse } from 'next/server'
import { supabase, supabaseAdmin } from '@/lib/supabase'
import { UserEmail, UserCreateData } from '@/types/admin'
import { createClient } from '@supabase/supabase-js'

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
    const { users } = await request.json()

    if (!users || !Array.isArray(users)) {
      return NextResponse.json({ error: 'Users array is required' }, { status: 400 })
    }

    // Validate input structure
    const validUsers = users.filter((user: UserCreateData) => 
      user.name && user.name.trim() !== '' && 
      user.email && user.email.trim() !== ''
    )
    
    if (validUsers.length === 0) {
      return NextResponse.json({ error: 'No valid users provided' }, { status: 400 })
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    const invalidEmails = validUsers.filter((user: UserCreateData) => !emailRegex.test(user.email))
    
    if (invalidEmails.length > 0) {
      return NextResponse.json({ 
        error: `Invalid email format: ${invalidEmails.map(u => u.email).join(', ')}` 
      }, { status: 400 })
    }

    console.log('validUsers', validUsers)

    // Check for existing emails
    const { data: existingUsers } = await supabase
      .from('user_emails')
      .select('email')
      .in('email', validUsers.map(u => u.email))

    console.log('existingUsers', existingUsers)

    const existingEmails = existingUsers?.map(user => user.email) || []
    const newUsers = validUsers.filter(user => !existingEmails.includes(user.email))

    if (newUsers.length === 0) {
      return NextResponse.json({ 
        message: 'All users already exist',
        existing: existingEmails.length
      })
    }

    const insertedUsers: UserEmail[] = []
    const errors: string[] = []

    // Process each new user
    for (const userData of newUsers) {
      try {

        console.log('userData', userData)

        // Generate a secure random password for the user
        const password = Math.random().toString(36).slice(-12) + Math.random().toString(36).slice(-12)
        
        // Create Supabase auth user
        const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.createUser({
          email: userData.email,
          password: password,
          email_confirm: true,
          user_metadata: {
            name: userData.name,
            full_name: userData.name
          }
        })

        console.log('authUser', authUser)
        if (authError) {
          console.log('authError', authError)
        }

        if (authError || !authUser.user) {
          errors.push(`Failed to create auth account for ${userData.email}: ${authError?.message}`)
          continue
        }

        // Generate secure token for direct quiz access
        const timestamp = Date.now()
        const secureToken = btoa(`${userData.email}:${timestamp}:${Math.random().toString(36)}`)
        
        // Create user_emails record
        const { data: userEmail, error: insertError } = await supabase
          .from('user_emails')
          .insert({
            email: userData.email,
            name: userData.name,
            is_active: true,
            quiz_completed: false,
            user_id: authUser.user.id,
            unique_link: `${process.env.NEXT_PUBLIC_APP_URL}/quiz?email=${encodeURIComponent(userData.email)}&token=${secureToken}`
          })
          .select()
          .single()

        console.log('userEmail', userEmail)

        if (insertError || !userEmail) {
          errors.push(`Failed to create user record for ${userData.email}: ${insertError?.message}`)
          // Clean up auth user if user_emails creation failed
          await supabaseAdmin.auth.admin.deleteUser(authUser.user.id)
          continue
        }

        insertedUsers.push(userEmail)

      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error'
        errors.push(`Failed to process ${userData.email}: ${errorMessage}`)
      }
    }

    if (insertedUsers.length === 0) {
      return NextResponse.json({ 
        error: 'Failed to create any users',
        details: errors
      }, { status: 500 })
    }

    return NextResponse.json({
      message: 'Users added successfully',
      added: insertedUsers.length,
      existing: existingEmails.length,
      users: insertedUsers,
      errors: errors.length > 0 ? errors : undefined
    })
  } catch (error) {
    console.error('Error creating users:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
