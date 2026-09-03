import {
  ChevronRight,
  FileText,
  Heart,
  Info,
  Languages,
  ShieldCheck,
  SlidersHorizontal,
} from "@tamagui/lucide-icons";
import { router } from "expo-router";
import { Share } from "react-native";
import { ListItem, SizableText, View, YGroup, YStack } from "tamagui";

import { Container } from "../../components/container";
import { translate, useAppLanguage } from "../../components/translate";

const RowIcon = ({ children }: { children: React.ReactNode }) => (
  <View alignItems="center" backgroundColor="$primary3" borderRadius="$3" height={36} justifyContent="center" width={36}>
    {children}
  </View>
);

const Settings = () => {
  useAppLanguage();
  return (
  <Container paddingVertical="$4">
    <YStack gap="$5">
      <YStack gap="$2">
        <SizableText color="$text10" fontSize="$3" fontWeight="700">{translate.t("settings.control")}</SizableText>
        <YGroup alignSelf="center" bordered size="$4">
          <YGroup.Item>
            <ListItem icon={<RowIcon><SlidersHorizontal color="$primary11" size={19} /></RowIcon>} iconAfter={ChevronRight} onPress={() => router.push("/settings/permissions")} pressTheme>
              <ListItem.Text>{translate.t("settings.permissions")}</ListItem.Text>
            </ListItem>
          </YGroup.Item>
        </YGroup>
      </YStack>

      <YStack gap="$2">
        <SizableText color="$text10" fontSize="$3" fontWeight="700">{translate.t("settings.languageSection")}</SizableText>
        <YGroup alignSelf="center" bordered size="$4">
          <YGroup.Item>
            <ListItem
              icon={<RowIcon><Languages color="$primary11" size={19} /></RowIcon>}
              iconAfter={ChevronRight}
              onPress={() => router.push("/settings/language")}
              pressTheme
            >
              <ListItem.Text>{translate.t("settings.language")}</ListItem.Text>
            </ListItem>
          </YGroup.Item>
        </YGroup>
      </YStack>

      <YStack gap="$2">
        <SizableText color="$text10" fontSize="$3" fontWeight="700">{translate.t("settings.privacy")}</SizableText>
        <YGroup alignSelf="center" bordered size="$4">
          <YGroup.Item>
            <ListItem icon={<RowIcon><ShieldCheck color="$primary11" size={19} /></RowIcon>} iconAfter={ChevronRight} onPress={() => router.push("/settings/privacy")} pressTheme>
              <ListItem.Text>{translate.t("settings.privacyData")}</ListItem.Text>
            </ListItem>
          </YGroup.Item>
          <YGroup.Item>
            <ListItem icon={<RowIcon><FileText color="$primary11" size={19} /></RowIcon>} iconAfter={ChevronRight} onPress={() => router.push("/settings/terms")} pressTheme>
              <ListItem.Text>{translate.t("settings.terms")}</ListItem.Text>
            </ListItem>
          </YGroup.Item>
        </YGroup>
      </YStack>

      <YGroup alignSelf="center" bordered size="$4">
        <YGroup.Item>
          <ListItem
            icon={<RowIcon><Heart color="$primary11" size={19} /></RowIcon>}
            iconAfter={ChevronRight}
            onPress={() => void Share.share({ message: "Prueba Rehabbit para recuperar tiempo de las redes." })}
            pressTheme
          >
            <ListItem.Text>{translate.t("settings.share")}</ListItem.Text>
          </ListItem>
        </YGroup.Item>
        <YGroup.Item>
          <ListItem icon={<RowIcon><Info color="$primary11" size={19} /></RowIcon>} iconAfter={ChevronRight} onPress={() => router.push("/settings/about")} pressTheme>
            <ListItem.Text>{translate.t("settings.about")}</ListItem.Text>
          </ListItem>
        </YGroup.Item>
      </YGroup>
    </YStack>
  </Container>
  );
};

export default Settings;
