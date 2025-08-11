# AI Skincare Routine Generator - Complete Project Documentation

## 📖 What This Website Does (Non-Technical Explanation)

### 🎯 **Main Purpose**
This is an **AI-powered skincare consultation website** that acts like having a personal dermatologist available 24/7. Here's what it does:

1. **Personalized Skin Assessment**: Users take an interactive quiz about their skin type, concerns, age, budget, and preferences
2. **AI-Powered Recommendations**: An artificial intelligence system analyzes their answers to understand their unique skin profile
3. **Custom Skincare Routine**: The AI creates a personalized morning and evening skincare routine specifically for them
4. **Product Recommendations**: Suggests specific skincare products that match their needs and budget
5. **Email Delivery**: Sends the complete routine directly to their email address

### 🚀 **How It Works for Users**
1. **User receives a unique link** (usually via email from an admin)
2. **Takes a conversational quiz** - the AI asks questions one by one in natural language
3. **AI analyzes responses** and builds a complete skin profile
4. **Personalized routine is generated** with specific product recommendations
5. **Results are emailed** to the user for easy access

### 🏢 **How It Works for Businesses**
1. **Admin dashboard** to manage users and campaigns
2. **Bulk user management** - add users individually or upload lists via CSV
3. **Email campaign creation** - send personalized invitations to take the quiz
4. **Template management** - customize email messages and branding
5. **Analytics tracking** - monitor quiz completion rates and user engagement

---

## 🛠️ Technical Architecture (Developer Explanation)

### **Technology Stack**
- **Frontend**: Next.js 15 (App Router) + TypeScript + Tailwind CSS
- **Backend**: Next.js API Routes + Supabase
- **Database**: PostgreSQL (via Supabase)
- **AI Engine**: Cohere AI (Command R Plus model)
- **Authentication**: Supabase Auth
- **Email Service**: Klaviyo
- **UI Components**: shadcn/ui + Radix UI
- **Package Manager**: Bun
- **Deployment**: Vercel-ready

### **System Architecture**

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   User Browser  │    │   Next.js App   │    │   Supabase DB   │
│                 │◄──►│                 │◄──►│                 │
│  - Quiz Page    │    │  - API Routes   │    │  - User Data    │
│  - Admin Panel  │    │  - AI Tools     │    │  - Products    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                │
                                ▼
                       ┌─────────────────┐
                       │   Cohere AI     │
                       │                 │
                       │  - AI Chat      │
                       │  - Tool Usage   │
                       └─────────────────┘
```

### **Core Components**

#### 1. **AI Agent System** (`src/lib/ai.tsx`)
- **Purpose**: Manages conversation flow and tool execution
- **Model**: Cohere Command R Plus for natural language understanding
- **Tools**: Integrated function calling for routine generation and email sending

#### 2. **Conversation Flow** (`src/lib/ai-config.ts`)
- **Structured 10-question assessment** covering all skin profile aspects
- **Natural language processing** for user-friendly interactions
- **Contextual memory** to maintain conversation state

#### 3. **AI Tools** (`src/tools/`)
- **`planAndSendRoutine`**: Main tool that:
  - Queries product database based on user profile
  - Generates personalized routine using AI
  - Sends results via email
  - Returns summary to user

#### 4. **Database Schema** (`supabase-schema.sql`)
```sql
-- Core Tables
user_emails          -- User registration and tracking
quiz_responses       -- Individual quiz answers
email_templates      -- Reusable email templates
campaigns            -- Email campaign management
products             -- Skincare product database
```

#### 5. **API Endpoints** (`src/app/api/`)
- **`/api/chat`**: AI conversation handling
- **`/api/send-mail`**: Email delivery service
- **`/api/admin/*`**: Admin dashboard functionality
- **`/api/quiz/validate`**: Quiz validation and processing

---

## 🔄 **Data Flow & User Journey**

### **Complete User Experience Flow**

```
1. User Registration
   ↓
2. Email Invitation Sent
   ↓
3. User Clicks Unique Link
   ↓
4. AI Chat Interface Opens
   ↓
5. 10-Question Assessment
   ↓
6. AI Processes Responses
   ↓
7. Product Database Query
   ↓
8. Routine Generation
   ↓
9. Email Delivery
   ↓
10. User Receives Complete Routine
```

### **Technical Data Flow**

```
User Input → AI Processing → Tool Execution → Database Query → 
AI Generation → Email API → User Email → Success Response
```

---

## 🎨 **User Interface Components**

### **Quiz Interface** (`src/app/quiz/page.tsx`)
- **Real-time chat** with AI consultant
- **Streaming responses** for natural conversation feel
- **Progress indicators** during AI processing
- **Responsive design** for mobile and desktop

### **Admin Dashboard** (`src/app/admin/page.tsx`)
- **Tabbed interface** for different management areas
- **User management** - add, view, and manage users
- **Campaign creation** - design and send email campaigns
- **Template management** - customize email content
- **Product management** - maintain skincare product database

### **UI Component Library** (`src/components/ui/`)
- **shadcn/ui components** for consistent design
- **Responsive layouts** with Tailwind CSS
- **Accessibility features** following WCAG guidelines
- **Dark/light theme support** via theme provider

---

## 🔐 **Security & Authentication**

### **Admin Access Control**
- **Supabase authentication** for secure admin login
- **Environment-based admin emails** configuration
- **Protected API routes** with role-based access
- **Session management** with secure cookies

### **Data Protection**
- **Row Level Security (RLS)** in PostgreSQL
- **Input validation** with Zod schemas
- **SQL injection prevention** via Supabase client
- **Environment variable protection** for sensitive data

---

## 📧 **Email System Integration**

### **Klaviyo Email Service**
- **Professional email delivery** with high deliverability
- **Template system** with variable substitution
- **Campaign tracking** and analytics
- **Automated sending** for bulk campaigns
- **Contact list management** and segmentation

### **Email Templates**
- **Quiz invitations** with personalized links
- **Follow-up reminders** for incomplete quizzes
- **Welcome back** messages for returning users
- **Variable support** for personalization

---

## 🗄️ **Database Design**

### **Product Database Structure**
```sql
products table:
- Basic info: name, brand, type, price
- Skin compatibility: skin_types[], skin_concerns[]
- Product attributes: texture, ingredients, warnings
- Performance metrics: popularity_score, rating
- Purchase links: direct links to buy products
```

### **User Management Tables**
```sql
user_emails: Core user registration
quiz_responses: Individual assessment answers
campaigns: Email campaign tracking
email_templates: Reusable message templates
```

### **Performance Optimizations**
- **GIN indexes** for array-based searches
- **Composite indexes** for common query patterns
- **Automatic timestamp updates** via triggers
- **Row Level Security** for data isolation

---

## 🚀 **Deployment & Setup**

### **Environment Variables Required**
```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
KLAVIYO_API_KEY=your_klaviyo_api_key
KLAVIYO_LIST_ID=your_klaviyo_list_id
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### **Quick Setup Commands**
```bash
# Install dependencies
bun install

# Create admin account
bun run create-admin

# Quick development setup
bun run quick-setup

# Add sample products
bun run add-sample-products

# Start development server
bun dev
```

---

## 🔧 **Development & Customization**

### **Adding New AI Tools**
1. Create tool function in `src/tools/`
2. Export in `src/tools/index.ts`
3. Update AI configuration in `src/lib/ai-config.ts`
4. Test with conversation flow

### **Customizing Quiz Questions**
- Modify `src/lib/ai-config.ts` prompt templates
- Update database schema if new fields needed
- Adjust AI tool input schemas accordingly

### **Product Database Management**
- Use admin panel to add/edit products
- Import bulk products via CSV upload
- Maintain product attributes and compatibility data

---

## 📊 **Analytics & Monitoring**

### **User Engagement Metrics**
- Quiz completion rates
- User registration tracking
- Email campaign performance
- Product recommendation effectiveness

### **AI Performance Monitoring**
- Tool execution success rates
- Response generation quality
- User satisfaction metrics
- Error tracking and resolution

---

## 🔮 **Future Enhancements**

### **Potential Features**
- **Mobile app** for better user experience
- **Social sharing** of routines
- **Progress tracking** for skin improvement
- **Expert consultation** integration
- **Product reviews** and ratings
- **Subscription management** for ongoing support

### **Technical Improvements**
- **Real-time notifications** via WebSockets
- **Advanced AI models** for better recommendations
- **Machine learning** for routine optimization
- **A/B testing** for conversion optimization
- **Multi-language support** for global reach

---

## 📚 **Additional Resources**

### **Setup Guides**
- [Admin Setup Guide](ADMIN_SETUP.md)
- [Klaviyo Email Integration](KLAVIYO_SETUP.md)
- [Product Database Setup](PRODUCT_SETUP.md)

### **API Documentation**
- Chat API: `/api/chat`
- Email API: `/api/send-mail`
- Admin APIs: `/api/admin/*`

### **Database Schema**
- [Main Schema](supabase-schema.sql)
- [Products Table](add-products-table.sql)

---

## 🤝 **Support & Contributing**

### **Getting Help**
- Review setup guides and troubleshooting docs
- Check error logs in browser console
- Verify environment variable configuration
- Test individual components in isolation

### **Contributing to the Project**
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

---

## 📄 **License**

This project is licensed under the MIT License.

---

*This documentation covers both the technical implementation details for developers and the business functionality for non-technical stakeholders. The system is designed to be scalable, secure, and user-friendly while providing powerful AI-driven skincare recommendations.*
