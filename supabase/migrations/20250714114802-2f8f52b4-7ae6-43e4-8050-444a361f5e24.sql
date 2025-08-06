-- Completely recreate pets RLS policies to fix infinite recursion

-- Drop all existing policies on pets
DROP POLICY IF EXISTS "Only owners can insert pets" ON public.pets;
DROP POLICY IF EXISTS "Only owners can delete pets" ON public.pets;
DROP POLICY IF EXISTS "Users can view their own pets" ON public.pets;
DROP POLICY IF EXISTS "Users can view pets shared with them" ON public.pets;
DROP POLICY IF EXISTS "Only owners can update pets" ON public.pets;
DROP POLICY IF EXISTS "Family members with edit permission can update pets" ON public.pets;

-- Create simple, non-recursive policies
CREATE POLICY "pets_owner_all_access" 
ON public.pets 
FOR ALL 
USING (owner_id = auth.uid())
WITH CHECK (owner_id = auth.uid());

CREATE POLICY "pets_family_view" 
ON public.pets 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.pet_family_members 
    WHERE pet_family_members.pet_id = pets.id 
    AND pet_family_members.user_id = auth.uid() 
    AND pet_family_members.status = 'accepted'
  )
);