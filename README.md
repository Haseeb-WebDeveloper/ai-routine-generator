# 🧴 AI-Powered Skincare Routine Generator

A personalized skincare routine generator that uses AI to create custom recommendations based on user preferences and skin characteristics.

## 🚀 Features

- **Admin Dashboard**: Secure admin interface with authentication
- **User Management**: Add users individually or via CSV upload
- **Email Campaigns**: Create and manage email campaigns with templates
- **Email Templates**: Customizable email templates with variable support
- **Klaviyo Integration**: Professional email delivery via Klaviyo API
- **Quiz Link Generation**: Automatic unique link generation for each user
- **Database Integration**: PostgreSQL database with Supabase
- **Authentication**: Secure admin login system

## 🛠️ Tech Stack

- **Frontend**: Next.js 15 (App Router) + TypeScript + Tailwind CSS
- **Backend**: Next.js API Routes + Supabase
- **Database**: PostgreSQL (via Supabase)
- **Authentication**: Supabase Auth
- **Email Service**: Klaviyo
- **UI Components**: shadcn/ui + Radix UI
- **Package Manager**: Bun

## 📋 Prerequisites

- Node.js 18+ or Bun
- Supabase account
- Klaviyo account (for email functionality)

## 🚀 Getting Started

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd ai-routine
   ```

2. **Install dependencies**
   ```bash
   bun install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```
   
   Fill in your environment variables:
   ```bash
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
   KLAVIYO_API_KEY=your_klaviyo_api_key
   KLAVIYO_LIST_ID=your_klaviyo_list_id
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   ```

4. **Set up the database**
   - Run the SQL commands from `supabase-schema.sql` in your Supabase SQL editor
   - Or use the Supabase CLI to apply the schema

5. **Create an admin account**
   ```bash
   bun run create-admin
   ```
   Or for quick development setup:
   ```bash
   bun run quick-setup
   ```

6. **Start the development server**
   ```bash
   bun dev
   ```

7. **Access the admin dashboard**
   - Go to [http://localhost:3000/admin](http://localhost:3000/admin)
   - Log in with your admin credentials

## 📚 Documentation

- [Admin Setup Guide](ADMIN_SETUP.md)
- [Klaviyo Email Integration](KLAVIYO_SETUP.md)
- [Database Schema](supabase-schema.sql)

## 🔧 Available Scripts

- `bun dev` - Start development server
- `bun build` - Build for production
- `bun start` - Start production server
- `bun create-admin` - Create admin account
- `bun quick-setup` - Quick development setup

## 📁 Project Structure

```
ai-routine/
├── src/
│   ├── app/                 # Next.js App Router
│   │   ├── admin/          # Admin pages
│   │   ├── api/            # API routes
│   │   └── quiz/           # Quiz pages
│   ├── components/         # React components
│   │   ├── admin/         # Admin-specific components
│   │   └── ui/            # Reusable UI components
│   ├── lib/               # Utility functions
│   ├── types/             # TypeScript type definitions
│   └── constants/         # Application constants
├── scripts/               # Node.js scripts
├── public/               # Static assets
└── supabase-schema.sql   # Database schema
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.
