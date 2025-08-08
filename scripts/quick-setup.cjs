#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const path = require('path')
require('dotenv').config({ path: '.env' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing required environment variables:')
  console.error('   - NEXT_PUBLIC_SUPABASE_URL')
  console.error('   - SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function quickSetup() {
  console.log('🚀 AI Routine - Quick Setup\n')
  
  const defaultEmail = 'admin@ai-routine.com'
  const defaultPassword = 'admin123456'
  
  try {
    console.log('🔄 Creating default admin account...')
    console.log(`📧 Email: ${defaultEmail}`)
    console.log(`🔑 Password: ${defaultPassword}\n`)
    
    // Create user with Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: defaultEmail,
      password: defaultPassword,
      email_confirm: true,
      user_metadata: {
        role: 'admin'
      }
    })
    
    if (authError) {
      if (authError.message.includes('already registered')) {
        console.log('ℹ️  Admin account already exists, updating environment variables...')
      } else {
        console.error('❌ Error creating user:', authError.message)
        return
      }
    } else if (authData.user) {
      console.log('✅ Default admin account created successfully!')
      console.log(`📧 Email: ${authData.user.email}`)
      console.log(`🆔 User ID: ${authData.user.id}`)
    }
    
    // Update environment variables
    updateEnvironmentVariables(defaultEmail)
    
    console.log('\n🎉 Quick setup complete!')
    console.log('\nYou can now:')
    console.log('1. Start the development server: bun dev')
    console.log('2. Access admin dashboard: http://localhost:3000/admin')
    console.log('3. Sign in with:')
    console.log(`   Email: ${defaultEmail}`)
    console.log(`   Password: ${defaultPassword}`)
    console.log('\n⚠️  Remember to change the default password in production!')
    
  } catch (error) {
    console.error('❌ Unexpected error:', error.message)
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
    
    // Set admin emails
    envVars.ADMIN_EMAILS = email
    envVars.NEXT_PUBLIC_ADMIN_EMAILS = email
    
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
quickSetup()
