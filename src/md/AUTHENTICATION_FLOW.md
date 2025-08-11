# Enhanced Authentication Flow

## Overview

This document describes the new enhanced authentication flow implemented in the AI Routine application. The system now provides seamless user authentication when users access the application from campaign email links.

## Key Changes

### 1. User Creation with Names
- **Before**: Only email addresses were collected
- **Now**: Both name and email are required when creating users
- **Impact**: Better user experience and personalization

### 2. Automatic User Account Creation
- **Before**: Users were just added to a list
- **Now**: Full Supabase auth accounts are created with random passwords
- **Impact**: Users have actual accounts in the system

### 3. Direct Quiz Access
- **Before**: Users went through `/validate` → `/quiz` flow
- **Now**: Users go directly to `/quiz` with automatic authentication
- **Impact**: Streamlined user experience, no validation step needed

## Authentication Flow

### Step 1: Admin Creates Users
1. Admin uploads CSV with name and email columns, OR
2. Admin manually adds users with names and emails
3. System automatically:
   - Creates Supabase auth account with random password
   - Stores user data in `user_emails` table
   - Links auth account to user record

### Step 2: Campaign Trigger
1. Admin triggers email campaign
2. System generates secure tokens for each user
3. Emails are sent with direct links to `/quiz`
4. Links include email and secure token as query parameters

### Step 3: User Access
1. User clicks link in email
2. Link goes directly to `/quiz?email=...&token=...`
3. Middleware intercepts the request
4. System validates the secure token
5. If valid, user is automatically logged in
6. User proceeds directly to quiz

## Security Features

### Secure Token Generation
- Tokens include: `email:timestamp:random_string`
- Base64 encoded for URL safety
- 24-hour expiration
- Unique per user and campaign

### Authentication Cookies
- `sb-access-token`: Custom session token
- `sb-refresh-token`: User ID reference
- `quiz_verified`: Skip validation flag
- `quiz_email`: User's email
- `quiz_user_id`: User's auth ID

### Token Validation
- Email must match token email
- Timestamp must be within 24 hours
- User must exist and be active
- User must have valid auth account

## Database Schema Updates

### user_emails Table
```sql
ALTER TABLE user_emails 
ADD COLUMN name VARCHAR(255) NOT NULL DEFAULT '',
ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

CREATE INDEX idx_user_emails_user_id ON user_emails(user_id);
CREATE INDEX idx_user_emails_email ON user_emails(email);
```

## API Endpoints

### New Endpoints
- `POST /api/quiz-auth`: Handle quiz authentication
- Updated user creation endpoints to include names

### Modified Endpoints
- `POST /api/admin/users`: Now creates full auth accounts
- `POST /api/admin/upload-csv`: Handles name and email columns
- `POST /api/admin/campaigns/[id]/trigger`: Generates direct quiz links

## Middleware Changes

### Quiz Route Handling
- Intercepts `/quiz` requests with email and token
- Validates secure tokens
- Automatically authenticates users
- Sets appropriate cookies
- Redirects unauthorized users

### Backward Compatibility
- `/validate` route still works for existing links
- Existing validation flow preserved
- Gradual migration to new system

## Benefits

1. **Improved User Experience**: No more validation step
2. **Better Security**: Secure token-based authentication
3. **Full User Accounts**: Users have proper auth profiles
4. **Personalization**: Names available for better UX
5. **Streamlined Flow**: Direct access to quiz

## Migration Notes

### For Existing Users
- Run the SQL migration to add name and user_id columns
- Existing users will get default names
- Consider backfilling names if available

### For New Campaigns
- All new campaigns will use the direct quiz flow
- Old validation links will still work
- Gradually transition to new system

## Environment Variables

Ensure these are set:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` ⚠️ **CRITICAL FOR ADMIN OPERATIONS**
- `NEXT_PUBLIC_APP_URL`
- `ADMIN_EMAILS` (comma-separated admin emails)

## Setup Requirements

### 1. Supabase Service Role Key
The most critical requirement is the `SUPABASE_SERVICE_ROLE_KEY` environment variable. This key has admin privileges and is required for:
- Creating user accounts
- Managing user sessions
- Admin operations

**Without this key, user creation will fail with 500 errors.**

### 2. Database Migration
Run the SQL migration script to add required fields:
```bash
# Connect to your Supabase database and run:
psql -h your-project-ref.supabase.co -U postgres -d postgres -f add-name-field-to-users.sql
```

### 3. Environment Configuration
```bash
# .env.local
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
NEXT_PUBLIC_APP_URL=https://your-app-domain.com
ADMIN_EMAILS=admin@example.com,admin2@example.com
```

## Testing

### Test Scenarios
1. Create user with name and email
2. Trigger campaign
3. Click campaign link
4. Verify automatic login
5. Check quiz access
6. Verify cookie persistence

### Security Testing
1. Test expired tokens
2. Test invalid tokens
3. Test unauthorized access
4. Test token tampering
5. Test user deactivation

## Troubleshooting

### Common Issues

#### 1. User Creation Fails (500 Error)
**Symptoms**: `authUser { user: null }` in logs
**Cause**: Missing or invalid `SUPABASE_SERVICE_ROLE_KEY`
**Solution**: 
- Verify `SUPABASE_SERVICE_ROLE_KEY` is set in environment
- Check that the key has admin privileges
- Ensure the key is valid and not expired

#### 2. Database Schema Errors
**Symptoms**: Column not found errors
**Cause**: Database migration not run
**Solution**: Run the SQL migration script

#### 3. Authentication Failures
**Symptoms**: Users redirected to unauthorized page
**Cause**: Token validation or user lookup failures
**Solution**: Check user records in database and verify token generation

#### 4. Middleware Errors
**Symptoms**: 500 errors on quiz access
**Cause**: Admin client creation failures
**Solution**: Verify environment variables and Supabase configuration

### Debug Steps

1. **Check Environment Variables**
   ```bash
   echo $SUPABASE_SERVICE_ROLE_KEY
   ```

2. **Verify Database Schema**
   ```sql
   \d user_emails
   ```

3. **Check Logs**
   - Look for `authError` logs in API responses
   - Check middleware console errors
   - Verify user creation flow

4. **Test Admin Operations**
   - Try creating a user manually
   - Check Supabase dashboard for user creation
   - Verify auth.users table entries

## Security Considerations

### Service Role Key
- **NEVER** expose the service role key in client-side code
- Use only in server-side API routes and middleware
- Rotate keys regularly
- Monitor usage for suspicious activity

### Token Security
- Tokens expire after 24 hours
- Each token is unique per user and campaign
- Tokens are validated against user records
- Failed validation redirects to unauthorized page

### Cookie Security
- Authentication cookies are httpOnly
- Secure flag enabled in production
- SameSite policy prevents CSRF attacks
- Proper expiration times set

## Performance Notes

### Database Indexes
- Indexes created on `user_id` and `email` fields
- Improves query performance for user lookups
- Consider additional indexes based on usage patterns

### Caching
- User data cached in cookies for session duration
- Reduces database queries for authenticated users
- Session tokens expire appropriately

## Future Enhancements

### Planned Features
1. **User Profile Management**: Allow users to update their information
2. **Password Reset**: Self-service password reset functionality
3. **Session Management**: Better session handling and refresh
4. **Audit Logging**: Track user actions and system events

### Scalability Considerations
1. **Rate Limiting**: Implement API rate limiting
2. **Token Rotation**: Automatic token refresh mechanisms
3. **Load Balancing**: Distribute authentication load
4. **Monitoring**: Enhanced logging and monitoring

## Support

For issues or questions:
1. Check this documentation first
2. Review environment variable configuration
3. Verify database schema and migrations
4. Check application logs for detailed error messages
5. Test with minimal data to isolate issues
