import type { ConfigContext, ExpoConfig } from "expo/config";

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: "Reghabbit",
  slug: "digitalbreak",
  version: "1.0.2",
  orientation: "portrait",
  icon: "./assets/images/default.png",
  scheme: "digitalbreak",
  userInterfaceStyle: "automatic",
  splash: {
    image: "./assets/images/digital-break-hourglass-icon.png",
    resizeMode: "contain",
  },
  assetBundlePatterns: ["**/*"],
  ios: {
    supportsTablet: true,
    buildNumber: "1",
    bundleIdentifier: "com.lukesthl.digitalbreak",
    config: {
      usesNonExemptEncryption: false,
    },
  },
  android: {
    package: "com.gdesign.digitalbreak",
  },
  web: {
    bundler: "metro",
    // output: 'static',
  },
  plugins: [
    "expo-router",
    "expo-localization",
    "expo-font",
    "expo-web-browser",
    "./plugins/with-android-jvm-target",
    [
      "expo-dynamic-app-icon",
      {
        primary: {
          image: "./assets/images/default.png",
          prerendered: true,
        },
        light: {
          image: "./assets/images/light.png",
          prerendered: true,
        },
        dark: {
          image: "./assets/images/dark.png",
          prerendered: true,
        },
      },
    ],
    [
      "expo-build-properties",
      {
        ios: {
          deploymentTarget: "16.0",
        },
      },
    ],
    [
      "expo-app-blocker",
      {
        // This app currently keeps its existing iOS integration. The Android
        // reward blocker does not need to add any iOS extensions or targets.
        ios: { enabled: false },
        android: {
          scheme: "digitalbreak",
          overlayTitle: "Time to focus",
          overlayText: "Use one of your focus apps to earn your social time.",
          overlayBackgroundColor: "#FFF8F1",
          overlayTitleColor: "#1C1917",
          overlayTextColor: "#57534E",
          notificationTitle: "Focus time",
          notificationText: "{appName} is blocked until you complete your focus time.",
        },
      },
    ],
    [
      "./app.plugin",
      {
        appleTeamId: "3X5J8LXMDM",
      },
    ],
  ],
  experiments: {
    typedRoutes: true,
  },
  extra: {
    router: {
      origin: false,
    },
    eas: {
      projectId: "4fb26108-8286-4f78-b25f-1c10a7c6e82b",
    },
  },
});
