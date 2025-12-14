-- Allow ALL authenticated users to view profiles of counselors
-- This is necessary for students to see who their counselor is in the session history.

BEGIN;

-- Drop just in case it exists (though it shouldn't)
DROP POLICY IF EXISTS "Everyone can view counselor profiles" ON public.users;

-- Create the policy
CREATE POLICY "Everyone can view counselor profiles"
ON public.users
FOR SELECT
TO authenticated
USING ( role = 'counselor' );

COMMIT;
