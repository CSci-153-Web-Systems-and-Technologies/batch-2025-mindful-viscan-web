# Mindful Viscan - Student Well-being Platform

A comprehensive web application designed to support student mental health through counseling services, mood tracking, and resource management. Built for "Web Systems and Technologies" (CSci 153).

## 🚀 Features

### 🎓 Student Dashboard
- **Session Management**: 
  - Request new counseling sessions.
  - View session history and status.
  - Cancel or delete sessions.
- **Real-time Chat**: 
  - Direct messaging with assigned counselors.
  - Real-time updates for active sessions.
- **Mood Tracking**: 
  - Daily mood logging (Rating + Summary + Notes).
  - **Year in Pixels** interactive heatmap.
  - Daily limit check (prevents double logging).
  - Integration with dashboard widget.
- **Resources**: Access curated mental health articles and videos.

### 👩‍⚕️ Counselor Dashboard
- **Session Oversight**: 
  - View all student requests.
  - Accept, decline, or complete sessions.
- **Chat Interface**: 
  - Dedicated chat interface to communicate with students.
  - Split view for managing multiple conversations.
- **Resource Management**: 
  - CRUD operations for resources (Add, Edit, Delete).
  - Categorization and search functionality.

### 🛠 Technical Highlights
- **Real-time Engine**: Powered by Supabase Realtime for instant chat and status updates.
- **Authentication**: Secure user management via Clerk (integrating Roles and Metadata).
- **Database**: PostgreSQL (Supabase) with Row Level Security (RLS) policies for privacy.
- **Sync Logic**: Custom webhook handlers to sync Clerk user profiles with Supabase database.
- **UI/UX**: Modern, responsive design using Tailwind CSS with custom "Mindful Green" palette.

## 🏗 Tech Stack

- **Framework**: [Next.js 16](https://nextjs.org/) (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Database**: [Supabase](https://supabase.com/) (PostgreSQL)
- **Auth**: [Clerk](https://clerk.com/)
- **State/Query**: Native React Hooks + Supabase Client

## 📦 Getting Started

1. **Clone the repository**:
   ```bash
   git clone <repository-url>
   cd batch-2025-mindful-viscan-web
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Environment Setup**:
   Create a `.env.local` file with the following keys:
   ```env
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
   CLERK_SECRET_KEY=sk_test_...
   NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
   NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
   NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
   NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard
   CLERK_WEBHOOK_SECRET=whsec_...

   NEXT_PUBLIC_SUPABASE_URL=https://...supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
   SUPABASE_SERVICE_ROLE_KEY=eyJ...
   ```

4. **Run Development Server**:
   ```bash
   npm run dev
   ```

5. **Open Browser**:
   Navigate to [http://localhost:3000](http://localhost:3000).

## 🔒 Security

- **RLS**: Row-Level Security policies ensure students access only their own data and counselors access only assigned data.
- **Middleware**: Route protection ensures unauthenticated users are redirected.
- **Role-based Access**: Custom `is_counselor()` database function and Clerk metadata enforce role permissions.

## 🤝 Contributing

This project is a class requirement. Contributions limited to the project team.
