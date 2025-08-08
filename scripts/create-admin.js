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
      
      // Update environment variables
      await updateEnvironmentVariables(email)
      
      console.log('\n🎉 Admin account setup complete!')
      console.log('\nNext steps:')
      console.log('1. Update your .env file with the new admin email')
      console.log('2. Restart your development server')
      console.log('3. Access the admin dashboard at http://localhost:3000/admin')
    }
    
  } catch (error) {
    console.error('❌ Unexpected error:', error.message)
  } finally {
    rl.close()
  }
}

async function updateEnvironmentVariables(email) {
  console.log('\n📝 Updating environment variables...')
  
  try {
    // Read current .env file
    const fs = await import('fs')
    const path = await import('path')
    
    const envPath = path.join(process.cwd(), '.env')
    let envContent = ''
    
    try {
      envContent = fs.readFileSync(envPath, 'utf8')
    } catch (error) {
      // File doesn't exist, create it
      envContent = ''
    }
    
    // Parse existing variables
    const lines = envContent.split('\n')
    const envVars = {}
    
    lines.forEach(line => {
      const [key, ...valueParts] = line.split('=')
      if (key && valueParts.length > 0) {
        envVars[key.trim()] = valueParts.join('=').trim()
      }
    })
    
    // Update admin emails
    const currentAdminEmails = envVars.ADMIN_EMAILS || ''
    const currentPublicAdminEmails = envVars.NEXT_PUBLIC_ADMIN_EMAILS || ''
    
    // Add new email if not already present
    if (!currentAdminEmails.includes(email)) {
      envVars.ADMIN_EMAILS = currentAdminEmails ? `${currentAdminEmails},${email}` : email
    }
    
    if (!currentPublicAdminEmails.includes(email)) {
      envVars.NEXT_PUBLIC_ADMIN_EMAILS = currentPublicAdminEmails ? `${currentPublicAdminEmails},${email}` : email
    }
    
    // Write back to file
    const newEnvContent = Object.entries(envVars)
      .map(([key, value]) => `${key}=${value}`)
      .join('\n')
    
    fs.writeFileSync(envPath, newEnvContent)
    console.log('✅ Environment variables updated successfully!')
    
  } catch (error) {
    console.warn('⚠️  Could not update .env file automatically')
    console.log('Please manually add the following to your .env file:')
    console.log(`ADMIN_EMAILS=${email}`)
    console.log(`NEXT_PUBLIC_ADMIN_EMAILS=${email}`)
  }
}

// Run the script
createAdminUser()
