import { Bell, Eye, Smartphone } from "@tamagui/lucide-icons";
import { getPermissionStatus, openOverlaySettings, openUsageStatsSettings } from "expo-app-blocker";
import { useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { Linking, Platform } from "react-native";
import { Button, Paragraph, SizableText, View, XStack, YStack } from "tamagui";

import { Container } from "../../components/container";

type PermissionState = { notifications: boolean; overlay: boolean; usageStats: boolean };

export default function Permissions() {
  const [permissions, setPermissions] = useState<PermissionState | null>(null);
  const refresh = useCallback(() => {
    if (Platform.OS !== "android") return;
    void getPermissionStatus().then((status) => {
      if (status.details.platform === "android") setPermissions(status.details);
    });
  }, []);
  useFocusEffect(refresh);

  return (
    <Container paddingVertical="$4">
      <YStack gap="$4">
        <Paragraph color="$text10">Rehabbit solicita estos accesos únicamente para aplicar los modos que creas.</Paragraph>
        <PermissionRow icon={<Smartphone color="$primary11" size={20} />} title="Acceso de uso" description="Detecta cuándo abres una app que seleccionaste para bloquear." granted={permissions?.usageStats ?? false} onPress={openUsageStatsSettings} />
        <PermissionRow icon={<Eye color="$primary11" size={20} />} title="Mostrar sobre otras apps" description="Muestra el bloqueo cuando intentas abrir una app seleccionada." granted={permissions?.overlay ?? false} onPress={openOverlaySettings} />
        <PermissionRow icon={<Bell color="$primary11" size={20} />} title="Notificaciones" description="Mantiene visible el estado del modo activo en Android." granted={permissions?.notifications ?? false} onPress={() => void Linking.openSettings()} />
      </YStack>
    </Container>
  );
}

function PermissionRow({ description, granted, icon, onPress, title }: { description: string; granted: boolean; icon: React.ReactNode; onPress: () => void; title: string }) {
  return (
    <YStack backgroundColor="$background" borderColor="$borderColor" borderRadius="$5" borderWidth={1} gap="$2" padding="$4">
      <XStack alignItems="center" gap="$3"><View backgroundColor="$primary3" borderRadius={99} padding="$2">{icon}</View><YStack flex={1}><SizableText color="$text11" fontWeight="800">{title}</SizableText><SizableText color={granted ? "$primary11" : "$text10"} size="$2">{granted ? "Activo" : "Pendiente"}</SizableText></YStack></XStack>
      <Paragraph color="$text10" size="$3">{description}</Paragraph>
      {!granted && <Button alignSelf="flex-start" backgroundColor="$primary3" borderColor="$primary5" color="$primary11" onPress={onPress}>Activar</Button>}
    </YStack>
  );
}
