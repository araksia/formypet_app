-- Create family_invitations table
CREATE TABLE public.family_invitations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  token TEXT NOT NULL UNIQUE,
  invited_email TEXT NOT NULL,
  pet_id UUID NOT NULL,
  role TEXT NOT NULL DEFAULT 'family_member',
  message TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  invited_by UUID NOT NULL
);

-- Enable RLS
ALTER TABLE public.family_invitations ENABLE ROW LEVEL SECURITY;

-- Create policies for family_invitations
CREATE POLICY "Users can view invitations they sent" 
ON public.family_invitations 
FOR SELECT 
USING (invited_by = auth.uid());

CREATE POLICY "Users can create invitations for their pets" 
ON public.family_invitations 
FOR INSERT 
WITH CHECK (
  auth.uid() = invited_by AND 
  EXISTS (
    SELECT 1 FROM pets 
    WHERE pets.id = pet_id AND pets.owner_id = auth.uid()
  )
);

CREATE POLICY "Users can update invitations they sent" 
ON public.family_invitations 
FOR UPDATE 
USING (invited_by = auth.uid());

-- Anyone can view invitations by token (for accepting)
CREATE POLICY "Anyone can view invitation by token" 
ON public.family_invitations 
FOR SELECT 
USING (token IS NOT NULL);

-- Create index for token lookup
CREATE INDEX idx_family_invitations_token ON public.family_invitations(token);
CREATE INDEX idx_family_invitations_email ON public.family_invitations(invited_email);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_family_invitations_updated_at
BEFORE UPDATE ON public.family_invitations
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();