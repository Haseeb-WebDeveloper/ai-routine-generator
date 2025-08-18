import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
    }

    // Sign in with Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      console.error('Error signing in with Supabase Auth:', authError);
      return NextResponse.json({ error: authError.message }, { status: 401 });
    }

    // Check if user exists in our database
    const user = await prisma.user.findUnique({
      where: { id: authData.user.id },
    });

    if (!user) {
      // This should not happen if signup was done correctly, but just in case
      // Create user in our database with the Supabase Auth user ID
      const newUser = await prisma.user.create({
        data: {
          id: authData.user.id,
          email,
          name: 'User',
          role: 'user',
        },
      });

      // Create response with cookies
      const response = NextResponse.json({
        success: true,
        user: {
          id: newUser.id,
          email: newUser.email,
          name: newUser.name,
          role: newUser.role,
        },
        session: authData.session,
      });

      // Set auth cookies
      setAuthCookies(response, authData.session);
      
      return response;
    }

    // Create response with cookies
    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
      session: authData.session,
    });

    // Set auth cookies
    setAuthCookies(response, authData.session);
    
    return response;
  } catch (error) {
    console.error('Error in signin:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

function setAuthCookies(response: NextResponse, session: any) {
  if (!session) return;
  
  // Set access token cookie
  response.cookies.set({
    name: 'sb-access-token',
    value: session.access_token,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 60 * 24 * 7, // 1 week
    sameSite: 'lax',
    path: '/'
  });
  
  // Set refresh token cookie
  response.cookies.set({
    name: 'sb-refresh-token',
    value: session.refresh_token,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 60 * 24 * 30, // 30 days
    sameSite: 'lax',
    path: '/'
  });
}