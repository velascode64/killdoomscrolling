import { BarChart2, LayoutGrid } from "@tamagui/lucide-icons";
import { BlurView } from "expo-blur";
import { GlassView, isLiquidGlassAvailable } from "expo-glass-effect";
import { Tabs } from "expo-router";
import { Platform, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { SizableText, YStack } from "tamagui";

export const unstable_settings = {
  initialRouteName: "index",
};

const OverviewLayout = () => {
  const insets = useSafeAreaInsets();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: "#003B5C",
        tabBarInactiveTintColor: "#7896A8",
        tabBarShowLabel: false,
        tabBarBackground: () => <FrostedTabBackground />,
        tabBarStyle: {
          position: "absolute",
          left: 20,
          right: 20,
          bottom: Math.max(insets.bottom, 16) + 10,
          height: 76,
          borderRadius: 28,
          borderTopWidth: 0,
          backgroundColor: "transparent",
          elevation: 0,
          shadowOpacity: 0,
          overflow: "hidden",
        },
        tabBarItemStyle: {
          borderRadius: 22,
          paddingVertical: 8,
        },
      }}
    >
      <Tabs.Screen
        name="overview"
        options={{
          tabBarIcon: ({ color, focused }) => (
            <YStack alignItems="center" gap="$1">
              <BarChart2 size={21} color={color} strokeWidth={focused ? 2.6 : 2} />
              <SizableText color={color} fontSize="$2" fontWeight={focused ? "900" : "600"} lineHeight={13}>
                Overview
              </SizableText>
            </YStack>
          ),
          headerShown: false,
        }}
      />
      <Tabs.Screen
        name="apps"
        options={{
          tabBarIcon: ({ color, focused }) => (
            <YStack alignItems="center" gap="$1">
              <LayoutGrid size={21} color={color} strokeWidth={focused ? 2.6 : 2} />
              <SizableText color={color} fontSize="$2" fontWeight={focused ? "900" : "600"} lineHeight={13}>
                Apps
              </SizableText>
            </YStack>
          ),
          headerShown: false,
        }}
      />
    </Tabs>
  );
};

function FrostedTabBackground() {
  if (Platform.OS === "ios" && isLiquidGlassAvailable()) {
    return (
      <GlassView
        colorScheme="light"
        glassEffectStyle="regular"
        style={styles.tabBackground}
        tintColor="rgba(235, 252, 255, 0.72)"
      />
    );
  }

  return (
    <BlurView
      blurReductionFactor={3}
      experimentalBlurMethod="dimezisBlurView"
      intensity={60}
      style={styles.tabBackground}
      tint="systemUltraThinMaterialLight"
    />
  );
}

const styles = StyleSheet.create({
  tabBackground: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(248, 253, 254, 0.78)",
    borderColor: "rgba(162, 228, 250, 0.72)",
    borderRadius: 28,
    borderWidth: 1,
  },
});

export default OverviewLayout;
