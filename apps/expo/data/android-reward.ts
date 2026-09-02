import AsyncStorage from "@react-native-async-storage/async-storage";
import type {
  AndroidRewardBlockerPlan,
  AndroidRewardBlockerPlansConfig,
} from "expo-app-blocker";

export const ANDROID_REWARD_CONFIG_KEY = "android_reward_blocker_config";

export type RewardPlanMode = "focus" | "sleep" | "work";
export type PlanCategory = "focus" | "exercise" | "sleep" | "meditation" | "hobby" | "work";
export type PlanWeekday = 1 | 2 | 3 | 4 | 5 | 6 | 7;
export type PlanCustomCategoryIcon = "briefcase" | "book" | "heart" | "music" | "star";

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

export const PLAN_COPY: Record<RewardPlanMode, { name: string; description: string }> = {
  focus: { name: "Focus", description: "Recupera tu atención con apps que te hacen avanzar." },
  sleep: { name: "Sleep", description: "Protege tu descanso y prepara una mejor noche." },
  work: { name: "Work", description: "Crea espacio para el trabajo que importa." },
};

export const PLAN_CATEGORY_COPY: Record<PlanCategory, { name: string; description: string }> = {
  focus: { name: "Focus", description: "Recupera tu atencion con apps que te hacen avanzar." },
  exercise: { name: "Exercise", description: "Abre espacio para moverte antes de volver a las redes." },
  sleep: { name: "Sleep", description: "Protege tu descanso y prepara una mejor noche." },
  meditation: { name: "Meditation", description: "Toma una pausa antes de volver a las distracciones." },
  hobby: { name: "Hobby", description: "Reserva tiempo para una actividad que disfrutas." },
  work: { name: "Work", description: "Crea espacio para el trabajo que importa." },
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
    weekdays: [...ALL_PLAN_WEEKDAYS],
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
  const name = value.name?.trim();
  const customCategories = value.customCategories?.filter((entry) => entry.id && entry.label.trim()) ?? [];
  const selectedCategoryId = value.selectedCategoryId && (
    value.selectedCategoryId in PLAN_CATEGORY_COPY || customCategories.some((entry) => entry.id === value.selectedCategoryId)
  ) ? value.selectedCategoryId : category;
  return {
    ...fallback,
    ...value,
    id: id ? id : `plan-legacy-${index}`,
    name: name ? name : PLAN_CATEGORY_COPY[category].name,
    mode,
    category,
    paused: value.paused === true,
    blockedPackages: value.blockedPackages ?? [],
    productivePackages: value.productivePackages ?? [],
    schedule: value.schedule ?? fallback.schedule,
    weekdays: value.weekdays?.filter((day): day is PlanWeekday => ALL_PLAN_WEEKDAYS.includes(day)) ?? [...ALL_PLAN_WEEKDAYS],
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

export function pruneUnavailablePlanApps(
  plans: AndroidRewardPlan[],
  installedPackageNames: Iterable<string>,
): AndroidRewardPlan[] {
  const installedPackages = new Set(installedPackageNames);
  if (installedPackages.size === 0) return plans;

  return plans.map((plan) => {
    const blockedPackages = plan.blockedPackages.filter((packageName) => installedPackages.has(packageName));
    const productivePackages = plan.productivePackages.filter((packageName) => installedPackages.has(packageName));
    const enabled = plan.enabled && blockedPackages.length > 0 && productivePackages.length > 0;
    const unchanged =
      enabled === plan.enabled &&
      blockedPackages.length === plan.blockedPackages.length &&
      productivePackages.length === plan.productivePackages.length;

    return unchanged ? plan : { ...plan, blockedPackages, enabled, productivePackages };
  });
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
