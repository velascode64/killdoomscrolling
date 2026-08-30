import {
  ChevronRight,
  FileText,
  Heart,
  Info,
  ShieldCheck,
  SlidersHorizontal,
} from "@tamagui/lucide-icons";
import { router } from "expo-router";
import { Share } from "react-native";
import { ListItem, SizableText, View, YGroup, YStack } from "tamagui";

import { Container } from "../../components/container";

const RowIcon = ({ children }: { children: React.ReactNode }) => (
  <View alignItems="center" backgroundColor="$primary3" borderRadius="$3" height={36} justifyContent="center" width={36}>
    {children}
  </View>
);

const Settings = () => (
  <Container paddingVertical="$4">
    <YStack gap="$5">
      <YStack gap="$2">
        <SizableText color="$text10" fontSize="$3" fontWeight="700">Control</SizableText>
        <YGroup alignSelf="center" bordered size="$4">
          <YGroup.Item>
            <ListItem icon={<RowIcon><SlidersHorizontal color="$primary11" size={19} /></RowIcon>} iconAfter={ChevronRight} onPress={() => router.push("/settings/permissions")} pressTheme>
              <ListItem.Text>Permisos</ListItem.Text>
            </ListItem>
          </YGroup.Item>
        </YGroup>
      </YStack>

      <YStack gap="$2">
        <SizableText color="$text10" fontSize="$3" fontWeight="700">Privacidad</SizableText>
        <YGroup alignSelf="center" bordered size="$4">
          <YGroup.Item>
            <ListItem icon={<RowIcon><ShieldCheck color="$primary11" size={19} /></RowIcon>} iconAfter={ChevronRight} onPress={() => router.push("/settings/privacy")} pressTheme>
              <ListItem.Text>Privacidad y datos</ListItem.Text>
            </ListItem>
          </YGroup.Item>
          <YGroup.Item>
            <ListItem icon={<RowIcon><FileText color="$primary11" size={19} /></RowIcon>} iconAfter={ChevronRight} onPress={() => router.push("/settings/terms")} pressTheme>
              <ListItem.Text>Términos y condiciones</ListItem.Text>
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
            <ListItem.Text>Compartir Rehabbit</ListItem.Text>
          </ListItem>
        </YGroup.Item>
        <YGroup.Item>
          <ListItem icon={<RowIcon><Info color="$primary11" size={19} /></RowIcon>} iconAfter={ChevronRight} onPress={() => router.push("/settings/about")} pressTheme>
            <ListItem.Text>Acerca de Rehabbit</ListItem.Text>
          </ListItem>
        </YGroup.Item>
      </YGroup>
    </YStack>
  </Container>
);

export default Settings;
