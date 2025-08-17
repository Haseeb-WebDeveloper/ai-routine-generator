import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    // Sign out from Supabase Auth
    const { error } = await supabase.auth.signOut();

    if (error) {
      console.error('Error signing out:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Clear all auth cookies
    const response = NextResponse.json({ success: true });
    
    // Clear all cookies related to auth
    response.cookies.delete('quiz_verified');
    response.cookies.delete('quiz_email');
    response.cookies.delete('quiz_user_id');
    response.cookies.delete('quiz_name');
    response.cookies.delete('sb-access-token');
    response.cookies.delete('sb-refresh-token');

    return response;
  } catch (error) {
    console.error('Error in signout:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
