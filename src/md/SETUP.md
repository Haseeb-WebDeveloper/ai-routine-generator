# AI Skincare - Setup Guide

## Authentication Setup with Supabase

### 1. Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and create a new account or sign in
2. Create a new project
3. Wait for the project to be set up (this may take a few minutes)

### 2. Configure Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

You can find these values in your Supabase project dashboard:
- Go to Settings → API
- Copy the "Project URL" and "anon public" key

### 3. Configure Authentication in Supabase

1. In your Supabase dashboard, go to Authentication → Settings
2. Configure your site URL (for development, use `http://localhost:3000`)
3. Add redirect URLs:
   - `http://localhost:3000/auth/callback`
   - `http://localhost:3000/dashboard`

### 4. Enable Email Authentication

1. Go to Authentication → Providers
2. Make sure "Email" is enabled
3. Configure email templates if desired

### 5. Run the Application

```bash
bun dev
```

The application will be available at `http://localhost:3000`

## Features Implemented

- ✅ User registration with email/password
- ✅ User login/logout
- ✅ Protected routes
- ✅ Authentication context
- ✅ Modern UI with shadcn/ui components
- ✅ Responsive design
- ✅ Loading states and error handling

## Next Steps

1. Create database tables for user profiles and skincare routines
2. Implement the skin quiz functionality
3. Set up AI integration for routine generation
4. Add product database and filtering logic

## Project Structure

```
src/
├── app/
│   ├── auth/           # Authentication pages
│   ├── layout.tsx      # Root layout with AuthProvider
│   └── page.tsx        # Protected dashboard
├── components/
│   ├── auth/           # Authentication components
│   └── ui/             # shadcn/ui components
├── contexts/
│   └── AuthContext.tsx # Authentication context
├── lib/
│   └── supabase.ts     # Supabase client
└── types/
    └── auth.ts         # Authentication types
```
