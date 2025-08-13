-- Fix critical security vulnerability: Replace public profile viewing policy
DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON public.profiles;

-- Create secure policy: Users can only view their own profile and profiles of pets they have access to
CREATE POLICY "Users can view accessible profiles" 
ON public.profiles 
FOR SELECT 
USING (
  user_id = auth.uid() OR 
  EXISTS (
    SELECT 1 FROM public.pets p1 
    WHERE p1.owner_id = profiles.user_id AND p1.owner_id = auth.uid()
  ) OR 
  EXISTS (
    SELECT 1 FROM public.pets p2
    INNER JOIN public.pet_family_members pfm ON p2.id = pfm.pet_id
    WHERE p2.owner_id = profiles.user_id AND pfm.user_id = auth.uid() AND pfm.status = 'accepted'
  )
);

-- Improve invitation token security: Add expiry validation trigger
CREATE OR REPLACE FUNCTION public.validate_invitation_token()
RETURNS TRIGGER AS $$
BEGIN
  -- Prevent access to expired tokens
  IF NEW.expires_at <= now() THEN
    RAISE EXCEPTION 'Invitation token has expired';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add trigger to validate token expiry on access
CREATE TRIGGER validate_invitation_before_select
  BEFORE SELECT ON public.family_invitations
  FOR EACH ROW
  WHEN (OLD.expires_at <= now())
  EXECUTE FUNCTION public.validate_invitation_token();

-- Add more restrictive invitation viewing policy
DROP POLICY IF EXISTS "Anyone can view invitation by token" ON public.family_invitations;

CREATE POLICY "Users can view valid invitations by token" 
ON public.family_invitations 
FOR SELECT 
USING (
  token IS NOT NULL AND 
  expires_at > now() AND 
  status = 'pending'
);