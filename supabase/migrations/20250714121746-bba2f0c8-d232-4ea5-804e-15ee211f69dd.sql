-- Re-enable RLS on pets table and check for any user ID mismatches
ALTER TABLE public.pets ENABLE ROW LEVEL SECURITY;

-- Let's also check if there are any pets in the database and their owner_ids
-- This is a read operation to help debug the issue
DO $$
DECLARE
    pets_count INTEGER;
    auth_user_count INTEGER;
BEGIN
    -- Count pets
    SELECT COUNT(*) INTO pets_count FROM public.pets;
    
    -- Count auth users
    SELECT COUNT(*) INTO auth_user_count FROM auth.users;
    
    -- Log the results
    RAISE NOTICE 'Total pets in database: %', pets_count;
    RAISE NOTICE 'Total auth users: %', auth_user_count;
    
    -- Show pet owner_ids for debugging
    FOR i IN (SELECT id, name, owner_id FROM public.pets LIMIT 5) LOOP
        RAISE NOTICE 'Pet: % (%) - Owner ID: %', i.name, i.id, i.owner_id;
    END LOOP;
END $$;