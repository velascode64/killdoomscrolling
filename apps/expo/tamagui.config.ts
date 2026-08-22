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
      background: "#2CCEFE",
      backgroundFocus: "#4BB7FE",
      backgroundHover: "#4BB7FE",
      backgroundPress: "#1AE1FE",
      backgroundStrong: "#0C8FD1",
      backgroundTransparent: "#EFFBFD",
      color: "#fff",
      colorFocus: "#fff",
      colorHover: "#fff",
      colorPress: "#fff",
      colorTransparent: "#003B5C",
      placeholderColor: "#48748A",
    },
    light_Input: {
      background: "#FDFFFF",
      borderColor: "#CFEBF0",
      borderColorFocus: "#2CCEFE",
    },
    light_Checkbox: {
      borderColor: "#CFEBF0",
      background: "#FDFFFF",
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
