import { ArrowRight, CircleMinus, Clock3, Play, Plus, Settings, Timer } from "@tamagui/lucide-icons";
import {
  configureRewardBlockerPlans,
  getInstalledApps,
  getPermissionStatus,
  openOverlaySettings,
  openUsageStatsSettings,
  startMonitoring,
} from "expo-app-blocker";
import type { AndroidBlockableApp } from "expo-app-blocker";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { Alert, AppState, Platform } from "react-native";
import { Button, H4, Paragraph, Sheet, SizableText, Spinner, View, XStack, YStack } from "tamagui";

import {
  formatPlanTime,
  toNativeRewardPlansConfig,
  updateAndroidRewardPlans,
} from "../data/android-reward";
import type { AndroidRewardPlan } from "../data/android-reward";
import { syncModes } from "../data/supabase-sync";
import { CategoryGlyph } from "./category-selector";
import { AppAvatarStack, GradientButton } from "./mode-ui";
import { ShadowCard } from "./shadow.card";
import { translate } from "./translate";

export function AndroidFocusDashboard() {
  const [plans, setPlans] = useState<AndroidRewardPlan[]>([]);
  const [installedApps, setInstalledApps] = useState<AndroidBlockableApp[]>([]);
  const [permissions, setPermissions] = useState({ overlay: true, usageStats: true });
  const [loading, setLoading] = useState(true);
  const [resumingPlanId, setResumingPlanId] = useState<string | null>(null);

  const resumePlan = async (planId: string) => {
    setResumingPlanId(planId);
    try {
      const nextPlans = await updateAndroidRewardPlans((currentPlans) => {
        const pausedPlan = currentPlans.find((plan) => plan.id === planId);
        if (!pausedPlan) throw new Error("Cannot resume a mode that no longer exists.");
        const resumedPlan = { ...pausedPlan, enabled: true, paused: false };
        if (planHasOverlap(resumedPlan, currentPlans)) {
          throw new Error("Cannot resume a mode that overlaps another enabled mode.");
        }
        return currentPlans.map((plan) => (plan.id === planId ? resumedPlan : plan));
      });
      configureRewardBlockerPlans(toNativeRewardPlansConfig(nextPlans));
      startMonitoring();
      setPlans(nextPlans);
      void syncModes(nextPlans).catch((error: unknown) => console.warn("Unable to sync resumed mode", error));
    } catch (error) {
      console.warn("Unable to resume mode", error);
      Alert.alert(translate.t("dashboard.resumeErrorTitle"), translate.t("dashboard.resumeErrorBody"));
    } finally {
      setResumingPlanId(null);
    }
  };

  useEffect(() => {
    if (Platform.OS !== "android") return;

    const refresh = async () => {
      const [apps, permissionStatus] = await Promise.all([
        getInstalledApps(),
        getPermissionStatus(),
      ]);
      // Installed-app discovery is informational only. It must never rewrite a
      // user's saved modes, since Android may return a partial app list.
      const currentPlans = await updateAndroidRewardPlans((savedPlans) => savedPlans);
      setPlans(currentPlans);
      setInstalledApps(apps);
      if (permissionStatus.details.platform === "android") {
        setPermissions({ overlay: permissionStatus.details.overlay, usageStats: permissionStatus.details.usageStats });
      }
      configureRewardBlockerPlans(toNativeRewardPlansConfig(currentPlans));
      if (currentPlans.some((plan) => plan.enabled)) startMonitoring();
    };

    void refresh()
      .catch((error) => console.warn("Unable to load Android plans", error))
      .finally(() => setLoading(false));
    const subscription = AppState.addEventListener("change", (nextState) => {
      if (nextState === "active") void refresh();
    });
    return () => subscription.remove();
  }, []);

  if (loading) {
    return (
      <YStack gap="$3">
        <SectionHeader />
        <ShadowCard tone="aqua">
          <YStack alignItems="center" gap="$3" paddingVertical="$4">
            <Spinner color="$primary11" size="large" />
            <SizableText color="$text10" fontWeight="700">{translate.t("dashboard.loading")}</SizableText>
          </YStack>
        </ShadowCard>
      </YStack>
    );
  }

  if (!plans.length) {
    return (
      <>
        <YStack gap="$3">
          <SectionHeader />
          <ShadowCard tone="aqua">
            <YStack gap="$4">
              <View alignItems="center" backgroundColor="$primary3" borderRadius={99} height={56} justifyContent="center" width={56}>
                <CircleMinus color="$primary11" size={26} />
              </View>
              <YStack gap="$2">
                <H4 color="$text11">{translate.t("dashboard.startJourney")}</H4>
                <Paragraph color="$text10">{translate.t("dashboard.emptyDescription")}</Paragraph>
              </YStack>
              <GradientButton
                icon={<Plus color="white" size={19} />}
                onPress={() => router.push({ pathname: "/onboarding", params: { mode: "create" } })}
              >
                {translate.t("dashboard.createFirst")}
              </GradientButton>
            </YStack>
          </ShadowCard>
        </YStack>
        <PermissionsSheet permissions={permissions} visible={!permissions.overlay || !permissions.usageStats} />
      </>
    );
  }

  return (
    <>
      <YStack gap="$3">
        <SectionHeader />
        {plans.map((plan) => {
          const blockedApps = installedApps.filter((app) => plan.blockedPackages.includes(app.packageName));
          const rehabbitApps = installedApps.filter((app) => plan.productivePackages.includes(app.packageName));
          return (
            <ModeCard
              blockedApps={blockedApps}
              key={plan.id}
              plan={plan}
              rehabbitApps={rehabbitApps}
              resuming={resumingPlanId === plan.id}
              onResume={resumePlan}
            />
          );
        })}
      </YStack>
      <PermissionsSheet permissions={permissions} visible={!permissions.overlay || !permissions.usageStats} />
    </>
  );
}

function planHasOverlap(plan: AndroidRewardPlan, plans: AndroidRewardPlan[]) {
  return plans.some((other) => {
    if (other.id === plan.id || !other.enabled) return false;
    return [1, 2, 3, 4, 5, 6, 7].some((weekday) =>
      Array.from({ length: 1440 }).some((_, minute) => planIsActiveAt(plan, weekday, minute) && planIsActiveAt(other, weekday, minute)),
    );
  });
}

function planIsActiveAt(plan: AndroidRewardPlan, weekday: number, minute: number) {
  const { startMinute, endMinute } = plan.schedule;
  if (startMinute < endMinute) {
    return plan.weekdays.includes(weekday as 1 | 2 | 3 | 4 | 5 | 6 | 7) && minute >= startMinute && minute < endMinute;
  }
  const scheduleWeekday = minute >= startMinute ? weekday : weekday === 1 ? 7 : weekday - 1;
  return plan.weekdays.includes(scheduleWeekday as 1 | 2 | 3 | 4 | 5 | 6 | 7) && (minute >= startMinute || minute < endMinute);
}

function SectionHeader() {
  return (
    <XStack alignItems="center" marginTop="$2">
      <H4 color="$text11" fontSize="$7">{translate.t("dashboard.modes")}</H4>
    </XStack>
  );
}

function ModeCard({
  blockedApps,
  onResume,
  plan,
  rehabbitApps,
  resuming,
}: {
  blockedApps: AndroidBlockableApp[];
  onResume: (planId: string) => void;
  plan: AndroidRewardPlan;
  rehabbitApps: AndroidBlockableApp[];
  resuming: boolean;
}) {
  const customCategory = plan.customCategories.find((category) => category.id === plan.selectedCategoryId);
  const categoryIcon = customCategory?.icon ?? plan.category;

  return (
    <ShadowCard
      padding="$4"
      pressStyle={{ opacity: 0.88 }}
      tone={plan.category === "sleep" ? "sky" : plan.category === "exercise" ? "mint" : "aqua"}
      onPress={() => router.push({ pathname: "/onboarding", params: { planId: plan.id } })}
    >
      {plan.paused ? (
        <View
          backgroundColor="rgba(112, 119, 133, 0.16)"
          bottom={0}
          left={0}
          pointerEvents="none"
          position="absolute"
          right={0}
          top={0}
          zIndex={1}
        />
      ) : null}
      <YStack gap="$3" zIndex={2}>
        <XStack alignItems="center" gap="$3">
          <View
            alignItems="center"
            backgroundColor="$primary3"
            borderRadius={14}
            height={44}
            justifyContent="center"
            width={44}
          >
            <CategoryGlyph color="$primary11" icon={categoryIcon} size={23} />
          </View>
          <H4 color="$text11" flex={1} fontSize="$7" numberOfLines={1}>{plan.name}</H4>
        </XStack>

        <XStack alignItems="center" gap="$2">
          <AppAvatarStack apps={blockedApps} dimmed emptyLabel={translate.t("dashboard.noApps")} maxVisible={2} />
          <ArrowRight color="$primary11" size={20} />
          <AppAvatarStack apps={rehabbitApps} emptyLabel={translate.t("dashboard.noRehabbit")} maxVisible={2} />
        </XStack>

        <XStack alignItems="center" gap="$4">
          <XStack alignItems="center" gap="$2">
            <Clock3 color="$primary11" size={17} />
            <SizableText color="$text10" fontWeight="800">
              {formatPlanTime(plan.schedule.startMinute)} - {formatPlanTime(plan.schedule.endMinute)}
            </SizableText>
          </XStack>
          <XStack alignItems="center" gap="$1.5">
            <Timer color="$primary11" size={17} />
            <SizableText color="$text10" fontWeight="800">
              {plan.productiveMinutes} min
            </SizableText>
          </XStack>
        </XStack>

        <XStack alignItems="center" justifyContent="space-between">
          <SizableText color="$text6" fontSize="$2">{translate.t("dashboard.everyDay")}</SizableText>
          {plan.paused ? (
            <Button
              alignItems="center"
              backgroundColor="transparent"
              borderWidth={0}
              color="$primary11"
              disabled={resuming}
              fontSize="$2"
              fontWeight="800"
              height={28}
              icon={resuming ? undefined : <Play fill="$primary11" size={13} />}
              paddingHorizontal="$1"
              pressStyle={{ opacity: 0.65 }}
              onPress={(event) => {
                event.stopPropagation();
                onResume(plan.id);
              }}
            >
              {resuming ? translate.t("dashboard.resuming") : "Resume"}
            </Button>
          ) : null}
        </XStack>

      </YStack>
    </ShadowCard>
  );
}

function PermissionsSheet({ visible, permissions }: { visible: boolean; permissions: { overlay: boolean; usageStats: boolean } }) {
  return (
    <Sheet dismissOnSnapToBottom={false} modal open={visible} snapPoints={[42]} onOpenChange={() => undefined}>
      <Sheet.Overlay backgroundColor="rgba(33, 27, 32, 0.18)" />
      <Sheet.Frame backgroundColor="$background" padding="$4">
        <Sheet.Handle backgroundColor="$borderColor" />
        <YStack gap="$4">
          <View alignItems="center" backgroundColor="$primary3" borderRadius={99} height={48} justifyContent="center" width={48}>
            <Settings color="$primary11" size={22} />
          </View>
          <YStack gap="$1">
            <H4 color="$text11">{translate.t("permissions.sheetTitle")}</H4>
            <Paragraph color="$text10">{translate.t("permissions.sheetDescription")}</Paragraph>
          </YStack>
          {!permissions.usageStats && <Button backgroundColor="$primary3" borderColor="$primary5" color="$primary11" onPress={() => void openUsageStatsSettings()}>{translate.t("permissions.enableUsage")}</Button>}
          {!permissions.overlay && <Button backgroundColor="$primary3" borderColor="$primary5" color="$primary11" onPress={() => void openOverlaySettings()}>{translate.t("permissions.enableOverlay")}</Button>}
        </YStack>
      </Sheet.Frame>
    </Sheet>
  );
}
