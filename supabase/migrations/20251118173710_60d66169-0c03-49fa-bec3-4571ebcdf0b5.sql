-- Create app_role enum for proper role management
CREATE TYPE public.app_role AS ENUM ('admin', 'volunteer', 'citizen');

-- Create user_roles table (proper security pattern)
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Security definer function to check roles without RLS recursion
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- RLS policies for user_roles
CREATE POLICY "Users can view their own roles"
ON public.user_roles FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all roles"
ON public.user_roles FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- Create donations table with currency support
CREATE TABLE public.donations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  donor_name TEXT NOT NULL,
  donor_email TEXT,
  amount NUMERIC NOT NULL,
  currency TEXT NOT NULL DEFAULT 'RWF',
  payment_method TEXT NOT NULL,
  payment_status TEXT NOT NULL DEFAULT 'pending',
  stripe_session_id TEXT,
  mobile_money_reference TEXT,
  message TEXT,
  is_anonymous BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.donations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Donations are viewable by everyone"
ON public.donations FOR SELECT
USING (true);

CREATE POLICY "Authenticated users can create donations"
ON public.donations FOR INSERT
WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

-- Create volunteer attendance table for QR check-in/out
CREATE TABLE public.volunteer_attendance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  check_in_time TIMESTAMP WITH TIME ZONE DEFAULT now(),
  check_out_time TIMESTAMP WITH TIME ZONE,
  qr_code TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.volunteer_attendance ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Attendance viewable by everyone"
ON public.volunteer_attendance FOR SELECT
USING (true);

CREATE POLICY "Users can check in/out"
ON public.volunteer_attendance FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own attendance"
ON public.volunteer_attendance FOR UPDATE
USING (auth.uid() = user_id);

-- Update reports table RLS to allow admin approval
CREATE POLICY "Admins can update all reports"
ON public.reports FOR UPDATE
USING (public.has_role(auth.uid(), 'admin'));

-- Update projects table RLS to allow admin management
CREATE POLICY "Admins can manage all projects"
ON public.projects FOR ALL
USING (public.has_role(auth.uid(), 'admin'));