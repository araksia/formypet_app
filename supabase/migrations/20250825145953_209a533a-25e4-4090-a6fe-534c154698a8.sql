-- Create a security definer function to check if user can create expense for a pet
CREATE OR REPLACE FUNCTION public.user_can_create_expense_for_pet(pet_id_param uuid)
RETURNS boolean
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO ''
AS $$
BEGIN
  -- Check if user owns the pet
  IF EXISTS (
    SELECT 1 FROM public.pets 
    WHERE id = pet_id_param AND owner_id = auth.uid()
  ) THEN
    RETURN TRUE;
  END IF;
  
  -- Check if user has edit permissions via pet_family_members
  IF EXISTS (
    SELECT 1 FROM public.pet_family_members 
    WHERE pet_id = pet_id_param 
    AND user_id = auth.uid() 
    AND status = 'accepted' 
    AND (permissions->>'edit')::boolean = true
  ) THEN
    RETURN TRUE;
  END IF;
  
  RETURN FALSE;
END;
$$;

-- Drop the old policy
DROP POLICY IF EXISTS "Users can create expenses for their pets or pets they have edit" ON public.expenses;

-- Create a new simpler policy using the security definer function
CREATE POLICY "Users can create expenses for their pets" 
ON public.expenses 
FOR INSERT 
WITH CHECK (
  auth.uid() = user_id AND 
  public.user_can_create_expense_for_pet(pet_id)
);