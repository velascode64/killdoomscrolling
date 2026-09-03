import { Trash2 } from "@tamagui/lucide-icons";
import { router } from "expo-router";
import { Paragraph, SizableText, View, XStack, YStack } from "tamagui";

import { Container } from "../../components/container";
import { translate, useAppLanguage } from "../../components/translate";

export default function Privacy() {
  useAppLanguage();
  return (
    <Container paddingVertical="$4">
      <YStack gap="$4">
        <Paragraph color="$text10">{translate.t("privacy.intro")}</Paragraph>
        <YStack backgroundColor="$background" borderColor="$borderColor" borderRadius="$5" borderWidth={1} gap="$2" padding="$4">
          <SizableText color="$text11" fontWeight="800">{translate.t("privacy.storedTitle")}</SizableText>
          <Paragraph color="$text10">{translate.t("privacy.storedBody")}</Paragraph>
        </YStack>
        <View backgroundColor="rgba(220,38,38,0.06)" borderColor="rgba(220,38,38,0.18)" borderRadius="$5" borderWidth={1} padding="$4" onPress={() => router.push("/settings/delete-app-data")} pressStyle={{ opacity: 0.75 }}>
          <XStack alignItems="center" gap="$3"><Trash2 color="#DC2626" size={20} /><YStack flex={1}><SizableText color="#B91C1C" fontWeight="800">{translate.t("privacy.deleteTitle")}</SizableText><SizableText color="$text10" size="$2">{translate.t("privacy.deleteBody")}</SizableText></YStack></XStack>
        </View>
      </YStack>
    </Container>
  );
}
