import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { supabase } from "@/lib/supabase";

// POST /api/chat/conversations/[id]/messages
// Add a new message to a conversation
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Get user session from Supabase
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

    // Get user email from Supabase user
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
        id: params.id,
        userEmail: userEmail,
      },
    });

    if (!existingConversation) {
      return NextResponse.json(
        { success: false, error: "Conversation not found" },
        { status: 404 }
      );
    }

    // Get message data from request
    const data = await req.json();
    const { role, content, metadata } = data;

    // Add new message
    const message = await prisma.chatMessage.create({
      data: {
        conversationId: params.id,
        role,
        content,
        metadata: metadata || {},
      },
    });

    // Update conversation's updatedAt
    await prisma.conversation.update({
      where: { id: params.id },
      data: { updatedAt: new Date() },
    });

    return NextResponse.json({
      success: true,
      data: message,
    });
  } catch (error: any) {
    console.error("Error adding message:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}