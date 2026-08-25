import type { ReactNode } from "react";
import { useEffect } from "react";
import { Pressable, StyleSheet } from "react-native";
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated";

export function LiquidTabItem({
  accessibilityLabel,
  focused,
  icon,
  onLongPress,
  onPress,
  testID,
}: {
  accessibilityLabel?: string;
  focused: boolean;
  icon: ReactNode;
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
    justifyContent: "center",
  },
});
