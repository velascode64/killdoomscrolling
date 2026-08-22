import type { ReactNode } from "react";
import { useEffect } from "react";
import { Pressable, StyleSheet, Text } from "react-native";
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated";

export function LiquidTabItem({
  accessibilityLabel,
  focused,
  icon,
  label,
  onLongPress,
  onPress,
  testID,
}: {
  accessibilityLabel?: string;
  focused: boolean;
  icon: ReactNode;
  label: string;
  onLongPress: () => void;
  onPress: () => void;
  testID?: string;
}) {
  const focusProgress = useSharedValue(focused ? 1 : 0);

  useEffect(() => {
    focusProgress.value = withTiming(focused ? 1 : 0, { duration: 180 });
  }, [focusProgress, focused]);

  const animatedContentStyle = useAnimatedStyle(() => ({
    opacity: 0.62 + focusProgress.value * 0.38,
    transform: [{ scale: 0.94 + focusProgress.value * 0.06 }],
  }));

  return (
    <Pressable
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="button"
      accessibilityState={focused ? { selected: true } : {}}
      style={styles.pressable}
      testID={testID}
      onLongPress={onLongPress}
      onPress={onPress}
    >
      <Animated.View style={[styles.content, animatedContentStyle]}>
        {icon}
        <Text numberOfLines={1} style={[styles.label, focused && styles.activeLabel]}>
          {label}
        </Text>
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pressable: {
    alignItems: "center",
    flex: 1,
    height: "100%",
    justifyContent: "center",
  },
  content: {
    alignItems: "center",
    gap: 4,
    justifyContent: "center",
    minWidth: 82,
  },
  label: {
    color: "#5D7C8E",
    fontFamily: "Satoshi",
    fontSize: 12,
    lineHeight: 14,
  },
  activeLabel: {
    color: "#003B5C",
    fontFamily: "SatoshiBold",
  },
});
