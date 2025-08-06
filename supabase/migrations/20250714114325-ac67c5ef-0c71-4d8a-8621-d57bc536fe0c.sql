-- Fix infinite recursion in pets RLS policies

-- Drop existing problematic policies
DROP POLICY IF EXISTS "Users can view pets they have access to" ON public.pets;
DROP POLICY IF EXISTS "Owners and family members with edit permission can update pets" ON public.pets;

-- Create simple, non-recursive policies for pets
CREATE POLICY "Users can view their own pets" 
ON public.pets 
FOR SELECT 
USING (owner_id = auth.uid());

CREATE POLICY "Users can view pets shared with them" 
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

CREATE POLICY "Only owners can update pets" 
ON public.pets 
FOR UPDATE 
USING (owner_id = auth.uid());

-- Ensure all other policies are correct
CREATE POLICY "Family members with edit permission can update pets" 
ON public.pets 
FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM public.pet_family_members 
    WHERE pet_family_members.pet_id = pets.id 
    AND pet_family_members.user_id = auth.uid() 
    AND pet_family_members.status = 'accepted'
    AND (pet_family_members.permissions->>'edit')::boolean = true
  )
);