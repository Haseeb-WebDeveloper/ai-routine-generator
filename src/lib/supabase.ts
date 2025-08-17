import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabaseServiceKey = process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY!

// Client-side Supabase client with cookie support
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: false,
    storageKey: 'sb-auth-state',
    flowType: 'pkce',
    debug: true
  },
  global: {
    headers: {
      'X-Client-Info': 'supabase-js-client'
    }
  }
})

// Create a server-side supabase client with cookie support
export const createServerClient = (cookieHeader: string | null) => {
  return createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false
    },
    global: {
      headers: {
        cookie: cookieHeader || ''
      }
    }
  })
}

// Admin client for server-side operations that require elevated privileges
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

// Function to check if a user has admin role
export async function isUserAdmin(userId: string): Promise<boolean> {
  try {
    console.log('🔍 Checking admin role for user ID:', userId)
    
    const { data, error } = await supabaseAdmin
      .from('users')
      .select('role, email')
      .eq('id', userId)
      .single()
    
    console.log('📋 Admin check result:', { data, error: error?.message })
    
    if (error || !data) {
      console.log('❌ Error checking admin role:', error)
      return false
    }
    
    const isAdmin = data.role === 'admin'
    console.log('✅ Admin check complete:', { email: data.email, role: data.role, isAdmin })
    return isAdmin
  } catch (error) {
    console.error('❌ Error in isUserAdmin:', error)
    return false
  }
}

// Function to check if a user has admin role by email
export async function isEmailAdmin(email: string): Promise<boolean> {
  try {
    console.log('🔍 Checking admin role for email:', email)
    
    const { data, error } = await supabaseAdmin
      .from('users')
      .select('role, id')
      .eq('email', email)
      .single()
    
    console.log('📋 Admin check result:', { data, error: error?.message })
    
    if (error || !data) {
      console.log('❌ Error checking admin role by email:', error)
      return false
    }
    
    const isAdmin = data.role === 'admin'
    console.log('✅ Admin check complete:', { email, role: data.role, isAdmin })
    return isAdmin
  } catch (error) {
    console.error('❌ Error in isEmailAdmin:', error)
    return false
  }
}