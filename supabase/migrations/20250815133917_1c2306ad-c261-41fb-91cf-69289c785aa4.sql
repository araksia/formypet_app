-- Add missing foreign key constraints
ALTER TABLE public.events 
ADD CONSTRAINT events_pet_id_fkey 
FOREIGN KEY (pet_id) REFERENCES public.pets(id) ON DELETE CASCADE;

ALTER TABLE public.expenses 
ADD CONSTRAINT expenses_pet_id_fkey 
FOREIGN KEY (pet_id) REFERENCES public.pets(id) ON DELETE CASCADE;

ALTER TABLE public.medical_records 
ADD CONSTRAINT medical_records_pet_id_fkey 
FOREIGN KEY (pet_id) REFERENCES public.pets(id) ON DELETE CASCADE;

ALTER TABLE public.pet_family_members 
ADD CONSTRAINT pet_family_members_pet_id_fkey 
FOREIGN KEY (pet_id) REFERENCES public.pets(id) ON DELETE CASCADE;

ALTER TABLE public.family_invitations 
ADD CONSTRAINT family_invitations_pet_id_fkey 
FOREIGN KEY (pet_id) REFERENCES public.pets(id) ON DELETE CASCADE;