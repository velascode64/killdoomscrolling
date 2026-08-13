import { Check, Clock3, Focus, ShieldBan } from "@tamagui/lucide-icons";
import {
  AndroidBlockableApp,
  AndroidRewardBlockerStatus,
  getInstalledApps,
  getRewardBlockerStatus,
  startMonitoring,
} from "expo-app-blocker";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { Image, Platform } from "react-native";
import { Button, H1, H4, Paragraph, SizableText, View, XStack, YStack } from "tamagui";

import { loadAndroidRewardConfig } from "../data/android-reward";
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

function AppList({ apps, tone }: { apps: AndroidBlockableApp[]; tone: "blocked" | "focus" }) {
  const color = tone === "blocked" ? "#C2410C" : "#15803D";
  const background = tone === "blocked" ? "#FFEDD5" : "#DCFCE7";
  if (apps.length === 0) return <Paragraph color="$text6">Todavia no has seleccionado apps.</Paragraph>;
  return <YStack space="$2">{apps.map((app) => <XStack key={app.packageName} alignItems="center" space="$2"><View width={34} height={34} borderRadius={9} alignItems="center" justifyContent="center" backgroundColor={background}>{app.iconBase64 ? <Image source={{ uri: `data:image/png;base64,${app.iconBase64}` }} style={{ width: 34, height: 34, borderRadius: 9 }} /> : tone === "blocked" ? <ShieldBan color={color} size={17} /> : <Focus color={color} size={17} />}</View><SizableText color="$text11" fontWeight="700">{app.name}</SizableText></XStack>)}</YStack>;
}

export function AndroidFocusDashboard() {
  const [status, setStatus] = useState<AndroidRewardBlockerStatus>(EMPTY_STATUS);
  const [blockedApps, setBlockedApps] = useState<AndroidBlockableApp[]>([]);
  const [focusApps, setFocusApps] = useState<AndroidBlockableApp[]>([]);
  const [configured, setConfigured] = useState(false);

  useEffect(() => {
    if (Platform.OS !== "android") return;
    const refresh = async () => {
      const [config, installedApps] = await Promise.all([loadAndroidRewardConfig(), getInstalledApps()]);
      setConfigured(Boolean(config?.enabled));
      // Android stops foreground services when a debug APK is updated. Resume
      // the saved plan as soon as the dashboard loads after an install.
      if (config?.enabled) startMonitoring();
      setBlockedApps(installedApps.filter((app) => config?.blockedPackages.includes(app.packageName)));
      setFocusApps(installedApps.filter((app) => config?.productivePackages.includes(app.packageName)));
      setStatus(getRewardBlockerStatus());
    };
    void refresh().catch((error) => console.warn("Unable to load Android focus dashboard", error));
    const interval = setInterval(() => setStatus(getRewardBlockerStatus()), 1000);
    return () => clearInterval(interval);
  }, []);

  if (!configured) return <ShadowCard backgroundColor="#FFF8F1" borderColor="#FED7AA"><YStack space="$2"><H4 color="$text11">Tu plan de enfoque</H4><Paragraph color="$text6">Elige las apps que quieres pausar y las apps que te ayudan a recuperar tu tiempo.</Paragraph><Button alignSelf="flex-start" backgroundColor="#EA580C" color="white" onPress={() => router.push("/onboarding")}>Configurar mi plan</Button></YStack></ShadowCard>;

  const unlocked = status.phase === "unlocked";
  const headline = unlocked ? "Tiempo recuperado" : status.isScheduleActive ? "Recuperando tu tiempo" : "Tu plan esta en pausa";
  const countdown = unlocked ? status.unlockRemainingSeconds : status.productiveRemainingSeconds;
  const description = unlocked
    ? "Tus apps bloqueadas estan disponibles por ahora."
    : status.isScheduleActive
      ? "Abre una app de enfoque para seguir avanzando."
      : "Fuera del horario, tus apps estan disponibles.";

  return <YStack space="$3">
    <ShadowCard backgroundColor={unlocked ? "#F0FDF4" : "#FFF8F1"} borderColor={unlocked ? "#86EFAC" : "#FED7AA"}>
      <XStack space="$3" alignItems="center"><View padding="$2" borderRadius={99} backgroundColor={unlocked ? "#DCFCE7" : "#FFEDD5"}>{unlocked ? <Check color="#15803D" /> : <Clock3 color="#C2410C" />}</View><YStack flex={1}><SizableText color="$text11" fontWeight="800">{headline}</SizableText><Paragraph color="$text6">{description}</Paragraph></YStack></XStack>
      {status.isScheduleActive && <XStack alignItems="baseline" space="$2" marginTop="$3"><H1 color="$text11" lineHeight={48}>{formatDuration(countdown)}</H1><Paragraph color="$text6">{unlocked ? "para usar redes" : "para completar enfoque"}</Paragraph></XStack>}
    </ShadowCard>
    <ShadowCard><YStack space="$3"><XStack justifyContent="space-between" alignItems="center"><H4 color="$text11">Apps bloqueadas</H4><SizableText color="#C2410C" fontWeight="800">{blockedApps.length}</SizableText></XStack><AppList apps={blockedApps} tone="blocked" /></YStack></ShadowCard>
    <ShadowCard><YStack space="$3"><XStack justifyContent="space-between" alignItems="center"><H4 color="$text11">Apps de enfoque</H4><SizableText color="#15803D" fontWeight="800">{focusApps.length}</SizableText></XStack><AppList apps={focusApps} tone="focus" /><Paragraph color="$text6">Meta: {status.isScheduleActive ? formatDuration(status.productiveRemainingSeconds) : "se activa en tu horario"}</Paragraph></YStack></ShadowCard>
    <Button onPress={() => router.push("/onboarding")}>Editar plan</Button>
  </YStack>;
}
