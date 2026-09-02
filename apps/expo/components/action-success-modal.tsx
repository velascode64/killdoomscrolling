import { CircleCheck, PartyPopper } from "@tamagui/lucide-icons";
import { Modal, StyleSheet } from "react-native";
import { H3, Paragraph, View, YStack } from "tamagui";

import { GradientButton } from "./mode-ui";

export function ActionSuccessModal({
  buttonLabel = "Continuar",
  celebration = false,
  message,
  title,
  visible,
  onClose,
}: {
  buttonLabel?: string;
  celebration?: boolean;
  message: string;
  title: string;
  visible: boolean;
  onClose: () => void;
}) {
  return (
    <Modal
      animationType="fade"
      statusBarTranslucent
      transparent
      visible={visible}
      onRequestClose={onClose}
    >
      <View alignItems="center" flex={1} justifyContent="center" padding="$5" style={styles.backdrop}>
        <View
          backgroundColor="#FFFFFF"
          borderColor="#E2E8F0"
          borderRadius={30}
          borderWidth={1}
          maxWidth={420}
          padding="$6"
          shadowColor="#1F2430"
          shadowOffset={{ height: 10, width: 0 }}
          shadowOpacity={0.18}
          shadowRadius={24}
          width="100%"
        >
          <YStack alignItems="center" gap="$5">
            <View
              alignItems="center"
              backgroundColor={celebration ? "#EEF3FF" : "#EEF3FF"}
              borderColor="#C7D8FF"
              borderRadius={99}
              borderWidth={1}
              height={76}
              justifyContent="center"
              width={76}
            >
              {celebration ? (
                <PartyPopper color="#483FFF" size={36} />
              ) : (
                <CircleCheck color="#483FFF" size={38} />
              )}
            </View>
            <YStack alignItems="center" gap="$2">
              <H3 color="$text11" textAlign="center">{title}</H3>
              <Paragraph color="$text10" fontSize="$5" lineHeight="$6" textAlign="center">
                {message}
              </Paragraph>
            </YStack>
            <View width="100%">
              <GradientButton onPress={onClose}>{buttonLabel}</GradientButton>
            </View>
          </YStack>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    backgroundColor: "rgba(31, 36, 48, 0.42)",
  },
});
