# Supabase setup

1. Create a project at https://supabase.com/dashboard.
2. **SQL Editor**: paste the whole of `migrations/20261127000000_init.sql` and run it once.
3. **Project Settings > API**: copy the project URL and the **publishable** key.
   Copy `.env.example` to `.env.local` and fill both in. Never use the secret / service_role key.
4. **Authentication > URL Configuration > Redirect URLs**: add `lappka://**` and, for Expo Go, `exp://**`
   (remove `exp://**` before release).
5. **Authentication > Providers > Email**: while testing you may turn "Confirm email" off.
   Keep it on for real users.
6. Restart Expo: `npx expo start --clear`.

## Google and Apple (optional)

Enable them under **Authentication > Providers**. Google needs an OAuth client from Google Cloud;
Apple needs a paid Apple Developer account (Services ID and key). Until then the app says the method
is not set up, and email sign-in works.
