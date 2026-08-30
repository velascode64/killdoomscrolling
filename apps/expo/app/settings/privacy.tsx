import { Trash2 } from "@tamagui/lucide-icons";
import { router } from "expo-router";
import { Paragraph, SizableText, View, XStack, YStack } from "tamagui";

import { Container } from "../../components/container";

export default function Privacy() {
  return (
    <Container paddingVertical="$4">
      <YStack gap="$4">
        <Paragraph color="$text10">Rehabbit guarda tus modos, respuestas de onboarding y eventos de uso propios de Rehabbit para sincronizarlos y medir si el producto te ayuda. No enviamos el historial completo de uso de tu teléfono.</Paragraph>
        <YStack backgroundColor="$background" borderColor="$borderColor" borderRadius="$5" borderWidth={1} gap="$2" padding="$4">
          <SizableText color="$text11" fontWeight="800">Datos que guardamos</SizableText>
          <Paragraph color="$text10">Configuración de modos, apps que eliges bloquear, respuestas de onboarding y eventos de interacción con Rehabbit.</Paragraph>
        </YStack>
        <View backgroundColor="rgba(220,38,38,0.06)" borderColor="rgba(220,38,38,0.18)" borderRadius="$5" borderWidth={1} padding="$4" onPress={() => router.push("/settings/delete-app-data")} pressStyle={{ opacity: 0.75 }}>
          <XStack alignItems="center" gap="$3"><Trash2 color="#DC2626" size={20} /><YStack flex={1}><SizableText color="#B91C1C" fontWeight="800">Eliminar mis datos</SizableText><SizableText color="$text10" size="$2">Borra los datos del dispositivo y de Rehabbit.</SizableText></YStack></XStack>
        </View>
      </YStack>
    </Container>
  );
}
