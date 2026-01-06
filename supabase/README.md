# Supabase Configuration

This directory contains all Supabase-related files including migrations, edge functions, and seed data.

## Directory Structure

```
supabase/
├── migrations/     # Database migration files
├── functions/      # Edge Functions (serverless TypeScript functions)
│   ├── function-name/
│   │   └── index.ts
│   └── another-function/
│       └── index.ts
└── seed/          # Seed data for development
```

## Migrations

Migrations are SQL files that define your database schema. They are run in chronological order based on their filename.

### Running Migrations

**Using Supabase Dashboard:**
1. Go to your Supabase project dashboard
2. Navigate to SQL Editor
3. Copy and paste the contents of migration files in order
4. Execute them

**Using Supabase CLI (recommended):**
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

### Migration Files

- `20240101000000_initial_schema.sql` - Initial database schema with notes and newsletter tables

## Edge Functions

Edge Functions are serverless TypeScript functions that run on Deno. They're perfect for API endpoints, webhooks, and other server-side logic.

### Example Use Cases

- Newsletter email sending
- Contact form processing
- Payment processing
- Data validation and transformation

### Creating a New Edge Function

Each edge function should have its own folder with an `index.ts` file:

1. Create a new folder for your function:
   ```bash
   mkdir supabase/functions/my-function-name
   ```

2. Create an `index.ts` file inside the folder:
   ```bash
   touch supabase/functions/my-function-name/index.ts
   ```

3. Add your function code to the `index.ts` file

Alternatively, you can use the Supabase CLI:
```bash
supabase functions new my-function-name
```

This will create a folder structure: `functions/my-function-name/index.ts`

### Deploying Edge Functions

```bash
supabase functions deploy my-function-name
```

## Seed Data

The `seed/` directory contains SQL files with sample data for development and testing.

### Running Seed Data

**Using Supabase Dashboard:**
1. Go to SQL Editor
2. Copy and paste the contents of `seed/seed_data.sql`
3. Execute

**Using Supabase CLI:**
```bash
supabase db seed
```

## Environment Variables

Make sure to set up your environment variables in `.env`:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase CLI](https://supabase.com/docs/reference/cli)
- [Edge Functions Guide](https://supabase.com/docs/guides/functions)
- [Database Migrations](https://supabase.com/docs/guides/cli/local-development#database-migrations)

