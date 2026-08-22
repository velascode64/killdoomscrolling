import { Check, Search, X } from "@tamagui/lucide-icons";
import type { AndroidBlockableApp } from "expo-app-blocker";
import { useDeferredValue, useEffect, useState } from "react";
import { Image } from "react-native";
import { Button, H4, Input, Paragraph, ScrollView, Sheet, SizableText, View, XStack, YStack } from "tamagui";

import { GradientButton } from "./mode-ui";

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
  const [query, setQuery] = useState("");
  const [position, setPosition] = useState(1);
  const deferredQuery = useDeferredValue(query.trim().toLocaleLowerCase());
  const filteredApps = deferredQuery
    ? apps.filter((app) => app.name.toLocaleLowerCase().includes(deferredQuery))
    : apps;

  useEffect(() => {
    if (!open) return;
    setQuery("");
    setPosition(1);
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
      <Sheet.Overlay animation="quick" backgroundColor="rgba(0, 59, 92, 0.2)" />
      <Sheet.Frame
        backgroundColor="#F8FDFE"
        borderColor="rgba(162, 228, 250, 0.72)"
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
              backgroundColor="$blue2"
              borderRadius={99}
              height={38}
              justifyContent="center"
              width={38}
              onPress={() => onOpenChange(false)}
            >
              <X color="$text11" size={20} />
            </Button>
          </XStack>

          <XStack
            alignItems="center"
            backgroundColor="$background2"
            borderColor="$borderColor"
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
              placeholder="Buscar apps"
              placeholderTextColor="$text6"
              value={query}
              onChangeText={setQuery}
              onFocus={() => setPosition(0)}
            />
            {query.length > 0 && (
              <Button unstyled padding="$1" onPress={() => setQuery("")}>
                <X color="$text10" size={17} />
              </Button>
            )}
          </XStack>

          <ScrollView
            flex={1}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            onScrollBeginDrag={() => setPosition(0)}
          >
            <YStack gap="$2" paddingBottom="$3">
              {filteredApps.map((app) => (
                <AppPickerRow
                  app={app}
                  key={app.packageName}
                  selected={selectedPackages.includes(app.packageName)}
                  onPress={() => onToggle(app.packageName)}
                />
              ))}
              {filteredApps.length === 0 && (
                <YStack alignItems="center" gap="$2" paddingVertical="$8">
                  <Search color="$text6" size={26} />
                  <SizableText color="$text10">No encontramos apps con ese nombre.</SizableText>
                </YStack>
              )}
            </YStack>
          </ScrollView>

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
      backgroundColor={selected ? "$blue2" : "$background2"}
      borderColor={selected ? "$blue8" : "rgba(207, 235, 240, 0.8)"}
      borderRadius={20}
      borderWidth={1}
      flexDirection="row"
      gap="$3"
      justifyContent="space-between"
      minHeight={64}
      paddingHorizontal="$3"
      paddingVertical="$2"
      pressStyle={{ opacity: 0.75 }}
      onPress={onPress}
    >
      <XStack alignItems="center" flex={1} gap="$3">
        <AppIcon app={app} />
        <SizableText color="$text11" flex={1} fontWeight="700" numberOfLines={1}>
          {app.name}
        </SizableText>
      </XStack>
      <View
        alignItems="center"
        backgroundColor={selected ? "$blue9" : "$background"}
        borderColor={selected ? "$blue9" : "$borderColor"}
        borderRadius={99}
        borderWidth={1}
        height={25}
        justifyContent="center"
        width={25}
      >
        {selected && <Check color="white" size={16} />}
      </View>
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
