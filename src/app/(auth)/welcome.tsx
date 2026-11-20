import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Image, Pressable, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { SymbolIcon } from '@/components/ui/symbol-icon';
import { Spacing } from '@/constants/theme';
import { useI18n } from '@/i18n';

// Credit for the photo is in assets/images/CREDITS.md.
const PHOTO = require('../../../assets/images/welcome-dog.jpg');

/** First screen: a full-screen dog photo, a gradient for legibility, and two buttons (one frosted glass). */
export default function WelcomeScreen() {
  const router = useRouter();
  const { t } = useI18n();
  const go = (mode: 'sign-up' | 'sign-in') => router.push({ pathname: '/auth', params: { mode } });

  return (
    <View style={styles.root}>
      <Image
        source={PHOTO}
        style={styles.photo}
      />
      <LinearGradient
        colors={['rgba(0,0,0,0.35)', 'rgba(0,0,0,0)']}
        style={styles.topShade}
        pointerEvents="none"
      />
      <LinearGradient
        colors={['rgba(0,0,0,0)', 'rgba(0,0,0,0.55)', 'rgba(0,0,0,0.88)']}
        locations={[0, 0.5, 1]}
        style={styles.bottomShade}
        pointerEvents="none"
      />

      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        {/* The brand mark is a paw ("лапка"). */}
        <View style={styles.brand}>
          <SymbolIcon ios="pawprint.fill" material="pets" color="#fff" size={30} />
        </View>

        <View style={styles.bottom}>
          <ThemedText style={styles.headline}>{t('welcome.headline')}</ThemedText>
          <ThemedText style={styles.sub}>{t('welcome.sub')}</ThemedText>

          <View style={styles.actions}>
            <Pressable accessibilityRole="button" onPress={() => go('sign-up')} style={styles.solid}>
              <ThemedText style={styles.solidLabel}>{t('welcome.signUp')}</ThemedText>
            </Pressable>
            <Pressable accessibilityRole="button" onPress={() => go('sign-in')} style={styles.glass}>
              <BlurView intensity={45} tint="dark" style={StyleSheet.absoluteFill} />
              <ThemedText style={styles.glassLabel}>{t('welcome.signIn')}</ThemedText>
            </Pressable>
          </View>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#000' },
  safe: { flex: 1 },
  photo: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, width: '100%', height: '100%', resizeMode: 'cover' },
  topShade: { position: 'absolute', top: 0, left: 0, right: 0, height: 160 },
  bottomShade: { position: 'absolute', bottom: 0, left: 0, right: 0, height: '58%' },
  brand: { paddingHorizontal: Spacing.four, paddingTop: Spacing.two },
  bottom: {
    flex: 1,
    justifyContent: 'flex-end',
    width: '100%',
    maxWidth: 460,
    alignSelf: 'center',
    paddingHorizontal: Spacing.four,
    paddingBottom: Spacing.three,
    gap: Spacing.two,
  },
  headline: { color: '#fff', fontSize: 34, lineHeight: 40, fontWeight: '700' },
  sub: { color: 'rgba(255,255,255,0.75)', fontSize: 16, marginBottom: Spacing.three },
  actions: { gap: Spacing.three },
  solid: {
    minHeight: 56,
    borderRadius: 28,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  solidLabel: { color: '#000', fontSize: 17, fontWeight: '700' },
  glass: {
    minHeight: 56,
    borderRadius: 28,
    overflow: 'hidden',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255,255,255,0.45)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  glassLabel: { color: '#fff', fontSize: 17, fontWeight: '600' },
});
