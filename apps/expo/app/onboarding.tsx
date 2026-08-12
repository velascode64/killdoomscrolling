import {
  ArrowLeft,
  ArrowRight,
  Check,
  Clock3,
  Focus,
  ShieldBan,
} from "@tamagui/lucide-icons";
import {
  AndroidBlockableApp,
  AndroidRewardBlockerConfig,
  configureRewardBlocker,
  getInstalledApps,
  getPermissionStatus,
  openOverlaySettings,
  openUsageStatsSettings,
} from "expo-app-blocker";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { Alert, AppState, Image, Platform } from "react-native";
import {
  Button,
  H1,
  H4,
  Input,
  Paragraph,
  SizableText,
  View,
  XStack,
  YStack,
} from "tamagui";

import { Container } from "../components/container";
import { ShadowCard } from "../components/shadow.card";
import {
  DEFAULT_ANDROID_REWARD_CONFIG,
  loadAndroidRewardConfig,
  saveAndroidRewardConfig,
} from "../data/android-reward";

const TOTAL_STEPS = 4;

function toClock(value: number) {
  const hours = Math.floor(value / 60);
  const minutes = value % 60;
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
}

function fromClock(value: string): number | null {
  const match = /^(\d{1,2}):(\d{2})$/.exec(value.trim());
  if (!match) return null;
  const hours = Number(match[1]);
  const minutes = Number(match[2]);
  return hours <= 23 && minutes <= 59 ? hours * 60 + minutes : null;
}

export default function OnboardingPage() {
  const [step, setStep] = useState(1);
  const [apps, setApps] = useState<AndroidBlockableApp[]>([]);
  const [config, setConfig] = useState<AndroidRewardBlockerConfig>(DEFAULT_ANDROID_REWARD_CONFIG);
  const [permissions, setPermissions] = useState({ overlay: false, usageStats: false });
  const [search, setSearch] = useState("");
  const [startText, setStartText] = useState(toClock(DEFAULT_ANDROID_REWARD_CONFIG.schedule.startMinute));
  const [endText, setEndText] = useState(toClock(DEFAULT_ANDROID_REWARD_CONFIG.schedule.endMinute));
  const [saving, setSaving] = useState(false);

  const refreshDeviceData = async () => {
    const [installedApps, permissionStatus] = await Promise.all([getInstalledApps(), getPermissionStatus()]);
    setApps(installedApps);
    if (permissionStatus.details.platform === "android") {
      setPermissions({
        overlay: permissionStatus.details.overlay,
        usageStats: permissionStatus.details.usageStats,
      });
    }
  };

  useEffect(() => {
    if (Platform.OS !== "android") return;
    void Promise.all([loadAndroidRewardConfig(), refreshDeviceData()])
      .then(([saved]) => {
        if (!saved) return;
        setConfig(saved);
        setStartText(toClock(saved.schedule.startMinute));
        setEndText(toClock(saved.schedule.endMinute));
      })
      .catch((error) => console.warn("Unable to load Android onboarding", error));

    const subscription = AppState.addEventListener("change", (state) => {
      if (state === "active") void refreshDeviceData();
    });
    return () => subscription.remove();
  }, []);

  if (Platform.OS !== "android") {
    return <></>;
  }

  const selectedPackages = step === 2 ? config.blockedPackages : config.productivePackages;
  const filteredApps = apps.filter((app) => app.name.toLowerCase().includes(search.toLowerCase()));
  const permissionsReady = permissions.overlay && permissions.usageStats;

  const toggleApp = (packageName: string, type: "blocked" | "productive") => {
    setConfig((current) => {
      const selectedKey = type === "blocked" ? "blockedPackages" : "productivePackages";
      const otherKey = type === "blocked" ? "productivePackages" : "blockedPackages";
      const isSelected = current[selectedKey].includes(packageName);
      return {
        ...current,
        [selectedKey]: isSelected
          ? current[selectedKey].filter((item) => item !== packageName)
          : [...current[selectedKey], packageName],
        // A focus app cannot also be blocked.
        [otherKey]: current[otherKey].filter((item) => item !== packageName),
      };
    });
  };

  const complete = async () => {
    const startMinute = fromClock(startText);
    const endMinute = fromClock(endText);
    if (startMinute === null || endMinute === null || startMinute === endMinute) {
      Alert.alert("Revisa el horario", "Usa dos horas diferentes, por ejemplo 20:00 y 07:00.");
      return;
    }
    const nextConfig: AndroidRewardBlockerConfig = {
      ...config,
      enabled: true,
      schedule: { startMinute, endMinute },
      productiveMinutes: Math.max(1, Math.round(config.productiveMinutes)),
      unlockMinutes: Math.max(1, Math.round(config.unlockMinutes)),
    };
    setSaving(true);
    try {
      configureRewardBlocker(nextConfig);
      await saveAndroidRewardConfig(nextConfig);
      router.replace("/overview");
    } catch (error) {
      Alert.alert("No se pudo activar", error instanceof Error ? error.message : "Intentalo otra vez.");
    } finally {
      setSaving(false);
    }
  };

  const next = () => {
    if (step === 1 && !permissionsReady) {
      Alert.alert("Faltan permisos", "Activa Acceso de uso y Mostrar sobre otras apps para continuar.");
      return;
    }
    if (step === 2 && config.blockedPackages.length === 0) {
      Alert.alert("Elige una app", "Selecciona al menos una app que quieras bloquear.");
      return;
    }
    if (step === 3 && config.productivePackages.length === 0) {
      Alert.alert("Elige una app", "Selecciona al menos una app de reemplazo.");
      return;
    }
    if (step === TOTAL_STEPS) {
      void complete();
      return;
    }
    setSearch("");
    setStep((current) => current + 1);
  };

  const stepTitle = ["", "Activa el bloqueo", "Que quieres pausar?", "En que app quieres invertir?", "Define tu trato contigo"];
  const stepDescription = [
    "",
    "Android necesita dos permisos para detectar la app abierta y mostrar tu pantalla de enfoque.",
    "Estas apps se bloquearan durante el horario que elijas.",
    "El contador solo avanza dentro de estas apps. Al salir, se pausa.",
    "Completa tus minutos de enfoque y recibiras tiempo real para usar las apps bloqueadas.",
  ];

  return (
    <Container paddingVertical="$4">
      <YStack space="$4">
        <XStack alignItems="center" space="$2">
          <View height={6} flex={1} borderRadius={99} backgroundColor="#EA580C" opacity={step / TOTAL_STEPS} />
          <SizableText color="$text6" fontWeight="700">{step}/{TOTAL_STEPS}</SizableText>
        </XStack>
        <YStack space="$2">
          <H1 color="$text11" fontSize="$10" lineHeight={44}>{stepTitle[step]}</H1>
          <Paragraph color="$text6" fontSize="$5" lineHeight={23}>{stepDescription[step]}</Paragraph>
        </YStack>

        {step === 1 && (
          <YStack space="$3">
            <ShadowCard borderColor={permissions.usageStats ? "#86EFAC" : "#FED7AA"} backgroundColor={permissions.usageStats ? "#F0FDF4" : "#FFF8F1"}>
              <XStack alignItems="center" space="$3">
                <View padding="$2" borderRadius={99} backgroundColor={permissions.usageStats ? "#DCFCE7" : "#FFEDD5"}><ShieldBan color={permissions.usageStats ? "#15803D" : "#C2410C"} /></View>
                <YStack flex={1}><SizableText color="$text11" fontWeight="800">Acceso de uso</SizableText><Paragraph color="$text6">Detecta la app que esta abierta.</Paragraph></YStack>
                <Button size="$3" onPress={openUsageStatsSettings}>{permissions.usageStats ? "Listo" : "Activar"}</Button>
              </XStack>
            </ShadowCard>
            <ShadowCard borderColor={permissions.overlay ? "#86EFAC" : "#FED7AA"} backgroundColor={permissions.overlay ? "#F0FDF4" : "#FFF8F1"}>
              <XStack alignItems="center" space="$3">
                <View padding="$2" borderRadius={99} backgroundColor={permissions.overlay ? "#DCFCE7" : "#FFEDD5"}><Focus color={permissions.overlay ? "#15803D" : "#C2410C"} /></View>
                <YStack flex={1}><SizableText color="$text11" fontWeight="800">Mostrar sobre otras apps</SizableText><Paragraph color="$text6">Abre tu pantalla de enfoque al intentar entrar.</Paragraph></YStack>
                <Button size="$3" onPress={openOverlaySettings}>{permissions.overlay ? "Listo" : "Activar"}</Button>
              </XStack>
            </ShadowCard>
            <Button onPress={() => void refreshDeviceData()}>Ya los active, revisar</Button>
          </YStack>
        )}

        {(step === 2 || step === 3) && (
          <YStack space="$3">
            <Input value={search} onChangeText={setSearch} placeholder="Busca una app instalada" />
            <YStack space="$2">
              {filteredApps.map((app) => {
                const isSelected = selectedPackages.includes(app.packageName);
                return <ShadowCard key={app.packageName} padding="$2" backgroundColor={isSelected ? "#FFF7ED" : "$background1"} borderColor={isSelected ? "#FB923C" : "$grey3"} onPress={() => toggleApp(app.packageName, step === 2 ? "blocked" : "productive")}>
                  <XStack alignItems="center" space="$3">
                    {app.iconBase64 ? <Image source={{ uri: `data:image/png;base64,${app.iconBase64}` }} style={{ width: 40, height: 40, borderRadius: 10 }} /> : <View width={40} height={40} borderRadius={10} backgroundColor="$grey3" />}
                    <YStack flex={1}><SizableText color="$text11" fontWeight="800">{app.name}</SizableText><SizableText color="$text6" fontSize="$2">{app.packageName}</SizableText></YStack>
                    <View width={25} height={25} borderRadius={99} alignItems="center" justifyContent="center" backgroundColor={isSelected ? "#EA580C" : "$grey3"}>{isSelected && <Check color="white" size={16} />}</View>
                  </XStack>
                </ShadowCard>;
              })}
            </YStack>
          </YStack>
        )}

        {step === 4 && (
          <YStack space="$3">
            <ShadowCard backgroundColor="#FFF8F1" borderColor="#FED7AA">
              <XStack space="$3" alignItems="center"><View backgroundColor="#FFEDD5" padding="$2" borderRadius={99}><Clock3 color="#C2410C" /></View><YStack flex={1}><SizableText color="$text11" fontWeight="800">Cada dia, a tu ritmo</SizableText><Paragraph color="$text6">El horario puede cruzar medianoche, por ejemplo 20:00 a 07:00.</Paragraph></YStack></XStack>
            </ShadowCard>
            <XStack space="$3"><YStack flex={1} space="$1"><SizableText color="$text6">Empieza</SizableText><Input value={startText} onChangeText={setStartText} keyboardType="numbers-and-punctuation" placeholder="20:00" /></YStack><YStack flex={1} space="$1"><SizableText color="$text6">Termina</SizableText><Input value={endText} onChangeText={setEndText} keyboardType="numbers-and-punctuation" placeholder="07:00" /></YStack></XStack>
            <XStack space="$3"><YStack flex={1} space="$1"><SizableText color="$text6">Minutos de enfoque</SizableText><Input value={String(config.productiveMinutes)} onChangeText={(value) => setConfig((current) => ({ ...current, productiveMinutes: Number(value.replace(/[^0-9]/g, "")) || 1 }))} keyboardType="number-pad" /></YStack><YStack flex={1} space="$1"><SizableText color="$text6">Minutos desbloqueados</SizableText><Input value={String(config.unlockMinutes)} onChangeText={(value) => setConfig((current) => ({ ...current, unlockMinutes: Number(value.replace(/[^0-9]/g, "")) || 1 }))} keyboardType="number-pad" /></YStack></XStack>
          </YStack>
        )}

        <XStack space="$3" marginTop="$2">
          {step > 1 && <Button flex={1} onPress={() => setStep((current) => current - 1)} icon={<ArrowLeft size={17} />}>Atras</Button>}
          <Button flex={1} backgroundColor="#EA580C" color="white" disabled={saving} onPress={next} iconAfter={step === TOTAL_STEPS ? <Check size={17} /> : <ArrowRight size={17} />}>
            {saving ? "Activando..." : step === TOTAL_STEPS ? "Activar mi plan" : "Continuar"}
          </Button>
        </XStack>
      </YStack>
    </Container>
  );
}
