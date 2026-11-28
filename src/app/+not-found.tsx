import { Redirect } from 'expo-router';

/**
 * Unknown links go home (the navigator then sends the user to the right step). This also catches the
 * "auth/callback" link Supabase uses after email confirmation and Google / Apple sign-in.
 */
export default function NotFound() {
  return <Redirect href="/" />;
}
