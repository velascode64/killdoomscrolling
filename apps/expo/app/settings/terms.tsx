import { Paragraph, SizableText, YStack } from "tamagui";

import { Container } from "../../components/container";
import { translate, useAppLanguage } from "../../components/translate";

export default function Terms() {
  useAppLanguage();
  return (
    <Container paddingVertical="$4">
      <YStack gap="$3">
        <SizableText color="$text11" fontWeight="800">{translate.t("terms.title")}</SizableText>
        <Paragraph color="$text10">{translate.t("terms.body1")}</Paragraph>
        <Paragraph color="$text10">{translate.t("terms.body2")}</Paragraph>
      </YStack>
    </Container>
  );
}
