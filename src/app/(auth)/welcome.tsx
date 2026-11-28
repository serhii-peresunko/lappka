import { useRouter } from 'expo-router';
import { Image, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/ui/button';
import { Colors, Spacing } from '@/constants/theme';
import { useI18n } from '@/i18n';

// Credit for the photo is in assets/images/CREDITS.md.
const PHOTO = require('../../../assets/images/welcome-dog.jpg');

// A few short strokes and dots around the photo.
const CONFETTI = [
  { top: 6, left: 14, w: 26, h: 6, color: '#000000', angle: '28deg' },
  { top: 0, left: 186, w: 8, h: 8, color: '#8A8A8A', angle: '0deg' },
  { top: 34, left: 232, w: 6, h: 28, color: '#8A8A8A', angle: '22deg' },
  { top: 128, left: -8, w: 28, h: 6, color: '#8A8A8A', angle: '8deg' },
  { top: 190, left: 238, w: 22, h: 6, color: '#FFFFFF', angle: '-24deg' },
  { top: 238, left: 34, w: 9, h: 9, color: '#8A8A8A', angle: '0deg' },
] as const;

/** First screen: the pet's photo in a circle on pale blue, what the app is for, and the two buttons. */
export default function WelcomeScreen() {
  const router = useRouter();
  const { t } = useI18n();
  const go = (mode: 'sign-up' | 'sign-in') => router.push({ pathname: '/auth', params: { mode } });

  return (
    <SafeAreaView style={styles.root}>
      <View style={styles.center}>
        <View style={styles.art}>
          {CONFETTI.map((item, index) => (
            <View
              key={index}
              style={{ position: 'absolute', top: item.top, left: item.left, width: item.w, height: item.h, borderRadius: 6, backgroundColor: item.color, transform: [{ rotate: item.angle }] }}
            />
          ))}
          <View style={styles.ring}>
            <Image source={PHOTO} style={styles.photo} resizeMode="cover" />
          </View>
        </View>
        <ThemedText style={styles.headline}>{t('welcome.headline')}</ThemedText>
        <ThemedText style={styles.sub}>{t('welcome.sub')}</ThemedText>
      </View>
      <View style={styles.actions}>
        <Button title={t('welcome.signUp')} onPress={() => go('sign-up')} />
        <Button variant="outline" title={t('welcome.signIn')} onPress={() => go('sign-in')} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.light.hero, paddingHorizontal: Spacing.four },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: Spacing.three },
  art: { width: 250, height: 250, alignItems: 'center', justifyContent: 'center', marginBottom: Spacing.two },
  ring: { width: 200, height: 200, borderRadius: 100, padding: 6, backgroundColor: '#FFFFFF' },
  photo: { width: 188, height: 188, borderRadius: 94 },
  headline: { fontSize: 28, lineHeight: 34, fontWeight: '600', textAlign: 'center', letterSpacing: -0.4 },
  sub: { color: Colors.light.textSecondary, fontSize: 15, lineHeight: 21, textAlign: 'center', maxWidth: 320 },
  actions: { gap: 10, paddingBottom: Spacing.three },
});
