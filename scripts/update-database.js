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

async function updateDatabase() {
  console.log('🔄 Updating database schema...');

  try {
    // First, let's check if the role column already exists
    console.log('🔍 Checking current table structure...');
    const { data: tableInfo, error: tableError } = await supabase
      .from('user_emails')
      .select('*')
      .limit(1);
    
    if (tableError) {
      console.error('❌ Error checking table structure:', tableError.message);
      return;
    }

    console.log('✅ Table structure check successful');

    // Check if role column exists by trying to select it
    try {
      const { data: roleCheck, error: roleError } = await supabase
        .from('user_emails')
        .select('role')
        .limit(1);
      
      if (roleError && roleError.message.includes('column "role" does not exist')) {
        console.log('📝 Role column does not exist, adding it...');
        
        // Since we can't use ALTER TABLE directly, we'll need to handle this differently
        // For now, let's just update existing users to have a default role
        console.log('⚠️  Cannot add column directly. Please add the role column manually in Supabase dashboard.');
        console.log('   - Go to Supabase Dashboard > SQL Editor');
        console.log('   - Run: ALTER TABLE user_emails ADD COLUMN role VARCHAR(50) DEFAULT \'user\' NOT NULL;');
        
      } else if (roleError) {
        console.log('⚠️  Error checking role column:', roleError.message);
      } else {
        console.log('✅ Role column already exists');
      }
    } catch (error) {
      console.log('📝 Role column does not exist, needs to be added manually');
    }

    // Update existing admin users (replace with your actual admin email)
    const adminEmail = 'web.dev.haseeb@gmail.com'; // Replace with your admin email
    console.log(`👑 Updating ${adminEmail} to admin role...`);

    // First, check if the user exists
    const { data: existingUser, error: checkError } = await supabase
      .from('user_emails')
      .select('*')
      .eq('email', adminEmail)
      .single();

    if (checkError) {
      if (checkError.code === 'PGRST116') {
        console.log('❌ User not found in user_emails table');
        console.log('   Please make sure the user exists in the user_emails table first');
        return;
      } else {
        console.log('❌ Error checking user:', checkError.message);
        return;
      }
    }

    console.log('✅ User found:', existingUser.email);

    // Try to update the role (this will fail if the column doesn't exist)
    const { error: updateError } = await supabase
      .from('user_emails')
      .update({ role: 'admin' })
      .eq('email', adminEmail);

    if (updateError) {
      if (updateError.message.includes('column "role" does not exist')) {
        console.log('❌ Role column does not exist yet');
        console.log('\n🔧 MANUAL STEPS REQUIRED:');
        console.log('1. Go to https://supabase.com/dashboard/project/xjwisdvcvxbzzvrntcxm/sql');
        console.log('2. Run this SQL command:');
        console.log('   ALTER TABLE user_emails ADD COLUMN role VARCHAR(50) DEFAULT \'user\' NOT NULL;');
        console.log('3. Run this to create an index:');
        console.log('   CREATE INDEX idx_user_emails_role ON user_emails(role);');
        console.log('4. Then run this script again');
      } else {
        console.log('❌ Error updating admin role:', updateError.message);
      }
    } else {
      console.log('✅ Admin role updated successfully');
      
      console.log('\n🎉 Database update complete!');
      console.log('\nNext steps:');
      console.log('1. Restart your development server');
      console.log('2. Try logging in with your admin account');
    }

  } catch (error) {
    console.error('❌ Error updating database:', error.message);
  }
}

// Run the update
updateDatabase();
