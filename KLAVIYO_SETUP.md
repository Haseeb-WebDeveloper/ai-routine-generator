# Klaviyo Integration Setup

This guide will help you set up Klaviyo to replace Brevo for email functionality in your AI Routine application.

## Prerequisites

1. A Klaviyo account (sign up at [klaviyo.com](https://klaviyo.com))
2. Access to your Klaviyo dashboard

## Setup Steps

### 1. Get Your Klaviyo API Key

1. Log in to your Klaviyo account
2. Go to **Account** → **API Keys**
3. Click **Create API Key**
4. Give it a name (e.g., "AI Routine App")
5. Select **Full Access** or **Read & Write** permissions
6. Copy the generated API key

### 2. Create a List in Klaviyo

1. In your Klaviyo dashboard, go to **Lists & Segments**
2. Click **Create List**
3. Give it a name (e.g., "AI Routine Users")
4. Set the list type to **Email Marketing**
5. Copy the List ID from the URL or list settings

### 3. Configure Environment Variables

Add these variables to your `.env.local` file:

```bash
# Klaviyo Configuration
KLAVIYO_API_KEY=your_klaviyo_api_key_here
KLAVIYO_LIST_ID=your_klaviyo_list_id_here

# Remove or comment out old Brevo variables
# BREVO_API_KEY=your_old_brevo_key
# BREVO_SMTP_USER=your_old_brevo_user
# BREVO_SMTP_PASS=your_old_brevo_pass
# BREVO_SENDER_EMAIL=your_old_brevo_email
```

### 4. Verify Your Sender Domain

1. In Klaviyo, go to **Account** → **Sending Domains**
2. Add and verify your domain
3. Set up SPF and DKIM records as instructed

### 5. Test the Integration

1. Start your development server
2. Try sending a test email through the admin panel
3. Check Klaviyo dashboard for email delivery status

## API Endpoints Updated

The following API endpoints now use Klaviyo:

- `POST /api/admin/campaigns/[id]/trigger` - Campaign email triggers
- `POST /api/send-mail` - Individual email sending

## Features

- **Contact Management**: Automatically adds/updates contacts in Klaviyo
- **Email Tracking**: Full email analytics and tracking through Klaviyo
- **List Management**: Centralized contact list management
- **Professional Delivery**: High deliverability rates through Klaviyo's infrastructure

## Troubleshooting

### Common Issues

1. **API Key Invalid**: Ensure your Klaviyo API key is correct and has proper permissions
2. **List ID Not Found**: Verify the list exists and is accessible
3. **Email Not Sending**: Check Klaviyo dashboard for any delivery issues
4. **Domain Not Verified**: Complete domain verification in Klaviyo

### Debug Mode

Enable detailed logging by checking the console output when sending emails. The API will log:
- Contact creation/update status
- Email sending responses
- Any errors encountered

## Migration from Brevo

If you're migrating from Brevo:

1. **Backup**: Export your contact list from Brevo
2. **Import**: Import contacts to Klaviyo (if needed)
3. **Update**: Replace environment variables
4. **Test**: Verify all email functionality works
5. **Cleanup**: Remove old Brevo environment variables

## Support

For Klaviyo-specific issues, refer to:
- [Klaviyo API Documentation](https://developers.klaviyo.com/)
- [Klaviyo Support](https://help.klaviyo.com/)

For application-specific issues, check the application logs and console output.
