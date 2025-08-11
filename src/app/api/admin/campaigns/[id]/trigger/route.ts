import { NextRequest, NextResponse } from 'next/server'
import { supabase, supabaseAdmin } from '@/lib/supabase'
import EmailTemplates from '@/components/admin/EmailTemplates'

// Klaviyo API configuration
// const KLAVIYO_API_KEY = process.env.KLAVIYO_API_KEY
// const KLAVIYO_API_URL = 'https://a.klaviyo.com/api/v2'
// const KLAVIYO_LIST_ID = process.env.KLAVIYO_LIST_ID

// Simple working Klaviyo integration
const KLAVIYO_API_KEY = process.env.KLAVIYO_API_KEY
const KLAVIYO_API_URL = 'https://a.klaviyo.com/api'
const KLAVIYO_LIST_ID = process.env.KLAVIYO_LIST_ID
async function sendEmailViaKlaviyo(to: string, subject: string, content: string, name?: string) {
  if (!KLAVIYO_API_KEY) {
    throw new Error('Klaviyo API key not configured')
  }

  if (!KLAVIYO_LIST_ID) {
    throw new Error('Klaviyo List ID not configured')
  }

  console.log('Using Klaviyo API Key (first 10 chars):', KLAVIYO_API_KEY.substring(0, 10))
  console.log('Using List ID:', KLAVIYO_LIST_ID)

  try {
    let profileId: string

    // Step 1: Try to create profile, or get existing one
    const profileData = {
      data: {
        type: "profile",
        attributes: {
          email: to,
          first_name: name || '',
          last_name: "",
          properties: {}
        }
      }
    }

    console.log('Creating/updating profile...')

    const profileResponse = await fetch(`${KLAVIYO_API_URL}/profiles/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Klaviyo-API-Key ${KLAVIYO_API_KEY}`,
        'revision': '2024-10-15'
      },
      body: JSON.stringify(profileData)
    })

    if (profileResponse.status === 409) {
      // Profile already exists, extract the ID from the error
      const errorData = await profileResponse.json()
      profileId = errorData.errors[0].meta.duplicate_profile_id
      console.log('Profile already exists, using existing ID:', profileId)
      
      // Optionally update the existing profile
      const updateData = {
        data: {
          type: "profile",
          id: profileId,
          attributes: {
            first_name: name || '',
            properties: {
              last_updated: new Date().toISOString()
            }
          }
        }
      }

      const updateResponse = await fetch(`${KLAVIYO_API_URL}/profiles/${profileId}/`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Klaviyo-API-Key ${KLAVIYO_API_KEY}`,
          'revision': '2024-10-15'
        },
        body: JSON.stringify(updateData)
      })

      if (!updateResponse.ok) {
        console.warn('Failed to update existing profile, but continuing...')
      } else {
        console.log('Existing profile updated successfully')
      }

    } else if (profileResponse.ok) {
      // New profile created successfully
      const profileResult = await profileResponse.json()
      profileId = profileResult.data.id
      console.log('New profile created:', profileId)
    } else {
      // Some other error
      const errorData = await profileResponse.text()
      console.error('Klaviyo profile error:', errorData)
      throw new Error(`Failed to handle profile: ${profileResponse.status} - ${errorData}`)
    }

    // Step 2: Add profile to list (if not already there)
    console.log('Adding profile to list...')
    
    const listMembershipData = {
      data: [
        {
          type: "profile",
          id: profileId
        }
      ]
    }

    const listResponse = await fetch(`${KLAVIYO_API_URL}/lists/${KLAVIYO_LIST_ID}/relationships/profiles/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Klaviyo-API-Key ${KLAVIYO_API_KEY}`,
        'revision': '2024-10-15'
      },
      body: JSON.stringify(listMembershipData)
    })

    if (!listResponse.ok) {
      const errorData = await listResponse.text()
      console.warn('List membership error (may already be in list):', errorData)
    } else {
      console.log('Profile added to list successfully')
    }

    // Step 3: Create event to trigger email
    console.log('Creating event to trigger email...')

    const eventData = {
      data: {
        type: "event",
        attributes: {
          properties: {
            subject: subject,
            content: content,
            quiz_link: content.includes('quiz') ? 'true' : 'false',
            timestamp: new Date().toISOString(),
            email_type: 'quiz_invitation'
          },
          metric: {
            data: {
              type: "metric",
              attributes: {
                name: "Quiz Email Triggered"
              }
            }
          },
          profile: {
            data: {
              type: "profile",
              id: profileId
            }
          }
        }
      }
    }

    const eventResponse = await fetch(`${KLAVIYO_API_URL}/events/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Klaviyo-API-Key ${KLAVIYO_API_KEY}`,
        'revision': '2024-10-15'
      },
      body: JSON.stringify(eventData)
    })

    console.log('Event response status:', eventResponse.status)
    console.log('Event response headers:', Object.fromEntries(eventResponse.headers.entries()))

    if (!eventResponse.ok) {
      const errorData = await eventResponse.text()
      console.error('Klaviyo event creation error:', errorData)
      throw new Error(`Failed to create event: ${eventResponse.status} - ${errorData}`)
    }

    // Check if response has content before parsing JSON
    const responseText = await eventResponse.text()
    console.log('Event response text:', responseText)
    
    if (!responseText) {
      console.log('Event created successfully (empty response)')
      return {
        success: true,
        profileId: profileId,
        eventId: 'created_but_no_id_returned',
        message: 'Email event triggered successfully (empty response from Klaviyo)'
      }
    }

    const eventResult = JSON.parse(responseText)
    console.log('Event created successfully:', eventResult.data?.id || 'no ID in response')

    return {
      success: true,
      profileId: profileId,
      eventId: eventResult.data?.id || 'created_successfully',
      message: 'Email event triggered successfully'
    }

  } catch (error) {
    console.error('Klaviyo API error:', error)
    throw error
  }
}

// Alternative: Skip profile creation and just create the event
async function sendEmailViaKlaviyoSimple(to: string, subject: string, content: string, name?: string) {
  try {
    console.log('Creating event directly without profile management...')

    const eventData = {
      data: {
        type: "event",
        attributes: {
          properties: {
            subject: subject,
            content: content,
            quiz_link: content.includes('quiz') ? 'true' : 'false',
            timestamp: new Date().toISOString(),
            email_type: 'quiz_invitation'
          },
          metric: {
            data: {
              type: "metric",
              attributes: {
                name: "Quiz Email Triggered"
              }
            }
          },
          profile: {
            data: {
              type: "profile",
              attributes: {
                email: to,
                first_name: name || ''
              }
            }
          }
        }
      }
    }

    const eventResponse = await fetch(`${KLAVIYO_API_URL}/events/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Klaviyo-API-Key ${KLAVIYO_API_KEY}`,
        'revision': '2024-10-15'
      },
      body: JSON.stringify(eventData)
    })

    if (!eventResponse.ok) {
      const errorData = await eventResponse.text()
      console.error('Klaviyo event creation error:', errorData)
      throw new Error(`Failed to create event: ${eventResponse.status} - ${errorData}`)
    }

    const eventResult = await eventResponse.json()
    console.log('Event created successfully:', eventResult.data.id)

    return {
      success: true,
      eventId: eventResult.data.id,
      message: 'Email event triggered successfully (profile handled automatically)'
    }

  } catch (error) {
    console.error('Klaviyo API error:', error)
    throw error
  }
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

        // Send email via Klaviyo
        await sendEmailViaKlaviyo(user.email, emailSubject, emailContent, user.name)
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
