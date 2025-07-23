-- Fix security definer functions by setting search_path

-- Update create_medical_record_from_event function
CREATE OR REPLACE FUNCTION public.create_medical_record_from_event()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = ''
AS $function$
BEGIN
  -- Only create medical record for medical event types and when event date has passed
  IF NEW.event_type IN ('vaccination', 'checkup', 'medication') AND NEW.event_date <= CURRENT_DATE THEN
    INSERT INTO public.medical_records (
      pet_id,
      user_id,
      record_type,
      title,
      date,
      description,
      event_id
    ) VALUES (
      NEW.pet_id,
      NEW.user_id,
      NEW.event_type,
      NEW.title,
      NEW.event_date::date,
      NEW.notes,
      NEW.id
    )
    ON CONFLICT (event_id) DO NOTHING; -- Prevent duplicates
  END IF;
  
  RETURN NEW;
END;
$function$;

-- Update user_owns_pet function
CREATE OR REPLACE FUNCTION public.user_owns_pet(pet_id_param uuid)
 RETURNS boolean
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path = ''
AS $function$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.pets 
    WHERE id = pet_id_param AND owner_id = auth.uid()
  );
END;
$function$;

-- Update user_can_invite_to_pet function
CREATE OR REPLACE FUNCTION public.user_can_invite_to_pet(pet_id_param uuid)
 RETURNS boolean
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path = ''
AS $function$
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
$function$;

-- Update is_pet_owner function
CREATE OR REPLACE FUNCTION public.is_pet_owner(pet_id_param uuid)
 RETURNS boolean
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path = ''
AS $function$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.pets 
    WHERE id = pet_id_param AND owner_id = auth.uid()
  );
END;
$function$;

-- Update update_updated_at_column function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path = ''
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;