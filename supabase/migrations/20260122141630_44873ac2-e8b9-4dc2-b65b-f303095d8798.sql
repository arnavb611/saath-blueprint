-- Create services table
CREATE TABLE public.services (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    base_price INTEGER NOT NULL DEFAULT 0,
    price_unit TEXT NOT NULL DEFAULT 'per hour',
    emoji TEXT,
    verified_workers_count INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create workers table
CREATE TABLE public.workers (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    phone TEXT NOT NULL,
    email TEXT,
    service TEXT NOT NULL,
    area TEXT NOT NULL,
    experience TEXT NOT NULL,
    price TEXT NOT NULL,
    photo TEXT,
    rating NUMERIC(2,1) NOT NULL DEFAULT 4.5,
    reviews_count INTEGER NOT NULL DEFAULT 0,
    is_verified BOOLEAN NOT NULL DEFAULT false,
    is_available BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on both tables
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workers ENABLE ROW LEVEL SECURITY;

-- Services policies: Public read, admin write
CREATE POLICY "Anyone can view services"
ON public.services FOR SELECT
USING (true);

CREATE POLICY "Admins can insert services"
ON public.services FOR INSERT
WITH CHECK (is_admin());

CREATE POLICY "Admins can update services"
ON public.services FOR UPDATE
USING (is_admin());

CREATE POLICY "Admins can delete services"
ON public.services FOR DELETE
USING (is_admin());

-- Workers policies: Public read verified, admin write
CREATE POLICY "Anyone can view verified workers"
ON public.workers FOR SELECT
USING (is_verified = true);

CREATE POLICY "Admins can view all workers"
ON public.workers FOR SELECT
USING (is_admin());

CREATE POLICY "Admins can insert workers"
ON public.workers FOR INSERT
WITH CHECK (is_admin());

CREATE POLICY "Admins can update workers"
ON public.workers FOR UPDATE
USING (is_admin());

CREATE POLICY "Admins can delete workers"
ON public.workers FOR DELETE
USING (is_admin());

-- Create triggers for updated_at
CREATE TRIGGER update_services_updated_at
BEFORE UPDATE ON public.services
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_workers_updated_at
BEFORE UPDATE ON public.workers
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Seed default services
INSERT INTO public.services (name, description, base_price, price_unit, emoji, verified_workers_count) VALUES
('Home Cleaning', 'Professional home cleaning services', 500, 'per visit', '🏠', 0),
('Electrician', 'Electrical repair and installation', 400, 'per hour', '⚡', 0),
('Plumber', 'Plumbing repair and maintenance', 350, 'per hour', '🔧', 0),
('Carpenter', 'Furniture repair and woodwork', 450, 'per hour', '🪚', 0),
('Painter', 'Interior and exterior painting', 300, 'per day', '🎨', 0),
('AC Repair', 'Air conditioner service and repair', 600, 'per visit', '❄️', 0),
('Cook', 'Professional cooking services', 400, 'per day', '👨‍🍳', 0),
('Driver', 'Personal driver services', 500, 'per day', '🚗', 0),
('Gardener', 'Garden maintenance and landscaping', 350, 'per visit', '🌱', 0),
('Security Guard', 'Professional security services', 800, 'per day', '👮', 0);