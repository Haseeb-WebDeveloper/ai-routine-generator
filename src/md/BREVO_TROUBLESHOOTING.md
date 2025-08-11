# Brevo API Troubleshooting Guide

## Current Issue: "Key not found" (401 Unauthorized)

Based on the logs, your Brevo API key is being read correctly but Brevo is returning "Key not found". Here's how to fix this:

## Step 1: Verify Your Brevo Account

1. **Go to [Brevo Dashboard](https://app.brevo.com/)**
2. **Log in to your account**
3. **Check if you're in the correct account** (you might have multiple accounts)

## Step 2: Check API Key Status

1. **Go to Settings → API Keys**
2. **Find your API key**: `xsmtpsib-088d1d6617e1083979390913d278ba60db2db1a789d240df029916ebfcb97fa3-9X25w7agzLMJQjYN`
3. **Check if it's:**
   - ✅ Active (not disabled)
   - ✅ Not expired
   - ✅ Has correct permissions

## Step 3: Regenerate API Key (Recommended)

If the key is not working, let's create a new one:

1. **Go to Settings → API Keys**
2. **Click "Create a new API key"**
3. **Name it**: "AI Routine Email Service"
4. **Select permissions**: 
   - ✅ **SMTP** (required for sending emails)
   - ✅ **Account** (for account info)
5. **Copy the new API key** (it will start with `xsmtpsib-`)

## Step 4: Update Environment Variable

1. **Open your `.env.local` file**
2. **Replace the old API key with the new one**:
   ```env
   BREVO_API_KEY=xsmtpsib-YOUR_NEW_API_KEY_HERE
   ```
3. **Save the file**
4. **Restart your development server**: `bun dev`

## Step 5: Test the New API Key

1. **Visit**: `http://localhost:3000/api/test-brevo`
2. **Check the response** - it should show success for all endpoints
3. **Look for any recommendations** in the response

## Step 6: Verify Sender Domain

1. **Go to Settings → Senders & IP**
2. **Add a sender email** (e.g., `noreply@yourdomain.com`)
3. **Verify the sender email** (Brevo will send a verification email)
4. **Or use Brevo's shared IP** (no domain verification needed)

## Step 7: Test Email Sending

1. **Go to your admin panel**
2. **Create a test campaign**
3. **Try sending it to a test email**
4. **Check the console logs for detailed information**

## Common Issues and Solutions

### Issue 1: "Key not found"
**Solution**: 
- Regenerate the API key
- Make sure you're in the correct Brevo account
- Check if the key has SMTP permissions

### Issue 2: "Sender not verified"
**Solution**:
- Verify your sender email in Brevo
- Or use a verified sender email
- Or use Brevo's shared IP

### Issue 3: "API key format invalid"
**Solution**:
- API key should start with `xsmtpsib-`
- Make sure there are no extra spaces or characters
- Copy the key exactly as shown in Brevo

### Issue 4: "Account suspended"
**Solution**:
- Check your Brevo account status
- Verify your account is active
- Contact Brevo support if needed

## Alternative: Use Brevo's SMTP Settings

If the API continues to fail, you can also use Brevo's SMTP settings:

1. **Go to Settings → SMTP & API**
2. **Copy the SMTP settings**:
   - Server: `smtp-relay.brevo.com`
   - Port: `587`
   - Username: Your Brevo email
   - Password: Your SMTP password

## Testing Your Setup

After following the steps above:

1. **Run the enhanced test**: `http://localhost:3000/api/test-brevo`
2. **Check all endpoint tests pass**
3. **Verify SMTP test works**
4. **Try sending a campaign**

## Still Having Issues?

If you're still experiencing problems:

1. **Check Brevo's status page**: [status.brevo.com](https://status.brevo.com/)
2. **Contact Brevo support**: [support.brevo.com](https://support.brevo.com/)
3. **Check your account limits**: Free accounts have sending limits

## Environment Variables Checklist

Make sure your `.env.local` has:

```env
# Brevo API Configuration
BREVO_API_KEY=xsmtpsib-YOUR_NEW_API_KEY_HERE

# App URL for generating quiz links
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Admin Configuration
ADMIN_EMAILS=admin@example.com,another@example.com
```

## Next Steps

Once the API key is working:

1. ✅ Campaign trigger buttons will remain available
2. ✅ Emails will send successfully
3. ✅ You can trigger campaigns multiple times
4. ✅ Detailed logging will help with debugging

Let me know what the test endpoint shows after you've regenerated the API key!
