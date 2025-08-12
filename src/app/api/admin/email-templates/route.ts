import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const templates = await prisma.emailTemplate.findMany({
      orderBy: {
        createdAt: 'desc'
      }
    })

    // Transform the data to match frontend expectations
    const transformedTemplates = templates.map(template => ({
      id: template.id,
      name: template.name,
      subject: template.subject,
      content: template.content,
      created_at: template.createdAt.toISOString(), // Convert Date to string
      updated_at: template.updatedAt.toISOString() // Convert Date to string
    }))

    return NextResponse.json({ templates: transformedTemplates })
  } catch (error) {
    console.error('Error fetching email templates:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { name, subject, content } = await request.json()

    if (!name || !subject || !content) {
      return NextResponse.json({ 
        error: 'Name, subject, and content are required' 
      }, { status: 400 })
    }

    const template = await prisma.emailTemplate.create({
      data: {
        name,
        subject,
        content
      }
    })

    return NextResponse.json({ template })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
