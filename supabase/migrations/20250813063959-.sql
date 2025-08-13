-- Fix remaining critical security issue: Further restrict profile access
DROP POLICY IF EXISTS "Users can view accessible profiles" ON public.profiles;

-- Create more secure policy: Only allow viewing own profile
CREATE POLICY "Users can only view their own profile" 
ON public.profiles 
FOR SELECT 
USING (user_id = auth.uid());

-- Fix invitation token exposure: Require authentication for token-based access
DROP POLICY IF EXISTS "Users can view valid invitations by token" ON public.family_invitations;

-- Create policy that requires authentication AND valid token
CREATE POLICY "Authenticated users can view their invitation by token" 
ON public.family_invitations 
FOR SELECT 
USING (
  auth.uid() IS NOT NULL AND
  token IS NOT NULL AND 
  expires_at > now() AND 
  status = 'pending' AND
  (invited_by = auth.uid() OR 
   EXISTS (
     SELECT 1 FROM auth.users 
     WHERE auth.users.id = auth.uid() 
     AND auth.users.email = family_invitations.invited_email
   ))
);