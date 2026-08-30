import AsyncStorage from "@react-native-async-storage/async-storage";

import { ANDROID_REWARD_CONFIG_KEY } from "./android-reward";

const ONBOARDING_COMPLETED_KEY = "rehabbit_onboarding_completed";

export async function hasCompletedOnboarding(): Promise<boolean> {
  return (await AsyncStorage.getItem(ONBOARDING_COMPLETED_KEY)) === "true";
}

export async function markOnboardingCompleted(): Promise<void> {
  await AsyncStorage.setItem(ONBOARDING_COMPLETED_KEY, "true");
}

/** Development helper: lets QA replay onboarding from a clean local plan state. */
export async function resetOnboardingForTesting(): Promise<void> {
  await AsyncStorage.multiRemove([ONBOARDING_COMPLETED_KEY, ANDROID_REWARD_CONFIG_KEY]);
}
