import React from 'react';
import { StyleSheet, TextInput as RNTextInput, TextInputProps, TextStyle } from 'react-native';
import { googleSansForWeight, normalizeFontWeight } from '../../theme/typography';

export const AppTextInput: React.FC<TextInputProps> = ({ style, ...rest }) => {
  const flat = (StyleSheet.flatten(style) || {}) as TextStyle;
  const weight = normalizeFontWeight(flat.fontWeight);
  const italic = flat.fontStyle === 'italic';
  const { fontWeight, fontStyle, ...restStyle } = flat;
  const family = flat.fontFamily || googleSansForWeight(weight, italic);

  return <RNTextInput {...rest} style={[{ fontFamily: family }, restStyle]} />;
};

export const TextInput = AppTextInput;
