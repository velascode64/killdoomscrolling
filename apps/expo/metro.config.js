const { getDefaultConfig } = require("expo/metro-config");

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname, {
  // [Web-only]: Enables CSS support in Metro.
  isCSSEnabled: false,
});

// File-system watching is reliable for this workspace and avoids local
// Watchman launch-agent failures during release exports.
config.resolver.useWatchman = false;

// 2. Enable Tamagui
const { withTamagui } = require("@tamagui/metro-plugin");
module.exports = withTamagui(config, {
  components: ["tamagui"],
  config: "./tamagui.config.ts",
  // outputCSS: "./tamagui.css",
});
