import { LinearGradient } from "expo-linear-gradient";
import { StyleSheet } from "react-native";
import { View } from "tamagui";

type CardTone = "aqua" | "mint" | "sky" | "surface";

const CARD_GRADIENTS: Record<CardTone, readonly [string, string, ...string[]]> = {
  surface: ["rgba(255,255,255,0.98)", "rgba(248,253,254,0.96)"],
  aqua: ["rgba(255,255,255,0.98)", "rgba(221,249,253,0.88)"],
  sky: ["rgba(255,255,255,0.98)", "rgba(226,242,255,0.9)"],
  mint: ["rgba(255,255,255,0.98)", "rgba(226,251,244,0.9)"],
};

export const ShadowCard = ({
  children,
  tone = "surface",
  ...viewProps
}: { children: React.ReactNode; tone?: CardTone } & React.ComponentProps<typeof View>) => (
  <View
    backgroundColor="transparent"
    shadowColor="#67DDFC"
    shadowOpacity={0.07}
    shadowRadius={12}
    borderRadius={28}
    borderWidth={1}
    borderColor="rgba(162, 228, 250, 0.62)"
    shadowOffset={{ width: 0, height: 5 }}
    overflow="hidden"
    padding="$5"
    {...viewProps}
  >
    <LinearGradient
      colors={CARD_GRADIENTS[tone]}
      end={{ x: 1, y: 1 }}
      pointerEvents="none"
      start={{ x: 0, y: 0 }}
      style={StyleSheet.absoluteFill}
    />
    {children}
  </View>
);
