import type { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { getFocusedRouteNameFromRoute } from "@react-navigation/native";
import { Plus } from "@tamagui/lucide-icons";
import { BlurView } from "expo-blur";
import { router } from "expo-router";
import { useEffect } from "react";
import { Platform, Pressable, StyleSheet, View } from "react-native";
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { colors } from "../../theme/colors";
import { LiquidTabItem } from "./LiquidTabItem";

const BAR_MARGIN = 18;
export const LIQUID_TAB_BAR_HEIGHT = 64;
export const LIQUID_TAB_BAR_BOTTOM_GAP = 10;
export const LIQUID_TAB_BAR_MIN_SAFE_BOTTOM = 12;
const INNER_PADDING = 5;

export function LiquidGlassTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const visibleRoutes = state.routes.filter((route) => {
    const itemStyle = StyleSheet.flatten(descriptors[route.key]?.options.tabBarItemStyle);
    return itemStyle?.display !== "none";
  });
  const visibleActiveIndex = Math.max(0, visibleRoutes.findIndex((route) => route.key === state.routes[state.index]?.key));
  const activeIndex = useSharedValue(visibleActiveIndex);
  const itemWidth = useSharedValue(0);
  const activeRoute = state.routes[state.index];
  const nestedRouteName = activeRoute ? getFocusedRouteNameFromRoute(activeRoute) : undefined;

  useEffect(() => {
    activeIndex.value = withSpring(visibleActiveIndex, {
      damping: 24,
      mass: 0.78,
      overshootClamping: true,
      stiffness: 210,
    });
  }, [activeIndex, visibleActiveIndex]);

  const indicatorStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: activeIndex.value * itemWidth.value }],
    width: itemWidth.value,
  }));

  if (activeRoute?.name === "tips" && nestedRouteName && nestedRouteName !== "index") {
    return null;
  }

  return (
    <View
      pointerEvents="box-none"
      style={[
        styles.positioner,
        {
          bottom: Math.max(insets.bottom, LIQUID_TAB_BAR_MIN_SAFE_BOTTOM) + LIQUID_TAB_BAR_BOTTOM_GAP,
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
              itemWidth.value = (event.nativeEvent.layout.width - INNER_PADDING * 2) / visibleRoutes.length;
            }}
          >
            <Animated.View pointerEvents="none" style={[styles.activePill, indicatorStyle]} />

            {visibleRoutes.map((route) => {
              const descriptor = descriptors[route.key];
              if (!descriptor) return null;
              const { options } = descriptor;
              const focused = state.routes[state.index]?.key === route.key;
              const color = focused ? colors.primary.light.primary9 : colors.text.light.text6;
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
                  testID={options.tabBarButtonTestID}
                  onLongPress={onLongPress}
                  onPress={onPress}
                />
              );
            })}
          </View>
        </View>
      </View>
      <View style={styles.createShadow}>
        <View style={styles.createGlassClip}>
          <BlurView
            blurReductionFactor={4}
            experimentalBlurMethod="dimezisBlurView"
            intensity={55}
            pointerEvents="none"
            style={StyleSheet.absoluteFill}
            tint="systemUltraThinMaterialLight"
          />
          <View pointerEvents="none" style={styles.createOverlay} />
          <Pressable
            accessibilityLabel="Crear nuevo modo"
            accessibilityRole="button"
            style={styles.createButton}
            onPress={() => router.push({ pathname: "/onboarding", params: { mode: "create" } })}
          >
            <Plus color={colors.primary.light.primary9} size={28} strokeWidth={2.2} />
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  positioner: {
    flexDirection: "row",
    gap: 12,
    height: LIQUID_TAB_BAR_HEIGHT,
    position: "absolute",
  },
  shadowShell: {
    borderRadius: 32,
    elevation: 10,
    flex: 1,
    height: LIQUID_TAB_BAR_HEIGHT,
    shadowColor: colors.grey.light.grey5,
    shadowOffset: { height: 8, width: 0 },
    shadowOpacity: Platform.OS === "android" ? 0.16 : 0.11,
    shadowRadius: 18,
  },
  glassClip: {
    borderColor: "rgba(255,255,255,0.82)",
    borderRadius: 32,
    borderWidth: 1,
    flex: 1,
    overflow: "hidden",
  },
  translucentOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(255,255,255,0.2)",
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
    backgroundColor: "rgba(255,255,255,0.72)",
    borderColor: "rgba(255,255,255,0.88)",
    borderRadius: 27,
    borderWidth: 1,
    bottom: INNER_PADDING,
    elevation: 3,
    left: INNER_PADDING,
    overflow: "hidden",
    position: "absolute",
    shadowColor: colors.grey.light.grey5,
    shadowOffset: { height: 3, width: 0 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    top: INNER_PADDING,
  },
  createShadow: {
    borderRadius: 32,
    elevation: 10,
    height: LIQUID_TAB_BAR_HEIGHT,
    shadowColor: colors.grey.light.grey5,
    shadowOffset: { height: 8, width: 0 },
    shadowOpacity: Platform.OS === "android" ? 0.16 : 0.11,
    shadowRadius: 18,
    width: LIQUID_TAB_BAR_HEIGHT,
  },
  createGlassClip: {
    borderColor: "rgba(255,255,255,0.86)",
    borderRadius: 32,
    borderWidth: 1,
    flex: 1,
    overflow: "hidden",
  },
  createOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(255,255,255,0.46)",
  },
  createButton: {
    alignItems: "center",
    flex: 1,
    justifyContent: "center",
  },
});
