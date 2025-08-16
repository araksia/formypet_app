-- Βεβαιωθούμε ότι το RLS είναι ενεργοποιημένο σε όλους τους πίνακες
ALTER TABLE public.pets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.medical_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pet_family_members ENABLE ROW LEVEL SECURITY;

-- Διαγραφή όλων των κατοικιδίων εκτός από τα δικά σου
DELETE FROM public.pets 
WHERE owner_id != '1ae214d5-d6af-4aa1-8bd2-cfb225c22309';