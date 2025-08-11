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

async function checkDatabase() {
  console.log('🔍 Checking database state...\n');

  try {
    // Check user_emails table structure
    console.log('📊 Checking user_emails table structure...');
    const { data: tableData, error: tableError } = await supabase
      .from('user_emails')
      .select('*')
      .limit(5);
    
    if (tableError) {
      console.error('❌ Error checking user_emails table:', tableError.message);
      return;
    }

    console.log('✅ user_emails table accessible');
    console.log(`📝 Found ${tableData?.length || 0} records`);
    
    if (tableData && tableData.length > 0) {
      console.log('\n📋 Sample records:');
      tableData.forEach((record, index) => {
        console.log(`   ${index + 1}. Email: ${record.email}, Role: ${record.role || 'N/A'}, Active: ${record.is_active}`);
      });
    }

    // Check if specific admin user exists
    const adminEmail = 'web.dev.haseeb@gmail.com';
    console.log(`\n👑 Checking for admin user: ${adminEmail}`);
    
    const { data: adminUser, error: adminError } = await supabase
      .from('user_emails')
      .select('*')
      .eq('email', adminEmail)
      .single();

    if (adminError) {
      if (adminError.code === 'PGRST116') {
        console.log('❌ Admin user NOT found in user_emails table');
        console.log('   This is why you\'re getting "Access denied"');
      } else {
        console.log('❌ Error checking admin user:', adminError.message);
      }
    } else {
      console.log('✅ Admin user found in user_emails table:');
      console.log(`   Email: ${adminUser.email}`);
      console.log(`   Role: ${adminUser.role || 'N/A'}`);
      console.log(`   Active: ${adminUser.is_active}`);
      console.log(`   User ID: ${adminUser.user_id || 'N/A'}`);
    }

    // Check Supabase Auth users
    console.log('\n🔐 Checking Supabase Auth users...');
    try {
      const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();
      
      if (authError) {
        console.log('❌ Error listing auth users:', authError.message);
      } else {
        console.log(`✅ Found ${authUsers.users.length} auth users`);
        
        const adminAuthUser = authUsers.users.find(u => u.email === adminEmail);
        if (adminAuthUser) {
          console.log('✅ Admin user found in Supabase Auth:');
          console.log(`   Email: ${adminAuthUser.email}`);
          console.log(`   ID: ${adminAuthUser.id}`);
          console.log(`   Created: ${adminAuthUser.created_at}`);
        } else {
          console.log('❌ Admin user NOT found in Supabase Auth');
        }
      }
    } catch (error) {
      console.log('⚠️  Could not check auth users (might need different permissions)');
    }

    console.log('\n🔧 NEXT STEPS:');
    if (adminUser) {
      console.log('✅ User exists in user_emails table');
      console.log('   Try logging in again - it should work now!');
    } else {
      console.log('❌ User missing from user_emails table');
      console.log('   You need to add the user to the user_emails table');
      console.log('   Run: bun run create-admin (this will add the user properly)');
    }

  } catch (error) {
    console.error('❌ Error checking database:', error.message);
  }
}

// Run the check
checkDatabase();
