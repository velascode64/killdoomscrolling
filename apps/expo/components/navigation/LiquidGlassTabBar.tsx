import type { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { BlurView } from "expo-blur";
import { useEffect } from "react";
import { Platform, StyleSheet, View } from "react-native";
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { LiquidTabItem } from "./LiquidTabItem";

const BAR_MARGIN = 20;
const BAR_HEIGHT = 78;
const INNER_PADDING = 8;

export function LiquidGlassTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const activeIndex = useSharedValue(state.index);
  const itemWidth = useSharedValue(0);

  useEffect(() => {
    activeIndex.value = withSpring(state.index, {
      damping: 24,
      mass: 0.78,
      overshootClamping: true,
      stiffness: 210,
    });
  }, [activeIndex, state.index]);

  const indicatorStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: activeIndex.value * itemWidth.value }],
    width: itemWidth.value,
  }));

  return (
    <View
      pointerEvents="box-none"
      style={[
        styles.positioner,
        {
          bottom: Math.max(insets.bottom, 12) + 10,
          left: BAR_MARGIN,
          right: BAR_MARGIN,
        },
      ]}
    >
      <View style={styles.shadowShell}>
        <View style={styles.glassClip}>
          <BlurView
            blurReductionFactor={4}
            experimentalBlurMethod="dimezisBlurView"
            intensity={55}
            pointerEvents="none"
            style={StyleSheet.absoluteFill}
            tint="systemUltraThinMaterialLight"
          />
          <View pointerEvents="none" style={styles.translucentOverlay} />
          <View pointerEvents="none" style={styles.topHighlight} />

          <View
            style={styles.tabs}
            onLayout={(event) => {
              itemWidth.value = (event.nativeEvent.layout.width - INNER_PADDING * 2) / state.routes.length;
            }}
          >
            <Animated.View pointerEvents="none" style={[styles.activePill, indicatorStyle]}>
              <View style={styles.pillHighlight} />
            </Animated.View>

            {state.routes.map((route, index) => {
              const descriptor = descriptors[route.key];
              if (!descriptor) return null;
              const { options } = descriptor;
              const focused = state.index === index;
              const color = focused ? "#003B5C" : "#6F8E9F";
              const label =
                typeof options.tabBarLabel === "string"
                  ? options.tabBarLabel
                  : typeof options.title === "string"
                    ? options.title
                    : route.name;

              const onPress = () => {
                const event = navigation.emit({
                  canPreventDefault: true,
                  target: route.key,
                  type: "tabPress",
                });

                if (!focused && !event.defaultPrevented) {
                  navigation.navigate(route.name, route.params);
                }
              };

              const onLongPress = () => {
                navigation.emit({ target: route.key, type: "tabLongPress" });
              };

              return (
                <LiquidTabItem
                  accessibilityLabel={options.tabBarAccessibilityLabel}
                  focused={focused}
                  icon={options.tabBarIcon?.({ color, focused, size: 23 })}
                  key={route.key}
                  label={label}
                  testID={options.tabBarButtonTestID}
                  onLongPress={onLongPress}
                  onPress={onPress}
                />
              );
            })}
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  positioner: {
    height: BAR_HEIGHT,
    position: "absolute",
  },
  shadowShell: {
    borderRadius: 34,
    elevation: 14,
    height: BAR_HEIGHT,
    shadowColor: "#1D7FA7",
    shadowOffset: { height: 8, width: 0 },
    shadowOpacity: Platform.OS === "android" ? 0.2 : 0.13,
    shadowRadius: 18,
  },
  glassClip: {
    borderColor: "rgba(255,255,255,0.8)",
    borderRadius: 34,
    borderWidth: 1,
    flex: 1,
    overflow: "hidden",
  },
  translucentOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(235, 250, 253, 0.68)",
  },
  topHighlight: {
    backgroundColor: "rgba(255,255,255,0.86)",
    borderRadius: 99,
    height: 1,
    left: 24,
    position: "absolute",
    right: 24,
    top: 1,
  },
  tabs: {
    flex: 1,
    flexDirection: "row",
    padding: INNER_PADDING,
  },
  activePill: {
    backgroundColor: "rgba(255,255,255,0.68)",
    borderColor: "rgba(255,255,255,0.92)",
    borderRadius: 27,
    borderWidth: 1,
    bottom: INNER_PADDING,
    elevation: 3,
    left: INNER_PADDING,
    overflow: "hidden",
    position: "absolute",
    shadowColor: "#5FCFE8",
    shadowOffset: { height: 3, width: 0 },
    shadowOpacity: 0.14,
    shadowRadius: 8,
    top: INNER_PADDING,
  },
  pillHighlight: {
    backgroundColor: "rgba(255,255,255,0.82)",
    height: 1,
    left: 14,
    position: "absolute",
    right: 14,
    top: 1,
  },
});
