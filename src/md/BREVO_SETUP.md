# Brevo API Setup Guide

## Issues Fixed

### 1. Campaign Trigger Button Disappearing
- **Problem**: Trigger button disappeared after first run because campaign status changed to 'sent'
- **Solution**: Keep campaign status as 'draft' after sending, allowing multiple triggers
- **Result**: Campaigns can now be triggered multiple times with "Re-send" button

### 2. Email Sending Failing (401 Unauthorized)
- **Problem**: Brevo API returning 401 errors
- **Solution**: Improved API request structure and error handling

## Environment Variables Required

Add these to your `.env.local` file:

```env
# Brevo API Configuration
BREVO_API_KEY=your_brevo_api_key_here

# App URL for generating quiz links
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Admin Configuration
ADMIN_EMAILS=admin@example.com,another@example.com
```

## Brevo API Setup Steps

### 1. Create Brevo Account
1. Go to [brevo.com](https://brevo.com) and create an account
2. Verify your email address

### 2. Get API Key
1. Go to Settings → API Keys
2. Create a new API key with "SMTP" permissions
3. Copy the API key (starts with `xsmtpsib-`)

### 3. Configure Sender Domain
1. Go to Settings → Senders & IP
2. Add your domain or use Brevo's shared IP
3. Verify your domain if using custom domain

### 4. Test API Connection
Visit `/api/test-brevo` in your browser to test the API key:
```
http://localhost:3000/api/test-brevo
```

## Troubleshooting

### API Key Issues
- Ensure the API key starts with `xsmtpsib-`
- Check that the key has SMTP permissions
- Verify the key is not expired

### 401 Unauthorized Error
- Double-check the API key format
- Ensure the key has the correct permissions
- Try regenerating the API key

### Email Not Sending
- Check the sender email is verified in Brevo
- Ensure the recipient email is valid
- Check Brevo dashboard for delivery status

## Testing

1. Create a campaign in the admin panel
2. Select users and email template
3. Click "Send" button
4. Check console logs for detailed debugging info
5. Verify emails are received by test users

## Features

- ✅ Campaigns can be triggered multiple times
- ✅ Improved error handling and logging
- ✅ Better API request structure
- ✅ Environment variable validation
- ✅ Detailed debugging information
