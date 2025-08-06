-- Drop ALL existing pet_family_members policies
DROP POLICY IF EXISTS "pet_family_members_insert_policy" ON public.pet_family_members;
DROP POLICY IF EXISTS "pet_family_members_select_policy" ON public.pet_family_members;
DROP POLICY IF EXISTS "pet_family_members_update_owner" ON public.pet_family_members;
DROP POLICY IF EXISTS "pet_family_members_update_self" ON public.pet_family_members;
DROP POLICY IF EXISTS "Owners can update family member permissions" ON public.pet_family_members;
DROP POLICY IF EXISTS "Users can update their own family member status" ON public.pet_family_members;

-- Create a much simpler security definer function that doesn't reference pet_family_members
CREATE OR REPLACE FUNCTION public.is_pet_owner(pet_id_param UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.pets 
    WHERE id = pet_id_param AND owner_id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Create simple policies WITHOUT referencing pet_family_members in complex ways
CREATE POLICY "pet_family_members_owner_all" ON public.pet_family_members
FOR ALL 
USING (public.is_pet_owner(pet_id))
WITH CHECK (public.is_pet_owner(pet_id));

CREATE POLICY "pet_family_members_self_view" ON public.pet_family_members
FOR SELECT 
USING (user_id = auth.uid());

CREATE POLICY "pet_family_members_self_update" ON public.pet_family_members
FOR UPDATE 
USING (user_id = auth.uid());