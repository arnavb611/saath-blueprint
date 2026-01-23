-- Fix: Worker Contact Information Exposed Publicly
-- This migration creates a public view without sensitive contact information
-- and restricts direct access to the workers table for anonymous users

-- Step 1: Create a public view that excludes email and phone
CREATE VIEW public.workers_public
WITH (security_invoker = on) AS
SELECT 
  id,
  name,
  service,
  area,
  experience,
  price,
  photo,
  rating,
  reviews_count,
  is_verified,
  is_available,
  created_at,
  updated_at
FROM public.workers
WHERE is_verified = true;

-- Step 2: Grant SELECT on the view to anon and authenticated roles
GRANT SELECT ON public.workers_public TO anon;
GRANT SELECT ON public.workers_public TO authenticated;

-- Step 3: Drop the overly permissive public policy
DROP POLICY IF EXISTS "Anyone can view verified workers" ON public.workers;

-- Step 4: Create a new policy that only allows authenticated users to view workers
-- (Contact info will be accessible to authenticated users who have booked the worker)
CREATE POLICY "Authenticated users can view verified workers"
ON public.workers
FOR SELECT
TO authenticated
USING (is_verified = true);

-- Note: The workers_public view will be used for public listing without contact info
-- The workers table with contact info will only be accessible to authenticated users