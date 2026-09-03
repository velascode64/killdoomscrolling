import AsyncStorage from "@react-native-async-storage/async-storage";
import { translate } from "../components/translate";
import type {
  AndroidRewardBlockerPlan,
  AndroidRewardBlockerPlansConfig,
} from "expo-app-blocker";

export const ANDROID_REWARD_CONFIG_KEY = "android_reward_blocker_config";

export type RewardPlanMode = "focus" | "sleep" | "work";
export type PlanCategory = "focus" | "exercise" | "sleep" | "meditation" | "hobby" | "work";
export type PlanWeekday = 1 | 2 | 3 | 4 | 5 | 6 | 7;
export type PlanCustomCategoryIcon =
  | "briefcase"
  | "book"
  | "heart"
  | "music"
  | "star"
  | "running"
  | "fitness"
  | "study"
  | "game"
  | "coffee"
  | "moon";

export interface PlanCustomCategory {
  id: string;
  label: string;
  icon: PlanCustomCategoryIcon;
}

export const ALL_PLAN_WEEKDAYS: PlanWeekday[] = [1, 2, 3, 4, 5, 6, 7];

export interface AndroidRewardPlan extends AndroidRewardBlockerPlan {
  mode: RewardPlanMode;
  category: PlanCategory;
  name: string;
  paused: boolean;
  weekdays: PlanWeekday[];
  customCategories: PlanCustomCategory[];
  selectedCategoryId: string;
}

function localizedCopy(key: PlanCategory) {
  return {
    get description() {
      return translate.t(`categories.${key}.description`);
    },
    get name() {
      return translate.t(`categories.${key}.name`);
    },
  };
}

// Getters ensure a mode opened before a language change immediately uses the new labels.
export const PLAN_COPY: Record<RewardPlanMode, { name: string; description: string }> = {
  focus: { get name() { return translate.t("modes.focus"); }, get description() { return translate.t("categories.focus.description"); } },
  sleep: { get name() { return translate.t("modes.sleep"); }, get description() { return translate.t("categories.sleep.description"); } },
  work: { get name() { return translate.t("modes.work"); }, get description() { return translate.t("categories.work.description"); } },
};

export const PLAN_CATEGORY_COPY: Record<PlanCategory, { name: string; description: string }> = {
  focus: localizedCopy("focus"),
  exercise: localizedCopy("exercise"),
  sleep: localizedCopy("sleep"),
  meditation: localizedCopy("meditation"),
  hobby: localizedCopy("hobby"),
  work: localizedCopy("work"),
};

const LEGACY_CATEGORY_NAMES: Record<PlanCategory, string[]> = {
  focus: ["Focus", "Foco"],
  exercise: ["Exercise", "Ejercicio"],
  sleep: ["Sleep", "Dormir"],
  meditation: ["Meditation", "Meditación"],
  hobby: ["Hobby", "Pasatiempo"],
  work: ["Work", "Trabajo"],
};

const MODE_SCHEDULE: Record<RewardPlanMode, { startMinute: number; endMinute: number }> = {
  sleep: { startMinute: 22 * 60, endMinute: 7 * 60 },
  work: { startMinute: 9 * 60, endMinute: 17 * 60 },
  focus: { startMinute: 18 * 60, endMinute: 22 * 60 },
};

export function nativeModeForCategory(category: PlanCategory): RewardPlanMode {
  if (category === "sleep") return "sleep";
  if (category === "work") return "work";
  return "focus";
}

export function createAndroidRewardPlan(category: PlanCategory = "focus"): AndroidRewardPlan {
  const mode = nativeModeForCategory(category);
  return {
    id: `plan-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    mode,
    category,
    name: PLAN_CATEGORY_COPY[category].name,
    enabled: false,
    paused: false,
    blockedPackages: [],
    productivePackages: [],
    schedule: MODE_SCHEDULE[mode],
    weekdays: ALL_PLAN_WEEKDAYS.filter((day) => day !== 7),
    customCategories: [],
    selectedCategoryId: category,
    productiveMinutes: 5,
    unlockMinutes: 5,
  };
}

function normalizePlan(value: Partial<AndroidRewardPlan>, index: number): AndroidRewardPlan {
  const mode = value.mode === "sleep" || value.mode === "work" ? value.mode : "focus";
  const category = value.category === "exercise" || value.category === "meditation" || value.category === "hobby" || value.category === "sleep" || value.category === "work" ? value.category : mode;
  const fallback = createAndroidRewardPlan(category);
  const id = value.id?.trim();
  const storedName = value.name?.trim();
  const name = !storedName || LEGACY_CATEGORY_NAMES[category].includes(storedName)
    ? PLAN_CATEGORY_COPY[category].name
    : storedName;
  const customCategories = value.customCategories?.filter((entry) => entry.id && entry.label.trim()) ?? [];
  const selectedCategoryId = value.selectedCategoryId && (
    value.selectedCategoryId in PLAN_CATEGORY_COPY || customCategories.some((entry) => entry.id === value.selectedCategoryId)
  ) ? value.selectedCategoryId : category;
  return {
    ...fallback,
    ...value,
    id: id ? id : `plan-legacy-${index}`,
    name,
    mode,
    category,
    paused: value.paused === true,
    blockedPackages: value.blockedPackages ?? [],
    productivePackages: value.productivePackages ?? [],
    schedule: value.schedule ?? fallback.schedule,
    weekdays: value.weekdays?.filter((day): day is PlanWeekday => ALL_PLAN_WEEKDAYS.includes(day)) ?? fallback.weekdays,
    customCategories,
    selectedCategoryId,
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

// All destructive updates must begin from storage, not from a screen's possibly
// stale state. This prevents a partially hydrated editor from replacing every
// saved mode with only the mode currently on screen.
let plansUpdateOperation: Promise<unknown> = Promise.resolve();

export async function updateAndroidRewardPlans(
  updater: (plans: AndroidRewardPlan[]) => AndroidRewardPlan[],
): Promise<AndroidRewardPlan[]> {
  const operation = plansUpdateOperation.then(async () => {
    const currentPlans = await loadAndroidRewardPlans();
    const nextPlans = updater(currentPlans);
    await saveAndroidRewardPlans(nextPlans);
    return nextPlans;
  });

  // Keep the queue usable after a failed update while still returning the error
  // to the caller that initiated it.
  plansUpdateOperation = operation.catch(() => undefined);
  return operation;
}

export function toNativeRewardPlansConfig(plans: AndroidRewardPlan[]): AndroidRewardBlockerPlansConfig {
  return {
    plans: plans.map(({ id, category, enabled, blockedPackages, productivePackages, schedule, weekdays, productiveMinutes, unlockMinutes }) => ({
      id,
      mode: nativeModeForCategory(category),
      enabled,
      blockedPackages,
      productivePackages,
      schedule: { ...schedule, weekdays },
      productiveMinutes,
      unlockMinutes,
    })),
  };
}

export function formatPlanTime(minute: number): string {
  return `${String(Math.floor(minute / 60)).padStart(2, "0")}:${String(minute % 60).padStart(2, "0")}`;
}
