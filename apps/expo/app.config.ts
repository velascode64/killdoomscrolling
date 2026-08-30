import type { ConfigContext, ExpoConfig } from "expo/config";

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: "Rehabbit",
  slug: "digital-break-app",
  version: "1.0.2",
  orientation: "portrait",
  icon: "./assets/images/rehabbit-logo.png",
  scheme: "digitalbreak",
  userInterfaceStyle: "light",
  splash: {
    image: "./assets/images/rehabbit-splash.png",
    resizeMode: "contain",
    backgroundColor: "#483FFF",
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
    package: "com.velascode.rehabbit",
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
          image: "./assets/images/rehabbit-logo.png",
          prerendered: true,
        },
        light: {
          image: "./assets/images/rehabbit-logo.png",
          prerendered: true,
        },
        dark: {
          image: "./assets/images/rehabbit-logo.png",
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
          overlayTitle: "Recupera tu tiempo",
          overlayText: "{appName} puede esperar. Abre una app de reemplazo para continuar con tu plan.",
          overlayBackgroundColor: "#F8FAFC",
          overlayTitleColor: "#1F2430",
          overlayTextColor: "#707785",
          notificationTitle: "Rehabbit está en foco",
          notificationText: "{appName} está bloqueada mientras completas tu tiempo de enfoque.",
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
      projectId: "e31cb166-348d-46db-b35c-520cba7d573c",
    },
  },
});
