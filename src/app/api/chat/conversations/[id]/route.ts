import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createServerClient } from "@/lib/supabase";

// GET /api/chat/conversations/[id]
// Get a specific conversation by ID
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Get user session from Supabase
    const cookieHeader = req.headers.get('cookie');
    const supabase = createServerClient(cookieHeader);
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      console.error("Session error:", sessionError);
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }
    
    // If no authenticated user, return error
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: "User not authenticated" },
        { status: 401 }
      );
    }

    // Get user email from Supabase session
    const userEmail = session.user.email;
    
    if (!userEmail) {
      return NextResponse.json(
        { success: false, error: "User email not found" },
        { status: 400 }
      );
    }

    // Get conversation
    const conversation = await prisma.conversation.findUnique({
      where: {
        id: id,
        userEmail: userEmail, // Ensure user owns this conversation
      },
      include: {
        messages: {
          orderBy: {
            timestamp: "asc",
          },
        },
      },
    });

    if (!conversation) {
      return NextResponse.json(
        { success: false, error: "Conversation not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: conversation,
    });
  } catch (error: any) {
    console.error("Error fetching conversation:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// PUT /api/chat/conversations/[id]
// Update a conversation
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    // Get user session from Supabase
    const cookieHeader = req.headers.get('cookie');
    const supabase = createServerClient(cookieHeader);
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      console.error("Session error:", sessionError);
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }
    
    // If no authenticated user, return error
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: "User not authenticated" },
        { status: 401 }
      );
    }

    // Get user email from Supabase session
    const userEmail = session.user.email;
    
    if (!userEmail) {
      return NextResponse.json(
        { success: false, error: "User email not found" },
        { status: 400 }
      );
    }

    // Get conversation data from request
    const data = await req.json();
    const { title, messages } = data;

    // Check if conversation exists and belongs to user
    const existingConversation = await prisma.conversation.findUnique({
      where: {
        id: id,
        userEmail: userEmail,
      },
    });

    if (!existingConversation) {
      return NextResponse.json(
        { success: false, error: "Conversation not found" },
        { status: 404 }
      );
    }

    // Update conversation title if provided
    if (title !== undefined) {
      await prisma.conversation.update({
        where: { id: id },
        data: { title },
      });
    }

    // Update messages if provided
    if (messages && Array.isArray(messages)) {
      // Delete existing messages
      await prisma.chatMessage.deleteMany({
        where: { conversationId: id },
      });

      // Add new messages
      await prisma.$transaction(
        messages.map((message) =>
          prisma.chatMessage.create({
            data: {
              conversationId: id,
              role: message.role,
              content: message.content,
              metadata: message.metadata || {},
            },
          })
        )
      );
    }

    // Get updated conversation
    const updatedConversation = await prisma.conversation.findUnique({
      where: { id: id },
      include: {
        messages: {
          orderBy: {
            timestamp: "asc",
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      data: updatedConversation,
    });
  } catch (error: any) {
    console.error("Error updating conversation:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// DELETE /api/chat/conversations/[id]
// Delete a conversation
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Get user session from Supabase
    const cookieHeader = req.headers.get('cookie');
    const supabase = createServerClient(cookieHeader);
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      console.error("Session error:", sessionError);
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }
    
    // If no authenticated user, return error
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: "User not authenticated" },
        { status: 401 }
      );
    }

    // Get user email from Supabase session
    const userEmail = session.user.email;
    
    if (!userEmail) {
      return NextResponse.json(
        { success: false, error: "User email not found" },
        { status: 400 }
      );
    }

    // Check if conversation exists and belongs to user
    const existingConversation = await prisma.conversation.findUnique({
      where: {
        id: id,
        userEmail: userEmail,
      },
    });

    if (!existingConversation) {
      return NextResponse.json(
        { success: false, error: "Conversation not found" },
        { status: 404 }
      );
    }

    // Delete conversation (messages will be deleted via cascade)
    await prisma.conversation.delete({
      where: { id: id },
    });

    return NextResponse.json({
      success: true,
      data: { id: id },
    });
  } catch (error: any) {
    console.error("Error deleting conversation:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}