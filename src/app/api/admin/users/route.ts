import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { UserEmail, UserCreateData } from '@/types/admin'
import bcrypt from 'bcryptjs'

export async function GET() {
  try {
    const users = await prisma.userEmail.findMany({
      orderBy: {
        createdAt: 'desc'
      }
    })

    // Transform the data to match frontend expectations
    const transformedUsers = users.map(user => ({
      id: user.id,
      email: user.email,
      name: user.name,
      is_active: user.isActive, // Convert camelCase to snake_case
      quiz_completed: user.quizCompleted, // Convert camelCase to snake_case
      unique_link: user.uniqueLink, // Convert camelCase to snake_case
      user_id: user.userId, // Convert camelCase to snake_case
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
    const existingUsers = await prisma.userEmail.findMany({
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

    const existingEmails = existingUsers.map(user => user.email)
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

        // Generate secure token for direct quiz access
        const timestamp = Date.now()
        const secureToken = btoa(`${userData.email}:${timestamp}:${Math.random().toString(36)}`)
        
        // Create user record directly with Prisma
        const userEmail = await prisma.userEmail.create({
          data: {
            email: userData.email,
            name: userData.name,
            isActive: true,
            quizCompleted: false,
            uniqueLink: `${process.env.NEXT_PUBLIC_APP_URL}/quiz?email=${encodeURIComponent(userData.email)}&token=${secureToken}`,
            role: 'user' // Default role for new users
          }
        })

        console.log('userEmail', userEmail)
        insertedUsers.push({
          ...userEmail,
          is_active: userEmail.isActive,
          quiz_completed: userEmail.quizCompleted,
          created_at: userEmail.createdAt.toISOString(),
          updated_at: userEmail.updatedAt.toISOString()
        })

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
