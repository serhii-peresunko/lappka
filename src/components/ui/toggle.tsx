import { Platform, Switch } from 'react-native';

import { useTheme } from '@/hooks/use-theme';

type ToggleProps = {
  value: boolean;
  onValueChange: (value: boolean) => void;
  accessibilityLabel: string;
};

// react-native-web colors the "on" thumb with its own `activeThumbColor` (teal by default),
// which isn't in the React Native types, so it is passed only on web.
const webThumb = Platform.OS === 'web' ? { activeThumbColor: '#FFFFFF' } : {};

export function Toggle({ value, onValueChange, accessibilityLabel }: ToggleProps) {
  const theme = useTheme();
  return (
    <Switch
      accessibilityLabel={accessibilityLabel}
      value={value}
      onValueChange={onValueChange}
      trackColor={{ true: theme.primary, false: theme.border }}
      thumbColor="#FFFFFF"
      {...webThumb}
    />
  );
}
