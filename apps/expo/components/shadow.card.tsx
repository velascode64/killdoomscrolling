import { LinearGradient } from "expo-linear-gradient";
import { StyleSheet } from "react-native";
import { View } from "tamagui";

type CardTone = "aqua" | "mint" | "sky" | "surface";

const CARD_GRADIENTS: Record<CardTone, readonly [string, string, ...string[]]> = {
  surface: ["rgba(255,255,255,0.99)", "rgba(248,250,252,0.96)"],
  aqua: ["rgba(255,255,255,0.99)", "rgba(238,242,255,0.58)"],
  sky: ["rgba(255,255,255,0.99)", "rgba(240,249,255,0.52)"],
  mint: ["rgba(255,255,255,0.99)", "rgba(248,250,252,0.96)"],
};

export const ShadowCard = ({
  children,
  tone = "surface",
  ...viewProps
}: { children: React.ReactNode; tone?: CardTone } & React.ComponentProps<typeof View>) => (
  <View
    backgroundColor="transparent"
    shadowColor="#483FFF"
    shadowOpacity={0.05}
    shadowRadius={10}
    borderRadius={16}
    borderWidth={1}
    borderColor="#E2E8F0"
    shadowOffset={{ width: 0, height: 3 }}
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
