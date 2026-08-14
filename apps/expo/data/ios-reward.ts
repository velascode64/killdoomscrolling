import AsyncStorage from "@react-native-async-storage/async-storage";
import type { IOSBlockedItem } from "expo-app-blocker";

export type IOSRewardPlan = {
  enabled: boolean;
  blockedItems: IOSBlockedItem[];
  productiveItems: IOSBlockedItem[];
  schedule: { startMinute: number; endMinute: number };
  productiveMinutes: number;
  unlockMinutes: number;
};

export const IOS_REWARD_PLAN_KEY = "ios_reward_plan";

export const DEFAULT_IOS_REWARD_PLAN: IOSRewardPlan = {
  enabled: false,
  blockedItems: [],
  productiveItems: [],
  schedule: { startMinute: 20 * 60, endMinute: 7 * 60 },
  productiveMinutes: 5,
  unlockMinutes: 5,
};

export async function loadIOSRewardPlan(): Promise<IOSRewardPlan | null> {
  const value = await AsyncStorage.getItem(IOS_REWARD_PLAN_KEY);
  return value ? (JSON.parse(value) as IOSRewardPlan) : null;
}

export async function saveIOSRewardPlan(plan: IOSRewardPlan): Promise<void> {
  await AsyncStorage.setItem(IOS_REWARD_PLAN_KEY, JSON.stringify(plan));
}
