-- Fix security issue: Enable RLS on achievements table
ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;

-- Create policy for achievements - they should be readable by all authenticated users
CREATE POLICY "All authenticated users can view achievements"
ON public.achievements
FOR SELECT
TO authenticated
USING (true);