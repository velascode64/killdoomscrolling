import { Paragraph, SizableText, YStack } from "tamagui";

import { Container } from "../../components/container";

export default function Terms() {
  return (
    <Container paddingVertical="$4">
      <YStack gap="$3">
        <SizableText color="$text11" fontWeight="800">Uso de Rehabbit</SizableText>
        <Paragraph color="$text10">Rehabbit te permite crear modos para bloquear temporalmente las apps que selecciones. Los permisos Android son necesarios para que el bloqueo funcione.</Paragraph>
        <Paragraph color="$text10">Puedes modificar o eliminar tus modos y tus datos en cualquier momento desde Ajustes.</Paragraph>
      </YStack>
    </Container>
  );
}
