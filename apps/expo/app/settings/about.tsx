import Constants from "expo-constants";
import { Paragraph, SizableText, YStack } from "tamagui";

import { Container } from "../../components/container";

export default function About() {
  const version = Constants.expoConfig?.version ?? "1.0.2";
  return (
    <Container paddingVertical="$4">
      <YStack gap="$2"><SizableText color="$text11" fontWeight="800">Rehabbit</SizableText><Paragraph color="$text10">Versión {version}</Paragraph><Paragraph color="$text10">Recupera tiempo de las redes para lo que realmente quieres hacer.</Paragraph></YStack>
    </Container>
  );
}
