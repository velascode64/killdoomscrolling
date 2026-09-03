import { Check, Languages } from "@tamagui/lucide-icons";
import { ListItem, SizableText, View, YGroup, YStack } from "tamagui";

import { Container } from "../../components/container";
import { translate, useAppLanguage } from "../../components/translate";

export default function LanguageSettings() {
  const { language, setLanguage } = useAppLanguage();
  const options = [
    { id: "es" as const, label: "Español" },
    { id: "en" as const, label: "English" },
  ];

  return (
    <Container paddingVertical="$4">
      <YStack gap="$4">
        <YStack gap="$2">
          <SizableText color="$text11" fontSize="$7" fontWeight="800">{translate.t("settings.language")}</SizableText>
          <SizableText color="$text10">{translate.t("settings.languageDescription")}</SizableText>
        </YStack>
        <YGroup alignSelf="center" bordered size="$4">
          {options.map((option) => (
            <YGroup.Item key={option.id}>
              <ListItem
                icon={
                  <View alignItems="center" backgroundColor="$primary3" borderRadius="$3" height={36} justifyContent="center" width={36}>
                    <Languages color="$primary11" size={19} />
                  </View>
                }
                iconAfter={language === option.id ? <Check color="$primary11" size={20} /> : undefined}
                onPress={() => void setLanguage(option.id)}
                pressTheme
              >
                <ListItem.Text>{option.label}</ListItem.Text>
              </ListItem>
            </YGroup.Item>
          ))}
        </YGroup>
      </YStack>
    </Container>
  );
}
