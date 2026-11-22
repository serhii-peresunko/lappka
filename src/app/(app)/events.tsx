import { useRouter } from 'expo-router';
import { useMemo } from 'react';

import { EventTimeline, groupByDay } from '@/components/event-timeline';
import { FormScreen } from '@/components/ui/form-screen';
import { useI18n } from '@/i18n';
import { upcomingEvents } from '@/lib/repeat';
import { useSession } from '@/providers/session';

/** All planned events on a screen of their own (the "All" button next to "Planned events" opens it). */
export default function EventsScreen() {
  const router = useRouter();
  const { t } = useI18n();
  const { events } = useSession();
  const groups = useMemo(() => groupByDay(upcomingEvents(events)), [events]);

  return (
    <FormScreen title={t('home.comingUp')} onBack={() => router.back()}>
      <EventTimeline groups={groups} highlightFirst />
    </FormScreen>
  );
}
