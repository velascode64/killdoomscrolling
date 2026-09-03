import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { Tabs } from "expo-router";

import { LiquidGlassTabBar } from "../../components/navigation/LiquidGlassTabBar";
import { translate, useAppLanguage } from "../../components/translate";

export const unstable_settings = {
  initialRouteName: "overview",
};

const OverviewLayout = () => {
  useAppLanguage();
  return (
  <Tabs
    screenOptions={{ headerShown: false }}
    tabBar={(props) => <LiquidGlassTabBar {...props} />}
  >
    <Tabs.Screen
      name="overview"
      options={{
        title: translate.t("navigation.overview"),
        tabBarIcon: ({ color, size }) => (
          <MaterialCommunityIcons color={color} name="chart-box-outline" size={size} />
        ),
      }}
    />
    <Tabs.Screen
      name="apps"
      options={{
        href: null,
        title: translate.t("navigation.apps"),
        tabBarIcon: ({ color, size }) => (
          <MaterialCommunityIcons color={color} name="view-grid-outline" size={size} />
        ),
      }}
    />
    <Tabs.Screen
      name="tips"
      options={{
        title: translate.t("navigation.tips"),
        tabBarIcon: ({ color, size }) => (
          <MaterialCommunityIcons color={color} name="lightbulb-on-outline" size={size} />
        ),
      }}
    />
  </Tabs>
  );
};

export default OverviewLayout;
