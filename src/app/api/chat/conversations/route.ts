import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Conversation } from "@/types/chat";
import { createServerClient } from "@/lib/supabase";

// GET /api/chat/conversations
// Get all conversations for the current user
export async function GET(req: NextRequest) {
  try {
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
    
    // If no authenticated user, return empty array
    if (!session?.user) {
      return NextResponse.json({
        success: true,
        data: [],
      });
    }

    // Get user email from Supabase session
    const userEmail = session.user.email;
    
    if (!userEmail) {
      return NextResponse.json(
        { success: false, error: "User email not found" },
        { status: 400 }
      );
    }

    // Get all conversations for this user
    const conversations = await prisma.conversation.findMany({
      where: {
        userEmail: userEmail,
      },
      include: {
        messages: {
          orderBy: {
            timestamp: "asc",
          },
        },
      },
      orderBy: {
        updatedAt: "desc",
      },
    });

    return NextResponse.json({
      success: true,
      data: conversations,
    });
  } catch (error: any) {
    console.error("Error fetching conversations:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// POST /api/chat/conversations
// Create a new conversation
export async function POST(req: NextRequest) {
  try {
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
    const { title, messages } = data as Conversation;

    console.log("Creating new conversation for user:", userEmail);
    console.log("Conversation data:", { title, messageCount: messages.length });

    // Create new conversation
    const conversation = await prisma.conversation.create({
      data: {
        userEmail: userEmail,
        title: title || "New Conversation",
        messages: {
          create: messages.map(message => ({
            role: message.role,
            content: message.content,
            metadata: message.metadata || {},
          })),
        },
      },
      include: {
        messages: true,
      },
    });

    console.log("Conversation created:", conversation.id);

    return NextResponse.json({
      success: true,
      data: conversation,
    });
  } catch (error: any) {
    console.error("Error creating conversation:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}