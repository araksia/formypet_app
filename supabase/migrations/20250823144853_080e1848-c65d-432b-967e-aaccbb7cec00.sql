-- Create gamification tables

-- Pet happiness tracking
CREATE TABLE public.pet_happiness_log (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  pet_id UUID NOT NULL,
  user_id UUID NOT NULL,
  happiness_score NUMERIC(5,2) NOT NULL DEFAULT 50.00,
  factors JSONB DEFAULT '{}',
  recorded_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.pet_happiness_log ENABLE ROW LEVEL SECURITY;

-- RLS policies for pet_happiness_log
CREATE POLICY "Users can view happiness for their pets or pets they have access to"
ON public.pet_happiness_log
FOR SELECT
USING (
  user_id = auth.uid() 
  OR EXISTS (
    SELECT 1 FROM public.pets 
    WHERE pets.id = pet_happiness_log.pet_id AND pets.owner_id = auth.uid()
  )
  OR EXISTS (
    SELECT 1 FROM public.pet_family_members 
    WHERE pet_family_members.pet_id = pet_happiness_log.pet_id 
    AND pet_family_members.user_id = auth.uid() 
    AND pet_family_members.status = 'accepted'
  )
);

CREATE POLICY "Users can create happiness records for their pets"
ON public.pet_happiness_log
FOR INSERT
WITH CHECK (
  auth.uid() = user_id AND (
    EXISTS (
      SELECT 1 FROM public.pets 
      WHERE pets.id = pet_happiness_log.pet_id AND pets.owner_id = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM public.pet_family_members 
      WHERE pet_family_members.pet_id = pet_happiness_log.pet_id 
      AND pet_family_members.user_id = auth.uid() 
      AND pet_family_members.status = 'accepted'
      AND ((pet_family_members.permissions->>'edit')::boolean = true)
    )
  )
);

-- Achievements system
CREATE TABLE public.achievements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  key TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  icon TEXT NOT NULL,
  category TEXT NOT NULL,
  condition_type TEXT NOT NULL, -- 'count', 'streak', 'percentage', 'custom'
  condition_value INTEGER NOT NULL,
  condition_data JSONB DEFAULT '{}',
  badge_color TEXT NOT NULL DEFAULT 'primary',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- User achievements tracking
CREATE TABLE public.user_achievements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  achievement_id UUID NOT NULL REFERENCES public.achievements(id),
  pet_id UUID,
  earned_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  progress INTEGER DEFAULT 0,
  is_completed BOOLEAN DEFAULT false,
  UNIQUE(user_id, achievement_id, pet_id)
);

-- Enable RLS
ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;

-- RLS policies for user_achievements
CREATE POLICY "Users can view their own achievements"
ON public.user_achievements
FOR SELECT
USING (user_id = auth.uid());

CREATE POLICY "Users can create their own achievements"
ON public.user_achievements
FOR INSERT
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own achievements"
ON public.user_achievements
FOR UPDATE
USING (user_id = auth.uid());

-- Streaks tracking
CREATE TABLE public.pet_streaks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  pet_id UUID NOT NULL,
  user_id UUID NOT NULL,
  streak_type TEXT NOT NULL, -- 'feeding', 'exercise', 'medical', 'general_care'
  current_count INTEGER NOT NULL DEFAULT 0,
  best_count INTEGER NOT NULL DEFAULT 0,
  last_activity_date DATE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(pet_id, user_id, streak_type)
);

-- Enable RLS
ALTER TABLE public.pet_streaks ENABLE ROW LEVEL SECURITY;

-- RLS policies for pet_streaks
CREATE POLICY "Users can view streaks for their pets or pets they have access to"
ON public.pet_streaks
FOR SELECT
USING (
  user_id = auth.uid() 
  OR EXISTS (
    SELECT 1 FROM public.pets 
    WHERE pets.id = pet_streaks.pet_id AND pets.owner_id = auth.uid()
  )
  OR EXISTS (
    SELECT 1 FROM public.pet_family_members 
    WHERE pet_family_members.pet_id = pet_streaks.pet_id 
    AND pet_family_members.user_id = auth.uid() 
    AND pet_family_members.status = 'accepted'
  )
);

CREATE POLICY "Users can manage streaks for their pets"
ON public.pet_streaks
FOR ALL
USING (
  user_id = auth.uid() AND (
    EXISTS (
      SELECT 1 FROM public.pets 
      WHERE pets.id = pet_streaks.pet_id AND pets.owner_id = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM public.pet_family_members 
      WHERE pet_family_members.pet_id = pet_streaks.pet_id 
      AND pet_family_members.user_id = auth.uid() 
      AND pet_family_members.status = 'accepted'
      AND ((pet_family_members.permissions->>'edit')::boolean = true)
    )
  )
)
WITH CHECK (
  user_id = auth.uid() AND (
    EXISTS (
      SELECT 1 FROM public.pets 
      WHERE pets.id = pet_streaks.pet_id AND pets.owner_id = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM public.pet_family_members 
      WHERE pet_family_members.pet_id = pet_streaks.pet_id 
      AND pet_family_members.user_id = auth.uid() 
      AND pet_family_members.status = 'accepted'
      AND ((pet_family_members.permissions->>'edit')::boolean = true)
    )
  )
);

-- Function to calculate pet happiness score
CREATE OR REPLACE FUNCTION public.calculate_pet_happiness(pet_id_param UUID)
RETURNS NUMERIC(5,2)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  happiness_score NUMERIC(5,2) := 50.0;
  recent_events_count INTEGER;
  recent_expenses_count INTEGER;
  recent_medical_count INTEGER;
  overdue_events_count INTEGER;
BEGIN
  -- Count recent positive activities (last 7 days)
  SELECT COUNT(*) INTO recent_events_count
  FROM public.events
  WHERE pet_id = pet_id_param 
    AND event_date >= CURRENT_DATE - INTERVAL '7 days'
    AND event_date <= CURRENT_DATE;
    
  SELECT COUNT(*) INTO recent_expenses_count
  FROM public.expenses
  WHERE pet_id = pet_id_param 
    AND expense_date >= CURRENT_DATE - INTERVAL '7 days'
    AND category IN ('food', 'treats', 'toys');
    
  SELECT COUNT(*) INTO recent_medical_count
  FROM public.medical_records
  WHERE pet_id = pet_id_param 
    AND date >= CURRENT_DATE - INTERVAL '30 days';
    
  -- Count overdue events (negative impact)
  SELECT COUNT(*) INTO overdue_events_count
  FROM public.events
  WHERE pet_id = pet_id_param 
    AND event_date < CURRENT_DATE
    AND event_type IN ('feeding', 'exercise', 'medication');
  
  -- Calculate happiness based on activities
  happiness_score := happiness_score 
    + (recent_events_count * 5.0)      -- +5% per recent event
    + (recent_expenses_count * 3.0)    -- +3% per care expense
    + (recent_medical_count * 10.0)    -- +10% per medical record
    - (overdue_events_count * 8.0);    -- -8% per overdue event
    
  -- Keep within bounds (0-100)
  happiness_score := GREATEST(0.0, LEAST(100.0, happiness_score));
  
  RETURN happiness_score;
END;
$$;

-- Function to update pet streaks
CREATE OR REPLACE FUNCTION public.update_pet_streak(
  pet_id_param UUID, 
  user_id_param UUID, 
  streak_type_param TEXT, 
  activity_date DATE DEFAULT CURRENT_DATE
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_streak RECORD;
  new_count INTEGER;
BEGIN
  -- Get current streak
  SELECT * INTO current_streak
  FROM public.pet_streaks
  WHERE pet_id = pet_id_param 
    AND user_id = user_id_param 
    AND streak_type = streak_type_param;
    
  IF current_streak IS NULL THEN
    -- Create new streak
    INSERT INTO public.pet_streaks (
      pet_id, user_id, streak_type, current_count, best_count, last_activity_date
    ) VALUES (
      pet_id_param, user_id_param, streak_type_param, 1, 1, activity_date
    );
  ELSE
    -- Check if continuing streak (consecutive days)
    IF current_streak.last_activity_date = activity_date - INTERVAL '1 day' THEN
      new_count := current_streak.current_count + 1;
    ELSIF current_streak.last_activity_date = activity_date THEN
      -- Same day, no change
      RETURN;
    ELSE
      -- Streak broken, restart
      new_count := 1;
    END IF;
    
    -- Update streak
    UPDATE public.pet_streaks
    SET 
      current_count = new_count,
      best_count = GREATEST(best_count, new_count),
      last_activity_date = activity_date,
      is_active = true,
      updated_at = now()
    WHERE id = current_streak.id;
  END IF;
END;
$$;

-- Insert default achievements (fixing the quote issue)
INSERT INTO public.achievements (key, title, description, icon, category, condition_type, condition_value, badge_color) VALUES
('first_event', 'Πρώτο Βήμα', 'Δημιουργήστε το πρώτο σας event', 'Calendar', 'events', 'count', 1, 'primary'),
('event_master', 'Οργανωμένος', 'Δημιουργήστε 10 events', 'CalendarDays', 'events', 'count', 10, 'secondary'),
('feeding_streak_7', 'Τακτικό Φαγητό', '7 συνεχόμενες μέρες φαγητού', 'Utensils', 'feeding', 'streak', 7, 'success'),
('feeding_streak_30', 'Μάστερ Φαγητού', '30 συνεχόμενες μέρες φαγητού', 'ChefHat', 'feeding', 'streak', 30, 'warning'),
('exercise_lover', 'Αθλητικός Τύπος', '5 συνεχόμενες μέρες άσκησης', 'Dumbbell', 'exercise', 'streak', 5, 'info'),
('medical_care', 'Υγεία Πάνω Από Όλα', 'Καταγράψτε 3 ιατρικά records', 'Stethoscope', 'medical', 'count', 3, 'danger'),
('expense_tracker', 'Οικονομικός Διαχειριστής', 'Καταγράψτε 20 έξοδα', 'PiggyBank', 'expenses', 'count', 20, 'primary'),
('happy_pet', 'Χαρούμενο Κατοικίδιο', 'Πετύχετε 80% ευτυχία', 'Heart', 'happiness', 'percentage', 80, 'success');

-- Add trigger to update streaks automatically when events are created
CREATE OR REPLACE FUNCTION public.auto_update_streaks()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Update streak based on event type
  CASE NEW.event_type
    WHEN 'feeding' THEN
      PERFORM public.update_pet_streak(NEW.pet_id, NEW.user_id, 'feeding', NEW.event_date::date);
    WHEN 'exercise' THEN
      PERFORM public.update_pet_streak(NEW.pet_id, NEW.user_id, 'exercise', NEW.event_date::date);
    WHEN 'medication' THEN
      PERFORM public.update_pet_streak(NEW.pet_id, NEW.user_id, 'medical', NEW.event_date::date);
    ELSE
      PERFORM public.update_pet_streak(NEW.pet_id, NEW.user_id, 'general_care', NEW.event_date::date);
  END CASE;
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER trigger_auto_update_streaks
  AFTER INSERT ON public.events
  FOR EACH ROW
  EXECUTE FUNCTION public.auto_update_streaks();

-- Add trigger to update happiness when events are created/updated
CREATE OR REPLACE FUNCTION public.auto_update_happiness()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_happiness NUMERIC(5,2);
BEGIN
  -- Calculate new happiness score
  new_happiness := public.calculate_pet_happiness(COALESCE(NEW.pet_id, OLD.pet_id));
  
  -- Insert happiness log entry
  INSERT INTO public.pet_happiness_log (pet_id, user_id, happiness_score, factors)
  VALUES (
    COALESCE(NEW.pet_id, OLD.pet_id), 
    COALESCE(NEW.user_id, OLD.user_id), 
    new_happiness,
    jsonb_build_object(
      'trigger', 'event_change',
      'event_type', COALESCE(NEW.event_type, OLD.event_type),
      'timestamp', now()
    )
  );
  
  RETURN COALESCE(NEW, OLD);
END;
$$;

CREATE TRIGGER trigger_auto_update_happiness_events
  AFTER INSERT OR UPDATE OR DELETE ON public.events
  FOR EACH ROW
  EXECUTE FUNCTION public.auto_update_happiness();

CREATE TRIGGER trigger_auto_update_happiness_expenses
  AFTER INSERT OR UPDATE OR DELETE ON public.expenses
  FOR EACH ROW
  EXECUTE FUNCTION public.auto_update_happiness();

CREATE TRIGGER trigger_auto_update_happiness_medical
  AFTER INSERT OR UPDATE OR DELETE ON public.medical_records
  FOR EACH ROW
  EXECUTE FUNCTION public.auto_update_happiness();