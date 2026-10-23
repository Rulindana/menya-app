import React, { createContext, useContext } from 'react';
import { StyleSheet, Text as RNText, TextProps, TextStyle } from 'react-native';
import { googleSansForWeight, normalizeFontWeight } from '../../theme/typography';

const InheritedWeightContext = createContext<number | undefined>(undefined);

export const AppText: React.FC<TextProps> = ({ style, children, ...rest }) => {  const inheritedWeight = useContext(InheritedWeightContext);
  const flat = (StyleSheet.flatten(style) || {}) as TextStyle;
  const weight = normalizeFontWeight(flat.fontWeight ?? inheritedWeight);
  const italic = flat.fontStyle === 'italic';
  const { fontWeight, fontStyle, ...restStyle } = flat;

  const family = flat.fontFamily || googleSansForWeight(weight, italic);

  return (
    <InheritedWeightContext.Provider value={weight}>
      <RNText {...rest} style={[{ fontFamily: family }, restStyle]}>
        {children}
      </RNText>
    </InheritedWeightContext.Provider>
  );
};

export const Text = AppText;
