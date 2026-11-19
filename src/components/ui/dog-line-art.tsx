import Svg, { Circle, Path } from 'react-native-svg';

export type DogEars = 'floppy' | 'pointy' | 'round';

type DogLineArtProps = {
  size?: number;
  /** Line color. */
  color: string;
  /** Accent for the nose, tongue and bandana. */
  accent?: string;
  /** Draw a polka-dot bandana under the chin. */
  bandana?: boolean;
  /** Ear shape; breeds use this to look different. */
  ears?: DogEars;
  /** Coat color for the head and ears; transparent when omitted. */
  fill?: string;
  strokeWidth?: number;
};

const EARS: Record<DogEars, { left: string; right: string }> = {
  floppy: {
    left: 'M64 62 C36 54 22 88 30 120 C34 134 52 128 56 110',
    right: 'M136 62 C164 54 178 88 170 120 C166 134 148 128 144 110',
  },
  pointy: {
    left: 'M62 76 L48 24 L98 52',
    right: 'M138 76 L152 24 L102 52',
  },
  round: {
    left: 'M64 60 C42 36 24 62 40 88',
    right: 'M136 60 C158 36 176 62 160 88',
  },
};

/**
 * A friendly cartoon dog in a single line weight: ears, round eyes, a nose and a
 * happy tongue, optionally with a bandana and a coat color.
 */
export function DogLineArt({
  size = 160,
  color,
  accent,
  bandana,
  ears = 'floppy',
  fill = 'none',
  strokeWidth = 4,
}: DogLineArtProps) {
  const detail = accent ?? color;
  const line = { stroke: color, strokeWidth, strokeLinecap: 'round', strokeLinejoin: 'round' } as const;
  return (
    <Svg width={size} height={size} viewBox="0 0 200 200" fill="none">
      {bandana && (
        <>
          <Path
            d="M64 150 C84 158 116 158 136 150 L100 194 Z"
            fill={detail}
            stroke={detail}
            strokeWidth={strokeWidth}
            strokeLinejoin="round"
          />
          <Circle cx="92" cy="165" r="2.6" fill="#FFFFFF" />
          <Circle cx="108" cy="165" r="2.6" fill="#FFFFFF" />
          <Circle cx="100" cy="177" r="2.6" fill="#FFFFFF" />
        </>
      )}
      {/* Ears first so the head covers where they join */}
      <Path d={EARS[ears].left} fill={fill} {...line} />
      <Path d={EARS[ears].right} fill={fill} {...line} />
      {/* Head */}
      <Path
        d="M62 66 C70 40 130 40 138 66 C152 98 146 140 100 150 C54 140 48 98 62 66 Z"
        fill={fill}
        {...line}
      />
      {/* Eyes and brows */}
      <Circle cx="82" cy="94" r="4.5" fill={color} />
      <Circle cx="118" cy="94" r="4.5" fill={color} />
      <Path d="M74 82 C78 78 86 78 90 82" {...line} strokeWidth={strokeWidth - 1} />
      <Path d="M110 82 C114 78 122 78 126 82" {...line} strokeWidth={strokeWidth - 1} />
      {/* Nose */}
      <Path
        d="M91 110 C91 104 109 104 109 110 C109 117 100 121 100 121 C100 121 91 117 91 110 Z"
        stroke={detail}
        strokeWidth={strokeWidth}
        strokeLinejoin="round"
        fill={detail}
      />
      {/* Mouth and tongue */}
      <Path d="M100 121 L100 128 M86 128 C92 138 108 138 114 128" {...line} />
      <Path d="M95 134 C95 148 106 148 106 134" {...line} stroke={detail} />
      {/* Cheek spots */}
      <Circle cx="70" cy="116" r="2" fill={color} />
      <Circle cx="130" cy="116" r="2" fill={color} />
    </Svg>
  );
}
