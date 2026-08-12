import { Check, Clock3, Focus, ShieldBan } from "@tamagui/lucide-icons";
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
import { Button, H1, H4, Input, Paragraph, SizableText, View, XStack, YStack } from "tamagui";

import { Container } from "../components/container";
import { ShadowCard } from "../components/shadow.card";
import { DEFAULT_ANDROID_REWARD_CONFIG, loadAndroidRewardConfig, saveAndroidRewardConfig } from "../data/android-reward";

function toClock(value: number) {
  return `${String(Math.floor(value / 60)).padStart(2, "0")}:${String(value % 60).padStart(2, "0")}`;
}

function fromClock(value: string): number | null {
  const match = /^(\d{1,2}):(\d{2})$/.exec(value.trim());
  if (!match) return null;
  const hours = Number(match[1]);
  const minutes = Number(match[2]);
  return hours <= 23 && minutes <= 59 ? hours * 60 + minutes : null;
}

export default function OnboardingPage() {
  const [apps, setApps] = useState<AndroidBlockableApp[]>([]);
  const [config, setConfig] = useState<AndroidRewardBlockerConfig>(DEFAULT_ANDROID_REWARD_CONFIG);
  const [permissions, setPermissions] = useState({ overlay: false, usageStats: false });
  const [selection, setSelection] = useState<"blocked" | "focus">("blocked");
  const [search, setSearch] = useState("");
  const [startText, setStartText] = useState(toClock(DEFAULT_ANDROID_REWARD_CONFIG.schedule.startMinute));
  const [endText, setEndText] = useState(toClock(DEFAULT_ANDROID_REWARD_CONFIG.schedule.endMinute));
  const [saving, setSaving] = useState(false);

  const refresh = async () => {
    const [installedApps, permissionStatus] = await Promise.all([getInstalledApps(), getPermissionStatus()]);
    setApps(installedApps);
    if (permissionStatus.details.platform === "android") setPermissions({ overlay: permissionStatus.details.overlay, usageStats: permissionStatus.details.usageStats });
  };

  useEffect(() => {
    if (Platform.OS !== "android") return;
    void Promise.all([loadAndroidRewardConfig(), refresh()]).then(([saved]) => {
      if (!saved) return;
      setConfig(saved);
      setStartText(toClock(saved.schedule.startMinute));
      setEndText(toClock(saved.schedule.endMinute));
    }).catch((error) => console.warn("Unable to load Android plan", error));
    const listener = AppState.addEventListener("change", (state) => { if (state === "active") void refresh(); });
    return () => listener.remove();
  }, []);

  if (Platform.OS !== "android") return null;

  const selectedPackages = selection === "blocked" ? config.blockedPackages : config.productivePackages;
  const filteredApps = apps.filter((app) => app.name.toLowerCase().includes(search.toLowerCase()));
  const toggleApp = (packageName: string) => setConfig((current) => {
    const selectedKey = selection === "blocked" ? "blockedPackages" : "productivePackages";
    const otherKey = selection === "blocked" ? "productivePackages" : "blockedPackages";
    const alreadySelected = current[selectedKey].includes(packageName);
    return { ...current, [selectedKey]: alreadySelected ? current[selectedKey].filter((item) => item !== packageName) : [...current[selectedKey], packageName], [otherKey]: current[otherKey].filter((item) => item !== packageName) };
  });

  const save = async () => {
    const startMinute = fromClock(startText);
    const endMinute = fromClock(endText);
    if (!permissions.overlay || !permissions.usageStats) return Alert.alert("Faltan permisos", "Activa Acceso de uso y Mostrar sobre otras apps.");
    if (!config.blockedPackages.length || !config.productivePackages.length) return Alert.alert("Faltan apps", "Elige al menos una app bloqueada y una app de enfoque.");
    if (startMinute === null || endMinute === null || startMinute === endMinute) return Alert.alert("Revisa el horario", "Usa dos horas diferentes, por ejemplo 20:00 y 07:00.");
    const nextConfig = { ...config, enabled: true, schedule: { startMinute, endMinute }, productiveMinutes: Math.max(1, Math.round(config.productiveMinutes)), unlockMinutes: Math.max(1, Math.round(config.unlockMinutes)) };
    setSaving(true);
    try { configureRewardBlocker(nextConfig); await saveAndroidRewardConfig(nextConfig); router.replace("/overview"); }
    catch (error) { Alert.alert("No se pudo activar", error instanceof Error ? error.message : "Intentalo otra vez."); }
    finally { setSaving(false); }
  };

  return <Container paddingVertical="$4"><YStack space="$4">
    <YStack space="$1"><H1 color="$text11" fontSize="$10" lineHeight={44}>Tu plan de enfoque</H1><Paragraph color="$text6" fontSize="$5">Elige que pausar y con que apps quieres recuperar tu tiempo.</Paragraph></YStack>
    <ShadowCard><YStack space="$2"><H4 color="$text11">Permisos de Android</H4><XStack space="$2"><Button flex={1} size="$3" onPress={openUsageStatsSettings} icon={<ShieldBan size={15} />}>{permissions.usageStats ? "Uso listo" : "Acceso de uso"}</Button><Button flex={1} size="$3" onPress={openOverlaySettings} icon={<Focus size={15} />}>{permissions.overlay ? "Bloqueo listo" : "Mostrar encima"}</Button></XStack><Button size="$2" alignSelf="flex-start" onPress={() => void refresh()}>Revisar permisos</Button></YStack></ShadowCard>
    <YStack space="$2"><H4 color="$text11">Selecciona tus apps</H4><XStack space="$2"><Button flex={1} theme={selection === "blocked" ? "active" : undefined} onPress={() => setSelection("blocked")} icon={<ShieldBan size={16} />}>Bloquear ({config.blockedPackages.length})</Button><Button flex={1} theme={selection === "focus" ? "active" : undefined} onPress={() => setSelection("focus")} icon={<Focus size={16} />}>Enfoque ({config.productivePackages.length})</Button></XStack><Paragraph color="$text6">{selection === "blocked" ? "Estas apps se pausaran dentro de tu horario." : "El contador solo avanza mientras usas estas apps."}</Paragraph><Input value={search} onChangeText={setSearch} placeholder="Busca una app instalada" /><View flexDirection="row" flexWrap="wrap">{filteredApps.map((app, index) => { const selected = selectedPackages.includes(app.packageName); return <View key={app.packageName} width="50%" paddingRight={index % 2 === 0 ? "$1" : 0} paddingLeft={index % 2 === 1 ? "$1" : 0} paddingBottom="$2"><ShadowCard padding="$2" minHeight={92} backgroundColor={selected ? "#FFF7ED" : "$background1"} borderColor={selected ? "#FB923C" : "$grey3"} onPress={() => toggleApp(app.packageName)}><YStack space="$2"><XStack justifyContent="space-between" alignItems="center">{app.iconBase64 ? <Image source={{ uri: `data:image/png;base64,${app.iconBase64}` }} style={{ width: 34, height: 34, borderRadius: 9 }} /> : <View width={34} height={34} borderRadius={9} backgroundColor="$grey3" />}<View width={22} height={22} borderRadius={99} alignItems="center" justifyContent="center" backgroundColor={selected ? "#EA580C" : "$grey3"}>{selected && <Check color="white" size={14} />}</View></XStack><SizableText color="$text11" fontWeight="800" numberOfLines={2}>{app.name}</SizableText></YStack></ShadowCard></View>; })}</View></YStack>
    <ShadowCard><YStack space="$3"><XStack space="$2" alignItems="center"><View padding="$2" borderRadius={99} backgroundColor="#FFEDD5"><Clock3 color="#C2410C" /></View><YStack flex={1}><H4 color="$text11">Tu recompensa</H4><Paragraph color="$text6">Completa enfoque para desbloquear tus apps por tiempo real.</Paragraph></YStack></XStack><XStack space="$3"><YStack flex={1} space="$1"><SizableText color="$text6">Empieza</SizableText><Input value={startText} onChangeText={setStartText} placeholder="20:00" keyboardType="numbers-and-punctuation" /></YStack><YStack flex={1} space="$1"><SizableText color="$text6">Termina</SizableText><Input value={endText} onChangeText={setEndText} placeholder="07:00" keyboardType="numbers-and-punctuation" /></YStack></XStack><XStack space="$3"><YStack flex={1} space="$1"><SizableText color="$text6">Minutos de enfoque</SizableText><Input value={String(config.productiveMinutes)} onChangeText={(value) => setConfig((current) => ({ ...current, productiveMinutes: Number(value.replace(/[^0-9]/g, "")) || 1 }))} keyboardType="number-pad" /></YStack><YStack flex={1} space="$1"><SizableText color="$text6">Minutos desbloqueados</SizableText><Input value={String(config.unlockMinutes)} onChangeText={(value) => setConfig((current) => ({ ...current, unlockMinutes: Number(value.replace(/[^0-9]/g, "")) || 1 }))} keyboardType="number-pad" /></YStack></XStack></YStack></ShadowCard>
    <Button size="$5" backgroundColor="#EA580C" color="white" disabled={saving} onPress={() => void save()}>{saving ? "Guardando..." : "Activar mi plan"}</Button>
  </YStack></Container>;
}
