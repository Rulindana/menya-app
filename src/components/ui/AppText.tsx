import React, { createContext, useContext } from 'react';
import { StyleSheet, Text as RNText, TextProps, TextStyle } from 'react-native';
import {
  fontForWeight,
  normalizeFontWeight,
  scaleFontSize,
  scaleLineHeight,
} from '../../theme/typography';

interface InheritedTypography {
  weight?: number;
  isNested?: boolean;
}

const InheritedTypographyContext = createContext<InheritedTypography>({});

export interface AppTextProps extends TextProps {
  unscaled?: boolean;
}

export const AppText: React.FC<AppTextProps> = ({
  style,
  children,
  unscaled = false,
  ...rest
}) => {
  const parent = useContext(InheritedTypographyContext);
  const flat = (StyleSheet.flatten(style) || {}) as TextStyle;
  const weight = normalizeFontWeight(flat.fontWeight ?? parent.weight);
  const italic = flat.fontStyle === 'italic';
  const { fontWeight, fontStyle, fontSize, lineHeight, ...restStyle } = flat;

  const family = flat.fontFamily || fontForWeight(weight, italic);

  // Scale fontSize when explicitly provided or for root-level Text nodes
  const shouldScaleSize = !unscaled && (fontSize !== undefined || !parent.isNested);
  const resolvedFontSize = shouldScaleSize ? scaleFontSize(fontSize) : fontSize;
  const resolvedLineHeight =
    shouldScaleSize && resolvedFontSize !== undefined
      ? scaleLineHeight(lineHeight, fontSize, resolvedFontSize)
      : lineHeight;

  return (
    <InheritedTypographyContext.Provider value={{ weight, isNested: true }}>
      <RNText
        {...rest}
        style={[
          {
            fontFamily: family,
            ...(resolvedFontSize !== undefined ? { fontSize: resolvedFontSize } : null),
            ...(resolvedLineHeight !== undefined ? { lineHeight: resolvedLineHeight } : null),
          },
          restStyle,
        ]}
      >
        {children}
      </RNText>
    </InheritedTypographyContext.Provider>
  );
};

export const Text = AppText;
