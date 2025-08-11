#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js'
import readline from 'readline'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config({ path: '.env' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing required environment variables:')
  console.error('   - NEXT_PUBLIC_SUPABASE_URL')
  console.error('   - SUPABASE_SERVICE_ROLE_KEY')
  console.error('\nPlease add these to your .env file')
  process.exit(1)
}

// Create Supabase client with service role key for admin operations
const supabase = createClient(supabaseUrl, supabaseServiceKey)

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
})

function question(prompt) {
  return new Promise((resolve) => {
    rl.question(prompt, resolve)
  })
}

async function createAdminUser() {
  console.log('🔐 AI Routine - Admin Account Creator\n')
  
  try {
    // Get admin details
    const email = await question('Enter admin email: ')
    const password = await question('Enter admin password (min 6 characters): ')
    const confirmPassword = await question('Confirm admin password: ')
    
    // Validate input
    if (!email || !email.includes('@')) {
      console.error('❌ Invalid email address')
      rl.close()
      return
    }
    
    if (password.length < 6) {
      console.error('❌ Password must be at least 6 characters long')
      rl.close()
      return
    }
    
    if (password !== confirmPassword) {
      console.error('❌ Passwords do not match')
      rl.close()
      return
    }
    
    console.log('\n🔄 Creating admin account...')
    
    // Create user with Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Auto-confirm email
      user_metadata: {
        role: 'admin'
      }
    })
    
    if (authError) {
      console.error('❌ Error creating user:', authError.message)
      rl.close()
      return
    }
    
    if (authData.user) {
      console.log('✅ Admin account created successfully!')
      console.log(`📧 Email: ${authData.user.email}`)
      console.log(`🆔 User ID: ${authData.user.id}`)
      console.log(`📅 Created: ${new Date(authData.user.created_at).toLocaleString()}`)
      
      // Insert user into user_emails table with admin role
      console.log('\n🔄 Adding user to user_emails table...')
      const { data: insertData, error: insertError } = await supabase
        .from('user_emails')
        .insert([
          {
            email: authData.user.email,
            name: 'Admin User',
            user_id: authData.user.id,
            role: 'admin',
            is_active: true,
            created_at: new Date().toISOString()
          }
        ])
      
      if (insertError) {
        console.error('❌ Error inserting into user_emails:', insertError.message)
        console.log('⚠️  You may need to manually add the user to the user_emails table')
      } else {
        console.log('✅ User added to user_emails table with admin role')
      }
      
      console.log('\n🎉 Admin account setup complete!')
      console.log('\nNext steps:')
      console.log('1. The user has been added to the database with admin role')
      console.log('2. Restart your development server')
      console.log('3. Access the admin dashboard at http://localhost:3000/admin')
    }
    
  } catch (error) {
    console.error('❌ Unexpected error:', error.message)
  } finally {
    rl.close()
  }
}

// Run the script
createAdminUser()
