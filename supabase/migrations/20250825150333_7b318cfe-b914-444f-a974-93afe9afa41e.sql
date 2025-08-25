-- Drop the trigger that's causing the issue
DROP TRIGGER IF EXISTS trigger_auto_update_happiness_expenses ON public.expenses;

-- Update the auto_update_happiness function to handle different table contexts
CREATE OR REPLACE FUNCTION public.auto_update_happiness()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  new_happiness NUMERIC(5,2);
  target_pet_id UUID;
  target_user_id UUID;
  trigger_source TEXT;
BEGIN
  -- Determine which table triggered this and extract relevant data
  IF TG_TABLE_NAME = 'events' THEN
    target_pet_id := COALESCE(NEW.pet_id, OLD.pet_id);
    target_user_id := COALESCE(NEW.user_id, OLD.user_id);
    trigger_source := 'event_' || COALESCE(NEW.event_type, OLD.event_type, 'unknown');
  ELSIF TG_TABLE_NAME = 'expenses' THEN
    target_pet_id := COALESCE(NEW.pet_id, OLD.pet_id);
    target_user_id := COALESCE(NEW.user_id, OLD.user_id);
    trigger_source := 'expense_' || COALESCE(NEW.category, OLD.category, 'unknown');
  ELSIF TG_TABLE_NAME = 'medical_records' THEN
    target_pet_id := COALESCE(NEW.pet_id, OLD.pet_id);
    target_user_id := COALESCE(NEW.user_id, OLD.user_id);
    trigger_source := 'medical_' || COALESCE(NEW.record_type, OLD.record_type, 'unknown');
  ELSE
    -- Fallback for unknown table
    RETURN COALESCE(NEW, OLD);
  END IF;
  
  -- Calculate new happiness score
  new_happiness := public.calculate_pet_happiness(target_pet_id);
  
  -- Insert happiness log entry
  INSERT INTO public.pet_happiness_log (pet_id, user_id, happiness_score, factors)
  VALUES (
    target_pet_id, 
    target_user_id, 
    new_happiness,
    jsonb_build_object(
      'trigger', 'auto_update',
      'source', trigger_source,
      'table', TG_TABLE_NAME,
      'timestamp', now()
    )
  );
  
  RETURN COALESCE(NEW, OLD);
END;
$$;

-- Re-create the trigger for expenses
CREATE TRIGGER trigger_auto_update_happiness_expenses
  AFTER INSERT OR UPDATE OR DELETE ON public.expenses
  FOR EACH ROW EXECUTE FUNCTION public.auto_update_happiness();