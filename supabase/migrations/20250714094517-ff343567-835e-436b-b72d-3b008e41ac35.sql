-- Create profiles table for user information
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  display_name TEXT,
  email TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create policies for profiles
CREATE POLICY "Profiles are viewable by everyone" 
ON public.profiles 
FOR SELECT 
USING (true);

CREATE POLICY "Users can update their own profile" 
ON public.profiles 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile" 
ON public.profiles 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Create pets table
CREATE TABLE public.pets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  species TEXT NOT NULL,
  breed TEXT,
  age INTEGER,
  weight DECIMAL,
  gender TEXT,
  description TEXT,
  avatar_url TEXT,
  owner_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.pets ENABLE ROW LEVEL SECURITY;

-- Create family members table for sharing pets
CREATE TABLE public.pet_family_members (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  pet_id UUID NOT NULL,
  user_id UUID NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('owner', 'family_member', 'caretaker', 'viewer')),
  invited_by UUID NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined')),
  permissions JSONB DEFAULT '{"view": true, "edit": false, "invite": false}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(pet_id, user_id)
);

-- Add foreign key constraints
ALTER TABLE public.pet_family_members 
ADD CONSTRAINT fk_pet_family_members_pet 
FOREIGN KEY (pet_id) REFERENCES public.pets(id) ON DELETE CASCADE;

ALTER TABLE public.pet_family_members 
ADD CONSTRAINT fk_pet_family_members_user 
FOREIGN KEY (user_id) REFERENCES public.profiles(user_id) ON DELETE CASCADE;

ALTER TABLE public.pet_family_members 
ADD CONSTRAINT fk_pet_family_members_invited_by 
FOREIGN KEY (invited_by) REFERENCES public.profiles(user_id) ON DELETE CASCADE;

-- Enable Row Level Security
ALTER TABLE public.pet_family_members ENABLE ROW LEVEL SECURITY;

-- Create policies for pets
CREATE POLICY "Users can view pets they have access to" 
ON public.pets 
FOR SELECT 
USING (
  owner_id = auth.uid() OR 
  EXISTS (
    SELECT 1 FROM public.pet_family_members 
    WHERE pet_id = pets.id 
    AND user_id = auth.uid() 
    AND status = 'accepted'
  )
);

CREATE POLICY "Only owners can insert pets" 
ON public.pets 
FOR INSERT 
WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Owners and family members with edit permission can update pets" 
ON public.pets 
FOR UPDATE 
USING (
  owner_id = auth.uid() OR 
  EXISTS (
    SELECT 1 FROM public.pet_family_members 
    WHERE pet_id = pets.id 
    AND user_id = auth.uid() 
    AND status = 'accepted'
    AND (permissions->>'edit')::boolean = true
  )
);

CREATE POLICY "Only owners can delete pets" 
ON public.pets 
FOR DELETE 
USING (owner_id = auth.uid());

-- Create policies for pet_family_members
CREATE POLICY "Users can view family members of their pets" 
ON public.pet_family_members 
FOR SELECT 
USING (
  user_id = auth.uid() OR 
  EXISTS (
    SELECT 1 FROM public.pets 
    WHERE id = pet_family_members.pet_id 
    AND owner_id = auth.uid()
  ) OR
  EXISTS (
    SELECT 1 FROM public.pet_family_members as pfm2
    WHERE pfm2.pet_id = pet_family_members.pet_id 
    AND pfm2.user_id = auth.uid() 
    AND pfm2.status = 'accepted'
  )
);

CREATE POLICY "Owners and users with invite permission can invite family members" 
ON public.pet_family_members 
FOR INSERT 
WITH CHECK (
  auth.uid() = invited_by AND (
    EXISTS (
      SELECT 1 FROM public.pets 
      WHERE id = pet_id 
      AND owner_id = auth.uid()
    ) OR
    EXISTS (
      SELECT 1 FROM public.pet_family_members 
      WHERE pet_id = pet_family_members.pet_id 
      AND user_id = auth.uid() 
      AND status = 'accepted'
      AND (permissions->>'invite')::boolean = true
    )
  )
);

CREATE POLICY "Users can update their own family member status" 
ON public.pet_family_members 
FOR UPDATE 
USING (user_id = auth.uid());

CREATE POLICY "Owners can update family member permissions" 
ON public.pet_family_members 
FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM public.pets 
    WHERE id = pet_id 
    AND owner_id = auth.uid()
  )
);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_profiles_updated_at
BEFORE UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_pets_updated_at
BEFORE UPDATE ON public.pets
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_pet_family_members_updated_at
BEFORE UPDATE ON public.pet_family_members
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();