import { NextRequest, NextResponse } from 'next/server'
import { supabase, supabaseAdmin } from '@/lib/supabase'
import EmailTemplates from '@/components/admin/EmailTemplates'

// Brevo API configuration
const BREVO_API_KEY = process.env.BREVO_API_KEY
const BREVO_API_URL = 'https://api.brevo.com/v3/smtp/email'


async function sendEmailViaBrevo(to: string, subject: string, content: string) {
  if (!BREVO_API_KEY) {
    throw new Error('Brevo API key not configured')
  }

  // Use the correct Brevo API endpoint and structure
  const response = await fetch(BREVO_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'api-key': BREVO_API_KEY,
      'Accept': 'application/json',
    },
    body: JSON.stringify({
      to: [{ email: to }],
      sender: {
        name: 'AI Routine Team',
        email: 'web.dev.haseeb@gmail.com' // Use your verified sender email
      },
      subject: subject,
      htmlContent: content,
      // Add additional required fields for Brevo
      replyTo: {
        email: 'web.dev.haseeb@gmail.com',
        name: 'AI Routine Team'
      }
    }),
  })

  console.log('Brevo Response Status:', response.status)
  console.log('Brevo Response Headers:', Object.fromEntries(response.headers.entries()))

  if (!response.ok) {
    let errorMessage = `HTTP ${response.status}: ${response.statusText}`
    try {
      const errorData = await response.json()
      console.log('Brevo Error Data:', errorData)
      errorMessage = errorData.message || errorData.error || errorMessage
    } catch (e) {
      console.log('Could not parse error response')
    }
    throw new Error(`Brevo API error: ${errorMessage}`)
  }

  const result = await response.json()
  console.log('Brevo Success Response:', result)
  return result
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Check required environment variables
    if (!process.env.NEXT_PUBLIC_APP_URL) {
      return NextResponse.json({ 
        error: 'NEXT_PUBLIC_APP_URL environment variable is not configured' 
      }, { status: 500 })
    }

    const { id } = await params

    // Get campaign details
    const { data: campaign, error: campaignError } = await supabase
      .from('campaigns')
      .select('*')
      .eq('id', id)
      .single()

    if (campaignError || !campaign) {
      return NextResponse.json({ error: 'Campaign not found' }, { status: 404 })
    }

    if (campaign.status !== 'draft') {
      return NextResponse.json({ 
        error: `Campaign cannot be triggered. Current status: ${campaign.status}. Only campaigns in 'draft' status can be triggered.` 
      }, { status: 400 })
    }

    // Get email template
    const { data: template, error: templateError } = await supabase
      .from('email_templates')
      .select('*')
      .eq('id', campaign.template_id)
      .single()

    if (templateError || !template) {
      return NextResponse.json({ error: 'Email template not found' }, { status: 404 })
    }

    // Get user details for unique links
    const { data: users, error: usersError } = await supabase
      .from('user_emails')
      .select('*')
      .in('email', campaign.selected_users)

    if (usersError) {
      return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 })
    }

    let sentCount = 0
    let failedCount = 0
    const errors: string[] = []

    // Send emails to each recipient
    for (const user of users) {
      try {
        // Get user's auth details
        const { data: { user: authUser }, error: authError } = await supabaseAdmin.auth.admin.getUserById(user.user_id)

        // Generate secure token for direct quiz access with authentication
        const timestamp = Date.now()
        const secureToken = btoa(`${user.email}:${timestamp}:${Math.random().toString(36)}`)
        
        // Create direct link to quiz (no need for validation)
        const directQuizLink = `${process.env.NEXT_PUBLIC_APP_URL}/quiz?email=${encodeURIComponent(user.email)}&token=${secureToken}`

        console.log(`Sending email to: ${user.email}`)
        console.log(`Direct quiz link: ${directQuizLink}`)
        
        // Replace template variables
        let emailContent = template.content.replace(/\{\{LINK\}\}/g, directQuizLink)
        emailContent = emailContent.replace(/\{\{name\}\}/g, user.name)
        let emailSubject = template.subject

        console.log(`Email subject: ${emailSubject}`)
        console.log(`Email content length: ${emailContent.length}`)

        // Send email via Brevo
        await sendEmailViaBrevo(user.email, emailSubject, emailContent)
        sentCount++
        console.log(`✅ Email sent successfully to: ${user.email}`)

        // Update user's unique link in database
        await supabase
          .from('user_emails')
          .update({ unique_link: directQuizLink })
          .eq('id', user.id)

      } catch (error) {
        failedCount++
        const errorMessage = error instanceof Error ? error.message : 'Unknown error'
        console.error(`❌ Failed to send email to ${user.email}:`, errorMessage)
        errors.push(`Failed to send to ${user.email}: ${errorMessage}`)
      }
    }

    // Update campaign stats but keep status as 'draft' so it can be triggered again
    const { error: updateError } = await supabase
      .from('campaigns')
      .update({
        // Keep status as 'draft' so campaign can be triggered multiple times
        status: 'draft',
        sent_at: new Date().toISOString(),
        stats: {
          total_recipients: campaign.selected_users.length,
          sent: sentCount,
          delivered: sentCount, // Assuming sent = delivered for now
          opened: 0,
          clicked: 0,
          failed: failedCount
        },
        updated_at: new Date().toISOString()
      })
      .eq('id', id)

    if (updateError) {
      console.error('Failed to update campaign stats:', updateError)
    }

    return NextResponse.json({
      message: 'Campaign triggered successfully',
      sent: sentCount,
      failed: failedCount,
      errors: errors.length > 0 ? errors : undefined
    })

  } catch (error) {
    console.error('Campaign trigger error:', error)
    return NextResponse.json({ 
      error: 'Failed to trigger campaign' 
    }, { status: 500 })
  }
}
