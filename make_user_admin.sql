-- SQL to make a user admin after they sign up
-- Replace 'shubakar01@gmail.com' with the email you used to sign up

-- Simple version - just update the role
UPDATE public.profiles 
SET role = 'admin'
WHERE email = 'shubakar01@gmail.com';

-- Verify it worked
SELECT id, email, role, created_at
FROM public.profiles
WHERE email = 'shubakar01@gmail.com';

-- You should see role = 'admin' in the results

