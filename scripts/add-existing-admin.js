#!/usr/bin/env bun

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing required environment variables:');
  console.error('   - NEXT_PUBLIC_SUPABASE_URL');
  console.error('   - SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

// Create Supabase client with service role key
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function addExistingAdmin() {
  console.log('🔐 Adding existing admin user to user_emails table...\n');

  try {
    const adminEmail = 'web.dev.haseeb@gmail.com';
    
    // Step 1: Get the user from Supabase Auth
    console.log('🔍 Getting user from Supabase Auth...');
    const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();
    
    if (authError) {
      console.error('❌ Error listing auth users:', authError.message);
      return;
    }

    const adminUser = authUsers.users.find(u => u.email === adminEmail);
    if (!adminUser) {
      console.error('❌ User not found in Supabase Auth:', adminEmail);
      return;
    }

    console.log('✅ Found user in Supabase Auth:');
    console.log(`   Email: ${adminUser.email}`);
    console.log(`   ID: ${adminUser.id}`);
    console.log(`   Created: ${adminUser.created_at}`);

    // Step 2: Check if user already exists in user_emails table
    console.log('\n🔍 Checking if user exists in user_emails table...');
    const { data: existingUser, error: checkError } = await supabase
      .from('user_emails')
      .select('*')
      .eq('email', adminEmail)
      .single();

    if (existingUser) {
      console.log('✅ User already exists in user_emails table:');
      console.log(`   Email: ${existingUser.email}`);
      console.log(`   Role: ${existingUser.role || 'N/A'}`);
      console.log(`   Active: ${existingUser.is_active}`);
      
      // Update role to admin if needed
      if (existingUser.role !== 'admin') {
        console.log('\n🔄 Updating role to admin...');
        const { error: updateError } = await supabase
          .from('user_emails')
          .update({ role: 'admin' })
          .eq('email', adminEmail);
        
        if (updateError) {
          console.error('❌ Error updating role:', updateError.message);
        } else {
          console.log('✅ Role updated to admin successfully!');
        }
      } else {
        console.log('✅ User already has admin role!');
      }
      
      return;
    }

    // Step 3: Add user to user_emails table
    console.log('\n➕ Adding user to user_emails table...');
    const { data: insertData, error: insertError } = await supabase
      .from('user_emails')
      .insert([
        {
          email: adminUser.email,
          name: 'Admin User',
          user_id: adminUser.id,
          role: 'admin',
          is_active: true,
          created_at: new Date().toISOString()
        }
      ])
      .select();

    if (insertError) {
      console.error('❌ Error inserting user:', insertError.message);
      return;
    }

    console.log('✅ User added to user_emails table successfully!');
    console.log('   Email:', insertData[0].email);
    console.log('   Role:', insertData[0].role);
    console.log('   Active:', insertData[0].is_active);

    console.log('\n🎉 SUCCESS! Your admin user is now properly set up.');
    console.log('\nNext steps:');
    console.log('1. Try logging in at http://localhost:3000/admin/login');
    console.log('2. It should work now without "Access denied"');

  } catch (error) {
    console.error('❌ Unexpected error:', error.message);
  }
}

// Run the script
addExistingAdmin();
