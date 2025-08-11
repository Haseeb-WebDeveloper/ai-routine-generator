#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js')
const readline = require('readline')
const fs = require('fs')
const path = require('path')
require('dotenv').config({ path: '.env' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing required environment variables:')
  console.error('   - NEXT_PUBLIC_SUPABASE_URL')
  console.error('   - SUPABASE_SERVICE_ROLE_KEY')
  console.error('\nPlease add these to your .env file')
  console.error('\nTo get your service role key:')
  console.error('1. Go to your Supabase dashboard')
  console.error('2. Navigate to Settings → API')
  console.error('3. Copy the "service_role" key (not the anon key)')
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
      updateEnvironmentVariables(email)
      
      console.log('\n🎉 Admin account setup complete!')
      console.log('\nNext steps:')
      console.log('1. Restart your development server')
      console.log('2. Access the admin dashboard at http://localhost:3000/admin')
      console.log('3. Sign in with your new admin credentials')
    }
    
  } catch (error) {
    console.error('❌ Unexpected error:', error.message)
  } finally {
    rl.close()
  }
}

function updateEnvironmentVariables(email) {
  console.log('\n📝 Updating environment variables...')
  
  try {
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
    
    
    // Write back to file
    const newEnvContent = Object.entries(envVars)
      .map(([key, value]) => `${key}=${value}`)
      .join('\n')
    
    fs.writeFileSync(envPath, newEnvContent)
    console.log('✅ Environment variables updated successfully!')
    
  } catch (error) {
    console.warn('⚠️  Could not update .env file automatically')
    console.log('Please manually add the following to your .env file:')
  }
}

// Run the script
createAdminUser()
