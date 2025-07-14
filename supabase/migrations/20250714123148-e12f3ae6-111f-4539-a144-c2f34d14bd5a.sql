-- Fix infinite recursion in pet_family_members policies
-- Drop existing problematic policies
DROP POLICY IF EXISTS "Owners and users with invite permission can invite family membe" ON public.pet_family_members;
DROP POLICY IF EXISTS "Users can view family members of their pets" ON public.pet_family_members;

-- Create security definer function to get user's pet ownership
CREATE OR REPLACE FUNCTION public.user_owns_pet(pet_id_param UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.pets 
    WHERE id = pet_id_param AND owner_id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Create security definer function to check if user has invite permissions
CREATE OR REPLACE FUNCTION public.user_can_invite_to_pet(pet_id_param UUID)
RETURNS BOOLEAN AS $$
BEGIN
  -- Owner can always invite
  IF public.user_owns_pet(pet_id_param) THEN
    RETURN TRUE;
  END IF;
  
  -- Check if user has invite permissions via pet_family_members
  RETURN EXISTS (
    SELECT 1 FROM public.pet_family_members 
    WHERE pet_id = pet_id_param 
    AND user_id = auth.uid() 
    AND status = 'accepted' 
    AND (permissions->>'invite')::boolean = true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Create new policies without infinite recursion
CREATE POLICY "pet_family_members_insert_policy" ON public.pet_family_members
FOR INSERT 
WITH CHECK (
  auth.uid() = invited_by AND 
  public.user_can_invite_to_pet(pet_id)
);

CREATE POLICY "pet_family_members_select_policy" ON public.pet_family_members
FOR SELECT 
USING (
  user_id = auth.uid() OR 
  public.user_owns_pet(pet_id) OR
  EXISTS (
    SELECT 1 FROM public.pet_family_members pfm2 
    WHERE pfm2.pet_id = pet_family_members.pet_id 
    AND pfm2.user_id = auth.uid() 
    AND pfm2.status = 'accepted'
  )
);

CREATE POLICY "pet_family_members_update_owner" ON public.pet_family_members
FOR UPDATE 
USING (public.user_owns_pet(pet_id));

CREATE POLICY "pet_family_members_update_self" ON public.pet_family_members
FOR UPDATE 
USING (user_id = auth.uid());