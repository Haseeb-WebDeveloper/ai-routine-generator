import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { User, UserDTO, UserCreateData } from '@/types/admin'
import { supabaseAdmin } from '@/lib/supabase'
import { generateRandomPassword } from '@/lib/utils'

export async function GET() {
  try {
    const users = await prisma.user.findMany({
      orderBy: {
        createdAt: 'desc'
      }
    })

    // Transform the data to match frontend expectations
    const transformedUsers: UserDTO[] = users.map((user: User) => ({
      id: user.id,
      email: user.email,
      name: user.name,
      is_active: user.isActive, // Convert camelCase to snake_case
      quiz_completed: user.quizCompleted, // Convert camelCase to snake_case
      role: user.role,
      created_at: user.createdAt.toISOString(), // Convert Date to string
      updated_at: user.updatedAt.toISOString() // Convert Date to string
    }))

    return NextResponse.json({ users: transformedUsers })
  } catch (error) {
    console.error('Error fetching users:', error)
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
    const existingUsers = await prisma.user.findMany({
      where: {
        email: {
          in: validUsers.map(u => u.email)
        }
      },
      select: {
        email: true
      }
    })

    console.log('existingUsers', existingUsers)

    const existingEmails = existingUsers.map((user: { email: string }) => user.email)
    const newUsers = validUsers.filter(user => !existingEmails.includes(user.email))

    if (newUsers.length === 0) {
      return NextResponse.json({ 
        message: 'All users already exist',
        existing: existingEmails.length
      })
    }

    const insertedUsers: UserDTO[] = []
    const errors: string[] = []

    // Process each new user
    for (const userData of newUsers) {
      try {
        console.log('Creating user:', userData)
        
        // Generate a random password for the user
        const randomPassword = generateRandomPassword()
        
        // 1. Check/Create user in Supabase Auth
        let authData;
        
        // First try to get existing user
        // Always try to create a new auth user
        const { data: newAuthData, error: authError } = await supabaseAdmin.auth.admin.createUser({
          email: userData.email,
          password: randomPassword,
          email_confirm: true,
          user_metadata: { name: userData.name }
        });

        if (authError) {
          if (authError.message.includes('already been registered')) {
            // If user exists, get their data
            const { data: { users }, error: listError } = await supabaseAdmin.auth.admin.listUsers();
            if (listError) {
              console.error('Error listing users:', listError);
              errors.push(`Failed to fetch existing user data for ${userData.email}`);
              continue;
            }
            
            const existingAuthUser = users.find(u => u.email === userData.email);
            if (!existingAuthUser) {
              console.error('Could not find existing user:', userData.email);
              errors.push(`Failed to find existing user data for ${userData.email}`);
              continue;
            }
            
            console.log('Found existing auth user:', existingAuthUser.email);
            authData = existingAuthUser;
          } else {
            console.error('Supabase Auth Error:', authError);
            errors.push(`Failed to create auth user for ${userData.email}: ${authError.message}`);
            continue;
          }
        } else {
          console.log('Created new auth user:', newAuthData.user.email);
          authData = newAuthData.user;
        }
        
        // 2. Create user in our database
        const user = await prisma.user.create({
          data: {
            id: authData.id, // Use Supabase Auth user ID
            email: userData.email,
            name: userData.name,
            isActive: true,
            quizCompleted: false,
            role: 'user'
          }
        })

        console.log('User created:', user)
        insertedUsers.push({
          id: user.id,
          email: user.email,
          name: user.name,
          is_active: user.isActive,
          quiz_completed: user.quizCompleted,
          role: user.role,
          created_at: user.createdAt.toISOString(),
          updated_at: user.updatedAt.toISOString()
        })

      } catch (error) {
        console.error('Error creating user:', error)
        // Check if it's a unique constraint violation
        if (error instanceof Error && error.message.includes('Unique constraint')) {
          console.log('User already exists in database:', userData.email)
          // Try to fetch the existing user
          const existingUser = await prisma.user.findUnique({
            where: { email: userData.email }
          })
          if (existingUser) {
            insertedUsers.push({
              id: existingUser.id,
              email: existingUser.email,
              name: existingUser.name || '',
              is_active: existingUser.isActive,
              quiz_completed: existingUser.quizCompleted,
              role: existingUser.role || 'user',
              created_at: existingUser.createdAt.toISOString(),
              updated_at: existingUser.updatedAt.toISOString()
            })
            continue
          }
        }
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