import AsyncStorage from "@react-native-async-storage/async-storage";
import type { AndroidRewardBlockerConfig } from "expo-app-blocker";

export const ANDROID_REWARD_CONFIG_KEY = "android_reward_blocker_config";

export const DEFAULT_ANDROID_REWARD_CONFIG: AndroidRewardBlockerConfig = {
  enabled: false,
  blockedPackages: [],
  productivePackages: [],
  schedule: { startMinute: 20 * 60, endMinute: 7 * 60 },
  productiveMinutes: 5,
  unlockMinutes: 5,
};

export async function loadAndroidRewardConfig(): Promise<AndroidRewardBlockerConfig | null> {
  const value = await AsyncStorage.getItem(ANDROID_REWARD_CONFIG_KEY);
  return value ? (JSON.parse(value) as AndroidRewardBlockerConfig) : null;
}

export async function saveAndroidRewardConfig(config: AndroidRewardBlockerConfig): Promise<void> {
  await AsyncStorage.setItem(ANDROID_REWARD_CONFIG_KEY, JSON.stringify(config));
}
