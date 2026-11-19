import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { FormScreen } from '@/components/ui/form-screen';
import { TextField } from '@/components/ui/text-field';
import { useI18n } from '@/i18n';
import { useSession } from '@/providers/session';

/** Step 1 for new users: the pet owner's account. Only a name is needed. */
export default function OwnerScreen() {
  const { saveOwnerName } = useSession();
  const { t } = useI18n();

  const [name, setName] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const error = name.trim() ? undefined : t('owner.error');

  function next() {
    setSubmitted(true);
    if (error) return;
    // Saving the name unlocks the pet step; the layout then shows it.
    saveOwnerName(name.trim());
  }

  return (
    <FormScreen
      eyebrow={t('step', { n: 1 })}
      title={t('owner.title')}
      subtitle={t('owner.subtitle')}
      footer={<Button title={t('continue')} onPress={next} />}>
      <TextField
        label={t('owner.label')}
        placeholder={t('owner.placeholder')}
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
