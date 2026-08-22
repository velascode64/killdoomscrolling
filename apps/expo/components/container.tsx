import { useContext, useState } from "react";
import { LinearGradient } from "expo-linear-gradient";
import { StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { BottomTabBarHeightContext } from "@react-navigation/bottom-tabs";
import { ScrollView, View } from "tamagui";

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
  const bottomInset = tabBarHeight && insets.bottom ? tabBarHeight - insets.bottom : tabBarHeight ?? insets.bottom;

  return (
    <View flex={1} backgroundColor="#F8FDFE">
      <LinearGradient
        colors={["#F8FDFE", "#F8FDFE", "#EAFBFE", "#F8FDFE"]}
        locations={[0, 0.28, 0.72, 1]}
        start={{ x: 0.08, y: 0 }}
        end={{ x: 0.92, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      {scroll ? (
        <ScrollView
          paddingTop={!header ? insets.top : undefined}
          paddingBottom={bottomInset}
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
          paddingBottom={tabBarHeight ?? insets.bottom}
          flex={1}
          backgroundColor="transparent"
          $gtSm={{
            marginHorizontal: "auto",
            maxWidth: 600,
          }}
          {...viewProps}
        >
          <View flex={1} paddingBottom={tabBarHeight ?? insets.bottom}>
            {children}
          </View>
        </View>
      )}
    </View>
  );
};
