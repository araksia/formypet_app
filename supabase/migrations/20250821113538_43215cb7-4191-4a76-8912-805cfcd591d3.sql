-- Fix critical security issue: Users can see all other users' email addresses
-- Drop the existing overly permissive policy
DROP POLICY IF EXISTS "Users can only view their own profile" ON public.profiles;

-- Create a more restrictive policy that only allows users to view their own profile
CREATE POLICY "Users can only view their own profile" 
ON public.profiles 
FOR SELECT 
USING (user_id = auth.uid());

-- Also improve family invitations security
-- Drop existing overly permissive policies
DROP POLICY IF EXISTS "Authenticated users can view their invitation by token" ON public.family_invitations;

-- Create more restrictive policy for family invitations
CREATE POLICY "Users can view invitations sent to them or by them" 
ON public.family_invitations 
FOR SELECT 
USING (
  -- User can see invitations they sent
  invited_by = auth.uid() 
  OR 
  -- User can see invitations sent to their email address
  (invited_email = (
    SELECT email FROM auth.users WHERE id = auth.uid()
  ) AND expires_at > now() AND status = 'pending')
);