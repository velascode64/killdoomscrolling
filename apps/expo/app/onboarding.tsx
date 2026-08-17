import { ArrowLeft, Briefcase, Check, Clock3, Focus, Moon, Plus, X } from "@tamagui/lucide-icons";
import {
  AndroidBlockableApp,
  configureRewardBlockerPlans,
  getInstalledApps,
} from "expo-app-blocker";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { Alert, Image, Platform } from "react-native";
import { Button, H4, Input, Paragraph, Sheet, SizableText, View, XStack, YStack } from "tamagui";

import { Container } from "../components/container";
import { ShadowCard } from "../components/shadow.card";
import {
  AndroidRewardPlan,
  createAndroidRewardPlan,
  formatPlanTime,
  loadAndroidRewardPlans,
  PLAN_COPY,
  RewardPlanMode,
  saveAndroidRewardPlans,
  toNativeRewardPlansConfig,
} from "../data/android-reward";

const MODES: Array<{ mode: RewardPlanMode; Icon: typeof Focus }> = [
  { mode: "focus", Icon: Focus },
  { mode: "sleep", Icon: Moon },
  { mode: "work", Icon: Briefcase },
];
const HOURS = Array.from({ length: 24 }, (_, hour) => hour);
const MINUTES = Array.from({ length: 60 }, (_, minute) => minute);

function activeAt(plan: AndroidRewardPlan, minute: number) {
  const { startMinute, endMinute } = plan.schedule;
  return startMinute < endMinute ? minute >= startMinute && minute < endMinute : minute >= startMinute || minute < endMinute;
}

function overlaps(first: AndroidRewardPlan, second: AndroidRewardPlan) {
  return Array.from({ length: 1440 }, (_, minute) => minute).some((minute) => activeAt(first, minute) && activeAt(second, minute));
}

function Section({ children, title, description }: { children: React.ReactNode; title: string; description: string }) {
  return <YStack space="$3" paddingVertical="$3"><YStack space="$1"><H4 color="$text11">{title}</H4><Paragraph color="$text6">{description}</Paragraph></YStack>{children}</YStack>;
}

export default function OnboardingPage() {
  const { planId } = useLocalSearchParams<{ planId?: string }>();
  const [apps, setApps] = useState<AndroidBlockableApp[]>([]);
  const [plan, setPlan] = useState<AndroidRewardPlan>(() => createAndroidRewardPlan());
  const [picker, setPicker] = useState<"blocked" | "productive" | null>(null);
  const [timePicker, setTimePicker] = useState<"start" | "end" | null>(null);
  const [search, setSearch] = useState("");
  const [saving, setSaving] = useState(false);

  const refresh = async () => {
    setApps(await getInstalledApps());
  };

  useEffect(() => {
    if (Platform.OS !== "android") return;
    void Promise.all([loadAndroidRewardPlans(), refresh()]).then(([plans]) => {
      const existing = planId ? plans.find((item) => item.id === planId) : undefined;
      if (existing) setPlan(existing);
    }).catch((error) => console.warn("Unable to load Android plans", error));
  }, [planId]);

  if (Platform.OS !== "android") return null;

  const pickerPackages = picker === "blocked" ? plan.blockedPackages : plan.productivePackages;
  const selectedBlockedApps = apps.filter((app) => plan.blockedPackages.includes(app.packageName));
  const selectedProductiveApps = apps.filter((app) => plan.productivePackages.includes(app.packageName));
  const unavailablePackages = picker === "blocked" ? plan.productivePackages : plan.blockedPackages;
  const filteredApps = apps.filter((app) => app.name.toLowerCase().includes(search.toLowerCase()) && !unavailablePackages.includes(app.packageName));

  const setMode = (mode: RewardPlanMode) => setPlan((current) => ({ ...current, mode, name: current.name === PLAN_COPY[current.mode].name ? PLAN_COPY[mode].name : current.name }));
  const toggleApp = (packageName: string) => setPlan((current) => {
    const selectedKey = picker === "blocked" ? "blockedPackages" : "productivePackages";
    const otherKey = picker === "blocked" ? "productivePackages" : "blockedPackages";
    const selected = current[selectedKey].includes(packageName);
    return {
      ...current,
      [selectedKey]: selected ? current[selectedKey].filter((item) => item !== packageName) : [...current[selectedKey], packageName],
      [otherKey]: current[otherKey].filter((item) => item !== packageName),
    };
  });
  const removeApp = (packageName: string, type: "blocked" | "productive") => setPlan((current) => ({
    ...current,
    [type === "blocked" ? "blockedPackages" : "productivePackages"]: current[type === "blocked" ? "blockedPackages" : "productivePackages"].filter((item) => item !== packageName),
  }));
  const setTimePart = (part: "hour" | "minute", value: number) => {
    if (!timePicker) return;
    setPlan((current) => ({
      ...current,
      schedule: {
        ...current.schedule,
        [timePicker === "start" ? "startMinute" : "endMinute"]: part === "hour"
          ? value * 60 + current.schedule[timePicker === "start" ? "startMinute" : "endMinute"] % 60
          : Math.floor(current.schedule[timePicker === "start" ? "startMinute" : "endMinute"] / 60) * 60 + value,
      },
    }));
  };

  const save = async () => {
    if (!plan.name.trim()) return Alert.alert("Agrega un nombre", "Dale un nombre corto a este plan.");
    if (!plan.blockedPackages.length || !plan.productivePackages.length) return Alert.alert("Faltan apps", "Elige apps bloqueadas y apps de recuperación.");
    if (plan.schedule.startMinute === plan.schedule.endMinute) return Alert.alert("Revisa el horario", "Elige una hora de inicio y otra de finalización.");
    const nextPlan = { ...plan, enabled: true, name: plan.name.trim(), productiveMinutes: Math.max(1, Math.round(plan.productiveMinutes)), unlockMinutes: Math.max(1, Math.round(plan.unlockMinutes)) };
    const savedPlans = await loadAndroidRewardPlans();
    const nextPlans = planId ? savedPlans.map((item) => item.id === planId ? nextPlan : item) : [...savedPlans, nextPlan];
    if (nextPlans.some((item) => item.id !== nextPlan.id && item.enabled && overlaps(nextPlan, item))) return Alert.alert("Horarios cruzados", "Cada plan necesita su propio horario.");
    setSaving(true);
    try {
      configureRewardBlockerPlans(toNativeRewardPlansConfig(nextPlans));
      await saveAndroidRewardPlans(nextPlans);
      router.replace("/overview");
    } catch (error) {
      Alert.alert("No se pudo activar", error instanceof Error ? error.message : "Inténtalo otra vez.");
    } finally {
      setSaving(false);
    }
  };

  return <Container header={() => <PlanHeader title={planId ? "Editar plan" : "Nuevo plan"} />}><YStack space="$4" paddingTop="$2" paddingBottom="$4">
    <ShadowCard padding="$4">
      <YStack space="$1" paddingBottom="$2"><H4 color="$text11">{planId ? "Detalles del plan" : "Configura tu plan"}</H4><Paragraph color="$text6">Define el horario, las distracciones que pausarás y cómo recuperarás el acceso.</Paragraph></YStack>
      <View height={1} backgroundColor="$grey3" />
      <Section title="Nombre del plan" description="Usa un nombre que reconozcas fácilmente."><Input value={plan.name} onChangeText={(name) => setPlan((current) => ({ ...current, name }))} placeholder="Ej. Noche sin redes" /></Section>
      <View height={1} backgroundColor="$grey3" />
      <Section title="Modo" description="Cambia el mensaje de tu locker, no la mecánica del plan."><XStack space="$2">{MODES.map(({ mode, Icon }) => <Button key={mode} flex={1} size="$3" backgroundColor={plan.mode === mode ? "$primary4" : "$background1"} borderColor={plan.mode === mode ? "$primary8" : "$grey3"} borderWidth={1} color="$text11" icon={<Icon size={15} />} onPress={() => setMode(mode)}>{PLAN_COPY[mode].name}</Button>)}</XStack></Section>
      <View height={1} backgroundColor="$grey3" />
      <Section title="Horario" description="Elige la hora y el minuto en que este plan estará activo."><XStack space="$3"><TimeControl label="Empieza" value={plan.schedule.startMinute} onPress={() => setTimePicker("start")} /><TimeControl label="Termina" value={plan.schedule.endMinute} onPress={() => setTimePicker("end")} /></XStack></Section>
      <View height={1} backgroundColor="$grey3" />
      <Section title="Apps bloqueadas" description="Estas apps se pausarán mientras el plan esté activo."><XStack alignItems="center" justifyContent="space-between"><SizableText color="$text6">Seleccionadas: {selectedBlockedApps.length}</SizableText><Button circular size="$3" icon={<Plus size={17} />} onPress={() => { setSearch(""); setPicker("blocked"); }} /></XStack><SelectedApps apps={selectedBlockedApps} onRemove={(app) => removeApp(app.packageName, "blocked")} empty="Agrega las apps que quieres pausar." /><XStack alignItems="center" space="$2" paddingTop="$1"><SizableText color="$text6" flex={1}>Para recuperar estas apps, completa</SizableText><MinutesInput value={plan.productiveMinutes} onChange={(productiveMinutes) => setPlan((current) => ({ ...current, productiveMinutes }))} /><SizableText color="$text6">min</SizableText></XStack></Section>
      <View height={1} backgroundColor="$grey3" />
      <Section title="Apps de reemplazo" description="El tiempo en estas apps hace avanzar tu contador."><XStack alignItems="center" justifyContent="space-between"><SizableText color="$text6">Seleccionadas: {selectedProductiveApps.length}</SizableText><Button circular size="$3" icon={<Plus size={17} />} onPress={() => { setSearch(""); setPicker("productive"); }} /></XStack><SelectedApps apps={selectedProductiveApps} onRemove={(app) => removeApp(app.packageName, "productive")} empty="Agrega las apps que usarás en su lugar." /><XStack alignItems="center" space="$2" paddingTop="$1"><SizableText color="$text6" flex={1}>Al completar, desbloqueas</SizableText><MinutesInput value={plan.unlockMinutes} onChange={(unlockMinutes) => setPlan((current) => ({ ...current, unlockMinutes }))} /><SizableText color="$text6">min</SizableText></XStack></Section>
    </ShadowCard>
    <Button size="$5" backgroundColor="$primary9" color="white" disabled={saving} icon={<Check size={18} />} onPress={() => void save()}>{saving ? "Guardando..." : planId ? "Guardar cambios" : "Activar plan"}</Button>
    <TimePickerSheet open={timePicker !== null} target={timePicker} value={timePicker === "start" ? plan.schedule.startMinute : plan.schedule.endMinute} onChange={setTimePart} onClose={() => setTimePicker(null)} />
    <AppPicker open={picker !== null} type={picker} apps={filteredApps} selectedPackages={pickerPackages} onToggle={toggleApp} onClose={() => setPicker(null)} search={search} onSearch={setSearch} />
  </YStack></Container>;
}

function PlanHeader({ title }: { title: string }) {
  return <XStack alignItems="center" justifyContent="space-between" paddingHorizontal="$4" paddingVertical="$3" backgroundColor="$background1" borderBottomWidth={1} borderColor="$grey3"><Button circular chromeless size="$3" icon={<ArrowLeft size={20} />} onPress={() => router.back()} /><H4 color="$text11">{title}</H4><View width={36} /></XStack>;
}

function TimeControl({ label, value, onPress }: { label: string; value: number; onPress: () => void }) {
  return <YStack flex={1} space="$1"><SizableText color="$text6">{label}</SizableText><Button justifyContent="space-between" iconAfter={<Clock3 size={16} />} onPress={onPress}>{formatPlanTime(value)}</Button></YStack>;
}

function MinutesInput({ value, onChange }: { value: number; onChange: (value: number) => void }) {
  return <Input width={58} textAlign="center" value={String(value)} onChangeText={(nextValue) => onChange(Number(nextValue.replace(/[^0-9]/g, "")) || 1)} keyboardType="number-pad" />;
}

function TimePickerSheet({ open, target, value, onChange, onClose }: { open: boolean; target: "start" | "end" | null; value: number; onChange: (part: "hour" | "minute", value: number) => void; onClose: () => void }) {
  const hour = Math.floor(value / 60);
  const minute = value % 60;
  return <Sheet modal open={open} onOpenChange={(nextOpen: boolean) => { if (!nextOpen) onClose(); }} snapPoints={[85]} dismissOnSnapToBottom><Sheet.Overlay /><Sheet.Frame padding="$4" backgroundColor="$background1"><Sheet.Handle /><YStack space="$3" flex={1}><XStack alignItems="center" justifyContent="space-between"><YStack><H4 color="$text11">{target === "start" ? "Hora de inicio" : "Hora de finalización"}</H4><Paragraph color="$text6">{formatPlanTime(value)}</Paragraph></YStack><Button chromeless size="$3" onPress={onClose}>Listo</Button></XStack><Sheet.ScrollView><YStack space="$4" paddingBottom="$4"><YStack space="$2"><SizableText color="$text6" fontWeight="800">HORA</SizableText><XStack flexWrap="wrap">{HOURS.map((item) => <View key={item} width="16.66%" padding="$1"><Button size="$3" backgroundColor={item === hour ? "$primary4" : "$background1"} borderColor={item === hour ? "$primary8" : "$grey3"} borderWidth={1} color="$text11" onPress={() => onChange("hour", item)}>{String(item).padStart(2, "0")}</Button></View>)}</XStack></YStack><YStack space="$2"><SizableText color="$text6" fontWeight="800">MINUTO</SizableText><XStack flexWrap="wrap">{MINUTES.map((item) => <View key={item} width="16.66%" padding="$1"><Button size="$3" backgroundColor={item === minute ? "$primary4" : "$background1"} borderColor={item === minute ? "$primary8" : "$grey3"} borderWidth={1} color="$text11" onPress={() => onChange("minute", item)}>{String(item).padStart(2, "0")}</Button></View>)}</XStack></YStack></YStack></Sheet.ScrollView></YStack></Sheet.Frame></Sheet>;
}

function SelectedApps({ apps, empty, onRemove }: { apps: AndroidBlockableApp[]; empty: string; onRemove: (app: AndroidBlockableApp) => void }) {
  if (!apps.length) return <Paragraph color="$text6">{empty}</Paragraph>;
  return <YStack space="$2">{apps.map((app) => <XStack key={app.packageName} alignItems="center" space="$2" backgroundColor="$grey1" borderRadius="$3" padding="$2">{app.iconBase64 ? <Image source={{ uri: `data:image/png;base64,${app.iconBase64}` }} style={{ width: 34, height: 34, borderRadius: 9 }} /> : <View width={34} height={34} borderRadius="$2" backgroundColor="$grey3" />}<SizableText flex={1} color="$text11" fontWeight="800" numberOfLines={1}>{app.name}</SizableText><Button circular chromeless size="$2" icon={<X size={15} />} onPress={() => onRemove(app)} /></XStack>)}</YStack>;
}

function AppPicker({ open, type, apps, selectedPackages, search, onSearch, onToggle, onClose }: { open: boolean; type: "blocked" | "productive" | null; apps: AndroidBlockableApp[]; selectedPackages: string[]; search: string; onSearch: (value: string) => void; onToggle: (packageName: string) => void; onClose: () => void }) {
  return <Sheet modal open={open} onOpenChange={(nextOpen: boolean) => { if (!nextOpen) onClose(); }} snapPoints={[85]} dismissOnSnapToBottom><Sheet.Overlay /><Sheet.Frame padding="$4" backgroundColor="$background1"><Sheet.Handle /><YStack space="$3" flex={1}><XStack alignItems="center" justifyContent="space-between"><YStack><H4 color="$text11">{type === "blocked" ? "Apps bloqueadas" : "Apps de reemplazo"}</H4><Paragraph color="$text6">Selecciona todas las que necesites.</Paragraph></YStack><Button chromeless size="$3" onPress={onClose}>Listo</Button></XStack><Input value={search} onChangeText={onSearch} placeholder="Buscar una app" /><Sheet.ScrollView>{apps.map((app) => { const selected = selectedPackages.includes(app.packageName); return <XStack key={app.packageName} alignItems="center" space="$3" paddingVertical="$2" borderBottomWidth={1} borderColor="$grey3" onPress={() => onToggle(app.packageName)}>{app.iconBase64 ? <Image source={{ uri: `data:image/png;base64,${app.iconBase64}` }} style={{ width: 40, height: 40, borderRadius: 10 }} /> : <View width={40} height={40} borderRadius="$2" backgroundColor="$grey3" />}<YStack flex={1}><SizableText color="$text11" fontWeight="800">{app.name}</SizableText><SizableText color="$text6" fontSize="$2" numberOfLines={1}>{app.packageName}</SizableText></YStack><View width={24} height={24} borderRadius={99} alignItems="center" justifyContent="center" backgroundColor={selected ? "$primary9" : "$grey3"}>{selected && <Check color="white" size={15} />}</View></XStack>; })}</Sheet.ScrollView></YStack></Sheet.Frame></Sheet>;
}
