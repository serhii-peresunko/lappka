import { useMemo } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { EventCard } from '@/components/ui/event-card';
import { PetArt } from '@/components/ui/pet-art';
import { Spacing } from '@/constants/theme';
import { breedLook } from '@/data/breeds';
import { useTheme } from '@/hooks/use-theme';
import { todayIso } from '@/lib/dates';
import { kindLabel } from '@/lib/event-kinds';
import { useSession, type PetEvent } from '@/providers/session';

const MORE = 4;

const dayLabel = (iso: string) =>
  iso === todayIso()
    ? 'Today'
    : new Date(`${iso}T12:00:00`).toLocaleDateString('en-US', { weekday: 'short', day: 'numeric', month: 'short' });

const whenLabel = (event: PetEvent) => `${dayLabel(event.date)}${event.time ? ` · ${event.time}` : ''}`;

/** Home tab, laid out as a bento grid: the next event (dark), the pet (peach), then the events after it. */
export default function HomeScreen() {
  const theme = useTheme();
  const { session, events } = useSession();
  const pet = session?.pet;
  const look = pet ? breedLook(pet.type, pet.breed) : undefined;

  const upcoming = useMemo(() => {
    const today = todayIso();
    return events
      .filter((event) => event.date >= today)
      .sort((a, b) => `${a.date} ${a.time ?? ''}`.localeCompare(`${b.date} ${b.time ?? ''}`));
  }, [events]);
  const next = upcoming[0];
  const rest = upcoming.slice(1, 1 + MORE);
  const pairs = Array.from({ length: Math.ceil(rest.length / 2) }, (_, i) => rest.slice(i * 2, i * 2 + 2));

  return (
    <ThemedView style={styles.root}>
      <SafeAreaView style={styles.root} edges={['top']}>
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          <View style={styles.content}>
            <View>
              <ThemedText type="subtitle">Hi, {session?.ownerName}</ThemedText>
              <ThemedText themeColor="textSecondary">
                {new Date().toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'long' })}
              </ThemedText>
            </View>

            <View style={styles.bento}>
              <View style={[styles.next, { backgroundColor: theme.text }]}>
                <ThemedText type="small" style={{ color: theme.background, opacity: 0.6 }}>
                  Next up
                </ThemedText>
                {next ? (
                  <>
                    <ThemedText style={[styles.nextTitle, { color: theme.background }]} numberOfLines={3}>
                      {next.title}
                    </ThemedText>
                    <View>
                      <ThemedText type="small" style={{ color: theme.background, opacity: 0.6 }}>
                        {kindLabel(next.kind)}
                      </ThemedText>
                      <ThemedText type="smallBold" style={{ color: theme.background }}>
                        {whenLabel(next)}
                      </ThemedText>
                    </View>
                  </>
                ) : (
                  <ThemedText style={[styles.nextTitle, { color: theme.background }]}>Nothing planned</ThemedText>
                )}
              </View>

              {pet ? (
                <View style={[styles.pet, { backgroundColor: theme.primarySoft }]}>
                  <PetArt
                    type={pet.type}
                    size={78}
                    color={theme.text}
                    accent={theme.primary}
                    bandana
                    strokeWidth={4.6}
                    fill={look?.coat}
                    ears={look?.ears}
                  />
                  <View style={styles.petText}>
                    <ThemedText style={[styles.petName, { color: '#2A211B' }]} numberOfLines={1}>
                      {pet.name}
                    </ThemedText>
                    <ThemedText type="small" style={{ color: '#5B534D' }} numberOfLines={1}>
                      {pet.breed}
                    </ThemedText>
                  </View>
                </View>
              ) : null}
            </View>

            {rest.length > 0 ? (
              <View style={styles.section}>
                <ThemedText style={styles.sectionTitle}>Coming up</ThemedText>
                {pairs.map((pair, index) => (
                  <View key={index} style={styles.pair}>
                    {pair.map((event) => (
                      <EventCard key={event.id} event={event} when={whenLabel(event)} variant="tile" />
                    ))}
                    {pair.length === 1 ? <View style={styles.pairFiller} /> : null}
                  </View>
                ))}
              </View>
            ) : null}
          </View>
        </ScrollView>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  scroll: { flexGrow: 1, paddingHorizontal: Spacing.four, paddingVertical: Spacing.four },
  content: { width: '100%', maxWidth: 460, alignSelf: 'center', gap: Spacing.four },
  bento: { flexDirection: 'row', gap: Spacing.three },
  next: { flex: 1.1, minHeight: 190, borderRadius: 28, padding: Spacing.three + 2, justifyContent: 'space-between' },
  nextTitle: { fontSize: 22, lineHeight: 28, fontWeight: '600' },
  pet: { flex: 1, minHeight: 190, borderRadius: 28, padding: Spacing.three, alignItems: 'center', justifyContent: 'space-between' },
  petText: { alignItems: 'center' },
  petName: { fontSize: 20, lineHeight: 26, fontWeight: '700' },
  section: { gap: Spacing.three },
  sectionTitle: { fontSize: 20, fontWeight: '600' },
  pair: { flexDirection: 'row', gap: Spacing.three },
  pairFiller: { flex: 1 },
});
