# Edge Functions

This directory contains Supabase Edge Functions.

Edge Functions are serverless TypeScript functions that run on Deno. They can be used for API endpoints, webhooks, and other server-side logic.

## Structure

Each edge function has its own folder with an `index.ts` file:

```
functions/
├── function-name/
│   └── index.ts
└── another-function/
    └── index.ts
```

## Creating a New Edge Function

1. Create a new folder for your function:
   ```bash
   mkdir supabase/functions/my-function
   ```

2. Create an `index.ts` file inside the folder:
   ```bash
   touch supabase/functions/my-function/index.ts
   ```

3. Add your function code to `index.ts`:
   ```typescript
   import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

   serve(async (req) => {
     const { name } = await req.json()
     const data = {
       message: `Hello ${name}!`,
     }

     return new Response(
       JSON.stringify(data),
       { headers: { 'Content-Type': 'application/json' } },
     )
   })
   ```

4. Deploy your function:
   ```bash
   supabase functions deploy my-function
   ```

## Example Functions

### send-newsletter
Send newsletter emails to subscribers.

### contact-form
Handle contact form submissions.

### process-payment
Handle payment processing (if needed).

## Resources

For more information, visit: https://supabase.com/docs/guides/functions

