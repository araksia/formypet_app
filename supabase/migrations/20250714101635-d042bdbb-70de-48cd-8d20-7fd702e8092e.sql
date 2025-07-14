-- Create events table for calendar functionality
CREATE TABLE public.events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  event_type TEXT NOT NULL,
  pet_id UUID NOT NULL,
  user_id UUID NOT NULL,
  event_date TIMESTAMP WITH TIME ZONE NOT NULL,
  event_time TIME,
  recurring TEXT DEFAULT 'none',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

-- Create policies for events
CREATE POLICY "Users can view events for their pets or pets they have access to" 
ON public.events 
FOR SELECT 
USING (
  user_id = auth.uid() OR 
  EXISTS (
    SELECT 1 FROM pets 
    WHERE pets.id = events.pet_id AND pets.owner_id = auth.uid()
  ) OR
  EXISTS (
    SELECT 1 FROM pet_family_members 
    WHERE pet_family_members.pet_id = events.pet_id 
    AND pet_family_members.user_id = auth.uid() 
    AND pet_family_members.status = 'accepted'
  )
);

CREATE POLICY "Users can create events for their pets or pets they have edit access to" 
ON public.events 
FOR INSERT 
WITH CHECK (
  auth.uid() = user_id AND (
    EXISTS (
      SELECT 1 FROM pets 
      WHERE pets.id = events.pet_id AND pets.owner_id = auth.uid()
    ) OR
    EXISTS (
      SELECT 1 FROM pet_family_members 
      WHERE pet_family_members.pet_id = events.pet_id 
      AND pet_family_members.user_id = auth.uid() 
      AND pet_family_members.status = 'accepted'
      AND ((pet_family_members.permissions ->> 'edit')::boolean = true)
    )
  )
);

CREATE POLICY "Users can update events they created or for pets they own" 
ON public.events 
FOR UPDATE 
USING (
  user_id = auth.uid() OR
  EXISTS (
    SELECT 1 FROM pets 
    WHERE pets.id = events.pet_id AND pets.owner_id = auth.uid()
  )
);

CREATE POLICY "Users can delete events they created or for pets they own" 
ON public.events 
FOR DELETE 
USING (
  user_id = auth.uid() OR
  EXISTS (
    SELECT 1 FROM pets 
    WHERE pets.id = events.pet_id AND pets.owner_id = auth.uid()
  )
);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_events_updated_at
BEFORE UPDATE ON public.events
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();