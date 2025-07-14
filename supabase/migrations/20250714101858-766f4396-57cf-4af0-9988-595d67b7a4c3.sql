-- Create expenses table
CREATE TABLE public.expenses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  category TEXT NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  pet_id UUID NOT NULL,
  user_id UUID NOT NULL,
  description TEXT NOT NULL,
  expense_date DATE NOT NULL DEFAULT CURRENT_DATE,
  is_recurring BOOLEAN DEFAULT false,
  recurring_frequency TEXT,
  receipt_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;

-- Create policies for expenses
CREATE POLICY "Users can view expenses for their pets or pets they have access to" 
ON public.expenses 
FOR SELECT 
USING (
  user_id = auth.uid() OR 
  EXISTS (
    SELECT 1 FROM pets 
    WHERE pets.id = expenses.pet_id AND pets.owner_id = auth.uid()
  ) OR
  EXISTS (
    SELECT 1 FROM pet_family_members 
    WHERE pet_family_members.pet_id = expenses.pet_id 
    AND pet_family_members.user_id = auth.uid() 
    AND pet_family_members.status = 'accepted'
  )
);

CREATE POLICY "Users can create expenses for their pets or pets they have edit access to" 
ON public.expenses 
FOR INSERT 
WITH CHECK (
  auth.uid() = user_id AND (
    EXISTS (
      SELECT 1 FROM pets 
      WHERE pets.id = expenses.pet_id AND pets.owner_id = auth.uid()
    ) OR
    EXISTS (
      SELECT 1 FROM pet_family_members 
      WHERE pet_family_members.pet_id = expenses.pet_id 
      AND pet_family_members.user_id = auth.uid() 
      AND pet_family_members.status = 'accepted'
      AND ((pet_family_members.permissions ->> 'edit')::boolean = true)
    )
  )
);

CREATE POLICY "Users can update expenses they created or for pets they own" 
ON public.expenses 
FOR UPDATE 
USING (
  user_id = auth.uid() OR
  EXISTS (
    SELECT 1 FROM pets 
    WHERE pets.id = expenses.pet_id AND pets.owner_id = auth.uid()
  )
);

CREATE POLICY "Users can delete expenses they created or for pets they own" 
ON public.expenses 
FOR DELETE 
USING (
  user_id = auth.uid() OR
  EXISTS (
    SELECT 1 FROM pets 
    WHERE pets.id = expenses.pet_id AND pets.owner_id = auth.uid()
  )
);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_expenses_updated_at
BEFORE UPDATE ON public.expenses
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();