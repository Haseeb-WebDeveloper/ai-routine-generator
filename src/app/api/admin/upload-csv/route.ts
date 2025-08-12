import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import Papa from 'papaparse'
import { UserCreateData } from '@/types/admin'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    if (!file.name.endsWith('.csv')) {
      return NextResponse.json({ error: 'File must be a CSV' }, { status: 400 })
    }

    const text = await file.text()
    
    // Parse CSV directly without Promise wrapper
    const results = Papa.parse(text, {
      header: true,
      skipEmptyLines: true
    })

    if (results.errors && results.errors.length > 0) {
      return NextResponse.json({ 
        error: `CSV parsing error: ${results.errors[0].message}` 
      }, { status: 400 })
    }

    const users: UserCreateData[] = []
    
    // Extract users from CSV
    results.data.forEach((row: any) => {
      // Look for name and email columns (case insensitive)
      const nameKey = Object.keys(row).find(key => 
        key.toLowerCase().includes('name')
      )
      const emailKey = Object.keys(row).find(key => 
        key.toLowerCase().includes('email')
      )
      
      if (nameKey && emailKey && row[nameKey] && row[emailKey]) {
        const name = row[nameKey].trim()
        const email = row[emailKey].trim()
        
        if (name && email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
          users.push({ name, email })
        }
      }
    })

    if (users.length === 0) {
      return NextResponse.json({ 
        error: 'No valid users found in CSV. Please ensure the CSV has "name" and "email" columns with valid data.' 
      }, { status: 400 })
    }

    // Check for existing emails
    const existingUsers = await prisma.userEmail.findMany({
      where: {
        email: {
          in: users.map(u => u.email)
        }
      },
      select: {
        email: true
      }
    })

    const existingEmails = existingUsers.map(user => user.email)
    const newUsers = users.filter(user => !existingEmails.includes(user.email))

    if (newUsers.length === 0) {
      return NextResponse.json({
        message: 'All users already exist',
        existing: existingEmails.length
      })
    }

    const insertedUsers: any[] = []
    const errors: string[] = []

    // Process each new user
    for (const userData of newUsers) {
      try {
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
      message: 'CSV processed successfully',
      added: insertedUsers.length,
      existing: existingEmails.length,
      total: users.length,
      users: insertedUsers,
      errors: errors.length > 0 ? errors : undefined
    })
  } catch (error) {
    console.error('Error processing CSV:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
