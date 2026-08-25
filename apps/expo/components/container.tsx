import { useContext, useState } from "react";
import { LinearGradient } from "expo-linear-gradient";
import { StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { BottomTabBarHeightContext } from "@react-navigation/bottom-tabs";
import { ScrollView, View } from "tamagui";

import {
  LIQUID_TAB_BAR_BOTTOM_GAP,
  LIQUID_TAB_BAR_HEIGHT,
  LIQUID_TAB_BAR_MIN_SAFE_BOTTOM,
} from "./navigation/LiquidGlassTabBar";

export const Container = ({
  children,
  scroll = true,
  header,
  ...viewProps
}: {
  children: React.ReactNode;
  header?: ({ isSticky }: { isSticky: boolean }) => React.ReactNode;
} & React.ComponentProps<typeof View> & {
    scroll?: boolean;
    refreshControl?: React.ComponentProps<typeof ScrollView>["refreshControl"];
  }) => {
  const [isSticky, setIsSticky] = useState(false);
  const insets = useSafeAreaInsets();

  const tabBarHeight = useContext(BottomTabBarHeightContext);
  const floatingTabClearance =
    LIQUID_TAB_BAR_HEIGHT +
    Math.max(insets.bottom, LIQUID_TAB_BAR_MIN_SAFE_BOTTOM) +
    LIQUID_TAB_BAR_BOTTOM_GAP +
    16;
  const bottomInset = tabBarHeight === undefined
    ? insets.bottom
    : Math.max(tabBarHeight, floatingTabClearance);

  return (
    <View flex={1} backgroundColor="#F8FAFC">
      <LinearGradient
        colors={["#F8FAFC", "#F8FAFC", "#F2F5FF", "#F8FAFC"]}
        locations={[0, 0.28, 0.72, 1]}
        start={{ x: 0.08, y: 0 }}
        end={{ x: 0.92, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      {scroll ? (
        <ScrollView
          paddingTop={!header ? insets.top : undefined}
          showsVerticalScrollIndicator={false}
          flex={1}
          backgroundColor="transparent"
          $gtSm={{
            minWidth: 600,
            marginHorizontal: "auto",
            maxWidth: 600,
          }}
          scrollEventThrottle={16}
          onScroll={(event) => {
            const offsetY = event.nativeEvent.contentOffset.y;
            setIsSticky(offsetY >= 5);
          }}
          stickyHeaderIndices={header ? [0] : undefined}
          {...(viewProps as React.ComponentProps<typeof ScrollView>)}
        >
          {header?.({ isSticky })}
          <View
            flex={1}
            paddingBottom={bottomInset}
            paddingHorizontal="$4"
          >
            {children}
          </View>
        </ScrollView>
      ) : (
        <View
          paddingHorizontal="$4"
          paddingTop={insets.top}
          paddingBottom={bottomInset}
          flex={1}
          backgroundColor="transparent"
          $gtSm={{
            marginHorizontal: "auto",
            maxWidth: 600,
          }}
          {...viewProps}
        >
          <View flex={1}>
            {children}
          </View>
        </View>
      )}
    </View>
  );
};
