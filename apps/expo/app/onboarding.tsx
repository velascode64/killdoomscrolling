import {
  ArrowLeft,
  Check,
  Clock3,
  Focus,
  Plus,
  ShieldBan,
} from "@tamagui/lucide-icons";
import {
  configureRewardBlockerPlans,
  getInstalledApps,
  getPermissionStatus,
  openOverlaySettings,
  openUsageStatsSettings,
  startMonitoring,
} from "expo-app-blocker";
import type { AndroidBlockableApp } from "expo-app-blocker";
import { router, useLocalSearchParams } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { Alert, Image, Modal, Platform, Pressable, StyleSheet } from "react-native";
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
import { AppPickerSheet } from "../components/app-picker-sheet";
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

const durationOptions = [15, 25, 60];
const phoneUseOptions = [1, 2, 4, 8];
const categories: PlanCategory[] = ["focus", "exercise", "sleep", "meditation", "hobby"];
const goals = ["Dejar redes", "Concentrar mas", "Dormir", "Hacer otra actividad", "Otro"];
const objectiveOptions = ["Foco", "Ejercicio", "Dormir", "Meditacion", "Hobby"];

type PickerTarget = "blocked" | "productive" | null;

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

function ProgressDots({ step }: { step: number }) {
  return (
    <XStack alignItems="center" gap={5} justifyContent="center">
      {Array.from({ length: 11 }).map((_, index) => (
        <View
          key={index}
          backgroundColor={index === step ? "$blue8" : "$borderColor"}
          borderRadius={99}
          height={6}
          opacity={index > step ? 0.65 : 1}
          width={index === step ? 20 : 6}
        />
      ))}
    </XStack>
  );
}

function AppIcon({ app, size = 44 }: { app: AndroidBlockableApp; size?: number }) {
  if (app.iconBase64) {
    return <Image source={{ uri: `data:image/png;base64,${app.iconBase64}` }} style={{ borderRadius: size / 2, height: size, width: size }} />;
  }

  return (
    <View
      alignItems="center"
      backgroundColor="$blue3"
      borderRadius={size / 2}
      height={size}
      justifyContent="center"
      width={size}
    >
      <SizableText color="$text11" fontWeight="800">{app.name.slice(0, 1).toUpperCase()}</SizableText>
    </View>
  );
}

function AppSelectionList({
  apps,
  selectedPackages,
  onToggle,
}: {
  apps: AndroidBlockableApp[];
  selectedPackages: string[];
  onToggle: (packageName: string) => void;
}) {
  if (apps.length === 0) {
    return <Paragraph color="$text10">No se pudieron cargar las aplicaciones instaladas.</Paragraph>;
  }

  return (
    <YStack gap="$2">
      {apps.map((app) => {
        const selected = selectedPackages.includes(app.packageName);
        return (
          <Button
            key={app.packageName}
            unstyled
            alignItems="center"
            backgroundColor={selected ? "$blue2" : "$background2"}
            borderColor={selected ? "$blue8" : "$borderColor"}
            borderRadius="$6"
            borderWidth={1}
            flexDirection="row"
            gap="$3"
            justifyContent="space-between"
            padding="$3"
            pressStyle={{ opacity: 0.75 }}
            onPress={() => onToggle(app.packageName)}
          >
            <XStack alignItems="center" flex={1} gap="$3">
              <AppIcon app={app} size={40} />
              <SizableText color="$text11" flex={1} fontWeight="700" numberOfLines={1}>
                {app.name}
              </SizableText>
            </XStack>
            <View
              alignItems="center"
              backgroundColor={selected ? "$blue8" : "$background"}
              borderColor={selected ? "$blue8" : "$borderColor"}
              borderRadius={99}
              borderWidth={1}
              height={24}
              justifyContent="center"
              width={24}
            >
              {selected && <Check color="$text1" size={15} />}
            </View>
          </Button>
        );
      })}
    </YStack>
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
  const isEditing = Boolean(planId);
  const isCreatingMode = mode === "create";
  const isDirectEditor = isEditing || isCreatingMode;

  useEffect(() => {
    if (Platform.OS !== "android") return;
    void Promise.all([loadAndroidRewardPlans(), getInstalledApps(), getPermissionStatus()]).then(async ([savedPlans, installedApps]) => {
      const currentPlans = pruneUnavailablePlanApps(savedPlans, installedApps.map((app) => app.packageName));
      if (currentPlans.some((savedPlan, index) => savedPlan !== savedPlans[index])) {
        await saveAndroidRewardPlans(currentPlans);
        configureRewardBlockerPlans(toNativeRewardPlansConfig(currentPlans));
      }
      setPlans(currentPlans);
      setApps(installedApps);
      if (planId) {
        const existing = currentPlans.find((entry) => entry.id === planId);
        if (existing) setPlan(existing);
      }
    });
  }, [planId]);

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

    const nextPlan = { ...plan, enabled };
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
      router.replace("/(tabs)/overview");
    } catch {
      Alert.alert("No se pudo guardar", "Intenta guardar el modo de nuevo.");
    }
  };

  const continueOnboarding = () => {
    if (step === 3) setCategory(categoryForGoal(goal));
    if (step === 4 && Platform.OS === "android") {
      // Permission access is optional during exploration; Android validates it on activation.
    }
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
      <Editor
        apps={apps}
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
        onSave={savePlan}
      />
    );
  }

  return (
    <Container scroll={false}>
      <StatusBar style="dark" />
      <YStack flex={1} paddingTop="$3">
        {step > 0 && <Header onBack={goBack} />}
        {step > 0 && <ProgressDots step={step} />}
        <View flex={1} marginTop={step > 0 ? "$5" : 0}>
          {step === 0 && (
            <WelcomeScreen onContinue={continueOnboarding} />
          )}
          {step === 1 && (
            <QuestionScreen
              body="Usaremos esta referencia para proponerte un plan inicial. Puedes cambiarlo despues."
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
            <QuestionScreen body="Elige el primer periodo que quieres recuperar." title="Cuanto tiempo quieres dejar de usar el telefono?">
              <DurationChips value={plan.unlockMinutes} onChange={(unlockMinutes) => setPlan((current) => ({ ...current, unlockMinutes }))} />
            </QuestionScreen>
          )}
          {step === 3 && (
            <QuestionScreen body="El plan se adapta a la intencion que elijas." title="Que quieres lograr?">
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
          {step === 4 && <PermissionsScreen />}
          {step === 5 && (
            <QuestionScreen body="Elige uno o varios objetivos para tu plan." title="Selecciona tus objetivos">
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
            <QuestionScreen body="Podras ajustarlas cuando quieras." title="Que apps quisieras dejar de usar mas?">
              <ScrollView height={330} showsVerticalScrollIndicator={false}>
                <AppSelectionList apps={apps} selectedPackages={plan.blockedPackages} onToggle={(item) => togglePackages("blockedPackages", item)} />
              </ScrollView>
            </QuestionScreen>
          )}
          {step === 7 && (
            <QuestionScreen body="Este es el tiempo que tendras para estar en tu estado antes de liberar las redes." title="Cuanto tiempo quieres dejar de usar esas apps?">
              <ModeRadial duration={plan.productiveMinutes} label="tu estado" />
              <DurationChips value={plan.productiveMinutes} onChange={(productiveMinutes) => setPlan((current) => ({ ...current, productiveMinutes }))} />
            </QuestionScreen>
          )}
          {step === 8 && (
            <QuestionScreen body="Estas apps se habilitan mientras mantienes tu estado." title="Con que app te gustaria reemplazar ese tiempo?">
              <ScrollView height={330} showsVerticalScrollIndicator={false}>
                <AppSelectionList apps={apps} selectedPackages={plan.productivePackages} onToggle={(item) => togglePackages("productivePackages", item)} />
              </ScrollView>
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
          <View marginTop="$4"><GradientButton onPress={continueOnboarding}>Continuar</GradientButton></View>
        )}
      </YStack>
    </Container>
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

function QuestionScreen({ body, children, title }: { body: string; children: ReactNode; title: string }) {
  return (
    <YStack gap="$5">
      <YStack gap="$2">
        <H3 color="$text11" letterSpacing={-0.4}>{title}</H3>
        <Paragraph color="$text10" fontSize="$5" lineHeight="$6">{body}</Paragraph>
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
      backgroundColor={selected ? "$primary3" : "$background2"}
      borderColor={selected ? "$primary6" : "$borderColor"}
      borderRadius="$10"
      borderWidth={1}
      justifyContent="center"
      minWidth={72}
      paddingHorizontal="$4"
      paddingVertical="$3"
      pressStyle={{ opacity: 0.75 }}
      onPress={onPress}
    >
      <SizableText color={selected ? "$primary11" : "$text11"} fontWeight="800">{label}</SizableText>
    </Button>
  );
}

function ChoiceRow({ label, selected, onPress }: { label: string; selected: boolean; onPress: () => void }) {
  return (
    <Button
      unstyled
      alignItems="center"
      backgroundColor={selected ? "$primary3" : "$background2"}
      borderColor={selected ? "$primary6" : "$borderColor"}
      borderRadius="$6"
      borderWidth={1}
      flexDirection="row"
      justifyContent="space-between"
      padding="$4"
      pressStyle={{ opacity: 0.75 }}
      onPress={onPress}
    >
      <SizableText color={selected ? "$primary11" : "$text11"} fontWeight="700" size="$5">{label}</SizableText>
      <View
        alignItems="center"
        backgroundColor={selected ? "rgba(72, 63, 255, 0.12)" : "$background"}
        borderColor={selected ? "rgba(72, 63, 255, 0.24)" : "$borderColor"}
        borderRadius={99}
        borderWidth={1}
        height={25}
        justifyContent="center"
        width={25}
      >
        {selected && <Check color="$primary11" size={16} />}
      </View>
    </Button>
  );
}

function PermissionsScreen() {
  return (
    <YStack gap="$5">
      <YStack gap="$2">
        <H3 color="$text11">Permisos necesarios</H3>
        <Paragraph color="$text10" fontSize="$5" lineHeight="$6">
          Android necesita estos permisos para aplicar tu plan en el momento indicado.
        </Paragraph>
      </YStack>
      <ShadowCard>
        <YStack gap="$3">
          <XStack alignItems="center" gap="$3">
            <View alignItems="center" backgroundColor="$blue2" borderRadius={99} height={42} justifyContent="center" width={42}>
              <ShieldBan color="$text11" size={20} />
            </View>
            <YStack flex={1} gap="$1">
              <SizableText color="$text11" fontWeight="800">Acceso de uso</SizableText>
              <SizableText color="$text10" size="$3">Para detectar las apps elegidas.</SizableText>
            </YStack>
          </XStack>
          <Button backgroundColor="$blue2" borderColor="$borderColor" color="$text11" onPress={() => void openUsageStatsSettings()}>
            Abrir ajustes
          </Button>
        </YStack>
      </ShadowCard>
      <ShadowCard>
        <YStack gap="$3">
          <XStack alignItems="center" gap="$3">
            <View alignItems="center" backgroundColor="$blue2" borderRadius={99} height={42} justifyContent="center" width={42}>
              <Focus color="$text11" size={20} />
            </View>
            <YStack flex={1} gap="$1">
              <SizableText color="$text11" fontWeight="800">Mostrar sobre otras apps</SizableText>
              <SizableText color="$text10" size="$3">Para mostrar el bloqueo cuando sea necesario.</SizableText>
            </YStack>
          </XStack>
          <Button backgroundColor="$blue2" borderColor="$borderColor" color="$text11" onPress={() => void openOverlaySettings()}>
            Abrir ajustes
          </Button>
        </YStack>
      </ShadowCard>
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
  onSave,
}: {
  apps: AndroidBlockableApp[];
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

            <GradientButton onPress={() => void onSave(true)}>{plan.enabled ? "Guardar cambios" : "Activar modo"}</GradientButton>
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
        tone={label === "Rehabbit" ? "mint" : "aqua"}
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
