import { Check, Focus, Timer } from "@tamagui/lucide-icons";
import {
  AndroidBlockableApp,
  AndroidRewardBlockerStatus,
  getInstalledApps,
  getRewardBlockerStatus,
} from "expo-app-blocker";
import { useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { Image, Platform } from "react-native";
import { H1, H4, Paragraph, SizableText, View, XStack, YStack } from "tamagui";

import { Container } from "../components/container";
import { ShadowCard } from "../components/shadow.card";
import { loadAndroidRewardConfig } from "../data/android-reward";

const EMPTY_STATUS: AndroidRewardBlockerStatus = {
  enabled: false,
  isScheduleActive: false,
  phase: "inactive",
  productiveElapsedSeconds: 0,
  productiveRemainingSeconds: 0,
  unlockRemainingSeconds: 0,
};

function formatDuration(seconds: number) {
  const minutes = Math.floor(Math.max(0, seconds) / 60);
  return `${minutes}:${String(Math.max(0, seconds) % 60).padStart(2, "0")}`;
}

export default function BlockedPage() {
  const { app } = useLocalSearchParams<{ app?: string }>();
  const [status, setStatus] = useState<AndroidRewardBlockerStatus>(EMPTY_STATUS);
  const [focusApps, setFocusApps] = useState<AndroidBlockableApp[]>([]);

  useEffect(() => {
    if (Platform.OS !== "android") return;
    const refresh = async () => {
      setStatus(getRewardBlockerStatus());
      const [config, installed] = await Promise.all([loadAndroidRewardConfig(), getInstalledApps()]);
      const focusPackageNames = new Set(config?.productivePackages ?? []);
      setFocusApps(installed.filter((item) => focusPackageNames.has(item.packageName)));
    };
    void refresh().catch((error) => console.warn("Unable to load focus reward", error));
    const interval = setInterval(() => setStatus(getRewardBlockerStatus()), 1000);
    return () => clearInterval(interval);
  }, []);

  const isUnlocked = status.phase === "unlocked";
  const remaining = isUnlocked ? status.unlockRemainingSeconds : status.productiveRemainingSeconds;
  const label = isUnlocked ? "Tiempo recuperado" : "Estas recuperando tu tiempo";
  const body = isUnlocked
    ? "Tu recompensa esta activa. Disfruta el tiempo que elegiste, sin culpa."
    : `Completa tu enfoque y ${app ?? "esta app"} vuelve a estar disponible.`;

  return <Container paddingVertical="$6">
    <YStack space="$4" flex={1} justifyContent="center">
      <YStack alignItems="center" space="$3">
        <View width={74} height={74} borderRadius={99} alignItems="center" justifyContent="center" backgroundColor={isUnlocked ? "#DCFCE7" : "#FFEDD5"}>
          {isUnlocked ? <Check color="#15803D" size={34} /> : <Focus color="#C2410C" size={34} />}
        </View>
        <YStack alignItems="center" space="$1"><H1 color="$text11" textAlign="center" fontSize="$10" lineHeight={44}>{label}</H1><Paragraph color="$text6" textAlign="center" fontSize="$5" lineHeight={23}>{body}</Paragraph></YStack>
      </YStack>
      <ShadowCard backgroundColor={isUnlocked ? "#F0FDF4" : "#FFF8F1"} borderColor={isUnlocked ? "#86EFAC" : "#FED7AA"} padding="$5">
        <YStack alignItems="center" space="$2"><Timer color={isUnlocked ? "#15803D" : "#C2410C"} size={24} /><SizableText color="$text6" fontWeight="700">{isUnlocked ? "Disponible durante" : "Enfoque que falta"}</SizableText><H1 color="$text11" fontSize="$12" lineHeight={66}>{formatDuration(remaining)}</H1><Paragraph color="$text6" textAlign="center">{isUnlocked ? "Cuando termine, puedes iniciar un nuevo ciclo." : "El contador se pausa si sales de una app de enfoque."}</Paragraph></YStack>
      </ShadowCard>
      <YStack space="$2"><H4 color="$text11">Tus apps de enfoque</H4><Paragraph color="$text6">Abre cualquiera de estas apps para avanzar el contador.</Paragraph>{focusApps.map((focusApp) => <ShadowCard key={focusApp.packageName} padding="$2"><XStack alignItems="center" space="$3">{focusApp.iconBase64 ? <Image source={{ uri: `data:image/png;base64,${focusApp.iconBase64}` }} style={{ width: 38, height: 38, borderRadius: 9 }} /> : <View width={38} height={38} borderRadius={9} backgroundColor="$grey3" />}<SizableText color="$text11" fontWeight="800">{focusApp.name}</SizableText></XStack></ShadowCard>)}</YStack>
    </YStack>
  </Container>;
}
