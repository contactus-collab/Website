# Ball Four Foundation Website

A modern React website for the Ball Four Foundation, a non-profit organization dedicated to raising awareness for Neurodevelopmental Disorders (ND).

## Features

- 🎨 Modern, responsive design with Tailwind CSS
- ⚡ Fast development with Vite
- 🗄️ Supabase integration for backend services
- 📱 Mobile-friendly navigation
- 📧 Newsletter subscription functionality
- 📝 Notes/blog section with dynamic content

## Tech Stack

- **Frontend**: React 18, TypeScript, React Router
- **Styling**: Tailwind CSS
- **Build Tool**: Vite
- **Backend**: Supabase
- **Package Manager**: npm
- **Deployment**: Vercel (recommended)

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Get your project URL and anon key from the project settings
3. Create a `.env` file in the root directory:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 3. Set Up Database Tables

**Option A: Using Supabase CLI (Recommended)**
```bash
# Install Supabase CLI if you haven't
npm install -g supabase

# Login to Supabase
supabase login

# Link your project
supabase link --project-ref your-project-ref

# Run migrations
supabase db push
```

**Option B: Using Supabase Dashboard**
1. Go to your Supabase project dashboard
2. Navigate to SQL Editor
3. Copy and paste the contents of `supabase/migrations/20240101000000_initial_schema.sql`
4. Execute the SQL

**Optional: Seed Sample Data**
To populate the database with sample notes, run the seed file:
```bash
# Using CLI
supabase db seed

# Or manually via Dashboard: Run the contents of supabase/seed/seed_data.sql
```

### 4. Run Development Server

```bash
npm run dev
```

The site will be available at `http://localhost:5173`

### 5. Build for Production

```bash
npm run build
```

The production build will be in the `dist` directory.

### 6. Deploy to Vercel

**Option A: Using Vercel CLI**
```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel
```

**Option B: Using Vercel Dashboard**
1. Push your code to GitHub, GitLab, or Bitbucket
2. Go to [vercel.com](https://vercel.com) and sign in
3. Click "New Project" and import your repository
4. Vercel will auto-detect Vite and configure the build settings
5. Add your environment variables:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
6. Click "Deploy"

**Note:** Make sure to add your environment variables in Vercel's project settings (Settings → Environment Variables).

## Project Structure

```
├── src/
│   ├── components/          # Reusable React components
│   │   ├── Navbar.tsx      # Navigation bar
│   │   ├── Footer.tsx      # Footer component
│   │   ├── Hero.tsx        # Hero section
│   │   ├── Mission.tsx     # Mission section
│   │   ├── WhatWeDo.tsx    # What We Do section
│   │   ├── LatestNotes.tsx # Latest notes preview
│   │   └── Newsletter.tsx  # Newsletter subscription
│   ├── pages/              # Page components
│   │   ├── Home.tsx        # Home page
│   │   ├── Purpose.tsx     # Purpose page
│   │   ├── Resources.tsx   # Resources page
│   │   ├── Notes.tsx       # All notes page
│   │   └── NewsletterPage.tsx # Newsletter page
│   ├── lib/                # Utility files
│   │   └── supabase.ts     # Supabase client configuration
│   ├── types/              # TypeScript type definitions
│   │   └── supabase.ts     # Supabase database types
│   ├── App.tsx             # Main app component with routing
│   ├── main.tsx            # Entry point
│   └── index.css           # Global styles
├── supabase/               # Supabase configuration and files
│   ├── migrations/         # Database migration files
│   │   └── 20240101000000_initial_schema.sql
│   ├── functions/          # Edge Functions (serverless functions)
│   └── seed/               # Seed data for development
│       └── seed_data.sql
├── tsconfig.json           # TypeScript configuration
├── vercel.json             # Vercel deployment configuration
└── README.md
```

For more information about the Supabase folder structure, see [supabase/README.md](./supabase/README.md).

## TypeScript

This project uses TypeScript for type safety and better developer experience. All components and utilities are written in TypeScript (`.tsx` and `.ts` files).

- Type definitions for Supabase tables are in `src/types/supabase.ts`
- TypeScript configuration is in `tsconfig.json`
- Strict type checking is enabled for better code quality

## Customization

- Update colors in `tailwind.config.js` to match your brand
- Modify content in component files (`.tsx` files)
- Add more pages by creating new components in `src/pages/` and adding routes in `App.tsx`
- Update type definitions in `src/types/` as your database schema evolves

## License

Copyright © 2024 - Ball Four Foundation | All rights reserved

