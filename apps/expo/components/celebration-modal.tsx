import { PartyPopper } from "@tamagui/lucide-icons";
import { useEffect } from "react";
import { Modal, Pressable, StyleSheet } from "react-native";
import { H3, Paragraph, View, YStack } from "tamagui";

const AUTO_DISMISS_MS = 5000;

export function CelebrationModal({
  message,
  onDismiss,
  title,
  visible,
}: {
  message: string;
  onDismiss: () => void;
  title: string;
  visible: boolean;
}) {
  useEffect(() => {
    if (!visible) return;
    const timeout = setTimeout(onDismiss, AUTO_DISMISS_MS);
    return () => clearTimeout(timeout);
  }, [onDismiss, visible]);

  return (
    <Modal
      animationType="fade"
      statusBarTranslucent
      transparent
      visible={visible}
      onRequestClose={onDismiss}
    >
      <Pressable accessibilityRole="button" onPress={onDismiss} style={styles.backdrop}>
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
          <YStack alignItems="center" gap="$4">
            <View
              alignItems="center"
              backgroundColor="#EEF3FF"
              borderColor="#C7D8FF"
              borderRadius={99}
              borderWidth={1}
              height={76}
              justifyContent="center"
              width={76}
            >
              <PartyPopper color="#483FFF" size={36} />
            </View>
            <YStack alignItems="center" gap="$2">
              <H3 color="$text11" textAlign="center">{title}</H3>
              <Paragraph color="$text10" fontSize="$5" lineHeight="$6" textAlign="center">
                {message}
              </Paragraph>
            </YStack>
          </YStack>
        </View>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    alignItems: "center",
    backgroundColor: "rgba(31, 36, 48, 0.42)",
    flex: 1,
    justifyContent: "center",
    padding: 20,
  },
});
