import { Clock3, Focus, Plus, Settings } from "@tamagui/lucide-icons";
import {
  AndroidBlockableApp,
  configureRewardBlockerPlans,
  getInstalledApps,
  getPermissionStatus,
  openOverlaySettings,
  openUsageStatsSettings,
  startMonitoring,
} from "expo-app-blocker";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { AppState, Platform, StyleSheet } from "react-native";
import { Button, H4, Paragraph, Sheet, SizableText, Switch, View, XStack, YStack } from "tamagui";

import {
  AndroidRewardPlan,
  formatPlanTime,
  loadAndroidRewardPlans,
  saveAndroidRewardPlans,
  toNativeRewardPlansConfig,
} from "../data/android-reward";
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
      setPlans(savedPlans);
      setInstalledApps(apps);
      if (permissionStatus.details.platform === "android") {
        setPermissions({ overlay: permissionStatus.details.overlay, usageStats: permissionStatus.details.usageStats });
      }
      await configureRewardBlockerPlans(toNativeRewardPlansConfig(savedPlans));
      if (savedPlans.some((plan) => plan.enabled)) await startMonitoring();
    };

    void refresh().catch((error) => console.warn("Unable to load Android plans", error));
    const subscription = AppState.addEventListener("change", (nextState) => {
      if (nextState === "active") void refresh();
    });
    return () => subscription.remove();
  }, []);

  const togglePlan = async (planId: string, enabled: boolean) => {
    const nextPlans = plans.map((plan) => (plan.id === planId ? { ...plan, enabled } : plan));
    setPlans(nextPlans);
    await saveAndroidRewardPlans(nextPlans);
    await configureRewardBlockerPlans(toNativeRewardPlansConfig(nextPlans));
    if (nextPlans.some((plan) => plan.enabled)) await startMonitoring();
  };

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
              <GradientButton icon={<Plus color="white" size={19} />} onPress={() => router.push("/onboarding")}>
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
              onToggle={(enabled) => void togglePlan(plan.id, enabled)}
            />
          );
        })}
      </YStack>
      <PermissionsSheet permissions={permissions} visible={!permissions.overlay || !permissions.usageStats} />
    </>
  );
}

function SectionHeader() {
  return (
    <XStack alignItems="center" justifyContent="space-between" marginTop="$2">
      <H4 color="$text11" fontSize="$7">Tus Modos</H4>
      <Button
        unstyled
        alignItems="center"
        borderRadius={99}
        height={46}
        justifyContent="center"
        overflow="hidden"
        pressStyle={{ opacity: 0.8 }}
        width={46}
        onPress={() => router.push("/onboarding")}
      >
        <LinearGradient colors={["#1AE1FE", "#2CCEFE", "#4BB7FE"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={StyleSheet.absoluteFill} />
        <Plus color="white" size={24} />
      </Button>
    </XStack>
  );
}

function ModeCard({
  blockedApps,
  plan,
  onToggle,
}: {
  blockedApps: AndroidBlockableApp[];
  plan: AndroidRewardPlan;
  onToggle: (enabled: boolean) => void;
}) {
  return (
    <ShadowCard
      padding="$4"
      pressStyle={{ opacity: 0.88 }}
      tone={plan.category === "sleep" ? "sky" : plan.category === "exercise" ? "mint" : "aqua"}
      onPress={() => router.push({ pathname: "/onboarding", params: { planId: plan.id } })}
    >
      <YStack gap="$3">
        <XStack alignItems="center" justifyContent="space-between">
          <H4 color="$text11" fontSize="$7">{plan.name}</H4>
          <Switch
            backgroundColor={plan.enabled ? "$blue9" : "$grey3"}
            checked={plan.enabled}
            size="$3"
            onCheckedChange={onToggle}
          >
            <Switch.Thumb animation="quick" backgroundColor="white" />
          </Switch>
        </XStack>

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
