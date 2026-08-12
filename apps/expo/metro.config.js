const { getDefaultConfig } = require("expo/metro-config");
const { resolve } = require("metro-resolver");
const path = require("path");

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname, {
  // [Web-only]: Enables CSS support in Metro.
  isCSSEnabled: false,
});

// expo-app-blocker is developed in the sibling repository. Bun resolves the
// file dependency through a symlink, but Metro only watches project roots by
// default and otherwise reports the package as missing on Android.
const appBlockerRoot = path.resolve(__dirname, "../../../expo-app-blocker-master");
config.watchFolders = [...(config.watchFolders ?? []), appBlockerRoot];
config.resolver.extraNodeModules = {
  ...(config.resolver.extraNodeModules ?? {}),
  "expo-app-blocker": appBlockerRoot,
  // Do not let Metro walk into the module's development node_modules. The
  // application is the source of truth for React Native and Expo versions.
  react: path.resolve(__dirname, "node_modules/react"),
  "react-native": path.resolve(__dirname, "node_modules/react-native"),
  expo: path.resolve(__dirname, "node_modules/expo"),
  "expo-modules-core": path.resolve(__dirname, "node_modules/expo-modules-core"),
};
const appNodeModules = path.resolve(__dirname, "node_modules");
const sharedRuntimeModules = new Set([
  "react",
  "react-native",
  "expo",
  "expo-modules-core",
]);
config.resolver.resolveRequest = (context, moduleName, platform) => {
  const packageName = moduleName.split("/").slice(0, moduleName.startsWith("@") ? 2 : 1).join("/");
  if (sharedRuntimeModules.has(packageName)) {
    return {
      type: "sourceFile",
      filePath: require.resolve(moduleName, { paths: [appNodeModules] }),
    };
  }
  return resolve(context, moduleName, platform);
};

// 2. Enable Tamagui
const { withTamagui } = require("@tamagui/metro-plugin");
module.exports = withTamagui(config, {
  components: ["tamagui"],
  config: "./tamagui.config.ts",
  // outputCSS: "./tamagui.css",
});
