import {
  Briefcase,
  ChevronDown,
  ChevronRight,
  Gamepad2,
  Headphones,
  Images,
  LayoutGrid,
  MapPinned,
  Newspaper,
  Play,
  Search,
  Users,
  X,
} from "@tamagui/lucide-icons";
import type { AndroidAppCategory, AndroidBlockableApp } from "expo-app-blocker";
import { useDeferredValue, useEffect, useState } from "react";
import { Image, SectionList } from "react-native";
import { Button, H4, Input, Paragraph, Sheet, SizableText, View, XStack, YStack } from "tamagui";

import { GradientButton } from "./mode-ui";
import { translate, useAppLanguage } from "./translate";

const CATEGORY_ORDER: AndroidAppCategory[] = [
  "social",
  "productivity",
  "video",
  "audio",
  "game",
  "news",
  "maps",
  "image",
  "other",
];

type AppSection = {
  category: AndroidAppCategory;
  data: AndroidBlockableApp[];
  selectedCount: number;
  title: string;
};

function CategoryIcon({ category, color }: { category: AndroidAppCategory; color: string }) {
  const props = { color, size: 18 };
  if (category === "social") return <Users {...props} />;
  if (category === "productivity") return <Briefcase {...props} />;
  if (category === "video") return <Play {...props} />;
  if (category === "audio") return <Headphones {...props} />;
  if (category === "game") return <Gamepad2 {...props} />;
  if (category === "news") return <Newspaper {...props} />;
  if (category === "maps") return <MapPinned {...props} />;
  if (category === "image") return <Images {...props} />;
  return <LayoutGrid {...props} />;
}

export function AppSelectionList({
  apps,
  height,
  resetKey,
  selectedPackages,
  onSearchFocus,
  onToggle,
}: {
  apps: AndroidBlockableApp[];
  height?: number;
  resetKey?: boolean | string;
  selectedPackages: string[];
  onSearchFocus?: () => void;
  onToggle: (packageName: string) => void;
}) {
  useAppLanguage();
  const [expandedCategories, setExpandedCategories] = useState<Set<AndroidAppCategory>>(() => new Set());
  const [query, setQuery] = useState("");
  const deferredQuery = useDeferredValue(query.trim().toLocaleLowerCase());

  useEffect(() => {
    setExpandedCategories(new Set());
    setQuery("");
  }, [resetKey]);

  const filteredApps = deferredQuery
    ? apps.filter((app) =>
        `${app.name} ${app.packageName}`.toLocaleLowerCase().includes(deferredQuery),
      )
    : apps;
  const groupedSections = CATEGORY_ORDER.reduce<AppSection[]>((result, category) => {
    const data = filteredApps.filter((app) => (app.category ?? "other") === category);
    const selectedCount = apps.filter(
      (app) => (app.category ?? "other") === category && selectedPackages.includes(app.packageName),
    ).length;
    if (data.length > 0) result.push({ category, data, selectedCount, title: translate.t(`appPicker.categories.${category}`) });
    return result;
  }, []);
  const searching = deferredQuery.length > 0;
  const sections = groupedSections.map((section) => ({
    ...section,
    data: searching || expandedCategories.has(section.category) ? section.data : [],
  }));

  const toggleCategory = (category: AndroidAppCategory) => {
    setExpandedCategories((current) => {
      const next = new Set(current);
      if (next.has(category)) next.delete(category);
      else next.add(category);
      return next;
    });
  };

  return (
    <YStack flex={height ? undefined : 1} gap="$3" height={height}>
      <XStack
        alignItems="center"
        backgroundColor="#FFFFFF"
        borderColor="#E2E8F0"
        borderRadius={20}
        borderWidth={1}
        gap="$2"
        paddingHorizontal="$3"
      >
        <Search color="$text10" size={20} />
        <Input
          unstyled
          color="$text11"
          flex={1}
          height={52}
          placeholder={translate.t("appPicker.search")}
          placeholderTextColor="$text6"
          value={query}
          onChangeText={setQuery}
          onFocus={onSearchFocus}
        />
        {query.length > 0 ? (
          <Button unstyled padding="$1" onPress={() => setQuery("")}>
            <X color="$text10" size={17} />
          </Button>
        ) : null}
      </XStack>

      <SectionList
        contentContainerStyle={{ paddingBottom: 12 }}
        keyboardShouldPersistTaps="handled"
        sections={sections}
        showsVerticalScrollIndicator={false}
        stickySectionHeadersEnabled={false}
        keyExtractor={(app) => app.packageName}
        ListEmptyComponent={groupedSections.length === 0 ? (
          <YStack alignItems="center" gap="$2" paddingVertical="$8">
            <Search color="$text6" size={26} />
            <SizableText color="$text10" textAlign="center">
              {apps.length === 0
                ? translate.t("appPicker.loadError")
                : translate.t("appPicker.empty")}
            </SizableText>
          </YStack>
        ) : null}
        renderSectionHeader={({ section }) => {
          const expanded = searching || expandedCategories.has(section.category);
          const hasSelection = section.selectedCount > 0;
          return (
            <Button
              unstyled
              alignItems="center"
              backgroundColor={hasSelection ? "$primary9" : "#FFFFFF"}
              borderColor={hasSelection ? "$primary9" : "#E2E8F0"}
              borderRadius={16}
              borderWidth={1}
              flexDirection="row"
              justifyContent="space-between"
              marginBottom={expanded ? "$2" : 0}
              marginTop="$2"
              minHeight={52}
              paddingHorizontal="$3"
              pressStyle={{ opacity: 0.72 }}
              onPress={() => toggleCategory(section.category)}
            >
              <XStack alignItems="center" flex={1} gap="$2" minWidth={0}>
                <View
                  alignItems="center"
                  backgroundColor={hasSelection ? "rgba(255,255,255,0.18)" : "$primary3"}
                  borderRadius={10}
                  height={32}
                  justifyContent="center"
                  width={32}
                >
                  <CategoryIcon category={section.category} color={hasSelection ? "#FFFFFF" : "#315BEA"} />
                </View>
                <SizableText color={hasSelection ? "white" : "$text11"} fontWeight="800" numberOfLines={1} size="$3">
                  {section.title}
                </SizableText>
              </XStack>
              <XStack alignItems="center" gap="$2">
                <SizableText color={hasSelection ? "white" : "$text6"} fontWeight="700" size="$2">
                  {translate.t("appPicker.selected", { count: section.selectedCount })}
                </SizableText>
                {expanded
                  ? <ChevronDown color={hasSelection ? "white" : "$primary9"} size={18} />
                  : <ChevronRight color={hasSelection ? "white" : "$primary9"} size={18} />}
              </XStack>
            </Button>
          );
        }}
        renderItem={({ item }) => (
          <View paddingBottom="$2">
            <AppPickerRow
              app={item}
              selected={selectedPackages.includes(item.packageName)}
              onPress={() => onToggle(item.packageName)}
            />
          </View>
        )}
      />
    </YStack>
  );
}

export function AppPickerSheet({
  apps,
  open,
  selectedPackages,
  title,
  onOpenChange,
  onToggle,
}: {
  apps: AndroidBlockableApp[];
  open: boolean;
  selectedPackages: string[];
  title: string;
  onOpenChange: (open: boolean) => void;
  onToggle: (packageName: string) => void;
}) {
  useAppLanguage();
  const [position, setPosition] = useState(1);

  useEffect(() => {
    if (open) setPosition(1);
  }, [open]);

  return (
    <Sheet
      dismissOnSnapToBottom
      modal
      open={open}
      position={position}
      snapPoints={[96, 78]}
      onOpenChange={onOpenChange}
      onPositionChange={setPosition}
    >
      <Sheet.Overlay animation="quick" backgroundColor="rgba(33, 27, 32, 0.2)" />
      <Sheet.Frame
        backgroundColor="#F8FAFC"
        borderColor="#E2E8F0"
        borderTopLeftRadius={32}
        borderTopRightRadius={32}
        borderWidth={1}
        paddingBottom="$5"
        paddingHorizontal="$4"
      >
        <Sheet.Handle backgroundColor="$borderColor" marginBottom="$3" />
        <YStack flex={1} gap="$4">
          <XStack alignItems="flex-start" justifyContent="space-between">
            <YStack flex={1} gap="$1">
              <H4 color="$text11" fontSize="$7">{translate.t("appPicker.title")}</H4>
              <Paragraph color="$text10">
                {title} · {translate.t("appPicker.selected", { count: selectedPackages.length })}
              </Paragraph>
            </YStack>
            <Button
              unstyled
              alignItems="center"
              backgroundColor="$primary3"
              borderRadius={99}
              height={38}
              justifyContent="center"
              width={38}
              onPress={() => onOpenChange(false)}
            >
              <X color="$text11" size={20} />
            </Button>
          </XStack>

          <AppSelectionList
            apps={apps}
            resetKey={open ? title : false}
            selectedPackages={selectedPackages}
            onSearchFocus={() => setPosition(0)}
            onToggle={onToggle}
          />

          <GradientButton onPress={() => onOpenChange(false)}>
            {selectedPackages.length ? `${translate.t("common.done")} · ${selectedPackages.length}` : translate.t("common.done")}
          </GradientButton>
        </YStack>
      </Sheet.Frame>
    </Sheet>
  );
}

function AppPickerRow({
  app,
  selected,
  onPress,
}: {
  app: AndroidBlockableApp;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <Button
      unstyled
      alignItems="center"
      backgroundColor={selected ? "#483FFF" : "#FFFFFF"}
      borderColor={selected ? "#483FFF" : "#E2E8F0"}
      borderRadius={20}
      borderWidth={1}
      flexDirection="row"
      gap="$3"
      minHeight={64}
      paddingHorizontal="$3"
      paddingVertical="$2"
      pressStyle={{ opacity: 0.75 }}
      onPress={onPress}
    >
      <XStack alignItems="center" flex={1} gap="$3">
        <AppIcon app={app} />
        <SizableText color={selected ? "white" : "$text11"} flex={1} fontWeight="700" numberOfLines={1}>
          {app.name}
        </SizableText>
      </XStack>
    </Button>
  );
}

function AppIcon({ app }: { app: AndroidBlockableApp }) {
  if (app.iconBase64) {
    return (
      <Image
        source={{ uri: `data:image/png;base64,${app.iconBase64}` }}
        style={{ borderRadius: 22, height: 44, width: 44 }}
      />
    );
  }

  return (
    <View alignItems="center" backgroundColor="$blue3" borderRadius={22} height={44} justifyContent="center" width={44}>
      <SizableText color="$text11" fontWeight="900">{app.name.slice(0, 1).toUpperCase()}</SizableText>
    </View>
  );
}
