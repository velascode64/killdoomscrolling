import { Modal, StyleSheet } from "react-native";
import { Button, H3, Paragraph, SizableText, View, YStack } from "tamagui";

export function InvitationToSaveProgressModal({ visible, onContinue, onClose }: { visible: boolean; onContinue: () => void; onClose: () => void }) {
  return <Modal animationType="fade" transparent visible={visible} onRequestClose={onClose}><View alignItems="center" flex={1} justifyContent="center" padding="$5" style={styles.backdrop}><YStack backgroundColor="white" borderRadius={28} gap="$4" padding="$5" width="100%"><YStack gap="$2"><H3 color="$text11">Guarda tu progreso</H3><Paragraph color="$text10">Completa tu perfil para guardar tu progreso y continuar con tus Planes.</Paragraph></YStack><Button backgroundColor="$primary9" color="white" onPress={onContinue}>Completar perfil</Button><Button chromeless onPress={onClose}><SizableText color="$text10">Ahora no</SizableText></Button></YStack></View></Modal>;
}

const styles = StyleSheet.create({ backdrop: { backgroundColor: "rgba(31, 36, 48, 0.42)" } });
