-- Fix anonymous access: Drop and recreate policies to require authentication

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;

DROP POLICY IF EXISTS "Users can view own roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can view all roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can manage roles" ON public.user_roles;

DROP POLICY IF EXISTS "Users can view own applications" ON public.worker_applications;
DROP POLICY IF EXISTS "Users can insert applications" ON public.worker_applications;
DROP POLICY IF EXISTS "Admins can view all applications" ON public.worker_applications;
DROP POLICY IF EXISTS "Admins can update applications" ON public.worker_applications;

-- Recreate profiles policies for authenticated users only
CREATE POLICY "Authenticated users can view own profile"
ON public.profiles FOR SELECT
TO authenticated
USING (auth.uid() = id);

CREATE POLICY "Authenticated users can update own profile"
ON public.profiles FOR UPDATE
TO authenticated
USING (auth.uid() = id);

CREATE POLICY "Authenticated users can insert own profile"
ON public.profiles FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = id);

CREATE POLICY "Admins can view all profiles"
ON public.profiles FOR SELECT
TO authenticated
USING (public.is_admin());

-- Recreate user_roles policies for authenticated users only
CREATE POLICY "Authenticated users can view own roles"
ON public.user_roles FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all roles"
ON public.user_roles FOR SELECT
TO authenticated
USING (public.is_admin());

CREATE POLICY "Admins can manage roles"
ON public.user_roles FOR ALL
TO authenticated
USING (public.is_admin());

-- Recreate worker_applications policies
CREATE POLICY "Authenticated users can view own applications"
ON public.worker_applications FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Anyone can insert applications"
ON public.worker_applications FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Admins can view all applications"
ON public.worker_applications FOR SELECT
TO authenticated
USING (public.is_admin());

CREATE POLICY "Admins can update applications"
ON public.worker_applications FOR UPDATE
TO authenticated
USING (public.is_admin());