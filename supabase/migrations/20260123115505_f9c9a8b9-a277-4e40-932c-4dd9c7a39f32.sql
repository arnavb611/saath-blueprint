-- Create booking status enum
CREATE TYPE public.booking_status AS ENUM ('pending', 'confirmed', 'in_progress', 'completed', 'cancelled');

-- Create bookings table
CREATE TABLE public.bookings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  worker_id UUID NOT NULL REFERENCES public.workers(id) ON DELETE CASCADE,
  service TEXT NOT NULL,
  status public.booking_status NOT NULL DEFAULT 'pending',
  scheduled_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

-- RLS Policies for bookings

-- Users can view their own bookings
CREATE POLICY "Users can view own bookings"
ON public.bookings
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Users can create bookings for themselves
CREATE POLICY "Users can create own bookings"
ON public.bookings
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Users can update their own pending bookings (e.g., cancel)
CREATE POLICY "Users can update own pending bookings"
ON public.bookings
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id AND status = 'pending');

-- Admins can view all bookings
CREATE POLICY "Admins can view all bookings"
ON public.bookings
FOR SELECT
TO authenticated
USING (is_admin());

-- Admins can update any booking
CREATE POLICY "Admins can update all bookings"
ON public.bookings
FOR UPDATE
TO authenticated
USING (is_admin());

-- Admins can delete any booking
CREATE POLICY "Admins can delete all bookings"
ON public.bookings
FOR DELETE
TO authenticated
USING (is_admin());

-- Add trigger for updated_at
CREATE TRIGGER update_bookings_updated_at
BEFORE UPDATE ON public.bookings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();