import {
  AppWindow,
  ArrowLeft,
  Ban,
  Bell,
  Check,
  ChevronRight,
  Clock3,
  Focus,
  Layers,
  ListChecks,
  Pause,
  Plus,
  Repeat2,
  ShieldCheck,
  ShieldBan,
  Smartphone,
  Target,
  Timer,
  Trash2,
} from "@tamagui/lucide-icons";
import {
  configureRewardBlockerPlans,
  getInstalledApps,
  getPermissionStatus,
  openOverlaySettings,
  openUsageStatsSettings,
  startMonitoring,
  stopMonitoring,
} from "expo-app-blocker";
import type { AndroidBlockableApp } from "expo-app-blocker";
import { router, useLocalSearchParams } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { Alert, AppState, Image, Linking, Modal, PermissionsAndroid, Platform, Pressable, StyleSheet } from "react-native";
import {
  Button,
  H3,
  H4,
  Input,
  Paragraph,
  ScrollView,
  SizableText,
  View,
  XStack,
  YStack,
} from "tamagui";

import { AppAvatarStack, GradientButton, ModeRadial } from "../components/mode-ui";
import { AppPickerSheet, AppSelectionList } from "../components/app-picker-sheet";
import { ActionSuccessModal } from "../components/action-success-modal";
import { CategoryGlyph, CategorySelector } from "../components/category-selector";
import type { CategoryOption } from "../components/category-selector";
import { GlassMinutePicker, ScheduleCard } from "../components/schedule-card";
import { ShadowCard } from "../components/shadow.card";
import { Container } from "../components/container";
import {
  PLAN_CATEGORY_COPY,
  createAndroidRewardPlan,
  loadAndroidRewardPlans,
  nativeModeForCategory,
  pruneUnavailablePlanApps,
  saveAndroidRewardPlans,
  toNativeRewardPlansConfig,
} from "../data/android-reward";
import type { AndroidRewardPlan, PlanCategory, PlanCustomCategory } from "../data/android-reward";
import { markOnboardingCompleted } from "../data/onboarding-state";
import { deleteMode, syncModes, syncOnboarding, trackProductEvent } from "../data/supabase-sync";

const durationOptions = [15, 25, 60];
const phoneUseOptions = [1, 2, 4, 8];
const categories: PlanCategory[] = ["focus", "exercise", "sleep", "meditation", "hobby"];
const goals = ["Dejar redes", "Concentrar mas", "Dormir", "Hacer otra actividad", "Otro"];
const objectiveOptions = ["Foco", "Ejercicio", "Dormir", "Meditacion", "Hobby"];

type PickerTarget = "blocked" | "productive" | null;
type AndroidPermissionState = { notifications: boolean; overlay: boolean; usageStats: boolean };

type ActionFeedback = {
  celebration?: boolean;
  message: string;
  title: string;
} | null;

function categoryForGoal(goal: string): PlanCategory {
  if (goal === "Dormir") return "sleep";
  if (goal === "Hacer otra actividad") return "hobby";
  return "focus";
}

function planHasOverlap(plan: AndroidRewardPlan, plans: AndroidRewardPlan[]) {
  return plans.some((other) => {
    if (other.id === plan.id || !other.enabled) return false;
    return [1, 2, 3, 4, 5, 6, 7].some((weekday) =>
      Array.from({ length: 1440 }).some((_, minute) =>
        planIsActiveAt(plan, weekday, minute) && planIsActiveAt(other, weekday, minute),
      ),
    );
  });
}

function planIsActiveAt(plan: AndroidRewardPlan, weekday: number, minute: number) {
  const { startMinute, endMinute } = plan.schedule;
  if (startMinute < endMinute) {
    return plan.weekdays.includes(weekday as 1 | 2 | 3 | 4 | 5 | 6 | 7) && minute >= startMinute && minute < endMinute;
  }
  const scheduleWeekday = minute >= startMinute ? weekday : weekday === 1 ? 7 : weekday - 1;
  return plan.weekdays.includes(scheduleWeekday as 1 | 2 | 3 | 4 | 5 | 6 | 7) && (minute >= startMinute || minute < endMinute);
}

function DurationChips({ value, onChange }: { value: number; onChange: (minutes: number) => void }) {
  const [customOpen, setCustomOpen] = useState(false);
  const customSelected = !durationOptions.includes(value);
  const customActive = customOpen || customSelected;

  return (
    <YStack gap="$2" width="100%">
      <XStack gap="$2" width="100%">
        {durationOptions.map((minutes) => {
          const selected = minutes === value;
          return (
            <Button
              key={minutes}
              unstyled
              alignItems="center"
              backgroundColor={selected ? "$primary9" : "$background2"}
              borderColor={selected ? "$primary9" : "$borderColor"}
              borderRadius="$10"
              borderWidth={1}
              flex={1}
              justifyContent="center"
              minWidth={0}
              paddingHorizontal="$1"
              paddingVertical="$2.5"
              pressStyle={{ opacity: 0.8 }}
              onPress={() => {
                setCustomOpen(false);
                onChange(minutes);
              }}
            >
              <SizableText
                color={selected ? "white" : "$text11"}
                fontWeight="700"
                maxFontSizeMultiplier={1.1}
                size="$4"
              >
                {minutes} min
              </SizableText>
            </Button>
          );
        })}
        <Button
          unstyled
          alignItems="center"
          backgroundColor={customActive ? "$primary9" : "$background2"}
          borderColor={customActive ? "$primary9" : "$borderColor"}
          borderRadius="$10"
          borderWidth={1}
          flex={1}
          justifyContent="center"
          minWidth={0}
          paddingHorizontal="$1"
          paddingVertical="$2.5"
          pressStyle={{ opacity: 0.8 }}
          onPress={() => {
            setCustomOpen((open) => !open);
          }}
        >
          <SizableText
            color={customActive ? "white" : "$text11"}
            fontWeight="700"
            maxFontSizeMultiplier={1.1}
            size="$4"
          >
            {customSelected ? `${value} min` : "Custom"}
          </SizableText>
        </Button>
      </XStack>

      <Modal
        animationType="fade"
        statusBarTranslucent
        transparent
        visible={customOpen}
        onRequestClose={() => setCustomOpen(false)}
      >
        <Pressable style={durationPickerStyles.backdrop} onPress={() => setCustomOpen(false)}>
          <Pressable onPress={(event) => event.stopPropagation()}>
            <GlassMinutePicker value={value} onChange={onChange} />
          </Pressable>
        </Pressable>
      </Modal>
    </YStack>
  );
}

function OnboardingProgress({ step }: { step: number }) {
  const progressWidth = `${Math.max(8, Math.min(100, step * 10))}%` as `${number}%`;

  return (
    <View backgroundColor="$primary3" borderRadius={99} height={7} overflow="hidden" width="100%">
      <View backgroundColor="$primary9" borderRadius={99} height="100%" width={progressWidth} />
    </View>
  );
}

function Header({ onBack, title }: { onBack: () => void; title?: string }) {
  return (
    <XStack alignItems="center" justifyContent="space-between" marginBottom="$5">
      <Button
        unstyled
        alignItems="center"
        backgroundColor="$background2"
        borderColor="$borderColor"
        borderRadius={99}
        borderWidth={1}
        height={42}
        justifyContent="center"
        pressStyle={{ opacity: 0.7 }}
        width={42}
        onPress={onBack}
      >
        <ArrowLeft color="$text11" size={21} />
      </Button>
      {title ? <SizableText color="$text11" fontWeight="800">{title}</SizableText> : <View width={42} />}
      {title ? <View width={42} /> : <View width={42} />}
    </XStack>
  );
}

export default function OnboardingScreen() {
  const { mode, planId } = useLocalSearchParams<{ mode?: string; planId?: string }>();
  const [apps, setApps] = useState<AndroidBlockableApp[]>([]);
  const [plans, setPlans] = useState<AndroidRewardPlan[]>([]);
  const [plan, setPlan] = useState<AndroidRewardPlan>(() => createAndroidRewardPlan("focus"));
  const [pickerTarget, setPickerTarget] = useState<PickerTarget>(null);
  const [step, setStep] = useState(Boolean(planId) || mode === "create" ? 10 : 0);
  const [phoneUse, setPhoneUse] = useState(2);
  const [goal, setGoal] = useState("Concentrar mas");
  const [customGoal, setCustomGoal] = useState("");
  const [objectives, setObjectives] = useState<string[]>([]);
  const [creating, setCreating] = useState(false);
  const [feedback, setFeedback] = useState<ActionFeedback>(null);
  const [permissions, setPermissions] = useState<AndroidPermissionState | null>(null);
  const isEditing = Boolean(planId);
  const isCreatingMode = mode === "create";
  const isDirectEditor = isEditing || isCreatingMode;

  useEffect(() => {
    if (Platform.OS !== "android") return;
    void Promise.all([loadAndroidRewardPlans(), getInstalledApps(), getPermissionStatus()]).then(async ([savedPlans, installedApps, permissionStatus]) => {
      const currentPlans = pruneUnavailablePlanApps(savedPlans, installedApps.map((app) => app.packageName));
      if (currentPlans.some((savedPlan, index) => savedPlan !== savedPlans[index])) {
        await saveAndroidRewardPlans(currentPlans);
        configureRewardBlockerPlans(toNativeRewardPlansConfig(currentPlans));
      }
      setPlans(currentPlans);
      setApps(installedApps);
      if (permissionStatus.details.platform === "android") setPermissions(permissionStatus.details);
      if (planId) {
        const existing = currentPlans.find((entry) => entry.id === planId);
        if (existing) setPlan(existing);
      }
    });
  }, [planId]);

  useEffect(() => {
    if (Platform.OS !== "android") return;
    const refresh = () => {
      void getPermissionStatus().then((status) => {
        if (status.details.platform === "android") setPermissions(status.details);
      });
    };
    const subscription = AppState.addEventListener("change", (nextState) => {
      if (nextState === "active") refresh();
    });
    return () => subscription.remove();
  }, []);

  useEffect(() => {
    if (step !== 9 || isDirectEditor) return;
    setCreating(true);
    const timeout = setTimeout(() => {
      setCreating(false);
      setStep(10);
    }, 1000);
    return () => clearTimeout(timeout);
  }, [isDirectEditor, step]);

  const selectedApps = (packages: string[]) => apps.filter((app) => packages.includes(app.packageName));

  const setCategory = (category: PlanCategory) => {
    setPlan((current) => {
      const copy = PLAN_CATEGORY_COPY[category];
      return {
        ...current,
        category,
        mode: nativeModeForCategory(category),
        name: copy.name,
        selectedCategoryId: category,
      };
    });
  };

  const selectCustomCategory = (category: PlanCustomCategory) => {
    setPlan((current) => ({
      ...current,
      category: "focus",
      mode: "focus",
      name: category.label,
      selectedCategoryId: category.id,
    }));
  };

  const addCustomCategory = (category: PlanCustomCategory) => {
    setPlan((current) => ({
      ...current,
      category: "focus",
      customCategories: [...current.customCategories, category],
      mode: "focus",
      name: category.label,
      selectedCategoryId: category.id,
    }));
  };

  const togglePackages = (key: "blockedPackages" | "productivePackages", packageName: string) => {
    const otherKey = key === "blockedPackages" ? "productivePackages" : "blockedPackages";
    setPlan((current) => {
      const values = current[key];
      const next = values.includes(packageName)
        ? values.filter((entry) => entry !== packageName)
        : [...values, packageName];
      return { ...current, [key]: next, [otherKey]: current[otherKey].filter((entry) => entry !== packageName) };
    });
  };

  const savePlan = async (enabled: boolean) => {
    if (!plan.name.trim()) {
      Alert.alert("Agrega un nombre", "El modo necesita un nombre para poder guardarse.");
      return;
    }
    if (plan.blockedPackages.length === 0) {
      Alert.alert("Selecciona apps", "Elige al menos una app que quieras bloquear.");
      return;
    }
    if (plan.schedule.startMinute === plan.schedule.endMinute) {
      Alert.alert("Revisa el horario", "La hora de inicio y la hora de fin deben ser diferentes.");
      return;
    }

    const nextPlan = { ...plan, enabled, paused: false };
    if (enabled && planHasOverlap(nextPlan, plans)) {
      Alert.alert("Horario ocupado", "Ya existe otro modo activo en ese horario.");
      return;
    }

    const nextPlans = plans.some((entry) => entry.id === nextPlan.id)
      ? plans.map((entry) => (entry.id === nextPlan.id ? nextPlan : entry))
      : [...plans, nextPlan];

    try {
      await saveAndroidRewardPlans(nextPlans);
      if (!isDirectEditor) await markOnboardingCompleted();
      configureRewardBlockerPlans(toNativeRewardPlansConfig(nextPlans));
      if (enabled) startMonitoring();
      void syncModes(nextPlans).catch((error: unknown) => console.warn("Unable to sync modes", error));
      if (isDirectEditor) {
        void trackProductEvent(isEditing ? "mode_updated" : "mode_created", {
          category: nextPlan.category,
          enabled,
        }).catch((error: unknown) => console.warn("Unable to track mode", error));
      } else {
        void Promise.all([
          syncOnboarding({
            blockedAppCount: nextPlan.blockedPackages.length,
            customGoal: goal === "Otro" ? customGoal.trim() : null,
            goal,
            objectives,
            phoneUseHours: phoneUse,
            productiveAppCount: nextPlan.productivePackages.length,
            productiveMinutes: nextPlan.productiveMinutes,
            unlockMinutes: nextPlan.unlockMinutes,
          }),
          trackProductEvent("onboarding_completed", {
            blockedAppCount: nextPlan.blockedPackages.length,
            goal,
            productiveAppCount: nextPlan.productivePackages.length,
          }),
          trackProductEvent("mode_created", { category: nextPlan.category, enabled }),
        ]).catch((error: unknown) => console.warn("Unable to sync onboarding", error));
      }
      setPlan(nextPlan);
      setPlans(nextPlans);
      setFeedback(isDirectEditor
        ? {
            message: isEditing
              ? "Los cambios de tu modo ya están guardados."
              : "Tu nuevo modo ya está guardado y listo para usar.",
            title: isEditing ? "Modo actualizado" : "Modo creado",
          }
        : {
            celebration: true,
            message: "Tu primer modo está listo. Puedes activarlo o cambiarlo cuando quieras.",
            title: "¡Tu rehábito comienza ahora!",
          });
    } catch {
      Alert.alert("No se pudo guardar", "Intenta guardar el modo de nuevo.");
    }
  };

  const pausePlan = async () => {
    if (!isEditing) return;
    const pausedPlan = { ...plan, enabled: false, paused: true };
    const nextPlans = plans.map((entry) => (entry.id === pausedPlan.id ? pausedPlan : entry));

    try {
      await saveAndroidRewardPlans(nextPlans);
      configureRewardBlockerPlans(toNativeRewardPlansConfig(nextPlans));
      if (!nextPlans.some((entry) => entry.enabled)) stopMonitoring();
      setPlan(pausedPlan);
      setPlans(nextPlans);
      void syncModes(nextPlans).catch((error: unknown) => console.warn("Unable to sync paused mode", error));
      void trackProductEvent("mode_paused", { category: pausedPlan.category }).catch((error: unknown) =>
        console.warn("Unable to track mode pause", error),
      );
      setFeedback({
        message: "El modo dejó de bloquear aplicaciones. Su configuración se conserva.",
        title: "Modo pausado",
      });
    } catch {
      Alert.alert("No se pudo pausar", "Intenta pausar el modo de nuevo.");
    }
  };

  const performDeletePlan = async () => {
    if (!isEditing) return;
    const nextPlans = plans.filter((entry) => entry.id !== plan.id);

    try {
      await saveAndroidRewardPlans(nextPlans);
      configureRewardBlockerPlans(toNativeRewardPlansConfig(nextPlans));
      if (!nextPlans.some((entry) => entry.enabled)) stopMonitoring();
      setPlans(nextPlans);
      void deleteMode(plan.id).catch((error: unknown) => console.warn("Unable to delete remote mode", error));
      void trackProductEvent("mode_deleted", { category: plan.category }).catch((error: unknown) =>
        console.warn("Unable to track mode deletion", error),
      );
      setFeedback({
        message: "El modo y su configuración fueron eliminados.",
        title: "Modo eliminado",
      });
    } catch {
      Alert.alert("No se pudo eliminar", "Intenta eliminar el modo de nuevo.");
    }
  };

  const deletePlan = () => {
    if (!isEditing) return;
    Alert.alert(
      "Eliminar modo",
      `¿Quieres eliminar ${plan.name}? Esta acción no se puede deshacer.`,
      [
        { style: "cancel", text: "Cancelar" },
        { style: "destructive", text: "Eliminar", onPress: () => void performDeletePlan() },
      ],
    );
  };

  const closeFeedback = () => {
    setFeedback(null);
    router.replace("/(tabs)/overview");
  };

  const continueOnboarding = () => {
    if (step === 0) {
      void trackProductEvent("onboarding_started").catch((error: unknown) => console.warn("Unable to track onboarding", error));
    }
    if (step === 3) setCategory(categoryForGoal(goal));
    if (step === 4 && (!permissions?.overlay || !permissions?.usageStats)) return;
    setStep((current) => Math.min(current + 1, 10));
  };

  const goBack = () => {
    if (isDirectEditor) {
      router.back();
      return;
    }
    if (step === 0) router.back();
    else setStep((current) => current - 1);
  };

  const updateTime = (key: "start" | "end", value: number) => {
    setPlan((current) => {
      if (key === "start") return { ...current, schedule: { ...current.schedule, startMinute: value } };
      return { ...current, schedule: { ...current.schedule, endMinute: value } };
    });
  };

  if (Platform.OS !== "android") {
    return (
      <Container>
        <Paragraph>Esta experiencia esta disponible en Android.</Paragraph>
      </Container>
    );
  }

  if (isDirectEditor) {
    return (
      <>
        <Editor
          apps={apps}
          isEditing={isEditing}
          pickerTarget={pickerTarget}
          plan={plan}
          setPickerTarget={setPickerTarget}
          setPlan={setPlan}
          setCategory={setCategory}
          addCustomCategory={addCustomCategory}
          selectCustomCategory={selectCustomCategory}
          togglePackages={togglePackages}
          selectedApps={selectedApps}
          updateTime={updateTime}
          title={isCreatingMode ? "Crear modo" : "Editar modo"}
          onBack={() => router.back()}
          onDelete={deletePlan}
          onPause={pausePlan}
          onSave={savePlan}
        />
        <ActionSuccessModal
          message={feedback?.message ?? ""}
          title={feedback?.title ?? ""}
          visible={feedback !== null}
          onClose={closeFeedback}
        />
      </>
    );
  }

  return (
    <>
      <Container scroll={false}>
        <StatusBar style="dark" />
        <YStack flex={1} paddingTop="$3">
        {step > 0 && <Header onBack={goBack} />}
        {step > 0 && <OnboardingProgress step={step} />}
        <View flex={1} marginTop={step > 0 ? "$5" : 0}>
          {step === 0 && (
            <WelcomeScreen onContinue={continueOnboarding} />
          )}
          {step === 1 && (
            <QuestionScreen
              body="Usaremos esta referencia para proponerte un plan inicial. Puedes cambiarlo despues."
              icon={<Smartphone color="$primary9" size={38} />}
              title="Cuanto tiempo pasas en tu telefono?"
            >
              <XStack flexWrap="wrap" gap="$3">
                {phoneUseOptions.map((hours) => (
                  <ChoiceChip key={hours} selected={phoneUse === hours} label={`${hours} h`} onPress={() => setPhoneUse(hours)} />
                ))}
              </XStack>
            </QuestionScreen>
          )}
          {step === 2 && (
            <QuestionScreen body="Elige el primer periodo que quieres recuperar." icon={<Timer color="$primary9" size={38} />} title="Cuanto tiempo quieres dejar de usar el telefono?">
              <DurationChips value={plan.unlockMinutes} onChange={(unlockMinutes) => setPlan((current) => ({ ...current, unlockMinutes }))} />
            </QuestionScreen>
          )}
          {step === 3 && (
            <QuestionScreen body="El plan se adapta a la intencion que elijas." icon={<Target color="$primary9" size={38} />} title="Que quieres lograr?">
              <YStack gap="$3">
                {goals.map((option) => (
                  <ChoiceRow key={option} selected={goal === option} label={option} onPress={() => setGoal(option)} />
                ))}
                {goal === "Otro" && (
                  <Input
                    backgroundColor="$background2"
                    borderColor="$borderColor"
                    placeholder="Escribe tu objetivo"
                    value={customGoal}
                    onChangeText={setCustomGoal}
                  />
                )}
              </YStack>
            </QuestionScreen>
          )}
          {step === 4 && (
            <PermissionsScreen
              permissions={permissions}
              onRefresh={() => void getPermissionStatus().then((status) => {
                if (status.details.platform === "android") setPermissions(status.details);
              })}
            />
          )}
          {step === 5 && (
            <QuestionScreen body="Elige uno o varios objetivos para tu plan." icon={<ListChecks color="$primary9" size={38} />} title="Selecciona tus objetivos">
              <YStack gap="$3">
                {objectiveOptions.map((option) => (
                  <ChoiceRow
                    key={option}
                    selected={objectives.includes(option)}
                    label={option}
                    onPress={() => setObjectives((current) => current.includes(option) ? current.filter((entry) => entry !== option) : [...current, option])}
                  />
                ))}
              </YStack>
            </QuestionScreen>
          )}
          {step === 6 && (
            <QuestionScreen body="Podras ajustarlas cuando quieras." icon={<Ban color="$primary9" size={38} />} title="Que apps quisieras dejar de usar mas?">
              <AppSelectionList
                apps={apps}
                height={360}
                selectedPackages={plan.blockedPackages}
                onToggle={(item) => togglePackages("blockedPackages", item)}
              />
            </QuestionScreen>
          )}
          {step === 7 && (
            <QuestionScreen body="Este es el tiempo que tendras para estar en tu estado antes de liberar las redes." icon={<Clock3 color="$primary9" size={38} />} title="Cuanto tiempo quieres dejar de usar esas apps?">
              <ModeRadial duration={plan.productiveMinutes} label="tu estado" />
              <DurationChips value={plan.productiveMinutes} onChange={(productiveMinutes) => setPlan((current) => ({ ...current, productiveMinutes }))} />
            </QuestionScreen>
          )}
          {step === 8 && (
            <QuestionScreen body="Estas apps se habilitan mientras mantienes tu estado." icon={<Repeat2 color="$primary9" size={38} />} title="Con que app te gustaria reemplazar ese tiempo?">
              <AppSelectionList
                apps={apps}
                height={360}
                selectedPackages={plan.productivePackages}
                onToggle={(item) => togglePackages("productivePackages", item)}
              />
            </QuestionScreen>
          )}
          {step === 9 && <CreatingScreen visible={creating} />}
          {step === 10 && (
            <PlanPreview
              plan={plan}
              selectedApps={selectedApps}
              onEdit={() => setStep(1)}
              onSave={() => void savePlan(false)}
            />
          )}
        </View>
        {step > 0 && step < 9 && (
          <View marginTop="$4">
            <GradientButton disabled={step === 4 && permissions?.overlay !== true || step === 4 && permissions?.usageStats !== true} onPress={continueOnboarding}>
              {step === 4 ? "Activar Rehabbit" : "Continuar"}
            </GradientButton>
          </View>
        )}
        </YStack>
      </Container>
      <ActionSuccessModal
        celebration={feedback?.celebration}
        message={feedback?.message ?? ""}
        title={feedback?.title ?? ""}
        visible={feedback !== null}
        onClose={closeFeedback}
      />
    </>
  );
}

function WelcomeScreen({ onContinue }: { onContinue: () => void }) {
  return (
    <YStack flex={1} justifyContent="space-between" paddingBottom="$5" paddingTop="$8">
      <YStack alignItems="center" gap="$6">
        <View
          alignItems="center"
          backgroundColor="$primary3"
          borderColor="$primary5"
          borderRadius={99}
          borderWidth={1}
          height={92}
          justifyContent="center"
          width={92}
        >
          <Image
            source={require("../assets/images/rehabbit-logo.png")}
            style={{ borderRadius: 24, height: 78, width: 78 }}
          />
        </View>
        <YStack alignItems="center" gap="$3" paddingHorizontal="$4">
          <H3 color="$text11" textAlign="center">Recupera tu atencion</H3>
          <Paragraph color="$text10" fontSize="$5" lineHeight="$6" textAlign="center">
            Crea un estado para bloquear distracciones y dedicar tiempo a lo que importa.
          </Paragraph>
        </YStack>
      </YStack>
      <GradientButton onPress={onContinue}>Empezar</GradientButton>
    </YStack>
  );
}

function QuestionScreen({ body, children, icon, title }: { body: string; children: ReactNode; icon: ReactNode; title: string }) {
  return (
    <YStack gap="$5">
      <YStack alignItems="center" gap="$3">
        <View alignItems="center" backgroundColor="$primary3" borderRadius={24} height={80} justifyContent="center" width={80}>
          {icon}
        </View>
        <YStack alignItems="center" gap="$2" paddingHorizontal="$2">
          <H3 color="$text11" letterSpacing={-0.4} textAlign="center">{title}</H3>
          <Paragraph color="$text10" fontSize="$5" lineHeight="$6" textAlign="center">{body}</Paragraph>
        </YStack>
      </YStack>
      {children}
    </YStack>
  );
}

function ChoiceChip({ label, selected, onPress }: { label: string; selected: boolean; onPress: () => void }) {
  return (
    <Button
      unstyled
      alignItems="center"
      backgroundColor={selected ? "#483FFF" : "#FFFFFF"}
      borderColor={selected ? "#483FFF" : "#E2E8F0"}
      borderRadius="$10"
      borderWidth={1}
      justifyContent="center"
      minWidth={72}
      paddingHorizontal="$4"
      paddingVertical="$3"
      pressStyle={{ opacity: 0.75 }}
      onPress={onPress}
    >
      <SizableText color={selected ? "white" : "$text11"} fontWeight="800">{label}</SizableText>
    </Button>
  );
}

function ChoiceRow({ label, selected, onPress }: { label: string; selected: boolean; onPress: () => void }) {
  return (
    <Button
      unstyled
      alignItems="center"
      backgroundColor={selected ? "#483FFF" : "#FFFFFF"}
      borderColor={selected ? "#483FFF" : "#E2E8F0"}
      borderRadius="$6"
      borderWidth={1}
      flexDirection="row"
      padding="$4"
      pressStyle={{ opacity: 0.75 }}
      onPress={onPress}
    >
      <SizableText color={selected ? "white" : "$text11"} fontWeight="700" size="$5">{label}</SizableText>
    </Button>
  );
}

function PermissionsScreen({
  onRefresh,
  permissions,
}: {
  onRefresh: () => void;
  permissions: AndroidPermissionState | null;
}) {
  return (
    <YStack flex={1} gap="$4">
      <YStack alignItems="center" height="15%" justifyContent="center" minHeight={92}>
        <View
          alignItems="center"
          backgroundColor="$primary3"
          borderRadius={28}
          height={88}
          justifyContent="center"
          width={88}
        >
          <ShieldCheck color="$primary9" size={52} strokeWidth={1.8} />
        </View>
      </YStack>
      <YStack alignItems="center" gap="$2" paddingHorizontal="$3">
        <H3 color="$text11" fontSize={24} lineHeight={29} maxFontSizeMultiplier={1.1} textAlign="center">
          Un último paso para activar Rehabbit
        </H3>
        <Paragraph color="$text10" fontSize={17} lineHeight={24} maxFontSizeMultiplier={1.1} textAlign="center">
          Necesitamos estos permisos para que el bloqueo funcione correctamente.
        </Paragraph>
      </YStack>
      <YStack gap="$3">
        <PermissionRow
          description="Detecta cuándo abres una app bloqueada."
          granted={permissions?.usageStats === true}
          icon={<AppWindow color="#315BEA" size={24} />}
          title="Acceso de uso"
          onPress={openUsageStatsSettings}
        />
        <PermissionRow
          description="Muestra la pantalla de bloqueo."
          granted={permissions?.overlay === true}
          icon={<Layers color="#315BEA" size={24} />}
          title="Mostrar sobre otras apps"
          onPress={openOverlaySettings}
        />
        <PermissionRow
          badgeLabel="Opcional"
          description="Estado y avisos del modo activo."
          granted={permissions?.notifications === true}
          icon={<Bell color="#315BEA" size={24} />}
          title="Notificaciones"
          onPress={async () => {
            if (Number(Platform.Version) >= 33) {
              await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS);
            } else {
              await Linking.openSettings();
            }
            onRefresh();
          }}
        />
      </YStack>
    </YStack>
  );
}

function PermissionRow({
  badgeLabel,
  description,
  granted,
  icon,
  onPress,
  title,
}: {
  badgeLabel?: string;
  description: string;
  granted: boolean;
  icon: ReactNode;
  onPress: () => void;
  title: string;
}) {
  return (
    <YStack
      backgroundColor="white"
      borderRadius={20}
      elevation={3}
      shadowColor="#000000"
      shadowOffset={{ height: 4, width: 0 }}
      shadowOpacity={0.08}
      shadowRadius={18}
    >
      <Button
        unstyled
        alignItems="center"
        flexDirection="row"
        gap={0}
        height={110}
        paddingHorizontal={14}
        disabled={granted}
        onPress={onPress}
        pressStyle={{ opacity: 0.72 }}
      >
        <View
          alignItems="center"
          backgroundColor="#F2F4FF"
          borderRadius={14}
          flexShrink={0}
          height={48}
          justifyContent="center"
          marginRight={8}
          padding={0}
          width={48}
        >
          {icon}
        </View>
        <YStack flex={1} gap={3} justifyContent="center" minWidth={0}>
          <XStack alignItems="center" gap={6} minWidth={0}>
            <SizableText
              adjustsFontSizeToFit
              color="$text11"
              flexShrink={1}
              fontSize={16}
              fontWeight="700"
              maxFontSizeMultiplier={1}
              minimumFontScale={0.8}
              numberOfLines={1}
            >
              {title}
            </SizableText>
            {badgeLabel && (
              <XStack
                backgroundColor="#F1EFFF"
                borderRadius={999}
                flexShrink={0}
                paddingHorizontal={7}
                paddingVertical={3}
              >
                <SizableText color="#5B5CE2" fontSize={10} maxFontSizeMultiplier={1}>
                  {badgeLabel}
                </SizableText>
              </XStack>
            )}
          </XStack>
          <SizableText
            color="#667085"
            fontSize={14}
            lineHeight={19}
            maxFontSizeMultiplier={1.05}
            numberOfLines={2}
          >
            {description}
          </SizableText>
        </YStack>
        <View alignItems="center" flexShrink={0} height={48} justifyContent="center" width={28}>
          {granted ? <Check color="#315BEA" size={20} /> : <ChevronRight color="#315BEA" size={20} />}
        </View>
      </Button>
    </YStack>
  );
}

function CreatingScreen({ visible }: { visible: boolean }) {
  return (
    <YStack alignItems="center" flex={1} gap="$5" justifyContent="center" paddingBottom="$8">
      <View alignItems="center" backgroundColor="$blue2" borderRadius={99} height={82} justifyContent="center" width={82}>
        <Clock3 color="$text11" size={38} />
      </View>
      <YStack alignItems="center" gap="$2">
        <H3 color="$text11">Creando tu plan</H3>
        <Paragraph color="$text10" textAlign="center">Estamos preparando tus limites y alternativas.</Paragraph>
      </YStack>
      {visible && <View backgroundColor="$blue8" borderRadius={99} height={8} width={160} />}
    </YStack>
  );
}

function PlanPreview({
  plan,
  selectedApps,
  onEdit,
  onSave,
}: {
  plan: AndroidRewardPlan;
  selectedApps: (packages: string[]) => AndroidBlockableApp[];
  onEdit: () => void;
  onSave: () => void;
}) {
  const copy = PLAN_CATEGORY_COPY[plan.category];
  const customCategory = plan.customCategories.find((category) => category.id === plan.selectedCategoryId);
  const categoryLabel = customCategory?.label ?? copy.name;
  const categoryIcon = customCategory?.icon ?? plan.category;
  return (
    <YStack gap="$4">
      <YStack gap="$2">
        <H3 color="$text11">Tu plan esta listo</H3>
        <Paragraph color="$text10">Revisalo antes de guardarlo. Quedara inactivo hasta que decidas activarlo.</Paragraph>
      </YStack>
      <ShadowCard>
        <YStack gap="$4">
          <XStack alignItems="center" gap="$3">
            <View alignItems="center" backgroundColor="$blue2" borderRadius={99} height={46} justifyContent="center" width={46}>
              <CategoryGlyph icon={categoryIcon} size={22} />
            </View>
            <YStack flex={1}>
              <H4 color="$text11">{categoryLabel}</H4>
              <SizableText color="$text10">Inactivo</SizableText>
            </YStack>
          </XStack>
          <ModeRadial duration={plan.productiveMinutes} label={categoryLabel.toLowerCase()} size={184} />
          <XStack alignItems="center" justifyContent="space-between">
            <SizableText color="$text10">Bloquear</SizableText>
            <AppAvatarStack apps={selectedApps(plan.blockedPackages)} />
          </XStack>
          <XStack alignItems="center" justifyContent="space-between">
            <SizableText color="$text10">Rehabbit</SizableText>
            <AppAvatarStack apps={selectedApps(plan.productivePackages)} />
          </XStack>
        </YStack>
      </ShadowCard>
      <Button backgroundColor="$blue2" borderColor="$borderColor" color="$text11" onPress={onEdit}>Editar opciones</Button>
      <GradientButton onPress={onSave}>Guardar modo</GradientButton>
    </YStack>
  );
}

function Editor({
  apps,
  isEditing,
  pickerTarget,
  plan,
  setPickerTarget,
  setPlan,
  setCategory,
  addCustomCategory,
  selectCustomCategory,
  togglePackages,
  selectedApps,
  updateTime,
  title,
  onBack,
  onDelete,
  onPause,
  onSave,
}: {
  apps: AndroidBlockableApp[];
  isEditing: boolean;
  pickerTarget: PickerTarget;
  plan: AndroidRewardPlan;
  setPickerTarget: (target: PickerTarget) => void;
  setPlan: (update: (current: AndroidRewardPlan) => AndroidRewardPlan) => void;
  setCategory: (category: PlanCategory) => void;
  addCustomCategory: (category: PlanCustomCategory) => void;
  selectCustomCategory: (category: PlanCustomCategory) => void;
  togglePackages: (key: "blockedPackages" | "productivePackages", packageName: string) => void;
  selectedApps: (packages: string[]) => AndroidBlockableApp[];
  updateTime: (key: "start" | "end", value: number) => void;
  title: string;
  onBack: () => void;
  onDelete: () => void;
  onPause: () => Promise<void>;
  onSave: (enabled: boolean) => Promise<void>;
}) {
  const categoryOptions: CategoryOption[] = [
    ...categories.map((category) => ({
      icon: category,
      id: category,
      label: PLAN_CATEGORY_COPY[category].name,
    })),
    ...plan.customCategories.map((category) => ({
      icon: category.icon,
      id: category.id,
      label: category.label,
    })),
  ];

  return (
    <Container scroll={false}>
      <StatusBar style="dark" />
      <YStack flex={1} paddingTop="$3">
        <Header title={title} onBack={onBack} />
        <ScrollView showsVerticalScrollIndicator={false}>
          <YStack gap="$5" paddingBottom="$8">
            <YStack alignItems="center" gap="$3">
              <ModeRadial duration={plan.productiveMinutes} size={214} />
              <DurationChips value={plan.productiveMinutes} onChange={(productiveMinutes) => setPlan((current) => ({ ...current, productiveMinutes }))} />
            </YStack>

            <CategorySelector
              options={categoryOptions}
              selectedId={plan.selectedCategoryId}
              onAdd={addCustomCategory}
              onSelect={(option) => {
                const predefined = categories.find((category) => category === option.id);
                if (predefined) setCategory(predefined);
                else {
                  const custom = plan.customCategories.find((category) => category.id === option.id);
                  if (custom) selectCustomCategory(custom);
                }
              }}
            />

            <AppGroupCard
              apps={selectedApps(plan.blockedPackages)}
              description="Estas apps permanecen bloqueadas durante tu estado."
              label="Bloquear"
              onPress={() => setPickerTarget("blocked")}
            />
            <AppGroupCard
              apps={selectedApps(plan.productivePackages)}
              description="Apps para reemplazar el tiempo de scroll."
              label="Rehabbit"
              onPress={() => setPickerTarget("productive")}
            />

            <YStack gap="$3">
              <H4 color="$text11">Hora</H4>
              <ScheduleCard
                endMinute={plan.schedule.endMinute}
                startMinute={plan.schedule.startMinute}
                weekdays={plan.weekdays}
                onTimeChange={updateTime}
                onWeekdaysChange={(weekdays) => setPlan((current) => ({ ...current, weekdays }))}
              />
            </YStack>

            <GradientButton onPress={() => void onSave(true)}>
              {plan.paused ? "Reanudar modo" : plan.enabled ? "Guardar cambios" : "Activar modo"}
            </GradientButton>
            {isEditing ? (
              <YStack gap="$3">
                <Button
                  backgroundColor="#FFFFFF"
                  borderColor="#C7D8FF"
                  borderRadius="$4"
                  color="#315BEA"
                  disabled={plan.paused}
                  height={54}
                  icon={Pause}
                  opacity={plan.paused ? 0.55 : 1}
                  onPress={() => void onPause()}
                >
                  {plan.paused ? "Modo pausado" : "Pausar modo"}
                </Button>
                <Button
                  backgroundColor="#FFFFFF"
                  borderColor="rgba(220, 38, 38, 0.28)"
                  borderRadius="$4"
                  color="#B91C1C"
                  height={54}
                  icon={Trash2}
                  onPress={onDelete}
                >
                  Eliminar modo
                </Button>
              </YStack>
            ) : null}
          </YStack>
        </ScrollView>
      </YStack>

      <AppPickerSheet
        apps={apps}
        open={pickerTarget !== null}
        selectedPackages={pickerTarget === "blocked" ? plan.blockedPackages : plan.productivePackages}
        title={pickerTarget === "blocked" ? "Apps bloqueadas" : "Apps Rehabbit"}
        onOpenChange={(open) => !open && setPickerTarget(null)}
        onToggle={(packageName) => {
          if (!pickerTarget) return;
          togglePackages(pickerTarget === "blocked" ? "blockedPackages" : "productivePackages", packageName);
        }}
      />

    </Container>
  );
}

function AppGroupCard({ apps, description, label, onPress }: { apps: AndroidBlockableApp[]; description: string; label: string; onPress: () => void }) {
  return (
    <YStack gap="$3">
      <H4 color="$text11">{label}</H4>
      <ShadowCard
        padding="$5"
        pressStyle={{ opacity: 0.75 }}
        tone="surface"
        onPress={onPress}
      >
        <XStack alignItems="center" gap="$3" justifyContent="space-between">
          <YStack flex={1} gap="$1">
            <SizableText color="$text11" fontWeight="800">{apps.length ? `${apps.length} apps seleccionadas` : "Seleccionar apps"}</SizableText>
            <SizableText color="$text10" size="$3">{description}</SizableText>
          </YStack>
          {apps.length > 0 ? <AppAvatarStack apps={apps} /> : <Plus color="$text11" size={22} />}
        </XStack>
      </ShadowCard>
    </YStack>
  );
}

const durationPickerStyles = StyleSheet.create({
  backdrop: {
    alignItems: "center",
    backgroundColor: "rgba(31, 36, 48, 0.2)",
    flex: 1,
    justifyContent: "center",
    padding: 24,
  },
});
