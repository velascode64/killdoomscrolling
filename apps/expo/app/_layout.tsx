import { DarkTheme, DefaultTheme, ThemeProvider as NavigationThemeProvider } from "@react-navigation/native";
import dayjs from "dayjs";
import { useFonts } from "expo-font";
import { router, Slot } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect, useRef } from "react";
import { AppState, Platform } from "react-native";
import { TamaguiProvider, useTheme as useThemeTamagui } from "tamagui";

import { ThemeProvider, useTheme } from "../components/theme-provider";
import { BreakStore } from "../data/break.store";
import { clearShortcutListener, listenForShortcut } from "../data/shortcut.listener";
import { ShortCutPayload } from "../data/shortcut.payload";
import { bootstrapSupabase } from "../data/supabase-bootstrap";
import config from "../tamagui.config";

export const unstable_settings = {
  // Ensure any route can link back to `/`
  initialRouteName: "/overview",
};

export { ErrorBoundary } from "expo-router";
// Prevent the splash screen from auto-hiding before asset loading is complete.
void SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    Satoshi: require("../assets/fonts/satoshi/Satoshi-Medium.otf"),
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    SatoshiBold: require("../assets/fonts/satoshi/Satoshi-Bold.otf"),
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    SatoshiBlack: require("../assets/fonts/satoshi/Satoshi-Black.otf"),
  });

  useEffect(() => {
    if (error) throw error;
  }, [error]);
  useEffect(() => {
    void bootstrapSupabase().catch((supabaseError: unknown) => {
      // The app stays local-first if Supabase is unavailable.
      console.warn("Supabase bootstrap failed", supabaseError);
    });
  }, []);
  const appState = useRef(AppState.currentState);
  useEffect(() => {
    // The original product receives iOS Shortcut/AppIntent callbacks. Android
    // uses the native foreground service in expo-app-blocker instead.
    if (Platform.OS === "android") {
      void SplashScreen.hideAsync();
      return;
    }
    const checkShortcut = () => {
      void listenForShortcut()
        .then(({ app, timestamp, event }) => {
          const oneMinuteAgo = dayjs().subtract(1, "minute");
          const lastOpen = dayjs.unix(timestamp);
          console.log("status", BreakStore.status);
          console.log("clear payload?", lastOpen.isBefore(oneMinuteAgo));
          if (lastOpen.isBefore(oneMinuteAgo)) {
            void ShortCutPayload.clear();
            return;
          }
          if (event === "app-reopen") {
            void BreakStore.openApp();
          }

          if (!BreakStore.status) {
            router.replace(`/break/${app}?timestamp=${timestamp}`);
          }
        })
        .catch((error) => {
          console.log(JSON.stringify(error));
        })
        .finally(() => {
          void SplashScreen.hideAsync();
        });
    };
    const subscription = AppState.addEventListener("change", (nextAppState) => {
      if (appState.current.match(/inactive|background/) && nextAppState === "active") {
        void bootstrapSupabase().catch((supabaseError: unknown) => {
          console.warn("Supabase foreground sync failed", supabaseError);
        });
        checkShortcut();
        console.log("App has come to the foreground!");
      } else if (appState.current.match(/active/) && nextAppState === "background") {
        clearShortcutListener();
        // void ShortCutPayload.clear();
        console.log("this would clear the shortcut listener");
        console.log("App has come to the background!");
        BreakStore.status = null;
      }
      appState.current = nextAppState;
    });
    checkShortcut();
    return () => {
      clearShortcutListener();
      subscription.remove();
    };
  }, []);
  if (!loaded) {
    return null;
  }

  return (
    <TamaguiProvider config={config}>
      <ThemeProvider>
        <RootNavigator />
      </ThemeProvider>
    </TamaguiProvider>
  );
}

function RootNavigator() {
  const { theme } = useTheme();
  const tamaguiTheme = useThemeTamagui();

  const navigationTheme = theme === "light"
    ? {
        ...DefaultTheme,
        colors: {
          ...DefaultTheme.colors,
          background: "#FFFFFF",
          text: tamaguiTheme.text11?.val as string,
          primary: tamaguiTheme.text11?.val as string,
          border: tamaguiTheme.grey3?.val as string,
        },
        fonts: DefaultTheme.fonts,
      }
    : {
        ...DarkTheme,
        colors: {
          ...DarkTheme.colors,
        },
        fonts: DarkTheme.fonts,
      };

  return (
    <NavigationThemeProvider value={navigationTheme}>
      <Slot />
    </NavigationThemeProvider>
  );
}
