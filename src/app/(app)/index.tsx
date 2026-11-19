import { Button } from '@/components/ui/button';
import { FormScreen } from '@/components/ui/form-screen';
import { ThemedText } from '@/components/themed-text';
import { useSession } from '@/providers/session';

// Placeholder: where the flow ends until the real home screen exists. Replace or delete it.
export default function HomePlaceholder() {
  const { session, signOut } = useSession();
  const pet = session?.pet;

  return (
    <FormScreen
      title={`Hi, ${session?.ownerName}`}
      subtitle={pet ? `${pet.name} · ${pet.breed} · ${pet.sex === 'male' ? 'Male' : 'Female'}` : undefined}
      footer={<Button variant="outline" title="Sign out" onPress={signOut} />}>
      <ThemedText themeColor="textSecondary">The main screen comes next.</ThemedText>
    </FormScreen>
  );
}
