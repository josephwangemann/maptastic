# Maptastic

Mobile map app with Expo, Expo Router, RNMapbox, MMKV, and Tamagui.

## Getting started

1. Run `npm install`.
2. Copy `.env.example` to `.env.local` and set `EXPO_PUBLIC_MAPBOX_ACCESS_TOKEN` to your public Mapbox token (`pk.*`). Public Expo variables are included in the client bundle; never put secret tokens there.
3. Create an iOS or Android development build with EAS, or use `npx expo run:ios` / `npx expo run:android` locally.
4. Run `npm start` and open the development build.

## Structure

- `src/app/`: Expo Router screens and root provider.
- `src/components/`: shared UI and platform-specific map.
- `src/lib/storage.ts`: shared MMKV store for lightweight local state.
- `tamagui.config.ts`: typed tokens, themes, and shorthands.
