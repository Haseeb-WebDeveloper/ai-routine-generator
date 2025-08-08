import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import Papa from 'papaparse'

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
    
    return new Promise((resolve, reject) => {
      Papa.parse(text, {
        header: true,
        skipEmptyLines: true,
        complete: async (results) => {
          try {
            const emails: string[] = []
            
            // Extract emails from CSV
            results.data.forEach((row: any) => {
              // Look for email column (case insensitive)
              const emailKey = Object.keys(row).find(key => 
                key.toLowerCase().includes('email')
              )
              
              if (emailKey && row[emailKey]) {
                const email = row[emailKey].trim()
                if (email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
                  emails.push(email)
                }
              }
            })

            if (emails.length === 0) {
              resolve(NextResponse.json({ 
                error: 'No valid emails found in CSV' 
              }, { status: 400 }))
              return
            }

            // Check for existing emails
            const { data: existingUsers } = await supabase
              .from('user_emails')
              .select('email')
              .in('email', emails)

            const existingEmails = existingUsers?.map(user => user.email) || []
            const newEmails = emails.filter(email => !existingEmails.includes(email))

            if (newEmails.length === 0) {
              resolve(NextResponse.json({
                message: 'All emails already exist',
                existing: existingEmails.length
              }))
              return
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
              resolve(NextResponse.json({ error: error.message }, { status: 500 }))
              return
            }

            resolve(NextResponse.json({
              message: 'CSV processed successfully',
              added: insertedUsers?.length || 0,
              existing: existingEmails.length,
              total: emails.length,
              users: insertedUsers
            }))
          } catch (error) {
            resolve(NextResponse.json({ error: 'Internal server error' }, { status: 500 }))
          }
        },
        error: (error) => {
          resolve(NextResponse.json({ 
            error: `CSV parsing error: ${error.message}` 
          }, { status: 400 }))
        }
      })
    })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
