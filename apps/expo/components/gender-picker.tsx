import { BlurView } from "expo-blur";
import { Modal, Pressable, StyleSheet } from "react-native";
import { Button, SizableText, View, YStack } from "tamagui";

import { Wheel } from "./schedule-card";

const OPTIONS = ["Masculino", "Femenino", "Prefiero no decir"] as const;
const VALUES = ["M", "F", "NA"] as const;
const ROW_HEIGHT = 40;

export function GenderPicker({ value, open, onOpenChange, onChange }: { value: string; open: boolean; onOpenChange: (open: boolean) => void; onChange: (value: string) => void }) {
  const selectedIndex = Math.max(0, VALUES.indexOf(value as (typeof VALUES)[number]));
  const label = value ? OPTIONS[selectedIndex] : "Selecciona una opción";
  const wheelValue = OPTIONS[selectedIndex] ?? OPTIONS[0];
  return <>
    <YStack gap="$2"><SizableText color="$text11" fontWeight="800">Género</SizableText><Button backgroundColor="white" borderColor="#E2E8F0" borderRadius={12} borderWidth={1} color={value ? "$text11" : "$text6"} justifyContent="flex-start" onPress={() => onOpenChange(true)}>{label}</Button></YStack>
    <Modal animationType="fade" transparent visible={open} onRequestClose={() => onOpenChange(false)}>
      <Pressable style={styles.backdrop} onPress={() => onOpenChange(false)}>
        <Pressable style={styles.shadow} onPress={(event) => event.stopPropagation()}>
          <View borderRadius={26} flex={1} overflow="hidden">
            <BlurView blurReductionFactor={4} experimentalBlurMethod="dimezisBlurView" intensity={62} pointerEvents="none" style={StyleSheet.absoluteFill} tint="systemUltraThinMaterialLight" />
            <View pointerEvents="none" style={styles.overlay} />
            <View pointerEvents="none" style={styles.highlight} />
            <View pointerEvents="none" style={styles.selectedRow} />
            <Wheel values={[...OPTIONS]} selected={wheelValue} width={260} onChange={(option) => { onChange(VALUES[OPTIONS.indexOf(option)] ?? "NA"); onOpenChange(false); }} />
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  </>;
}

const styles = StyleSheet.create({
  backdrop: { ...StyleSheet.absoluteFillObject, alignItems: "center", justifyContent: "center", zIndex: 20 },
  shadow: { borderColor: "rgba(255, 255, 255, 0.9)", borderRadius: 27, borderWidth: 1, elevation: 14, height: 206, overflow: "hidden", shadowColor: "#202040", shadowOpacity: 0.18, shadowRadius: 24, width: 280 },
  overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(238, 242, 255, 0.76)" },
  highlight: { backgroundColor: "rgba(255, 255, 255, 0.94)", height: 1, left: 20, position: "absolute", right: 20, top: 0 },
  selectedRow: { backgroundColor: "rgba(255, 255, 255, 0.72)", borderColor: "rgba(255, 255, 255, 0.96)", borderRadius: 18, borderWidth: 1, height: ROW_HEIGHT, left: 20, position: "absolute", right: 20, top: ROW_HEIGHT * 2 },
});
