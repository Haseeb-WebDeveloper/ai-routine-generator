import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const campaigns = await prisma.campaign.findMany({
      orderBy: {
        createdAt: 'desc'
      },
      include: {
        template: true // Include template data
      }
    })

    // Transform the data to match frontend expectations
    const transformedCampaigns = campaigns.map(campaign => ({
      id: campaign.id,
      name: campaign.name,
      description: campaign.description,
      template_id: campaign.templateId, // Convert camelCase to snake_case
      selected_users: campaign.selectedUsers, // Convert camelCase to snake_case
      status: campaign.status,
      scheduled_at: campaign.scheduledAt?.toISOString(), // Convert Date to string
      sent_at: campaign.sentAt?.toISOString(), // Convert Date to string
      created_at: campaign.createdAt.toISOString(), // Convert Date to string
      updated_at: campaign.updatedAt.toISOString(), // Convert Date to string
      stats: campaign.stats
    }))

    return NextResponse.json({ campaigns: transformedCampaigns })
  } catch (error) {
    console.error('Error fetching campaigns:', error)
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

    const campaign = await prisma.campaign.create({
      data: {
        name,
        description,
        templateId: template_id,
        selectedUsers: selected_users,
        status: 'draft',
        scheduledAt: scheduled_at || null
      }
    })

    return NextResponse.json({ campaign })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
