import { useCallback, useRef, useState } from 'react';
import { Alert } from 'react-native';

import { useI18n } from '@/i18n';

/**
 * Runs a server action: `pending` while it runs, a second tap is ignored, and a failure is shown to the user.
 * `run` resolves to true when the action worked.
 */
export function useTask() {
  const { t } = useI18n();
  const [pending, setPending] = useState(false);
  const busy = useRef(false);

  const run = useCallback(
    async (action: () => Promise<void>) => {
      if (busy.current) return false;
      busy.current = true;
      setPending(true);
      try {
        await action();
        return true;
      } catch (error) {
        console.warn('Action failed', error);
        Alert.alert(t('error.title'), t('error.save'));
        return false;
      } finally {
        busy.current = false;
        setPending(false);
      }
    },
    [t]
  );

  return { pending, run };
}
