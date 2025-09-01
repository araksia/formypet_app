-- Create table for remote debug logs
CREATE TABLE public.debug_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  level TEXT NOT NULL DEFAULT 'info',
  message TEXT NOT NULL,
  component TEXT,
  user_agent TEXT,
  url TEXT,
  metadata JSONB
);

-- Enable RLS (but allow public access for debugging)
ALTER TABLE public.debug_logs ENABLE ROW LEVEL SECURITY;

-- Allow anyone to insert logs (for debugging purposes)
CREATE POLICY "Anyone can insert debug logs" 
ON public.debug_logs 
FOR INSERT 
WITH CHECK (true);

-- Allow viewing logs (you can restrict this later)
CREATE POLICY "Anyone can view debug logs" 
ON public.debug_logs 
FOR SELECT 
USING (true);