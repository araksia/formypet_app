-- Add birth_date column to pets table
ALTER TABLE public.pets 
ADD COLUMN birth_date DATE;

-- Update existing pets with age to set birth_date as January 1st of calculated year
UPDATE public.pets 
SET birth_date = DATE(EXTRACT(YEAR FROM CURRENT_DATE) - age || '-01-01')
WHERE age IS NOT NULL;

-- Comment: We keep the age column for now for backward compatibility
-- but we'll primarily use birth_date going forward