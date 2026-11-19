import Svg, { Circle, Path } from 'react-native-svg';

type DogLineArtProps = {
  size?: number;
  /** Line color. */
  color: string;
  /** Accent for the nose, tongue and bandana. */
  accent?: string;
  /** Draw an orange polka-dot bandana under the chin. */
  bandana?: boolean;
  strokeWidth?: number;
};

/**
 * A friendly cartoon dog drawn with a single line weight: floppy ears, round
 * eyes, a nose and a happy tongue, optionally wearing a bandana. Mostly outline,
 * so it works on any background and in both themes.
 */
export function DogLineArt({ size = 160, color, accent, bandana, strokeWidth = 4 }: DogLineArtProps) {
  const detail = accent ?? color;
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
      <Path
        d="M62 66 C70 40 130 40 138 66 C152 98 146 140 100 150 C54 140 48 98 62 66 Z"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Floppy ears */}
      <Path
        d="M64 62 C36 54 22 88 30 120 C34 134 52 128 56 110"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M136 62 C164 54 178 88 170 120 C166 134 148 128 144 110"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Eyes and brows */}
      <Circle cx="82" cy="94" r="4.5" fill={color} />
      <Circle cx="118" cy="94" r="4.5" fill={color} />
      <Path d="M74 82 C78 78 86 78 90 82" stroke={color} strokeWidth={strokeWidth - 1} strokeLinecap="round" />
      <Path d="M110 82 C114 78 122 78 126 82" stroke={color} strokeWidth={strokeWidth - 1} strokeLinecap="round" />
      {/* Nose */}
      <Path
        d="M91 110 C91 104 109 104 109 110 C109 117 100 121 100 121 C100 121 91 117 91 110 Z"
        stroke={detail}
        strokeWidth={strokeWidth}
        strokeLinejoin="round"
        fill={detail}
      />
      {/* Mouth and tongue */}
      <Path
        d="M100 121 L100 128 M86 128 C92 138 108 138 114 128"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M95 134 C95 148 106 148 106 134"
        stroke={detail}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Cheek spots */}
      <Circle cx="70" cy="116" r="2" fill={color} />
      <Circle cx="130" cy="116" r="2" fill={color} />
    </Svg>
  );
}
