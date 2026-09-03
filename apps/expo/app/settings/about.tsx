import Constants from "expo-constants";
import { Paragraph, SizableText, YStack } from "tamagui";

import { Container } from "../../components/container";
import { translate, useAppLanguage } from "../../components/translate";

export default function About() {
  useAppLanguage();
  const version = Constants.expoConfig?.version ?? "1.0.2";
  return (
    <Container paddingVertical="$4">
      <YStack gap="$2"><SizableText color="$text11" fontWeight="800">Rehabbit</SizableText><Paragraph color="$text10">{translate.t("about.version", { version })}</Paragraph><Paragraph color="$text10">{translate.t("about.description")}</Paragraph></YStack>
    </Container>
  );
}
