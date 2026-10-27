import React from 'react';
import { StyleSheet, TextInput as RNTextInput, TextInputProps, TextStyle } from 'react-native';
import { fontForWeight, normalizeFontWeight, scaleFontSize } from '../../theme/typography';

export const AppTextInput: React.FC<TextInputProps> = ({ style, ...rest }) => {
  const flat = (StyleSheet.flatten(style) || {}) as TextStyle;
  const weight = normalizeFontWeight(flat.fontWeight);
  const italic = flat.fontStyle === 'italic';
  const { fontWeight, fontStyle, fontSize, ...restStyle } = flat;
  const family = flat.fontFamily || fontForWeight(weight, italic);
  const resolvedFontSize = scaleFontSize(fontSize ?? 16);

  return (
    <RNTextInput
      {...rest}
      style={[{ fontFamily: family, fontSize: resolvedFontSize }, restStyle]}
    />
  );
};

export const TextInput = AppTextInput;
