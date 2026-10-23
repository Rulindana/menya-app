import React from 'react';
import Svg, { Circle, Ellipse, G, Line, Path } from 'react-native-svg';

interface MenyaMascotProps {
  size?: number;
}

export const MenyaMascot: React.FC<MenyaMascotProps> = ({ size = 220 }) => (
  <Svg width={size} height={size} viewBox="0 0 240 240">
    <Ellipse cx="120" cy="228" rx="74" ry="9" fill="rgba(20,33,43,0.08)" />

    <G>
      <Path
        d="M64 192C64 142 82 120 120 120C158 120 176 142 176 192C176 218 152 228 120 228C88 228 64 218 64 192Z"
        fill="#2B3A42"
      />
      <Ellipse cx="94" cy="219" rx="24" ry="12" fill="#24323A" />
      <Ellipse cx="146" cy="219" rx="24" ry="12" fill="#24323A" />

      <Path
        d="M78 152C62 170 68 188 84 193"
        stroke="#2B3A42"
        strokeWidth="21"
        strokeLinecap="round"
        fill="none"
      />
      <Path
        d="M162 152C178 170 172 188 156 193"
        stroke="#2B3A42"
        strokeWidth="21"
        strokeLinecap="round"
        fill="none"
      />
      <Circle cx="86" cy="193" r="12" fill="#2B3A42" />
      <Circle cx="154" cy="193" r="12" fill="#2B3A42" />

      <Circle cx="62" cy="99" r="23" fill="#2B3A42" />
      <Circle cx="178" cy="99" r="23" fill="#2B3A42" />
      <Circle cx="62" cy="99" r="12" fill="#8A6A52" />
      <Circle cx="178" cy="99" r="12" fill="#8A6A52" />

      <Path
        d="M62 92C62 52 86 31 120 31C154 31 178 52 178 92C178 128 154 150 120 150C86 150 62 128 62 92Z"
        fill="#2B3A42"
      />
      <Ellipse cx="120" cy="104" rx="41" ry="39" fill="#C9A27E" />
      <Ellipse cx="120" cy="121" rx="27" ry="22" fill="#DDBB98" />

      <Circle cx="103" cy="94" r="9" fill="#F8FBFC" />
      <Circle cx="137" cy="94" r="9" fill="#F8FBFC" />
      <Circle cx="104" cy="95" r="4.5" fill="#1E2A31" />
      <Circle cx="138" cy="95" r="4.5" fill="#1E2A31" />
      <Circle cx="105.5" cy="93" r="1.4" fill="#FFFFFF" />
      <Circle cx="139.5" cy="93" r="1.4" fill="#FFFFFF" />

      <Path
        d="M93 82Q103 77 113 82"
        stroke="#1E2A31"
        strokeWidth="3.5"
        strokeLinecap="round"
        fill="none"
      />
      <Path
        d="M127 82Q137 77 147 82"
        stroke="#1E2A31"
        strokeWidth="3.5"
        strokeLinecap="round"
        fill="none"
      />

      <Ellipse cx="120" cy="113" rx="7" ry="5" fill="#8A6A52" />
      <Circle cx="117" cy="113" r="1.2" fill="#3B2E28" />
      <Circle cx="123" cy="113" r="1.2" fill="#3B2E28" />
      <Path
        d="M108 127Q120 136 132 127"
        stroke="#7A5138"
        strokeWidth="3"
        strokeLinecap="round"
        fill="none"
      />

      <Path d="M70 177L120 188L170 177L170 210L120 223L70 210Z" fill="#0B6E84" />
      <Path
        d="M78 175L118 183L118 212L78 204Z"
        fill="#F8FBFC"
        stroke="#D5E1E6"
        strokeWidth="1.5"
      />
      <Path
        d="M162 175L122 183L122 212L162 204Z"
        fill="#F8FBFC"
        stroke="#D5E1E6"
        strokeWidth="1.5"
      />

      <Line x1="88" y1="186" x2="110" y2="190" stroke="#B8C8D0" strokeWidth="2.5" strokeLinecap="round" />
      <Line x1="88" y1="192" x2="110" y2="196" stroke="#B8C8D0" strokeWidth="2.5" strokeLinecap="round" />
      <Line x1="88" y1="198" x2="104" y2="201" stroke="#B8C8D0" strokeWidth="2.5" strokeLinecap="round" />
      <Line x1="152" y1="186" x2="130" y2="190" stroke="#B8C8D0" strokeWidth="2.5" strokeLinecap="round" />
      <Line x1="152" y1="192" x2="130" y2="196" stroke="#B8C8D0" strokeWidth="2.5" strokeLinecap="round" />
      <Line x1="152" y1="198" x2="136" y2="201" stroke="#B8C8D0" strokeWidth="2.5" strokeLinecap="round" />

      <Line x1="120" y1="183" x2="120" y2="214" stroke="#085468" strokeWidth="3" />
      <Path d="M132 184L132 200L137 196L142 200L142 185Z" fill="#D9A441" />
    </G>
  </Svg>
);
