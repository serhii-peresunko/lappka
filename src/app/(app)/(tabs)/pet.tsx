import { useRouter } from 'expo-router';
import { SymbolView, type SymbolViewProps } from 'expo-symbols';
import { Linking, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Button } from '@/components/ui/button';
import { PawDecor } from '@/components/ui/paw-decor';
import { SectionTitle } from '@/components/ui/screen';
import { BottomTabInset, CardShadow, Spacing } from '@/constants/theme';
import { CATEGORIES, nextOccurrence } from '@/data/care';
import { useTheme } from '@/hooks/use-theme';
import { useI18n } from '@/i18n/i18n-provider';
import { today } from '@/lib/dates';
import { useCare } from '@/providers/care-provider';

export default function PetScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { pet, records } = useCare();
  const { t, formatAge, formatDate, formatRelative } = useI18n();
  const todayISO = today();

  // Latest given dose and when the next one is due, for each vaccine.
  const vaccinations = records.filter((r) => r.category === 'vaccination');
  const vaccines = [...new Set(vaccinations.map((r) => r.title))].map((title) => {
    const doses = vaccinations.filter((r) => r.title === title);
    const last = doses.filter((r) => r.done).at(-1);
    // Prefer a planned dose; otherwise work out when the next one is due from the last.
    const nextDate =
      doses.find((r) => !r.done)?.date ?? (last ? nextOccurrence(last.date, last.repeat) : null);
    return { title, last, nextDate };
  });
  const vaccineOverdue = vaccines.some((v) => v.nextDate !== null && v.nextDate < todayISO);

  const traits: { icon: SymbolViewProps['name']; label: string }[] = [
    ...(pet.neutered
      ? [{ icon: { ios: 'checkmark.seal.fill', android: 'verified', web: 'verified' } as const, label: t.pet.neuteredChip }]
      : []),
    ...(pet.microchip
      ? [{ icon: { ios: 'cpu', android: 'memory', web: 'memory' } as const, label: t.pet.microchipped }]
      : []),
    pet.allergies && pet.allergies !== t.pet.none
      ? { icon: { ios: 'exclamationmark.triangle.fill', android: 'warning', web: 'warning' }, label: t.pet.allergy(pet.allergies) }
      : { icon: { ios: 'leaf.fill', android: 'eco', web: 'eco' }, label: t.pet.noAllergies },
  ];

  return (
    <ThemedView style={styles.root}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Hero */}
        <View style={[styles.hero, { backgroundColor: theme.primarySoft }]}>
          <PawDecor
            color={theme.primary}
            opacity={0.3}
            paws={[
              { top: 70, left: 28, size: 30, rotate: -20 },
              { top: 110, right: 40, size: 24, rotate: 25 },
              { bottom: 70, left: 60, size: 20, rotate: 15 },
              { bottom: 90, right: 30, size: 34, rotate: -10 },
            ]}
          />
          <SafeAreaView edges={['top']} style={styles.heroBar}>
            <HeaderButton
              icon={{ ios: 'gearshape', android: 'settings', web: 'settings' }}
              label={t.settings.open}
              onPress={() => router.push('/settings')}
            />
            <HeaderButton
              icon={{ ios: 'pencil', android: 'edit', web: 'edit' }}
              label={t.pet.edit}
              onPress={() => router.push('/edit-pet')}
            />
          </SafeAreaView>
          <View style={styles.heroCenter}>
            <View style={[styles.blob, { backgroundColor: theme.primary, opacity: 0.25 }]} />
            <View style={[styles.avatar, { backgroundColor: theme.backgroundElement }]}>
              <SymbolView
                name={{ ios: 'pawprint.fill', android: 'pets', web: 'pets' }}
                tintColor={theme.primary}
                size={72}
              />
            </View>
          </View>
        </View>

        {/* Sheet */}
        <View style={[styles.sheet, { backgroundColor: theme.background }]}>
          <View style={styles.content}>
            <View style={styles.nameRow}>
              <ThemedText type="subtitle" style={styles.name} numberOfLines={1}>
                {pet.name}
              </ThemedText>
              <View
                style={[
                  styles.status,
                  { backgroundColor: vaccineOverdue ? theme.primarySoft : theme.successSoft },
                ]}>
                <ThemedText
                  type="smallBold"
                  style={{ color: vaccineOverdue ? theme.primary : theme.success, fontSize: 12 }}>
                  {vaccineOverdue ? t.pet.statusDue : t.pet.statusVaccinated}
                </ThemedText>
              </View>
            </View>
            <ThemedText themeColor="textSecondary" style={styles.meta}>
              {pet.breed} · {formatAge(pet.birthDate)} · {t.pet.sexValue[pet.sex]}
            </ThemedText>

            <View style={styles.stats}>
              <Stat
                icon={{ ios: 'scalemass.fill', android: 'monitor_weight', web: 'monitor_weight' }}
                value={`${pet.weightKg} ${t.pet.kg}`}
                label={t.pet.weight}
              />
              <Stat
                icon={{ ios: 'birthday.cake.fill', android: 'cake', web: 'cake' }}
                value={formatDate(pet.birthDate, { year: undefined })}
                label={t.pet.born}
              />
              <Stat
                icon={CATEGORIES.vaccination.icon}
                value={vaccines.length ? String(vaccines.length) : '—'}
                label={t.categories.vaccination.short}
              />
            </View>

            <SectionTitle>{t.pet.about(pet.name)}</SectionTitle>
            <View style={styles.traits}>
              {traits.map((trait) => (
                <View
                  key={trait.label}
                  style={[styles.trait, CardShadow, { backgroundColor: theme.backgroundElement }]}>
                  <SymbolView name={trait.icon} tintColor={theme.primary} size={16} />
                  <ThemedText type="small">{trait.label}</ThemedText>
                </View>
              ))}
            </View>

            <SectionTitle>{t.pet.details}</SectionTitle>
            <View style={[styles.panel, CardShadow, { backgroundColor: theme.backgroundElement }]}>
              <View style={styles.grid}>
                <Field label={t.pet.species} value={pet.species} />
                <Field label={t.pet.color} value={pet.color} />
                <Field label={t.pet.born} value={formatDate(pet.birthDate)} />
                <Field label={t.pet.passport} value={pet.passport} />
                <Field label={t.pet.microchip} value={pet.microchip} wide mono />
                <Field label={t.pet.conditions} value={pet.conditions || t.pet.none} wide />
              </View>
            </View>

            <SectionTitle>{t.pet.vaccinations}</SectionTitle>
            <View style={[styles.panel, CardShadow, { backgroundColor: theme.backgroundElement }]}>
              {vaccines.length === 0 ? (
                <ThemedText type="small" themeColor="textSecondary">
                  {t.pet.noVaccinations}
                </ThemedText>
              ) : (
                vaccines.map(({ title, last, nextDate }) => {
                  const late = nextDate !== null && nextDate < todayISO;
                  return (
                    <View key={title} style={styles.vaccineRow}>
                      <ThemedText type="smallBold" style={styles.vaccineName}>
                        {title}
                      </ThemedText>
                      <View style={styles.vaccineDates}>
                        <ThemedText type="small" themeColor="textSecondary">
                          {last ? t.pet.given(formatDate(last.date)) : t.pet.notGiven}
                        </ThemedText>
                        <ThemedText
                          type="small"
                          style={{ color: late ? theme.danger : theme.primary, fontWeight: 700 }}>
                          {nextDate
                            ? (late ? t.pet.overdue : t.pet.due)(formatRelative(nextDate))
                            : t.pet.noBooster}
                        </ThemedText>
                      </View>
                    </View>
                  );
                })
              )}
            </View>

            <SectionTitle>{t.pet.contacts}</SectionTitle>
            <Contact label={t.pet.vet} name={pet.vetClinic} phone={pet.vetPhone} />
            <Contact label={t.pet.owner} name={pet.ownerName} phone={pet.ownerPhone} />

            <View style={styles.editButton}>
              <Button
                title={t.pet.editButton}
                icon={
                  <SymbolView
                    name={{ ios: 'pawprint.fill', android: 'pets', web: 'pets' }}
                    tintColor={theme.onPrimary}
                    size={18}
                  />
                }
                onPress={() => router.push('/edit-pet')}
              />
            </View>
          </View>
        </View>
      </ScrollView>
    </ThemedView>
  );
}

function HeaderButton({
  icon,
  label,
  onPress,
}: {
  icon: SymbolViewProps['name'];
  label: string;
  onPress: () => void;
}) {
  const theme = useTheme();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      hitSlop={8}
      onPress={onPress}
      style={({ pressed }) => [
        styles.headerButton,
        CardShadow,
        { backgroundColor: theme.backgroundElement },
        pressed && { opacity: 0.8 },
      ]}>
      <SymbolView name={icon} tintColor={theme.text} size={20} />
    </Pressable>
  );
}

function Stat({ icon, value, label }: { icon: SymbolViewProps['name']; value: string; label: string }) {
  const theme = useTheme();
  return (
    <View style={[styles.stat, CardShadow, { backgroundColor: theme.backgroundElement }]}>
      <SymbolView name={icon} tintColor={theme.primary} size={22} />
      <View style={styles.statText}>
        <ThemedText type="smallBold" numberOfLines={1}>
          {value}
        </ThemedText>
        <ThemedText type="small" themeColor="textSecondary" numberOfLines={1} style={styles.statLabel}>
          {label}
        </ThemedText>
      </View>
    </View>
  );
}

function Field({ label, value, wide, mono }: { label: string; value: string; wide?: boolean; mono?: boolean }) {
  return (
    <View style={[styles.field, wide && styles.fieldWide]}>
      <ThemedText type="small" themeColor="textSecondary">
        {label}
      </ThemedText>
      <ThemedText type={mono ? 'code' : 'smallBold'} style={mono && styles.mono}>
        {value || '—'}
      </ThemedText>
    </View>
  );
}

function Contact({ label, name, phone }: { label: string; name: string; phone: string }) {
  const theme = useTheme();
  const { t } = useI18n();
  return (
    <View style={[styles.contact, CardShadow, { backgroundColor: theme.backgroundElement }]}>
      <View style={styles.contactText}>
        <ThemedText type="small" themeColor="textSecondary">
          {label}
        </ThemedText>
        <ThemedText type="smallBold">{name || '—'}</ThemedText>
        <ThemedText type="small">{phone}</ThemedText>
      </View>
      {phone ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t.pet.call(name)}
          onPress={() => Linking.openURL(`tel:${phone.replace(/[^\d+]/g, '')}`)}
          style={({ pressed }) => [styles.call, { backgroundColor: theme.primary }, pressed && { opacity: 0.8 }]}>
          <SymbolView
            name={{ ios: 'phone.fill', android: 'call', web: 'call' }}
            tintColor={theme.onPrimary}
            size={18}
          />
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  scroll: {
    paddingBottom: BottomTabInset + Spacing.three,
  },
  hero: {
    height: 330,
    overflow: 'hidden',
  },
  heroBar: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: Spacing.two,
    paddingHorizontal: Spacing.three + Spacing.one,
    paddingTop: Spacing.two,
  },
  headerButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroCenter: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: Spacing.five,
  },
  blob: {
    position: 'absolute',
    width: 230,
    height: 200,
    borderTopLeftRadius: 120,
    borderTopRightRadius: 90,
    borderBottomLeftRadius: 100,
    borderBottomRightRadius: 130,
    transform: [{ rotate: '-10deg' }],
  },
  avatar: {
    width: 150,
    height: 150,
    borderRadius: 75,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sheet: {
    marginTop: -36,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingTop: Spacing.four,
    paddingHorizontal: Spacing.three + Spacing.one,
  },
  content: {
    width: '100%',
    maxWidth: 640,
    alignSelf: 'center',
    gap: Spacing.three,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three - Spacing.one,
  },
  name: {
    fontSize: 34,
    lineHeight: 40,
    fontWeight: 800,
    flexShrink: 1,
  },
  status: {
    borderRadius: 999,
    paddingHorizontal: Spacing.three - Spacing.one,
    paddingVertical: Spacing.one,
  },
  meta: {
    marginTop: -Spacing.two,
  },
  stats: {
    flexDirection: 'row',
    gap: Spacing.two,
    marginTop: Spacing.one,
  },
  stat: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    padding: Spacing.three - Spacing.one,
    borderRadius: 18,
  },
  statText: {
    flex: 1,
  },
  statLabel: {
    fontSize: 12,
  },
  traits: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
  },
  trait: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.one + Spacing.half,
    borderRadius: 999,
    paddingHorizontal: Spacing.three - Spacing.one,
    paddingVertical: Spacing.two,
  },
  panel: {
    borderRadius: 20,
    padding: Spacing.three,
    gap: Spacing.three,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    rowGap: Spacing.three,
  },
  field: {
    width: '50%',
    gap: 2,
    paddingRight: Spacing.two,
  },
  fieldWide: {
    width: '100%',
  },
  mono: {
    fontSize: 15,
    letterSpacing: 1,
  },
  vaccineRow: {
    gap: 2,
  },
  vaccineName: {
    fontSize: 15,
  },
  vaccineDates: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: Spacing.two,
  },
  contact: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 20,
    padding: Spacing.three,
    gap: Spacing.three,
  },
  contactText: {
    flex: 1,
    gap: 2,
  },
  call: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  editButton: {
    marginTop: Spacing.three,
  },
});
