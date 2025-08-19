# AI Skincare Agent: Complete Technical Architecture Guide 🤖✨

*Comprehensive Documentation for Project Managers*

## Executive Summary

The AI Skincare Agent is a sophisticated conversational AI system that provides personalized skincare consultations through a web application. It combines multiple AI models, a comprehensive product database, intelligent matching algorithms, and automated email delivery to create a complete end-to-end skincare recommendation service.

**Key Technologies:** Next.js, PostgreSQL, Prisma ORM, Google Gemini AI, Cohere AI, Supabase Auth, Nodemailer, TypeScript

## System Architecture Overview

### Frontend Layer (Next.js + React)
- **Framework:** Next.js 14 with TypeScript
- **UI Components:** Custom React components with Tailwind CSS
- **Chat Interface:** Real-time streaming chat using `@ai-sdk/react`
- **State Management:** React hooks and Zustand for product display
- **Authentication:** Cookie-based session management

### Backend Layer (API Routes)
- **Runtime:** Node.js with Next.js API routes
- **Database ORM:** Prisma with PostgreSQL
- **AI Integration:** Multiple AI providers (Google Gemini, Cohere)
- **Email Service:** Nodemailer with Brevo SMTP
- **Authentication:** Supabase Auth + Custom session management

### Database Layer (PostgreSQL)
- **Primary Database:** PostgreSQL with Prisma ORM
- **User Management:** Comprehensive user profiles and quiz responses
- **Product Catalog:** 40+ product types with detailed metadata
- **Conversation History:** Chat messages and tool executions stored

### AI Layer (Multi-Model Architecture)
- **Primary Conversational AI:** Google Gemini 2.5 Flash
- **Routine Generation AI:** Cohere Command-R-Plus
- **Tool Execution Framework:** Vercel AI SDK
- **Conversation Management:** Structured prompt templates

## Detailed System Components

### 1. User Authentication & Session Management

#### Authentication Flow
```
User Email → Token Generation → Email Link → Quiz Auth API → Session Cookies
```

**Key Components:**
- `src/app/api/quiz-auth/route.ts` - Handles email-based authentication
- `src/app/api/auth/signin/route.ts` - Standard login authentication
- Cookie-based session management with multiple validation layers

**Authentication Methods:**
1. **Email Link Authentication** (Primary for quiz users)
   - Generates secure base64 tokens with timestamp validation
   - 24-hour token expiration
   - Sets multiple cookies: `quiz_verified`, `quiz_email`, `quiz_user_id`

2. **Standard Login** (For admin/registered users)
   - Supabase Auth integration
   - JWT tokens with refresh mechanism
   - Role-based access control

**Security Features:**
- Token timestamp validation (24-hour expiry)
- HTTP-only cookies for sensitive data
- CSRF protection with SameSite cookies
- Environment-based secure flag settings

### 2. Database Schema & Data Models

#### Core Database Tables

**Users Table (`users`)**
```sql
- id: TEXT (Primary Key, CUID)
- email: TEXT (Unique)
- name: TEXT (Default: "User")
- password_hash: TEXT (Optional for OAuth users)
- is_active: BOOLEAN (Default: true)
- quiz_completed: BOOLEAN (Default: false)
- role: TEXT (Default: "user")
- skin_profile_id: TEXT (Foreign Key to SkinProfile)
- created_at, updated_at: TIMESTAMP
```

**Products Table (`products`)**
```sql
- id: TEXT (Primary Key)
- name, brand: TEXT
- type: ProductType ENUM (40+ types: CLEANSER, SERUM, etc.)
- gender: Gender ENUM (MALE, FEMALE, UNISEX)
- age: AgeRange[] ARRAY (AGE_18_25, AGE_26_35, etc.)
- budget: BudgetRange ENUM (BUDGET_FRIENDLY, MID_RANGE, PREMIUM)
- skin_types: SkinType[] ARRAY (OILY, DRY, COMBINATION, etc.)
- skin_concerns: SkinConcern[] ARRAY (ACNE, WRINKLES, etc.)
- ingredients: JSONB (Structured ingredient data)
- texture: Texture ENUM (GEL, CREAM, LOTION, etc.)
- use_time: UseTime[] ARRAY (MORNING, NIGHT)
- price: DECIMAL
- purchase_link, image_url: TEXT
- instructions: TEXT
```

**Conversation Management**
```sql
- conversations: Stores chat sessions per user
- chat_messages: Individual messages with metadata
- quiz_responses: Structured quiz data for analytics
```

#### Data Relationships
- Users → SkinProfiles (1:1)
- Users → Conversations (1:Many)
- Conversations → ChatMessages (1:Many)
- Users → QuizResponses (1:Many)

### 3. AI Conversation Engine

#### Multi-AI Architecture

**Primary Conversational AI: Google Gemini 2.5 Flash**
- **Purpose:** Natural conversation, question asking, context management
- **Location:** `src/lib/ai.tsx`
- **Features:**
  - Streaming responses for real-time chat experience
  - Tool calling capabilities for executing backend functions
  - Context memory across conversation turns
  - Multi-language support with auto-detection

**Routine Generation AI: Cohere Command-R-Plus**
- **Purpose:** Scientific skincare routine creation
- **Location:** `src/tools/plan-and-send.ts` (line 294)
- **Features:**
  - Specialized in dermatology knowledge
  - Creates personalized morning/evening routines
  - Explains product choices with scientific reasoning
  - Formats output for email delivery

#### Conversation Flow Management

**Structured Prompt System (`src/lib/ai-config.ts`)**
```typescript
- SYSTEM_PROMPT: 200+ lines of detailed AI behavior instructions
- Conversation stages: Greeting → Assessment → Tool Execution
- 10 mandatory questions with validation rules
- Skin type detection protocol with keyword analysis
- Age-appropriate response guidelines
- Language adaptation capabilities
```

**Tool Execution Framework**
- **Available Tools:** 2 main tools (`send_mail`, `plan_and_send_routine`)
- **Tool Calling:** Automatic execution after question completion
- **State Management:** Tools can modify conversation state
- **Error Handling:** Graceful degradation with user feedback

### 4. Product Matching & Recommendation Engine

#### Advanced Product Search API (`src/app/api/tools/product-search/route.ts`)

**Multi-Stage Product Selection Process:**

**Stage 1: Required Products Selection**
```typescript
// Essential products for any routine
ROUTINE_REQUIREMENTS = {
  minimal: { required: ['cleanser', 'moisturizer', 'sunscreen'], maxProducts: 4 },
  standard: { required: ['cleanser', 'moisturizer', 'sunscreen'], preferred: ['toner', 'serum', 'eyeCream'], maxProducts: 7 },
  comprehensive: { required: ['cleanser', 'moisturizer', 'sunscreen'], preferred: ['toner', 'serum', 'eyeCream', 'essence'], optional: ['spotTreatment', 'faceOil', 'sleepingMask'], maxProducts: 12 }
}
```

**Stage 2: Concern-Specific Product Matching**
```typescript
// Intelligent concern-to-product mapping
CONCERN_PRIORITY_MAP = {
  acne: ['spotTreatment', 'serum', 'cleanser', 'toner'],
  blackheads: ['exfoliant', 'cleanser', 'toner', 'poreMinimizer'],
  hyperpigmentation: ['serum', 'vitaminC', 'brightening', 'sunscreen'],
  fine_lines: ['serum', 'retinoid', 'eyeCream', 'antiAging'],
  // ... 15+ concern mappings
}
```

**Stage 3: Advanced Scoring Algorithm**
```typescript
function scoreProducts(products, userProfile) {
  // Scoring matrix:
  // +10 points: Exact skin type match
  // +5 points per concern match
  // +3 points: Budget compatibility
  // +2 points: Gender/unisex match
  // +1 point: Age appropriateness
  // Additional multipliers for climate and preferences
}
```

**Stage 4: Smart Filtering & Deduplication**
- Removes duplicate brand-product combinations
- Applies budget hierarchy (Premium users can access all tiers)
- Age-range filtering with intelligent defaults
- Climate-based texture adjustments

### 5. Plan & Send Routine Tool (Core Business Logic)

#### Tool Architecture (`src/tools/plan-and-send.ts`)

**Input Validation & Normalization**
```typescript
interface ToolProfile {
  skinType?: string;           // Validated against Prisma enums
  skinConcerns?: string[];     // Array of concern enums
  gender?: string;             // MALE, FEMALE, UNISEX
  age?: string;               // Converted to age ranges
  allergies?: string;         // Free text, used for filtering
  climate?: string;           // Affects product texture selection
  routineComplexity?: string; // minimal, standard, comprehensive
  budget?: string;            // With intelligent inference
  currentRoutine?: string;    // Context for personalization
  email: string;              // Required for delivery
  userImportantInformation?: string; // AI-generated user summary
}
```

**Intelligent Budget Inference**
```typescript
function inferBudgetFromProfile(profile) {
  // Age-based budget assumptions:
  // < 22 years: budgetFriendly
  // Comprehensive routine preference: Premium
  // Professional age (25-45) + standard: midRange
  // Default: midRange for balanced approach
}
```

**Multi-Step Execution Process**
1. **Input Normalization:** Converts user inputs to database-compatible formats
2. **Product Search API Call:** Fetches curated products based on profile
3. **AI Routine Generation:** Creates personalized routine using Cohere
4. **Email Formatting:** Structures routine for email delivery
5. **Email Dispatch:** Sends via Nodemailer/Brevo SMTP
6. **Response Formatting:** Returns success/error with product data

### 6. Email Delivery System

#### SMTP Integration (`src/app/api/send-mail/route.ts`)

**Email Service Provider: Brevo (formerly Sendinblue)**
```typescript
const transporter = nodemailer.createTransporter({
  host: 'smtp-relay.brevo.com',
  port: 587,
  auth: {
    user: process.env.BREVO_SMTP_USER,
    pass: process.env.BREVO_SMTP_PASS,
  },
});
```

**Advanced Email Template System**
- **HTML Template:** Professional design with CSS styling
- **Responsive Design:** Mobile-optimized email layout
- **Dynamic Content:** Personalized routine insertion
- **Brand Consistency:** Custom header with gradient styling
- **Call-to-Action:** Product purchase links embedded

**Email Content Structure**
```html
Header: Gradient background with personalized greeting
Content: Routine sections with morning/evening organization
Product Details: Name, brand, usage instructions, purchase links
Footer: Encouragement message and disclaimer
```

**Delivery Features**
- **Dual Format:** Both HTML and plain text versions
- **Error Handling:** Comprehensive error catching and user feedback
- **Delivery Confirmation:** Message ID tracking
- **Spam Prevention:** Proper headers and sender reputation

### 7. Frontend Chat Interface

#### Real-Time Chat Implementation (`src/app/quiz/page.tsx`)

**Chat Framework: Vercel AI SDK (`@ai-sdk/react`)**
```typescript
const {
  messages,           // Message array with streaming updates
  sendMessage,        // Function to send user messages
  status,            // 'submitted', 'streaming', 'idle'
  error,             // Error state management
  stop,              // Stop streaming capability
  setMessages,       // Manual message management
} = useChat();
```

**Message Processing Pipeline**
1. **User Input:** Captured via controlled textarea component
2. **Message Sending:** Async dispatch to AI API
3. **Streaming Response:** Real-time AI response rendering
4. **Tool Execution:** Automatic tool calling display
5. **Product Extraction:** Parse tool outputs for product display
6. **UI Updates:** Dynamic product card rendering

**Advanced UI Features**
- **Message Hiding:** Initial greeting message hidden from UI
- **Tool Indicators:** Loading spinners during tool execution
- **Product Display:** Automatic product card generation
- **Auto-scroll:** Chat automatically scrolls to latest message
- **Error Handling:** User-friendly error display with retry options
- **Reset Functionality:** Clear conversation and start over

#### Authentication Integration
```typescript
// Cookie-based authentication check
const getCookie = (name: string) => {
  // Parse document.cookie for authentication tokens
};

// Multi-cookie validation
const checkAuth = () => {
  const quizEmail = getCookie("quiz_email");
  const quizUserId = getCookie("quiz_user_id");
  const quizVerified = getCookie("quiz_verified");
  return quizEmail && quizUserId && quizVerified === "1";
};
```

### 8. Admin Dashboard & Content Management

#### Admin Authentication & Authorization
- **Role-based Access:** Admin users with elevated permissions
- **Protected Routes:** Middleware-based route protection
- **Session Management:** Persistent admin sessions

#### Content Management Features
- **Product Management:** CRUD operations for skincare products
- **User Management:** View and manage user accounts
- **Email Templates:** Customizable email template system
- **Campaign Management:** Bulk email campaign creation and scheduling
- **CSV Import:** Bulk product import functionality

#### Analytics & Monitoring
- **User Analytics:** Quiz completion rates and user behavior
- **Product Performance:** Most recommended products tracking
- **Email Delivery:** Campaign success rates and engagement metrics
- **System Health:** Error monitoring and performance tracking

### 9. Technical Implementation Details

#### Environment Configuration
```bash
# Database
DATABASE_URL=postgresql://...

# AI Services
GOOGLE_GENERATIVE_AI_API_KEY=...
COHERE_API_KEY=...

# Email Service
BREVO_SMTP_USER=...
BREVO_SMTP_PASS=...
BREVO_SENDER_EMAIL=...

# Authentication
SUPABASE_URL=...
SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...

# Application
NEXT_PUBLIC_BASE_URL=...
```

#### Performance Optimizations
- **Database Indexing:** Optimized queries for product search
- **Caching Strategy:** Static generation for public pages
- **API Rate Limiting:** Protection against abuse
- **Image Optimization:** Next.js automatic image optimization
- **Code Splitting:** Dynamic imports for reduced bundle size

#### Security Measures
- **Input Validation:** Zod schema validation throughout
- **SQL Injection Prevention:** Prisma ORM parameterized queries
- **XSS Protection:** React's built-in XSS prevention
- **CSRF Protection:** SameSite cookie configuration
- **Environment Isolation:** Separate development/production configs

### 10. Deployment & DevOps

#### Technology Stack
- **Frontend Hosting:** Vercel (optimized for Next.js)
- **Database:** PostgreSQL (managed service recommended)
- **File Storage:** Vercel/CDN for static assets
- **Email Service:** Brevo SMTP
- **Monitoring:** Built-in logging and error tracking

#### Scalability Considerations
- **Database Connection Pooling:** Prisma connection management
- **API Rate Limiting:** Protection against traffic spikes
- **CDN Integration:** Global content delivery
- **Horizontal Scaling:** Stateless API design
- **Caching Layer:** Redis integration ready

## Business Logic Flow Summary

### Complete User Journey (Technical Perspective)

1. **User Authentication**
   - Email-based token generation and validation
   - Session cookie establishment
   - User record creation/retrieval

2. **Conversation Initialization**
   - AI system prompt loading
   - Initial message dispatch with user context
   - Conversation state initialization

3. **Interactive Assessment**
   - 10-question structured interview
   - Real-time response validation
   - Context accumulation and memory management

4. **Product Matching Engine**
   - Multi-stage product filtering
   - Intelligent scoring algorithm
   - Routine complexity optimization

5. **AI Routine Generation**
   - Cohere AI scientific analysis
   - Personalized routine creation
   - Professional formatting and explanations

6. **Multi-Channel Delivery**
   - Email template generation and dispatch
   - Real-time UI product display
   - Purchase link integration

7. **Data Persistence**
   - Conversation logging
   - User preference storage
   - Analytics data collection

## Key Differentiators & Technical Advantages

### 1. **Multi-AI Architecture**
- Specialized AI models for different tasks (conversation vs. routine generation)
- Optimized for specific use cases rather than general-purpose AI

### 2. **Sophisticated Product Matching**
- Multi-dimensional scoring algorithm
- Concern-priority mapping system
- Budget and age-appropriate filtering

### 3. **Real-Time Streaming Interface**
- Live AI responses for natural conversation flow
- Tool execution visualization
- Immediate product display integration

### 4. **Comprehensive Data Model**
- 40+ product types with detailed metadata
- Complex relationship mapping
- Scalable schema design

### 5. **Enterprise-Grade Email Delivery**
- Professional SMTP integration
- Template customization system
- Delivery tracking and analytics

### 6. **Security-First Design**
- Multiple authentication layers
- Input validation throughout
- Production-ready security measures

## System Dependencies & Integration Points

### External Service Dependencies
1. **Google AI (Gemini 2.5 Flash)** - Primary conversational AI
2. **Cohere AI (Command-R-Plus)** - Routine generation AI
3. **Brevo SMTP** - Email delivery service
4. **Supabase** - Authentication and user management
5. **PostgreSQL** - Primary database
6. **Vercel** - Hosting and deployment platform

### Internal Service Integration
1. **Frontend ↔ Chat API** - Real-time message streaming
2. **Chat API ↔ AI Services** - Tool execution and response generation
3. **Product Search API ↔ Database** - Complex product queries
4. **Email API ↔ SMTP Service** - Template rendering and delivery
5. **Auth API ↔ Supabase** - User authentication and session management

### Data Flow Architecture
```
User Input → Frontend → Chat API → AI Services → Tools → Database/Email → Response → Frontend → User
```

## Performance Metrics & Monitoring

### Key Performance Indicators
- **Response Time:** AI response generation < 3 seconds
- **Email Delivery:** 99%+ successful delivery rate
- **Database Queries:** < 100ms average query time
- **User Completion Rate:** % of users completing full quiz
- **Product Match Accuracy:** User satisfaction with recommendations

### Monitoring & Alerting
- **Error Tracking:** Real-time error monitoring and alerting
- **Performance Monitoring:** API response times and database performance
- **Email Delivery Monitoring:** SMTP delivery success rates
- **User Analytics:** Conversation completion and abandonment rates
- **System Health:** Server uptime and resource utilization

---

*This system represents a sophisticated integration of AI, database technology, and user experience design to deliver personalized skincare consultations at scale. The architecture supports thousands of concurrent users while maintaining response quality and system reliability.*
