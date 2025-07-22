-- Create medical_records table
CREATE TABLE public.medical_records (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  pet_id UUID NOT NULL,
  user_id UUID NOT NULL,
  record_type TEXT NOT NULL CHECK (record_type IN ('vaccination', 'checkup', 'medication', 'surgery', 'other')),
  title TEXT NOT NULL,
  date DATE NOT NULL,
  veterinarian TEXT,
  description TEXT,
  notes TEXT,
  event_id UUID, -- Reference to the original event that created this record
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.medical_records ENABLE ROW LEVEL SECURITY;

-- Create policies for medical records
CREATE POLICY "Users can view medical records for their pets or pets they have access to"
ON public.medical_records
FOR SELECT
USING (
  (user_id = auth.uid()) OR
  (EXISTS (
    SELECT 1 FROM pets 
    WHERE pets.id = medical_records.pet_id AND pets.owner_id = auth.uid()
  )) OR
  (EXISTS (
    SELECT 1 FROM pet_family_members 
    WHERE pet_family_members.pet_id = medical_records.pet_id 
    AND pet_family_members.user_id = auth.uid() 
    AND pet_family_members.status = 'accepted'
  ))
);

CREATE POLICY "Users can create medical records for their pets or pets they have edit access to"
ON public.medical_records
FOR INSERT
WITH CHECK (
  (auth.uid() = user_id) AND (
    (EXISTS (
      SELECT 1 FROM pets 
      WHERE pets.id = medical_records.pet_id AND pets.owner_id = auth.uid()
    )) OR
    (EXISTS (
      SELECT 1 FROM pet_family_members 
      WHERE pet_family_members.pet_id = medical_records.pet_id 
      AND pet_family_members.user_id = auth.uid() 
      AND pet_family_members.status = 'accepted' 
      AND ((pet_family_members.permissions->>'edit')::boolean = true)
    ))
  )
);

CREATE POLICY "Users can update medical records they created or for pets they own"
ON public.medical_records
FOR UPDATE
USING (
  (user_id = auth.uid()) OR
  (EXISTS (
    SELECT 1 FROM pets 
    WHERE pets.id = medical_records.pet_id AND pets.owner_id = auth.uid()
  ))
);

CREATE POLICY "Users can delete medical records they created or for pets they own"
ON public.medical_records
FOR DELETE
USING (
  (user_id = auth.uid()) OR
  (EXISTS (
    SELECT 1 FROM pets 
    WHERE pets.id = medical_records.pet_id AND pets.owner_id = auth.uid()
  ))
);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_medical_records_updated_at
BEFORE UPDATE ON public.medical_records
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to automatically create medical records from events
CREATE OR REPLACE FUNCTION public.create_medical_record_from_event()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
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
$$;

-- Add unique constraint on event_id to prevent duplicate medical records
ALTER TABLE public.medical_records ADD CONSTRAINT unique_event_id UNIQUE (event_id);

-- Create trigger to automatically create medical records when events are created or updated
CREATE TRIGGER create_medical_record_trigger
AFTER INSERT OR UPDATE ON public.events
FOR EACH ROW
EXECUTE FUNCTION public.create_medical_record_from_event();