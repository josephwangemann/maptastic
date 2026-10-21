import { nativeStyles } from "../theme/nativeStyles";
import {
  SpaceGrotesk_300Light,
  SpaceGrotesk_400Regular,
  SpaceGrotesk_500Medium,
  SpaceGrotesk_600SemiBold,
  SpaceGrotesk_700Bold,
} from "@expo-google-fonts/space-grotesk";
import { useFonts } from "expo-font";
import { useEffect } from "react";
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { DarkTheme, SplashScreen, Stack, ThemeProvider } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { styled, TamaguiProvider, Theme, useTheme } from "tamagui";
import { config } from "../../tamagui.config";

void SplashScreen.preventAutoHideAsync();

const GestureRoot = styled(GestureHandlerRootView, { f: 1 });

const RootLayout = () => {
  const [fontsLoaded, fontError] = useFonts({
    SpaceGrotesk_300Light,
    SpaceGrotesk_400Regular,
    SpaceGrotesk_500Medium,
    SpaceGrotesk_600SemiBold,
    SpaceGrotesk_700Bold,
  });

  useEffect(() => {
    if (fontsLoaded || fontError) void SplashScreen.hideAsync();
  }, [fontsLoaded, fontError]);

  if (fontError) throw fontError;
  if (!fontsLoaded) return null;

  return (
    <TamaguiProvider config={config} defaultTheme="dark">
      <Theme name="dark">
        <GestureRoot bg="background">
          <BottomSheetModalProvider>
            <StatusBar style="light" />
            <AppNavigator />
          </BottomSheetModalProvider>
        </GestureRoot>
      </Theme>
    </TamaguiProvider>
  );
};

const AppNavigator = () => {
  const theme = useTheme();
  const navigationTheme = {
    ...DarkTheme,
    colors: {
      primary: theme["accent-background"].val,
      background: theme.background.val,
      card: theme.background.val,
      text: theme.color.val,
      border: theme["border-color"].val,
      notification: theme["accent-background"].val,
    },
  };
  return (
    <ThemeProvider value={navigationTheme}>
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: nativeStyles({ bg: theme.background.val }),
        }}
      />
    </ThemeProvider>
  );
};

export default RootLayout;
