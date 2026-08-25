import { createAnimations } from "@tamagui/animations-moti";
import { createMedia } from "@tamagui/react-native-media-driver";
import { shorthands } from "@tamagui/shorthands";
import { createTamagui } from "tamagui";

import { createSatoshiFont } from "./components/font-satoshi";
import { themes } from "./theme/theme-output";
import { tokens } from "./theme/tokens";

const animations = createAnimations({
  bouncy: {
    type: "spring",
    damping: 10,
    mass: 0.9,
    stiffness: 100,
  },
  lazy: {
    type: "spring",
    damping: 20,
    stiffness: 60,
  },
  quick: {
    type: "spring",
    damping: 20,
    mass: 1.2,
    stiffness: 250,
  },
  fadeIn: {
    type: "spring",
    duration: 2000,
  },
});
const headingFont = createSatoshiFont({ family: "SatoshiBlack" });
const bodyFont = createSatoshiFont({
  family: "Satoshi",
  face: {
    bold: { normal: "SatoshiBold" },
    normal: { normal: "Satoshi" },
    300: { normal: "Satoshi" },
    500: { normal: "Satoshi" },
    600: { normal: "SatoshiBold" },
    700: { normal: "SatoshiBold" },
    800: { normal: "SatoshiBlack" },
    900: { normal: "SatoshiBlack" },
  },
});
const config = createTamagui({
  animations,
  defaultTheme: "light",
  shouldAddPrefersColorThemes: false,
  themeClassNameOnRoot: false,
  shorthands,
  fonts: {
    heading: headingFont,
    body: bodyFont,
  },
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  themes: {
    ...themes,
    light_Button: {
      background: "#4F46E5",
      backgroundFocus: "#6366F1",
      backgroundHover: "#6366F1",
      backgroundPress: "#4338CA",
      backgroundStrong: "#4338CA",
      backgroundTransparent: "#EEF2FF",
      color: "#fff",
      colorFocus: "#fff",
      colorHover: "#fff",
      colorPress: "#fff",
      colorTransparent: "#4F46E5",
      placeholderColor: "#878F9B",
    },
    light_Input: {
      background: "#FFFFFF",
      borderColor: "#E2E8F0",
      borderColorFocus: "#4F46E5",
    },
    light_Checkbox: {
      borderColor: "#E2E8F0",
      background: "#FFFFFF",
    },
  } as any, // eslint-disable-line @typescript-eslint/no-explicit-any
  tokens,
  media: createMedia({
    xs: { maxWidth: 660 },
    sm: { maxWidth: 800 },
    md: { maxWidth: 1020 },
    lg: { maxWidth: 1280 },
    xl: { maxWidth: 1420 },
    xxl: { maxWidth: 1600 },
    gtXs: { minWidth: 660 + 1 },
    gtSm: { minWidth: 800 + 1 },
    gtMd: { minWidth: 1020 + 1 },
    gtLg: { minWidth: 1280 + 1 },
    short: { maxHeight: 820 },
    tall: { minHeight: 820 },
    hoverNone: { hover: "none" },
    pointerCoarse: { pointer: "coarse" },
  }),
});
export type AppConfig = typeof config;
export default config;
