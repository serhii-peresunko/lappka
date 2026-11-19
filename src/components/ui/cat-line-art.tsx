import Svg, { Circle, Path } from 'react-native-svg';

export type CatEars = 'pointy' | 'fold' | 'big';

type CatLineArtProps = {
  size?: number;
  /** Line color. */
  color: string;
  /** Accent for the nose and bandana. */
  accent?: string;
  /** Draw a polka-dot bandana under the chin. */
  bandana?: boolean;
  /** Ear shape; breeds use this to look different. */
  ears?: CatEars;
  /** Coat color for the head and ears; transparent when omitted. */
  fill?: string;
  strokeWidth?: number;
};

const EARS: Record<CatEars, { left: string; right: string }> = {
  pointy: {
    left: 'M56 92 L48 36 L94 60 Z',
    right: 'M144 92 L152 36 L106 60 Z',
  },
  fold: {
    left: 'M58 90 L54 56 L88 66 Z',
    right: 'M142 90 L146 56 L112 66 Z',
  },
  big: {
    left: 'M56 92 L36 24 L96 58 Z',
    right: 'M144 92 L164 24 L104 58 Z',
  },
};

/** A friendly cartoon cat in the same single-weight line style as the dog. */
export function CatLineArt({
  size = 160,
  color,
  accent,
  bandana,
  ears = 'pointy',
  fill = 'none',
  strokeWidth = 4,
}: CatLineArtProps) {
  const detail = accent ?? color;
  const line = { stroke: color, strokeWidth, strokeLinecap: 'round', strokeLinejoin: 'round' } as const;
  return (
    <Svg width={size} height={size} viewBox="0 0 200 200" fill="none">
      {bandana && (
        <>
          <Path
            d="M70 156 C88 164 112 164 130 156 L100 196 Z"
            fill={detail}
            stroke={detail}
            strokeWidth={strokeWidth}
            strokeLinejoin="round"
          />
          <Circle cx="92" cy="168" r="2.6" fill="#FFFFFF" />
          <Circle cx="108" cy="168" r="2.6" fill="#FFFFFF" />
          <Circle cx="100" cy="180" r="2.6" fill="#FFFFFF" />
        </>
      )}
      {/* Ears first so the head covers where they join */}
      <Path d={EARS[ears].left} fill={fill} {...line} />
      <Path d={EARS[ears].right} fill={fill} {...line} />
      {/* Head */}
      <Path
        d="M52 112 C52 70 76 52 100 52 C124 52 148 70 148 112 C148 146 126 160 100 160 C74 160 52 146 52 112 Z"
        fill={fill}
        {...line}
      />
      {/* Eyes */}
      <Circle cx="80" cy="108" r="4.5" fill={color} />
      <Circle cx="120" cy="108" r="4.5" fill={color} />
      {/* Nose and mouth */}
      <Path
        d="M94 123 L106 123 L100 131 Z"
        fill={detail}
        stroke={detail}
        strokeWidth={strokeWidth - 1}
        strokeLinejoin="round"
      />
      <Path
        d="M100 131 L100 138 M100 138 C95 145 88 143 85 140 M100 138 C105 145 112 143 115 140"
        {...line}
        strokeWidth={strokeWidth - 1}
      />
      {/* Whiskers */}
      <Path d="M68 126 L36 120 M68 135 L36 137" {...line} strokeWidth={strokeWidth - 1.5} />
      <Path d="M132 126 L164 120 M132 135 L164 137" {...line} strokeWidth={strokeWidth - 1.5} />
    </Svg>
  );
}
