-- Align tracker_accounts.auth_user_id FK with INF-1235.
--
-- INF-1235 changed the FK target from auth_users.id to auth_users.supabase_id
-- by editing the init migration in place, but the deployed develop DB was
-- already bootstrapped from the pre-INF-1235 init and never received an
-- ALTER. This migration brings existing databases in sync; it is a no-op on
-- fresh DBs (where init.sql already created the FK on supabase_id).

DO $$
DECLARE
  fk_target text;
BEGIN
  SELECT a.attname
  INTO fk_target
  FROM pg_constraint c
  JOIN pg_attribute a
    ON a.attrelid = c.confrelid
   AND a.attnum = ANY (c.confkey)
  WHERE c.conname = 'tracker_accounts_auth_user_id_fkey'
    AND c.conrelid = 'public.tracker_accounts'::regclass;

  IF fk_target = 'id' THEN
    -- Drop the old FK first so the row backfill below isn't rejected by it
    -- (the old FK references auth_users.id; the new value is auth_users.supabase_id).
    ALTER TABLE public.tracker_accounts
      DROP CONSTRAINT tracker_accounts_auth_user_id_fkey;

    -- Rewrite existing rows from auth_users.id values to auth_users.supabase_id.
    UPDATE public.tracker_accounts ta
    SET auth_user_id = au.supabase_id
    FROM public.auth_users au
    WHERE ta.auth_user_id = au.id;

    ALTER TABLE public.tracker_accounts
      ADD CONSTRAINT tracker_accounts_auth_user_id_fkey
      FOREIGN KEY (auth_user_id)
      REFERENCES public.auth_users (supabase_id)
      ON DELETE RESTRICT
      ON UPDATE CASCADE;
  END IF;
END $$;
