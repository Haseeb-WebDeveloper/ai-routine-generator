#!/usr/bin/env node

import { PrismaClient } from '@prisma/client'
import readline from 'readline'
import dotenv from 'dotenv'
import bcrypt from 'bcryptjs'
import { createClient } from '@supabase/supabase-js'

// Load environment variables
dotenv.config({ path: '.env' })

// Create Prisma client
const prisma = new PrismaClient()

// Create Supabase admin client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables')
  process.exit(1)
}

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})

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
  console.log('🔐 AI Routine - Prisma Admin Account Creator\n')
  
  try {
    // Get admin details
    const email = await question('Enter admin email: ')
    const name = await question('Enter admin name: ')
    const password = await question('Enter admin password (min 6 characters): ')
    const confirmPassword = await question('Confirm admin password: ')
    
    // Validate input
    if (!email || !email.includes('@')) {
      console.error('❌ Invalid email address')
      rl.close()
      return
    }
    
    if (!name || name.trim().length < 2) {
      console.error('❌ Name must be at least 2 characters long')
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
    
    // Check if user already exists in Prisma
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })
    
    if (existingUser) {
      console.log('⚠️  User with this email already exists')
      
      if (existingUser.role === 'admin') {
        console.log('✅ User is already an admin')
        rl.close()
        return
      }
      
      const updateRole = await question('Update existing user to admin role? (y/n): ')
      if (updateRole.toLowerCase() === 'y') {
        await prisma.user.update({
          where: { email },
          data: { role: 'admin' }
        })
        console.log('✅ User role updated to admin')
        rl.close()
        return
      } else {
        console.log('❌ Operation cancelled')
        rl.close()
        return
      }
    }
    
    // Check if user exists in Supabase
    const { data, error } = await supabaseAdmin.auth.admin.listUsers()
    
    let supabaseUser = null
    if (data && data.users) {
      supabaseUser = data.users.find(user => user.email === email)
    }
    
    let userId = null
    
    // Create user in Supabase if not exists
    if (!supabaseUser) {
      console.log('📝 Creating user in Supabase Auth...')
      const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: { name, role: 'admin' }
      })
      
      if (createError) {
        console.error('❌ Error creating Supabase user:', createError.message)
        rl.close()
        return
      }
      
      userId = newUser.user.id
      console.log('✅ Supabase user created successfully')
    } else {
      userId = supabaseUser.id
      console.log('✅ User already exists in Supabase Auth')
    }
    
    // Hash password for Prisma DB
    const saltRounds = 12
    const passwordHash = await bcrypt.hash(password, saltRounds)
    
    // Create new admin user in Prisma
    const newAdmin = await prisma.user.create({
      data: {
        id: userId, // Use Supabase user ID
        email,
        name: name.trim(),
        passwordHash,
        role: 'admin',
        isActive: true,
        quizCompleted: false
      }
    })
    
    console.log('✅ Admin account created successfully!')
    console.log(`📧 Email: ${newAdmin.email}`)
    console.log(`👤 Name: ${newAdmin.name}`)
    console.log(`🆔 ID: ${newAdmin.id}`)
    console.log(`👑 Role: ${newAdmin.role}`)
    console.log(`📅 Created: ${newAdmin.createdAt.toLocaleString()}`)
    
    console.log('\n🎉 Admin account setup complete!')
    console.log('\nNext steps:')
    console.log('1. Restart your development server')
    console.log('2. Access the admin dashboard at http://localhost:3000/admin')
    console.log('3. You can now log in with this admin account')
    
  } catch (error) {
    console.error('❌ Error creating admin user:', error.message)
    if (error.code === 'P2002') {
      console.error('   This email is already in use')
    }
  } finally {
    await prisma.$disconnect()
    rl.close()
  }
}

// Run the script
createAdminUser()