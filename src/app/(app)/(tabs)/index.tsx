import { useRouter } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { CategoryIcon } from '@/components/care/category-icon';
import { RecordRow } from '@/components/care/record-row';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { PawDecor } from '@/components/ui/paw-decor';
import { EmptyState, SectionTitle } from '@/components/ui/screen';
import { BottomTabInset, CardShadow, Spacing } from '@/constants/theme';
import { CATEGORY_ORDER } from '@/data/care';
import { useTheme } from '@/hooks/use-theme';
import { useI18n } from '@/i18n/i18n-provider';
import { addDays, today } from '@/lib/dates';
import { useAuth } from '@/providers/auth-provider';
import { splitOpenRecords, useCare } from '@/providers/care-provider';

function greetingKey(hour: number) {
  if (hour < 12) return 'morning';
  if (hour < 18) return 'afternoon';
  return 'evening';
}

export default function HomeScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { session } = useAuth();
  const { pet, records } = useCare();
  const { t, formatAge, formatRelative } = useI18n();

  const todayISO = today();
  const weekEnd = addDays(todayISO, 7);
  const { overdue, upcoming } = splitOpenRecords(records, todayISO);
  const dueToday = upcoming.filter((record) => record.date === todayISO);
  const thisWeek = upcoming.filter((record) => record.date > todayISO && record.date <= weekEnd);
  const next = overdue[0] ?? upcoming[0];

  const firstName = (session?.name ?? '').split(' ')[0];
  const initial = firstName.charAt(0).toUpperCase() || '?';

  return (
    <ThemedView style={styles.root}>
      <SafeAreaView style={styles.root} edges={['top']}>
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          <View style={styles.content}>
            {/* Greeting header */}
            <View style={styles.header}>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={t.settings.open}
                onPress={() => router.push('/settings')}
                style={[styles.avatar, { backgroundColor: theme.primary }]}>
                <ThemedText type="smallBold" style={[styles.avatarText, { color: theme.onPrimary }]}>
                  {initial}
                </ThemedText>
              </Pressable>
              <View style={styles.headerText}>
                <ThemedText type="small" themeColor="textSecondary">
                  {t.today.greeting[greetingKey(new Date().getHours())]}
                </ThemedText>
                <View style={styles.nameRow}>
                  <ThemedText type="smallBold" style={styles.name} numberOfLines={1}>
                    {firstName}
                  </ThemedText>
                  <SymbolView
                    name={{ ios: 'pawprint.fill', android: 'pets', web: 'pets' }}
                    tintColor={theme.primary}
                    size={16}
                  />
                </View>
              </View>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={t.settings.open}
                hitSlop={8}
                onPress={() => router.push('/settings')}
                style={({ pressed }) => [
                  styles.roundButton,
                  CardShadow,
                  { backgroundColor: theme.backgroundElement },
                  pressed && styles.pressed,
                ]}>
                <SymbolView
                  name={{ ios: 'gearshape', android: 'settings', web: 'settings' }}
                  tintColor={theme.text}
                  size={22}
                />
              </Pressable>
            </View>

            {/* Pet hero card */}
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={t.today.openPet(pet.name)}
              onPress={() => router.navigate('/pet')}
              style={({ pressed }) => [styles.hero, { backgroundColor: theme.primary }, pressed && styles.pressed]}>
              <PawDecor
                color={theme.onPrimary}
                opacity={0.18}
                paws={[
                  { top: 10, right: 110, size: 26, rotate: 20 },
                  { bottom: 12, right: 18, size: 34, rotate: -20 },
                  { top: 54, right: 64, size: 18, rotate: 40 },
                ]}
              />
              <View style={styles.heroText}>
                <ThemedText style={[styles.heroName, { color: theme.onPrimary }]}>{pet.name}</ThemedText>
                <ThemedText type="small" style={{ color: theme.onPrimary, opacity: 0.9 }}>
                  {pet.breed} · {formatAge(pet.birthDate)}
                </ThemedText>
                <View style={styles.heroPill}>
                  <ThemedText type="smallBold" style={{ color: theme.onPrimary }} numberOfLines={1}>
                    {next ? `${t.today.nextUp}: ${next.title} · ${formatRelative(next.date)}` : t.today.allClear}
                  </ThemedText>
                </View>
              </View>
              <View style={[styles.heroAvatar, { backgroundColor: theme.backgroundElement }]}>
                <SymbolView
                  name={{ ios: 'pawprint.fill', android: 'pets', web: 'pets' }}
                  tintColor={theme.primary}
                  size={40}
                />
              </View>
            </Pressable>

            {/* Category shortcuts */}
            <SectionTitle>{t.today.categories}</SectionTitle>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.categories}
              style={styles.categoriesScroll}>
              {CATEGORY_ORDER.filter((category) => category !== 'other').map((category) => {
                const late = overdue.some((record) => record.category === category);
                return (
                  <Pressable
                    key={category}
                    accessibilityRole="button"
                    onPress={() => router.navigate({ pathname: '/care', params: { category } })}
                    style={({ pressed }) => [
                      styles.category,
                      CardShadow,
                      { backgroundColor: theme.backgroundElement },
                      pressed && styles.pressed,
                    ]}>
                    <CategoryIcon category={category} size={44} />
                    <ThemedText type="small" numberOfLines={1} style={styles.categoryLabel}>
                      {t.categories[category].short}
                    </ThemedText>
                    {late && <View style={[styles.lateDot, { backgroundColor: theme.danger }]} />}
                  </Pressable>
                );
              })}
            </ScrollView>

            {overdue.length > 0 && (
              <>
                <SectionTitle>
                  <ThemedText type="smallBold" style={[styles.overdueTitle, { color: theme.danger }]}>
                    {t.today.needsAttention(overdue.length)}
                  </ThemedText>
                </SectionTitle>
                {overdue.map((record) => (
                  <RecordRow key={record.id} record={record} />
                ))}
              </>
            )}

            <SectionTitle>{t.today.dueToday}</SectionTitle>
            {dueToday.length > 0 ? (
              dueToday.map((record) => <RecordRow key={record.id} record={record} showDate={false} />)
            ) : (
              <EmptyState title={t.today.nothingToday} hint={t.today.allSet(pet.name)} />
            )}

            <SectionTitle>{t.today.next7}</SectionTitle>
            {thisWeek.length > 0 ? (
              thisWeek.map((record) => <RecordRow key={record.id} record={record} />)
            ) : (
              <EmptyState title={t.today.quietWeek} />
            )}
          </View>
        </ScrollView>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  scroll: {
    paddingHorizontal: Spacing.three + Spacing.one,
    paddingTop: Spacing.two,
    paddingBottom: BottomTabInset + Spacing.three,
  },
  content: {
    width: '100%',
    maxWidth: 640,
    alignSelf: 'center',
    gap: Spacing.three,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 20,
    lineHeight: 24,
  },
  headerText: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.one + Spacing.half,
  },
  name: {
    fontSize: 20,
    lineHeight: 26,
    flexShrink: 1,
  },
  roundButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: {
    opacity: 0.85,
  },
  hero: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 28,
    padding: Spacing.four - Spacing.one,
    gap: Spacing.three,
    overflow: 'hidden',
  },
  heroText: {
    flex: 1,
    gap: Spacing.one,
  },
  heroName: {
    fontSize: 28,
    lineHeight: 34,
    fontWeight: 800,
  },
  heroPill: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.22)',
    borderRadius: 999,
    paddingHorizontal: Spacing.three - Spacing.one,
    paddingVertical: Spacing.one + Spacing.half,
    marginTop: Spacing.two,
    maxWidth: '100%',
  },
  heroAvatar: {
    width: 84,
    height: 84,
    borderRadius: 42,
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoriesScroll: {
    flexGrow: 0,
    marginHorizontal: -(Spacing.three + Spacing.one),
  },
  categories: {
    gap: Spacing.three - Spacing.one,
    paddingHorizontal: Spacing.three + Spacing.one,
    paddingVertical: Spacing.two,
  },
  category: {
    width: 84,
    alignItems: 'center',
    gap: Spacing.two,
    paddingVertical: Spacing.three - Spacing.one,
    borderRadius: 22,
  },
  categoryLabel: {
    fontSize: 12,
  },
  lateDot: {
    position: 'absolute',
    top: 8,
    right: 10,
    width: 9,
    height: 9,
    borderRadius: 5,
  },
  overdueTitle: {
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    fontSize: 12,
  },
});
