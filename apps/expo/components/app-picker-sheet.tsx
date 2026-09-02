import { Search, X } from "@tamagui/lucide-icons";
import type { AndroidAppCategory, AndroidBlockableApp } from "expo-app-blocker";
import { useDeferredValue, useEffect, useState } from "react";
import { Image, SectionList } from "react-native";
import { Button, H4, Input, Paragraph, Sheet, SizableText, View, XStack, YStack } from "tamagui";

import { GradientButton } from "./mode-ui";

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

const CATEGORY_LABELS: Record<AndroidAppCategory, string> = {
  audio: "Música y audio",
  game: "Juegos",
  image: "Fotos e imágenes",
  maps: "Mapas y navegación",
  news: "Noticias",
  other: "Otras aplicaciones",
  productivity: "Productividad",
  social: "Social",
  video: "Video",
};

type AppSection = {
  category: AndroidAppCategory;
  data: AndroidBlockableApp[];
  title: string;
};

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
  const [query, setQuery] = useState("");
  const deferredQuery = useDeferredValue(query.trim().toLocaleLowerCase());

  useEffect(() => {
    setQuery("");
  }, [resetKey]);

  const filteredApps = deferredQuery
    ? apps.filter((app) =>
        `${app.name} ${app.packageName}`.toLocaleLowerCase().includes(deferredQuery),
      )
    : apps;
  const sections = CATEGORY_ORDER.reduce<AppSection[]>((result, category) => {
    const data = filteredApps.filter((app) => (app.category ?? "other") === category);
    if (data.length > 0) result.push({ category, data, title: CATEGORY_LABELS[category] });
    return result;
  }, []);

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
          placeholder="Buscar aplicaciones"
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
        ListEmptyComponent={
          <YStack alignItems="center" gap="$2" paddingVertical="$8">
            <Search color="$text6" size={26} />
            <SizableText color="$text10" textAlign="center">
              {apps.length === 0
                ? "No se pudieron cargar las aplicaciones instaladas."
                : "No encontramos aplicaciones con ese nombre."}
            </SizableText>
          </YStack>
        }
        renderSectionHeader={({ section }) => (
          <XStack alignItems="center" justifyContent="space-between" paddingBottom="$2" paddingTop="$3">
            <SizableText color="$text10" fontWeight="900" size="$3">
              {section.title}
            </SizableText>
            <SizableText color="$text6" fontWeight="700" size="$2">
              {section.data.length}
            </SizableText>
          </XStack>
        )}
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
              <H4 color="$text11" fontSize="$7">Seleccionar apps</H4>
              <Paragraph color="$text10">
                {title} · {selectedPackages.length} seleccionadas
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
            {selectedPackages.length ? `Listo · ${selectedPackages.length}` : "Listo"}
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
