import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { Tabs } from "expo-router";

import { LiquidGlassTabBar } from "../../components/navigation/LiquidGlassTabBar";

export const unstable_settings = {
  initialRouteName: "overview",
};

const OverviewLayout = () => (
  <Tabs
    screenOptions={{ headerShown: false }}
    tabBar={(props) => <LiquidGlassTabBar {...props} />}
  >
    <Tabs.Screen
      name="overview"
      options={{
        title: "Overview",
        tabBarIcon: ({ color, size }) => (
          <MaterialCommunityIcons color={color} name="chart-box-outline" size={size} />
        ),
      }}
    />
    <Tabs.Screen
      name="apps"
      options={{
        title: "Apps",
        tabBarIcon: ({ color, size }) => (
          <MaterialCommunityIcons color={color} name="view-grid-outline" size={size} />
        ),
      }}
    />
    <Tabs.Screen
      name="tips"
      options={{
        title: "Tips",
        tabBarIcon: ({ color, size }) => (
          <MaterialCommunityIcons color={color} name="lightbulb-on-outline" size={size} />
        ),
      }}
    />
  </Tabs>
);

export default OverviewLayout;
