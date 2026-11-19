import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { FormScreen } from '@/components/ui/form-screen';
import { TextField } from '@/components/ui/text-field';
import { useSession } from '@/providers/session';

/** Step 1 for new users: the pet owner's account. Only a name is needed. */
export default function OwnerScreen() {
  const { saveOwnerName } = useSession();

  const [name, setName] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const error = name.trim() ? undefined : 'Enter your name';

  function next() {
    setSubmitted(true);
    if (error) return;
    // Saving the name unlocks the pet step; the layout then shows it.
    saveOwnerName(name.trim());
  }

  return (
    <FormScreen
      eyebrow="Step 1 of 3"
      title="What's your name?"
      subtitle="This is your pet owner account."
      footer={<Button title="Continue" onPress={next} />}>
      <TextField
        label="Your name"
        placeholder="e.g. Alex Moroz"
        value={name}
        onChangeText={setName}
        error={submitted ? error : undefined}
        autoCapitalize="words"
        autoComplete="name"
        textContentType="name"
        returnKeyType="done"
        onSubmitEditing={next}
      />
    </FormScreen>
  );
}
