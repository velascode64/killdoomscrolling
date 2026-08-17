import AsyncStorage from "@react-native-async-storage/async-storage";
import type {
  AndroidRewardBlockerPlan,
  AndroidRewardBlockerPlansConfig,
} from "expo-app-blocker";

export const ANDROID_REWARD_CONFIG_KEY = "android_reward_blocker_config";

export type RewardPlanMode = "focus" | "sleep" | "work";

export interface AndroidRewardPlan extends AndroidRewardBlockerPlan {
  mode: RewardPlanMode;
  name: string;
}

export const PLAN_COPY: Record<RewardPlanMode, { name: string; description: string }> = {
  focus: { name: "Focus", description: "Recupera tu atención con apps que te hacen avanzar." },
  sleep: { name: "Sleep", description: "Protege tu descanso y prepara una mejor noche." },
  work: { name: "Work", description: "Crea espacio para el trabajo que importa." },
};

const MODE_SCHEDULE: Record<RewardPlanMode, { startMinute: number; endMinute: number }> = {
  sleep: { startMinute: 22 * 60, endMinute: 7 * 60 },
  work: { startMinute: 9 * 60, endMinute: 17 * 60 },
  focus: { startMinute: 18 * 60, endMinute: 22 * 60 },
};

export function createAndroidRewardPlan(mode: RewardPlanMode = "focus"): AndroidRewardPlan {
  return {
    id: `plan-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    mode,
    name: PLAN_COPY[mode].name,
    enabled: true,
    blockedPackages: [],
    productivePackages: [],
    schedule: MODE_SCHEDULE[mode],
    productiveMinutes: 5,
    unlockMinutes: 5,
  };
}

function normalizePlan(value: Partial<AndroidRewardPlan>, index: number): AndroidRewardPlan {
  const mode = value.mode === "sleep" || value.mode === "work" ? value.mode : "focus";
  const fallback = createAndroidRewardPlan(mode);
  return {
    ...fallback,
    ...value,
    id: value.id || `plan-legacy-${index}`,
    name: value.name?.trim() || PLAN_COPY[mode].name,
    mode,
    blockedPackages: value.blockedPackages ?? [],
    productivePackages: value.productivePackages ?? [],
    schedule: value.schedule ?? fallback.schedule,
  };
}

/** Reads the former one-plan format too, so existing users keep their setup. */
export async function loadAndroidRewardPlans(): Promise<AndroidRewardPlan[]> {
  const value = await AsyncStorage.getItem(ANDROID_REWARD_CONFIG_KEY);
  if (!value) return [];
  const parsed = JSON.parse(value) as { plans?: AndroidRewardPlan[] } | AndroidRewardPlan;
  if ("plans" in parsed && Array.isArray(parsed.plans)) return parsed.plans.map(normalizePlan);
  return [normalizePlan(parsed as Partial<AndroidRewardPlan>, 0)];
}

export async function saveAndroidRewardPlans(plans: AndroidRewardPlan[]): Promise<void> {
  await AsyncStorage.setItem(ANDROID_REWARD_CONFIG_KEY, JSON.stringify({ version: 2, plans }));
}

export function toNativeRewardPlansConfig(plans: AndroidRewardPlan[]): AndroidRewardBlockerPlansConfig {
  return {
    plans: plans.map(({ id, mode, enabled, blockedPackages, productivePackages, schedule, productiveMinutes, unlockMinutes }) => ({
      id,
      mode,
      enabled,
      blockedPackages,
      productivePackages,
      schedule,
      productiveMinutes,
      unlockMinutes,
    })),
  };
}

export function formatPlanTime(minute: number): string {
  return `${String(Math.floor(minute / 60)).padStart(2, "0")}:${String(minute % 60).padStart(2, "0")}`;
}
