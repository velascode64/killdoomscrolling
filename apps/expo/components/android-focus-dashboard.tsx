import { Check, Clock3, Focus, Moon, Pencil, Plus, ShieldBan, Briefcase, Settings } from "@tamagui/lucide-icons";
import {
  AndroidBlockableApp,
  AndroidRewardBlockerStatus,
  configureRewardBlockerPlans,
  getInstalledApps,
  getPermissionStatus,
  getRewardBlockerStatus,
  openOverlaySettings,
  openUsageStatsSettings,
  startMonitoring,
} from "expo-app-blocker";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { AppState, Image, Platform } from "react-native";
import { Button, H1, H4, Paragraph, Sheet, SizableText, View, XStack, YStack } from "tamagui";

import { formatPlanTime, loadAndroidRewardPlans, AndroidRewardPlan, PLAN_COPY, toNativeRewardPlansConfig } from "../data/android-reward";
import { ShadowCard } from "./shadow.card";

const EMPTY_STATUS: AndroidRewardBlockerStatus = {
  enabled: false,
  isScheduleActive: false,
  phase: "inactive",
  productiveElapsedSeconds: 0,
  productiveRemainingSeconds: 0,
  unlockRemainingSeconds: 0,
};

function formatDuration(seconds: number) {
  const safeSeconds = Math.max(0, seconds);
  return `${Math.floor(safeSeconds / 60)}:${String(safeSeconds % 60).padStart(2, "0")}`;
}

function PlanIcon({ plan }: { plan: AndroidRewardPlan }) {
  const Icon = plan.mode === "sleep" ? Moon : plan.mode === "work" ? Briefcase : Focus;
  return <View width={38} height={38} borderRadius="$3" backgroundColor="$primary3" alignItems="center" justifyContent="center"><Icon color="$primary10" size={19} /></View>;
}

function AppPreview({ apps }: { apps: AndroidBlockableApp[] }) {
  if (!apps.length) return <Paragraph color="$text6">Sin apps seleccionadas.</Paragraph>;
  return <XStack space="$2" flexWrap="wrap">{apps.slice(0, 3).map((app) => <XStack key={app.packageName} alignItems="center" space="$1" backgroundColor="$grey1" borderRadius="$10" padding="$1"><View width={24} height={24} borderRadius="$1" overflow="hidden" backgroundColor="$grey3">{app.iconBase64 && <Image source={{ uri: `data:image/png;base64,${app.iconBase64}` }} style={{ width: 24, height: 24 }} />}</View><SizableText color="$text11" fontSize="$2" fontWeight="700" numberOfLines={1}>{app.name}</SizableText></XStack>)}</XStack>;
}

export function AndroidFocusDashboard() {
  const [status, setStatus] = useState<AndroidRewardBlockerStatus>(EMPTY_STATUS);
  const [plans, setPlans] = useState<AndroidRewardPlan[]>([]);
  const [installedApps, setInstalledApps] = useState<AndroidBlockableApp[]>([]);
  const [permissions, setPermissions] = useState({ overlay: true, usageStats: true });

  useEffect(() => {
    if (Platform.OS !== "android") return;
    const refresh = async () => {
      const [savedPlans, apps, permissionStatus] = await Promise.all([loadAndroidRewardPlans(), getInstalledApps(), getPermissionStatus()]);
      setPlans(savedPlans);
      setInstalledApps(apps);
      if (permissionStatus.details.platform === "android") setPermissions({ overlay: permissionStatus.details.overlay, usageStats: permissionStatus.details.usageStats });
      let nativeStatus = getRewardBlockerStatus();
      const activeSavedPlan = savedPlans.find((plan) => plan.id === nativeStatus.activePlanId);
      // Old native plans did not persist a mode. Repair that stale configuration
      // only when an active plan proves it differs, without resetting normal progress.
      if (activeSavedPlan && nativeStatus.activePlanMode !== activeSavedPlan.mode) {
        configureRewardBlockerPlans(toNativeRewardPlansConfig(savedPlans));
        nativeStatus = getRewardBlockerStatus();
      }
      if (savedPlans.some((plan) => plan.enabled)) startMonitoring();
      setStatus(nativeStatus);
    };
    void refresh().catch((error) => console.warn("Unable to load Android plans", error));
    const interval = setInterval(() => setStatus(getRewardBlockerStatus()), 1000);
    const subscription = AppState.addEventListener("change", (nextState) => { if (nextState === "active") void refresh(); });
    return () => { clearInterval(interval); subscription.remove(); };
  }, []);

  const activePlan = plans.find((plan) => plan.id === status.activePlanId);
  const isUnlocked = status.phase === "unlocked";

  if (!plans.length) return <><ShadowCard><YStack space="$3"><YStack space="$1"><H4 color="$text11">Crea tu primer plan</H4><Paragraph color="$text6">Pausa distracciones y recupera ese tiempo con una actividad que elegiste.</Paragraph></YStack><Button alignSelf="flex-start" backgroundColor="$primary9" color="white" icon={<Plus size={16} />} onPress={() => router.push("/onboarding")}>Crear plan</Button></YStack></ShadowCard><PermissionsSheet visible={!permissions.overlay || !permissions.usageStats} permissions={permissions} /></>;

  return <><YStack space="$3">
    <XStack alignItems="center" justifyContent="space-between"><YStack><H4 color="$text11">Tus planes</H4><Paragraph color="$text6">{plans.length} {plans.length === 1 ? "plan activo" : "planes configurados"}</Paragraph></YStack><Button size="$3" icon={<Plus size={16} />} onPress={() => router.push("/onboarding")}>Nuevo</Button></XStack>
    {activePlan && <ShadowCard backgroundColor="$primary2" borderColor="$primary7"><YStack space="$3"><XStack alignItems="center" space="$2"><PlanIcon plan={activePlan} /><YStack flex={1}><SizableText color="$text11" fontWeight="900">{activePlan.name}</SizableText><Paragraph color="$text6">{isUnlocked ? "Tu recompensa está activa" : PLAN_COPY[activePlan.mode].description}</Paragraph></YStack><View padding="$2" borderRadius={99} backgroundColor="$background1">{isUnlocked ? <Check color="$green10" size={18} /> : <Clock3 color="$primary10" size={18} />}</View></XStack><XStack alignItems="baseline" space="$2"><H1 color="$text11" lineHeight={48}>{formatDuration(isUnlocked ? status.unlockRemainingSeconds : status.productiveRemainingSeconds)}</H1><Paragraph color="$text6">{isUnlocked ? "para usar redes" : "para completar"}</Paragraph></XStack></YStack></ShadowCard>}
    <YStack space="$2">{plans.map((plan) => { const blockedApps = installedApps.filter((app) => plan.blockedPackages.includes(app.packageName)); const focusApps = installedApps.filter((app) => plan.productivePackages.includes(app.packageName)); const isCurrent = plan.id === activePlan?.id; return <ShadowCard key={plan.id} borderColor={isCurrent ? "$primary7" : "$grey3"} onPress={() => router.push({ pathname: "/onboarding", params: { planId: plan.id } })}><YStack space="$3"><XStack alignItems="center" space="$2"><PlanIcon plan={plan} /><YStack flex={1}><H4 color="$text11">{plan.name}</H4><Paragraph color="$text6">{formatPlanTime(plan.schedule.startMinute)} - {formatPlanTime(plan.schedule.endMinute)}</Paragraph></YStack><Pencil color="$text6" size={17} /></XStack><XStack space="$3"><YStack flex={1} space="$1"><SizableText color="$text6" fontSize="$2">APPS BLOQUEADAS</SizableText><AppPreview apps={blockedApps} /></YStack><YStack flex={1} space="$1"><SizableText color="$text6" fontSize="$2">RECUPERACIÓN</SizableText><AppPreview apps={focusApps} /></YStack></XStack><XStack alignItems="center" space="$2"><ShieldBan color="$text6" size={15} /><Paragraph color="$text6">{plan.productiveMinutes} min para ganar {plan.unlockMinutes} min</Paragraph></XStack></YStack></ShadowCard>; })}</YStack>
  </YStack><PermissionsSheet visible={!permissions.overlay || !permissions.usageStats} permissions={permissions} /></>;
}

function PermissionsSheet({ visible, permissions }: { visible: boolean; permissions: { overlay: boolean; usageStats: boolean } }) {
  return <Sheet modal open={visible} dismissOnSnapToBottom={false} onOpenChange={() => undefined} snapPoints={[42]}><Sheet.Overlay /><Sheet.Frame padding="$4" backgroundColor="$background1"><Sheet.Handle /><YStack space="$4"><View width={46} height={46} borderRadius="$3" backgroundColor="$orange3" alignItems="center" justifyContent="center"><Settings color="$orange10" size={22} /></View><YStack space="$1"><H4 color="$text11">Activa los permisos para usar Rehabbit</H4><Paragraph color="$text6">Sin acceso de uso y permiso para mostrarse encima de otras apps, Android no puede detectar ni mostrar tu locker.</Paragraph></YStack>{!permissions.usageStats && <Button onPress={openUsageStatsSettings}>Activar acceso de uso</Button>}{!permissions.overlay && <Button onPress={openOverlaySettings}>Permitir mostrar sobre otras apps</Button>}<Paragraph color="$text6" fontSize="$2">Vuelve al dashboard cuando termines. Esta pantalla se actualizará automáticamente.</Paragraph></YStack></Sheet.Frame></Sheet>;
}
