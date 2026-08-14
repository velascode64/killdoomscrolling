import { ArrowRight, Focus } from "@tamagui/lucide-icons";
import { LinearGradient } from "expo-linear-gradient";
import {
  AndroidRewardBlockerStatus,
  getInstalledApps,
  getRewardBlockerStatus,
  openSelectedApp,
  type IOSBlockedItem,
} from "expo-app-blocker";
import { useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { Alert, Image, Platform, Pressable } from "react-native";
import Svg, { Circle } from "react-native-svg";
import { H1, Paragraph, SizableText, View, XStack, YStack } from "tamagui";

import { loadAndroidRewardConfig } from "../data/android-reward";
import { loadIOSRewardPlan } from "../data/ios-reward";

const EMPTY_STATUS: AndroidRewardBlockerStatus = {
  enabled: false,
  isScheduleActive: false,
  phase: "inactive",
  productiveElapsedSeconds: 0,
  productiveRemainingSeconds: 0,
  unlockRemainingSeconds: 0,
};

type FocusApp = {
  id: string;
  name: string;
  iconBase64?: string | null;
  packageName?: string;
};

function formatDuration(seconds: number) {
  const safe = Math.max(0, seconds);
  return `${String(Math.floor(safe / 60)).padStart(2, "0")}:${String(safe % 60).padStart(2, "0")}`;
}

function formatSessionDuration(seconds: number) {
  const safe = Math.max(0, seconds);
  return `${String(Math.floor(safe / 3600)).padStart(2, "0")}:${String(Math.floor((safe % 3600) / 60)).padStart(2, "0")}:${String(safe % 60).padStart(2, "0")}`;
}

function formatIOSItem(item: IOSBlockedItem, index: number) {
  return item.displayName ?? item.categoryName ?? item.domain ?? `${item.type === "category" ? "Categoria" : "App"} seleccionada ${index + 1}`;
}

function ProgressRing({ progress }: { progress: number }) {
  const size = 268;
  const radius = 122;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - Math.min(1, Math.max(0, progress)));

  return <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
    <Circle cx={size / 2} cy={size / 2} r={radius} stroke="rgba(255,255,255,0.28)" strokeWidth={5} fill="none" />
    <Circle cx={size / 2} cy={size / 2} r={radius} stroke="#FFFFFF" strokeWidth={7} strokeLinecap="round" fill="none" strokeDasharray={`${circumference} ${circumference}`} strokeDashoffset={offset} rotation="-90" origin={`${size / 2}, ${size / 2}`} />
  </Svg>;
}

export default function BlockedPage() {
  const { app } = useLocalSearchParams<{ app?: string }>();
  const [status, setStatus] = useState<AndroidRewardBlockerStatus>(EMPTY_STATUS);
  const [focusApps, setFocusApps] = useState<FocusApp[]>([]);

  useEffect(() => {
    const refresh = async () => {
      if (Platform.OS === "ios") {
        const plan = await loadIOSRewardPlan();
        setFocusApps((plan?.productiveItems ?? []).slice(0, 3).map((item, index) => ({ id: `${item.type}:${item.token}`, name: formatIOSItem(item, index), iconBase64: item.iconBase64 })));
        setStatus({ ...EMPTY_STATUS, enabled: Boolean(plan?.enabled), isScheduleActive: true, phase: "earning", productiveRemainingSeconds: (plan?.productiveMinutes ?? 0) * 60 });
        return;
      }
      if (Platform.OS !== "android") return;
      const [config, installed] = await Promise.all([loadAndroidRewardConfig(), getInstalledApps()]);
      const focusPackages = new Set(config?.productivePackages ?? []);
      setFocusApps(installed.filter((item) => focusPackages.has(item.packageName)).slice(0, 3).map((item) => ({ id: item.packageName, name: item.name, iconBase64: item.iconBase64, packageName: item.packageName })));
      setStatus(getRewardBlockerStatus());
    };

    void refresh().catch((error) => console.warn("Unable to load focus screen", error));
    const interval = setInterval(() => {
      if (Platform.OS === "android") setStatus(getRewardBlockerStatus());
    }, 1_000);
    return () => clearInterval(interval);
  }, []);

  const unlocked = status.phase === "unlocked";
  const total = status.productiveElapsedSeconds + status.productiveRemainingSeconds;
  const progress = total > 0 ? status.productiveElapsedSeconds / total : 0;
  const timer = unlocked ? status.unlockRemainingSeconds : status.productiveElapsedSeconds;
  const progressLabel = unlocked
    ? `TIEMPO DISPONIBLE ${formatSessionDuration(status.unlockRemainingSeconds)}`
    : `${Math.round(progress * 100)}% DE ${formatSessionDuration(total)}`;
  const subtitle = unlocked
    ? "Tu recompensa esta activa. Disfruta el tiempo que elegiste."
    : `${app ?? "Esta app"} puede esperar. Tu sesion de enfoque esta en curso.`;

  const openFocusApp = (focusApp: FocusApp) => {
    if (focusApp.packageName && openSelectedApp(focusApp.packageName)) return;
    Alert.alert("Abre esta app", Platform.OS === "ios"
      ? "iOS no permite abrir directamente una app elegida con Family Controls. Abrela desde tu pantalla de inicio para avanzar."
      : "No se pudo abrir esta app desde Rehabbit.");
  };

  return <LinearGradient colors={["#16D9D5", "#008CEB", "#06254E"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ flex: 1 }}>
    <YStack flex={1} paddingHorizontal="$7" paddingTop="$8" paddingBottom="$6" justifyContent="space-between">
      <YStack alignItems="center" space="$2">
        <H1 color="white" textAlign="center" fontSize="$8" lineHeight={34}>Estas recuperando tu tiempo</H1>
        <Paragraph color="rgba(255,255,255,0.80)" textAlign="center" fontSize="$5" lineHeight={25}>{subtitle}</Paragraph>
      </YStack>

      <View width={268} height={268} alignSelf="center" alignItems="center" justifyContent="center">
        <View position="absolute"><ProgressRing progress={unlocked ? 1 : progress} /></View>
        <YStack alignItems="center" space="$1"><H1 color="white" fontSize={54} lineHeight={64} fontWeight="400">{formatDuration(timer)}</H1><SizableText color="rgba(255,255,255,0.82)" fontWeight="800" letterSpacing={1.5}>{progressLabel}</SizableText></YStack>
      </View>

      <YStack space="$3">{focusApps.map((focusApp) => <Pressable key={focusApp.id} onPress={() => openFocusApp(focusApp)}><XStack height={76} alignItems="center" paddingHorizontal="$3" borderRadius="$6" borderWidth={1} borderColor="rgba(255,255,255,0.33)" backgroundColor="rgba(255,255,255,0.13)"><View width={46} height={46} borderRadius="$4" alignItems="center" justifyContent="center" backgroundColor="rgba(255,255,255,0.16)">{focusApp.iconBase64 ? <Image source={{ uri: `data:image/png;base64,${focusApp.iconBase64}` }} style={{ width: 46, height: 46, borderRadius: 12 }} /> : <Focus color="white" size={23} />}</View><SizableText flex={1} marginLeft="$3" color="white" fontSize="$6" fontWeight="800">{focusApp.name}</SizableText><ArrowRight color="rgba(255,255,255,0.85)" size={28} /></XStack></Pressable>)}</YStack>
    </YStack>
  </LinearGradient>;
}
