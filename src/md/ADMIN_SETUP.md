# AI Routine Admin Dashboard Setup

This document explains how to set up and use the admin dashboard for the AI-Powered Skincare Routine Generator.

## 🚀 Quick Start

### 1. Database Setup

First, you need to set up your Supabase database with the required tables. Run the SQL commands from `supabase-schema.sql` in your Supabase SQL editor:

```sql
-- Copy and paste the contents of supabase-schema.sql
```

### 2. Environment Variables

Create a `.env` file in your project root with your Supabase credentials:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Admin Configuration
ADMIN_EMAILS=admin@example.com,admin2@example.com
NEXT_PUBLIC_ADMIN_EMAILS=admin@example.com,admin2@example.com
```

**Important**: 
- `ADMIN_EMAILS` is used by the middleware (server-side)
- `NEXT_PUBLIC_ADMIN_EMAILS` is used by the client-side components
- Add all admin email addresses separated by commas
- These emails will be the only ones allowed to access the admin dashboard

### 3. Install Dependencies

```bash
bun install
```

### 4. Set Up Admin Authentication

1. **Enable Email Authentication in Supabase**:
   - Go to your Supabase dashboard → Authentication → Settings
   - Make sure "Email" provider is enabled
   - Configure your site URL (for development, use `http://localhost:3000`)
   - Add redirect URLs:
     - `http://localhost:3000/admin/login`
     - `http://localhost:3000/admin/register`

2. **Get Your Service Role Key**:
   - Go to your Supabase dashboard → Settings → API
   - Copy the "service_role" key (not the anon key)
   - Add it to your `.env` file:
     ```env
     SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
     ```

3. **Create Your First Admin Account** (Choose one method):

   **Option A: Using the Script (Recommended)**
   ```bash
   bun run create-admin
   ```
   This will:
   - Prompt for email and password
   - Create the admin account automatically
   - Update your environment variables
   - Skip email verification

   **Option B: Using the Registration Page**
   - Navigate to `http://localhost:3000/admin/register`
   - Create an account with an email that's in your `ADMIN_EMAILS` list
   - Verify your email (check your inbox)
   - Sign in at `http://localhost:3000/admin/login`

### 5. Run the Development Server

```bash
bun dev
```

### 6. Access the Admin Dashboard

Navigate to `http://localhost:3000/admin` to access the admin dashboard.

## 🔐 Security Features

### Authentication & Authorization
- **Middleware Protection**: All `/admin/*` routes are protected by Next.js middleware
- **Email-based Authorization**: Only emails listed in `ADMIN_EMAILS` can access admin features
- **Session Management**: Automatic session validation and logout functionality
- **Unauthorized Access Handling**: Redirects non-admin users to appropriate pages

### Access Control Flow
1. User tries to access `/admin/*`
2. Middleware checks for valid session
3. If no session → redirect to `/admin/login`
4. If session exists → verify user email is in admin list
5. If not admin → redirect to `/admin/unauthorized`
6. If admin → allow access to dashboard

## 📊 Admin Dashboard Features

### Dashboard Overview
- View key metrics and statistics
- Quick access to common actions
- Recent activity feed

### Manage Users
- View all registered users in a searchable table
- See user status (active/inactive, quiz completed/pending)
- Delete users
- Copy unique quiz links

### Add Users
- Add individual email addresses
- Add multiple emails at once
- Real-time validation and feedback

### Upload CSV
- Bulk import users via CSV file
- Download CSV template
- Automatic email validation
- Duplicate detection

## 🔧 How It Works

### User Flow
1. **Admin adds users** via dashboard (manual or CSV upload)
2. **System generates unique links** for each user
3. **Admin sends emails** with unique links (using Bravo or any email service)
4. **Users click links** and are taken to the quiz page
5. **System validates** the user's email and token
6. **Users complete quiz** and get personalized recommendations

### Database Schema

#### `user_emails` table
- `id`: Unique identifier
- `email`: User's email address (unique)
- `is_active`: Whether the user is active
- `quiz_completed`: Whether the user has completed the quiz
- `unique_link`: Generated unique link for the quiz
- `created_at`: When the user was added
- `updated_at`: Last update timestamp

#### `quiz_responses` table
- `id`: Unique identifier
- `user_email`: References user_emails.email
- `skin_type`: User's skin type
- `concerns`: Array of skin concerns
- `age`: User's age
- `budget`: Budget preference
- `skin_sensitivity`: Skin sensitivity level
- `climate`: Climate/location
- `lifestyle`: Lifestyle factors
- `created_at`: When the quiz was completed
- `updated_at`: Last update timestamp

## 📧 Email Integration

The system generates unique links for each user that look like:
```
http://localhost:3000/validate?email=user@example.com&token=encoded_token
```

You can integrate with any email service (Bravo, SendGrid, etc.) to send these links to users.

### Example Email Template
```html
<h2>Your Personalized Skincare Routine Awaits!</h2>
<p>Hi there,</p>
<p>We're excited to create a custom skincare routine just for you!</p>
<p>Click the button below to start your personalized skincare quiz:</p>
<a href="{{unique_link}}" style="background: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">
  Start Your Quiz
</a>
<p>This link is unique to you and will expire after use.</p>
```

## 🛠️ API Endpoints

### Admin Endpoints
- `GET /api/admin/users` - Get all users
- `POST /api/admin/users` - Add new users
- `DELETE /api/admin/users/[id]` - Delete a user
- `POST /api/admin/upload-csv` - Upload CSV file

### Quiz Endpoints
- `GET /api/quiz/validate` - Validate quiz link

## 🎯 Next Steps

1. **Set up email service integration** (Bravo, SendGrid, etc.)
2. **Create the quiz interface** with questions from `src/constants/questions.json`
3. **Implement AI routine generation** using the AI SDK
4. **Add product database** and filtering logic
5. **Create user dashboard** to view personalized routines

## 🐛 Troubleshooting

### Common Issues

1. **Database connection errors**
   - Check your Supabase credentials in `.env`
   - Ensure the database tables are created

2. **Admin access denied**
   - Verify your email is in the `ADMIN_EMAILS` environment variable
   - Check that you're signed in with the correct account
   - Ensure email verification is completed

3. **CSV upload not working**
   - Make sure the CSV has an "email" column
   - Check file format (must be .csv)

4. **Quiz links not working**
   - Verify the `NEXT_PUBLIC_APP_URL` environment variable
   - Check that users exist in the database

5. **Authentication issues**
   - Clear browser cookies and try again
   - Check Supabase authentication settings
   - Verify email verification is enabled

### Getting Help

If you encounter issues:
1. Check the browser console for errors
2. Verify your environment variables
3. Check the Supabase logs
4. Ensure all dependencies are installed

## 📝 Notes

- The current implementation uses basic token validation. For production, consider using JWT tokens with expiration.
- The CSV upload supports any column name containing "email" (case insensitive).
- Users can be added multiple times, but only unique emails will be stored.
- The quiz validation is currently basic - you may want to add rate limiting and better security for production use.
- Admin authentication uses Supabase Auth with email-based authorization.
- The middleware protects all admin routes automatically.
