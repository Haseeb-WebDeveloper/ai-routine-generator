# Scripts Directory

This directory contains utility scripts for the AI Routine project.

## create-admin.cjs

A Node.js script to create admin accounts programmatically using Supabase Auth.

### Prerequisites

1. **Supabase Service Role Key**: You need the service role key from your Supabase project
   - Go to your Supabase dashboard
   - Navigate to Settings → API
   - Copy the "service_role" key (not the anon key)

2. **Environment Variables**: Add to your `.env` file:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   ```

### Usage

Run the script using npm/bun:

```bash
# Using npm
npm run create-admin

# Using bun
bun run create-admin

# Or directly
node scripts/create-admin.cjs
```

### What the script does

1. **Validates Input**: Checks email format and password requirements
2. **Creates User**: Uses Supabase Auth admin API to create a confirmed user
3. **Updates Environment**: Automatically adds the email to your admin environment variables
4. **Provides Feedback**: Shows success/error messages and next steps

### Example Output

```
🔐 AI Routine - Admin Account Creator

Enter admin email: admin@example.com
Enter admin password (min 6 characters): ********
Confirm admin password: ********

🔄 Creating admin account...
✅ Admin account created successfully!
📧 Email: admin@example.com
🆔 User ID: 12345678-1234-1234-1234-123456789abc
📅 Created: 12/19/2024, 2:30:45 PM

📝 Updating environment variables...
✅ Environment variables updated successfully!

🎉 Admin account setup complete!

Next steps:
1. Restart your development server
2. Access the admin dashboard at http://localhost:3000/admin
3. Sign in with your new admin credentials
```

### Security Notes

- The script uses the Supabase service role key which has admin privileges
- Keep your service role key secure and never commit it to version control
- The script automatically confirms the email to avoid verification steps
- Passwords are validated for minimum length (6 characters)

### Troubleshooting

**"Missing required environment variables"**
- Make sure you have both `NEXT_PUBLIC_SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` in your `.env`

**"Error creating user"**
- Check that your Supabase project is active
- Verify the service role key is correct
- Ensure the email isn't already registered

**"Could not update .env file"**
- The script will show you what to add manually
- Make sure the `.env` file is writable

## quick-setup.cjs

A simplified script that creates a default admin account for quick testing and development.

### Usage

```bash
# Using npm
npm run quick-setup

# Using bun
bun run quick-setup

# Or directly
node scripts/quick-setup.cjs
```

### What it creates

- **Email**: `admin@ai-routine.com`
- **Password**: `admin123456`
- **Status**: Email confirmed, ready to use immediately

### Use Cases

- **Development**: Quick setup for testing
- **Demo**: Fast admin account creation for presentations
- **CI/CD**: Automated setup for testing environments

### Security Warning

⚠️ **Never use the default credentials in production!**
- The default password is publicly known
- Always change the password after setup
- Use `create-admin.cjs` for production environments
