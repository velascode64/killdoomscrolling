import { Check, Clock3, Focus, ShieldBan } from "@tamagui/lucide-icons";
import {
  AndroidBlockableApp,
  AndroidRewardBlockerConfig,
  configureRewardBlocker,
  getBlockConfiguration,
  getInstalledApps,
  getPermissionStatus,
  openOverlaySettings,
  openUsageStatsSettings,
  presentFamilyActivityPicker,
  requestPermissions,
  setBlockConfiguration,
  type IOSBlockedItem,
} from "expo-app-blocker";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { Alert, AppState, Image, Platform } from "react-native";
import { Button, H1, H4, Input, Paragraph, SizableText, View, XStack, YStack } from "tamagui";

import { Container } from "../components/container";
import { ShadowCard } from "../components/shadow.card";
import { DEFAULT_ANDROID_REWARD_CONFIG, loadAndroidRewardConfig, saveAndroidRewardConfig } from "../data/android-reward";
import { DEFAULT_IOS_REWARD_PLAN, loadIOSRewardPlan, saveIOSRewardPlan, type IOSRewardPlan } from "../data/ios-reward";

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
  if (Platform.OS === "ios") return <IOSOnboardingPage />;
  return <AndroidOnboardingPage />;
}

function IOSOnboardingPage() {
  const [authorized, setAuthorized] = useState(false);
  const [plan, setPlan] = useState<IOSRewardPlan>(DEFAULT_IOS_REWARD_PLAN);
  const [selection, setSelection] = useState<"blocked" | "focus">("blocked");
  const [startText, setStartText] = useState(toClock(DEFAULT_IOS_REWARD_PLAN.schedule.startMinute));
  const [endText, setEndText] = useState(toClock(DEFAULT_IOS_REWARD_PLAN.schedule.endMinute));
  const [saving, setSaving] = useState(false);

  const refresh = async () => {
    const permission = await getPermissionStatus();
    if (permission.details.platform === "ios") setAuthorized(permission.details.authorized);
    const savedPlan = await loadIOSRewardPlan();
    if (savedPlan) {
      setPlan(savedPlan);
      setStartText(toClock(savedPlan.schedule.startMinute));
      setEndText(toClock(savedPlan.schedule.endMinute));
      return;
    }
    const savedBlockConfiguration = getBlockConfiguration();
    if (savedBlockConfiguration) {
      setPlan((current) => ({ ...current, blockedItems: savedBlockConfiguration.blockedItems }));
    }
  };

  useEffect(() => {
    void refresh().catch((error) => console.warn("Unable to load iOS blocker", error));
  }, []);

  const selectApps = async () => {
    try {
      let canSelect = authorized;
      if (!canSelect) {
        const permission = await requestPermissions();
        canSelect = permission.details.platform === "ios" && permission.details.authorized;
        setAuthorized(canSelect);
      }
      if (!canSelect) {
        Alert.alert("Permiso necesario", "Activa Screen Time para que Rehabbit pueda bloquear las apps que elijas.");
        return;
      }
      const selectedItems = await presentFamilyActivityPicker(
        selection === "blocked" ? plan.blockedItems : plan.productiveItems
      );
      setPlan((current) => {
        const selectedKey = selection === "blocked" ? "blockedItems" : "productiveItems";
        const otherKey = selection === "blocked" ? "productiveItems" : "blockedItems";
        const selectedTokens = new Set(selectedItems.map((item) => `${item.type}:${item.token}`));
        return {
          ...current,
          [selectedKey]: selectedItems,
          // A replacement app cannot also be a blocked app.
          [otherKey]: current[otherKey].filter((item) => !selectedTokens.has(`${item.type}:${item.token}`)),
        };
      });
    } catch (error) {
      Alert.alert("No se pudo abrir el selector", error instanceof Error ? error.message : "Intentalo otra vez.");
    }
  };

  const activate = async () => {
    const startMinute = fromClock(startText);
    const endMinute = fromClock(endText);
    if (!plan.blockedItems.length || !plan.productiveItems.length) {
      Alert.alert("Faltan apps", "Elige al menos una app bloqueada y una app de enfoque.");
      return;
    }
    if (startMinute === null || endMinute === null || startMinute === endMinute) {
      Alert.alert("Revisa el horario", "Usa dos horas diferentes, por ejemplo 20:00 y 07:00.");
      return;
    }
    setSaving(true);
    try {
      const nextPlan: IOSRewardPlan = {
        ...plan,
        enabled: true,
        schedule: { startMinute, endMinute },
        productiveMinutes: Math.max(1, Math.round(plan.productiveMinutes)),
        unlockMinutes: Math.max(1, Math.round(plan.unlockMinutes)),
      };
      await setBlockConfiguration({ blockedItems: nextPlan.blockedItems, isActive: true });
      await saveIOSRewardPlan(nextPlan);
      router.replace("/overview");
    } catch (error) {
      Alert.alert("No se pudo activar", error instanceof Error ? error.message : "Intentalo otra vez.");
    } finally {
      setSaving(false);
    }
  };

  const selectedItems = selection === "blocked" ? plan.blockedItems : plan.productiveItems;
  const selectionTitle = selection === "blocked" ? "Bloquear" : "Enfoque";

  return <Container paddingVertical="$4"><YStack space="$4">
    <YStack space="$1"><H1 color="$text11" fontSize="$10" lineHeight={44}>Tu plan de enfoque</H1><Paragraph color="$text6" fontSize="$5">Elige que pausar y con que apps quieres recuperar tu tiempo.</Paragraph></YStack>
    <ShadowCard><YStack space="$3"><XStack space="$2" alignItems="center"><View padding="$2" borderRadius={99} backgroundColor="#E0F2FE"><ShieldBan color="#0369A1" /></View><YStack flex={1}><H4 color="$text11">Permiso de Screen Time</H4><Paragraph color="$text6">Apple te pedira autorizacion una sola vez.</Paragraph></YStack></XStack><Button alignSelf="flex-start" backgroundColor={authorized ? "#15803D" : "#0369A1"} color="white" onPress={() => void selectApps()}>{authorized ? "Permiso listo" : "Dar permiso"}</Button></YStack></ShadowCard>
    <YStack space="$2"><H4 color="$text11">Selecciona tus apps</H4><XStack space="$2"><Button flex={1} theme={selection === "blocked" ? "active" : undefined} onPress={() => setSelection("blocked")} icon={<ShieldBan size={16} />}>Bloquear ({plan.blockedItems.length})</Button><Button flex={1} theme={selection === "focus" ? "active" : undefined} onPress={() => setSelection("focus")} icon={<Focus size={16} />}>Enfoque ({plan.productiveItems.length})</Button></XStack><Paragraph color="$text6">{selection === "blocked" ? "Estas apps se pausaran dentro de tu horario." : "El progreso se registra con Screen Time mientras usas estas apps."}</Paragraph><ShadowCard><YStack space="$3"><XStack justifyContent="space-between" alignItems="center"><H4 color="$text11">Apps para {selectionTitle.toLowerCase()}</H4><SizableText color={selection === "blocked" ? "#C2410C" : "#15803D"} fontWeight="800">{selectedItems.length}</SizableText></XStack><Button onPress={() => void selectApps()} icon={<Focus size={16} />}>{selectedItems.length ? "Cambiar seleccion" : "Seleccionar apps"}</Button>{selectedItems.map((item, index) => <XStack key={`${item.type}-${item.token}`} alignItems="center" space="$2" paddingVertical="$1"><View width={32} height={32} borderRadius={9} alignItems="center" justifyContent="center" backgroundColor={selection === "blocked" ? "#FFEDD5" : "#DCFCE7"}>{selection === "blocked" ? <ShieldBan color="#C2410C" size={16} /> : <Focus color="#15803D" size={16} />}</View><SizableText color="$text11" fontWeight="700">{item.displayName ?? item.categoryName ?? item.domain ?? `${item.type === "category" ? "Categoria" : "App"} seleccionada ${index + 1}`}</SizableText></XStack>)}</YStack></ShadowCard></YStack>
    <ShadowCard><YStack space="$3"><XStack space="$2" alignItems="center"><View padding="$2" borderRadius={99} backgroundColor="#FFEDD5"><Clock3 color="#C2410C" /></View><YStack flex={1}><H4 color="$text11">Tu recompensa</H4><Paragraph color="$text6">Completa enfoque para desbloquear tus apps por tiempo real.</Paragraph></YStack></XStack><XStack space="$3"><YStack flex={1} space="$1"><SizableText color="$text6">Empieza</SizableText><Input value={startText} onChangeText={setStartText} placeholder="20:00" keyboardType="numbers-and-punctuation" /></YStack><YStack flex={1} space="$1"><SizableText color="$text6">Termina</SizableText><Input value={endText} onChangeText={setEndText} placeholder="07:00" keyboardType="numbers-and-punctuation" /></YStack></XStack><XStack space="$3"><YStack flex={1} space="$1"><SizableText color="$text6">Minutos de enfoque</SizableText><Input value={String(plan.productiveMinutes)} onChangeText={(value) => setPlan((current) => ({ ...current, productiveMinutes: Number(value.replace(/[^0-9]/g, "")) || 1 }))} keyboardType="number-pad" /></YStack><YStack flex={1} space="$1"><SizableText color="$text6">Minutos desbloqueados</SizableText><Input value={String(plan.unlockMinutes)} onChangeText={(value) => setPlan((current) => ({ ...current, unlockMinutes: Number(value.replace(/[^0-9]/g, "")) || 1 }))} keyboardType="number-pad" /></YStack></XStack></YStack></ShadowCard>
    <Button size="$5" backgroundColor="#EA580C" color="white" disabled={saving} onPress={() => void activate()}>{saving ? "Guardando..." : "Activar mi plan"}</Button>
  </YStack></Container>;
}

function AndroidOnboardingPage() {
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
