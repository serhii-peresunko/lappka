import Svg, { Path } from 'react-native-svg';

// The menu's icons, exactly as exported from the owner's Figma file.
const STROKE = { strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round', fill: 'none' } as const;

export function HomeIcon({ color = '#000000' }: { color?: string }) {
  return (
    <Svg width={20} height={21} viewBox="0 0 20 21" fill="none">
      <Path
        {...STROKE}
        stroke={color}
        d="M19 17.24V10.507C19 9.96445 18.8896 9.42757 18.6756 8.92903C18.4616 8.43048 18.1483 7.98068 17.755 7.607L11.378 1.55C11.0063 1.19689 10.5132 1 10.0005 1C9.48781 1 8.9947 1.19689 8.623 1.55L2.245 7.607C1.85165 7.98068 1.53844 8.43048 1.3244 8.92903C1.11037 9.42757 0.999999 9.96445 1 10.507V17.24C1 17.7704 1.21071 18.2791 1.58579 18.6542C1.96086 19.0293 2.46957 19.24 3 19.24H17C17.5304 19.24 18.0391 19.0293 18.4142 18.6542C18.7893 18.2791 19 17.7704 19 17.24ZM7 13.24C7 12.7096 7.21071 12.2009 7.58579 11.8258C7.96086 11.4507 8.46957 11.24 9 11.24H11C11.5304 11.24 12.0391 11.4507 12.4142 11.8258C12.7893 12.2009 13 12.7096 13 13.24V19.24H7V13.24Z"
      />
    </Svg>
  );
}

export function CalendarIcon({ color = '#000000' }: { color?: string }) {
  return (
    <Svg width={22} height={22} viewBox="0 0 22 22" fill="none">
      <Path {...STROKE} stroke={color} d="M5 3H17C19.2091 3 21 4.79086 21 7V17C21 19.2091 19.2091 21 17 21H5C2.79086 21 1 19.2091 1 17V7C1 4.79086 2.79086 3 5 3Z" />
      <Path {...STROKE} stroke={color} d="M7 1V5M15 1V5M1 9H21" />
    </Svg>
  );
}

export function PlusIcon({ color = '#FFFFFF' }: { color?: string }) {
  return (
    <Svg width={16} height={16} viewBox="0 0 16 16" fill="none">
      <Path
        fill={color}
        d="M8 0C8.55229 0 9 0.447715 9 1V6C9 6.55228 9.44772 7 10 7H15C15.5523 7 16 7.44772 16 8C16 8.55229 15.5523 9 15 9H10C9.44771 9 9 9.44772 9 10V15C9 15.5523 8.55229 16 8 16C7.44772 16 7 15.5523 7 15V10C7 9.44771 6.55228 9 6 9H1C0.447715 9 0 8.55229 0 8C0 7.44772 0.447715 7 1 7H6C6.55228 7 7 6.55228 7 6V1C7 0.447715 7.44772 0 8 0Z"
      />
    </Svg>
  );
}
