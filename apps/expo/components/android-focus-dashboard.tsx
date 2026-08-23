import { Clock3, Focus, Plus, Settings } from "@tamagui/lucide-icons";
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
import { AppState, Platform } from "react-native";
import { Button, H4, Paragraph, Sheet, SizableText, View, XStack, YStack } from "tamagui";

import {
  formatPlanTime,
  loadAndroidRewardPlans,
  pruneUnavailablePlanApps,
  saveAndroidRewardPlans,
  toNativeRewardPlansConfig,
} from "../data/android-reward";
import type { AndroidRewardPlan } from "../data/android-reward";
import { AppAvatarStack, GradientButton } from "./mode-ui";
import { ShadowCard } from "./shadow.card";

export function AndroidFocusDashboard() {
  const [plans, setPlans] = useState<AndroidRewardPlan[]>([]);
  const [installedApps, setInstalledApps] = useState<AndroidBlockableApp[]>([]);
  const [permissions, setPermissions] = useState({ overlay: true, usageStats: true });

  useEffect(() => {
    if (Platform.OS !== "android") return;

    const refresh = async () => {
      const [savedPlans, apps, permissionStatus] = await Promise.all([
        loadAndroidRewardPlans(),
        getInstalledApps(),
        getPermissionStatus(),
      ]);
      const currentPlans = pruneUnavailablePlanApps(savedPlans, apps.map((app) => app.packageName));
      if (currentPlans.some((plan, index) => plan !== savedPlans[index])) {
        await saveAndroidRewardPlans(currentPlans);
      }
      setPlans(currentPlans);
      setInstalledApps(apps);
      if (permissionStatus.details.platform === "android") {
        setPermissions({ overlay: permissionStatus.details.overlay, usageStats: permissionStatus.details.usageStats });
      }
      configureRewardBlockerPlans(toNativeRewardPlansConfig(currentPlans));
      if (currentPlans.some((plan) => plan.enabled)) startMonitoring();
    };

    void refresh().catch((error) => console.warn("Unable to load Android plans", error));
    const subscription = AppState.addEventListener("change", (nextState) => {
      if (nextState === "active") void refresh();
    });
    return () => subscription.remove();
  }, []);

  if (!plans.length) {
    return (
      <>
        <YStack gap="$3">
          <SectionHeader />
          <ShadowCard tone="aqua">
            <YStack gap="$4">
              <View alignItems="center" backgroundColor="$blue2" borderRadius={99} height={56} justifyContent="center" width={56}>
                <Focus color="$text11" size={26} />
              </View>
              <YStack gap="$2">
                <H4 color="$text11">Start Your Journey</H4>
                <Paragraph color="$text10">Crea tu primer modo para pausar distracciones y recuperar tu tiempo.</Paragraph>
              </YStack>
              <GradientButton
                icon={<Plus color="white" size={19} />}
                onPress={() => router.push({ pathname: "/onboarding", params: { mode: "create" } })}
              >
                Crear mi primer modo
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
          return (
            <ModeCard
              blockedApps={blockedApps}
              key={plan.id}
              plan={plan}
            />
          );
        })}
        <CreateModeCard />
      </YStack>
      <PermissionsSheet permissions={permissions} visible={!permissions.overlay || !permissions.usageStats} />
    </>
  );
}

function SectionHeader() {
  return (
    <XStack alignItems="center" marginTop="$2">
      <H4 color="$text11" fontSize="$7">Tus Modos</H4>
    </XStack>
  );
}

function ModeCard({
  blockedApps,
  plan,
}: {
  blockedApps: AndroidBlockableApp[];
  plan: AndroidRewardPlan;
}) {
  return (
    <ShadowCard
      padding="$4"
      pressStyle={{ opacity: 0.88 }}
      tone={plan.category === "sleep" ? "sky" : plan.category === "exercise" ? "mint" : "aqua"}
      onPress={() => router.push({ pathname: "/onboarding", params: { planId: plan.id } })}
    >
      <YStack gap="$3">
        <H4 color="$text11" fontSize="$7">{plan.name}</H4>

        <XStack alignItems="center" gap="$2">
          <AppAvatarStack apps={blockedApps} emptyLabel="Sin apps" maxVisible={2} />
          <SizableText color="$text10" fontWeight="800">
            {blockedApps.length} {blockedApps.length === 1 ? "App" : "Apps"}
          </SizableText>
        </XStack>

        <XStack alignItems="center" gap="$2">
          <Clock3 color="$primary11" size={17} />
          <SizableText color="$text10" fontWeight="800">
            {formatPlanTime(plan.schedule.startMinute)} - {formatPlanTime(plan.schedule.endMinute)}
          </SizableText>
        </XStack>

        <SizableText color="$text6" fontSize="$2">Todos los dias</SizableText>
      </YStack>
    </ShadowCard>
  );
}

function CreateModeCard() {
  return (
    <ShadowCard
      padding="$4"
      pressStyle={{ opacity: 0.82 }}
      tone="surface"
      onPress={() => router.push({ pathname: "/onboarding", params: { mode: "create" } })}
    >
      <XStack alignItems="center" gap="$3">
        <View
          alignItems="center"
          backgroundColor="$blue2"
          borderRadius={99}
          height={42}
          justifyContent="center"
          width={42}
        >
          <Plus color="$primary11" size={20} />
        </View>
        <SizableText color="$text11" flex={1} fontSize="$5" fontWeight="900">
          Crear nuevo modo
        </SizableText>
      </XStack>
    </ShadowCard>
  );
}

function PermissionsSheet({ visible, permissions }: { visible: boolean; permissions: { overlay: boolean; usageStats: boolean } }) {
  return (
    <Sheet dismissOnSnapToBottom={false} modal open={visible} snapPoints={[42]} onOpenChange={() => undefined}>
      <Sheet.Overlay backgroundColor="rgba(0, 59, 92, 0.18)" />
      <Sheet.Frame backgroundColor="$background" padding="$4">
        <Sheet.Handle backgroundColor="$borderColor" />
        <YStack gap="$4">
          <View alignItems="center" backgroundColor="$blue2" borderRadius={99} height={48} justifyContent="center" width={48}>
            <Settings color="$text11" size={22} />
          </View>
          <YStack gap="$1">
            <H4 color="$text11">Activa los permisos para usar Rehabbit</H4>
            <Paragraph color="$text10">Android necesita acceso de uso y permiso para mostrarse sobre otras apps.</Paragraph>
          </YStack>
          {!permissions.usageStats && <Button backgroundColor="$blue2" borderColor="$borderColor" color="$text11" onPress={() => void openUsageStatsSettings()}>Activar acceso de uso</Button>}
          {!permissions.overlay && <Button backgroundColor="$blue2" borderColor="$borderColor" color="$text11" onPress={() => void openOverlaySettings()}>Permitir mostrar sobre otras apps</Button>}
        </YStack>
      </Sheet.Frame>
    </Sheet>
  );
}
