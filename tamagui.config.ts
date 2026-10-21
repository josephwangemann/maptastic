import { appShorthands } from "./src/theme/shorthands";
import { defaultConfig } from "@tamagui/config/v6";
import { createFont, createTamagui } from "tamagui";

const fontFaces = {
  300: { normal: "SpaceGrotesk_300Light" },
  400: { normal: "SpaceGrotesk_400Regular" },
  500: { normal: "SpaceGrotesk_500Medium" },
  600: { normal: "SpaceGrotesk_600SemiBold" },
  700: { normal: "SpaceGrotesk_700Bold" },
  800: { normal: "SpaceGrotesk_700Bold" },
  900: { normal: "SpaceGrotesk_700Bold" },
};

const bodyFont = createFont({
  ...defaultConfig.fonts.body,
  family: "SpaceGrotesk_400Regular",
  face: fontFaces,
});
const headingFont = createFont({
  ...defaultConfig.fonts.heading,
  family: "SpaceGrotesk_400Regular",
  face: fontFaces,
});

const palette = defaultConfig.tokens.color;
const mapColors = {
  buttonBackground: palette.black,
  sheetEdge: palette.white,
  pinBlue: palette["blue-500"],
  pinRed: palette["red-500"],
  pinOrange: palette["orange-500"],
  pinGreen: palette["green-500"],
  pinPurple: palette["purple-500"],
  pinWhite: palette.white,
  pinOutline: palette.white,
  contour: palette["amber-700"],
  contourLabel: palette["amber-800"],
  mapHalo: palette.white,
  trafficLow: palette["green-500"],
  trafficModerate: palette["amber-500"],
  trafficHeavy: palette["red-500"],
  trafficSevere: palette["red-800"],
  building: palette["slate-400"],
};

export const config = createTamagui({
  ...defaultConfig,
  fonts: { body: bodyFont, heading: headingFont },
  settings: { ...defaultConfig.settings, defaultFont: "body" },
  themes: {
    ...defaultConfig.themes,
    light: { ...defaultConfig.themes.light, ...mapColors },
    dark: {
      ...defaultConfig.themes.dark,
      ...mapColors,
      background: palette.black,
      color: palette["gray-100"],
    },
  },
  shorthands: {
    ...defaultConfig.shorthands,
    ...appShorthands,
  } as const,
});

type AppConfig = typeof config;

declare module "tamagui" {
  interface TamaguiCustomConfig extends AppConfig {}
}

export default config;
