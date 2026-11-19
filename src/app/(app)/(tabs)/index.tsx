import { useRouter } from 'expo-router';
import { useMemo } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Button } from '@/components/ui/button';
import { PetArt } from '@/components/ui/pet-art';
import { Spacing } from '@/constants/theme';
import { breedLook } from '@/data/breeds';
import { useTheme } from '@/hooks/use-theme';
import { todayIso } from '@/lib/dates';
import { KIND_COLORS, kindLabel } from '@/lib/event-kinds';
import { useSession } from '@/providers/session';

const UPCOMING = 4;

/** Home tab: greeting, the pet, the next few events and a shortcut to add one. */
export default function HomeScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { session, events, signOut } = useSession();
  const pet = session?.pet;
  const look = pet ? breedLook(pet.type, pet.breed) : undefined;

  const upcoming = useMemo(() => {
    const today = todayIso();
    return events
      .filter((event) => event.date >= today)
      .sort((a, b) => `${a.date} ${a.time ?? ''}`.localeCompare(`${b.date} ${b.time ?? ''}`))
      .slice(0, UPCOMING);
  }, [events]);

  const dayLabel = (iso: string) =>
    iso === todayIso()
      ? 'Today'
      : new Date(`${iso}T12:00:00`).toLocaleDateString('en-US', { weekday: 'short', day: 'numeric', month: 'short' });

  return (
    <ThemedView style={styles.root}>
      <SafeAreaView style={styles.root} edges={['top']}>
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          <View style={styles.content}>
            <View style={styles.top}>
              <ThemedText type="subtitle" style={styles.flex}>
                Hi, {session?.ownerName}
              </ThemedText>
              <Pressable accessibilityRole="button" onPress={signOut} hitSlop={8} style={styles.signOut}>
                <ThemedText type="smallBold" style={{ color: theme.primaryText }}>
                  Sign out
                </ThemedText>
              </Pressable>
            </View>

            {pet ? (
              <View style={[styles.petCard, { backgroundColor: theme.primarySoft }]}>
                <PetArt
                  type={pet.type}
                  size={72}
                  color={theme.text}
                  accent={theme.primary}
                  bandana
                  strokeWidth={4.6}
                  fill={look?.coat}
                  ears={look?.ears}
                />
                <View style={styles.flex}>
                  <ThemedText type="subtitle" style={styles.petName}>
                    {pet.name}
                  </ThemedText>
                  <ThemedText themeColor="textSecondary">{pet.breed}</ThemedText>
                </View>
              </View>
            ) : null}

            <View style={styles.section}>
              <ThemedText type="smallBold" style={styles.sectionTitle}>
                Upcoming
              </ThemedText>
              {upcoming.length === 0 ? (
                <ThemedText themeColor="textSecondary">No upcoming events.</ThemedText>
              ) : (
                upcoming.map((event) => (
                  <View
                    key={event.id}
                    style={[styles.event, { backgroundColor: theme.backgroundElement, borderColor: theme.border }]}>
                    <View style={[styles.accent, { backgroundColor: KIND_COLORS[event.kind] }]} />
                    <View style={styles.flex}>
                      <ThemedText type="smallBold" style={styles.eventTitle}>
                        {event.title}
                      </ThemedText>
                      <ThemedText type="small" themeColor="textSecondary">
                        {kindLabel(event.kind)}
                      </ThemedText>
                    </View>
                    <ThemedText type="small" themeColor="textSecondary">
                      {dayLabel(event.date)}
                      {event.time ? ` · ${event.time}` : ''}
                    </ThemedText>
                  </View>
                ))
              )}
            </View>

            <Button title="Add event" onPress={() => router.push({ pathname: '/add-event', params: { date: todayIso() } })} />
          </View>
        </ScrollView>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  flex: { flex: 1 },
  scroll: { flexGrow: 1, paddingHorizontal: Spacing.four, paddingVertical: Spacing.four },
  content: { width: '100%', maxWidth: 460, alignSelf: 'center', gap: Spacing.four },
  top: { flexDirection: 'row', alignItems: 'center', gap: Spacing.three },
  signOut: { minHeight: 44, justifyContent: 'center' },
  petCard: { flexDirection: 'row', alignItems: 'center', gap: Spacing.three, borderRadius: 20, padding: Spacing.three },
  petName: { fontSize: 28, lineHeight: 34 },
  section: { gap: Spacing.two },
  sectionTitle: { fontSize: 17 },
  event: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    borderWidth: 1,
    borderRadius: 14,
    padding: Spacing.three,
  },
  accent: { width: 4, alignSelf: 'stretch', borderRadius: 2 },
  eventTitle: { fontSize: 16 },
});
