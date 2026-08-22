import { Stack } from "expo-router";

export const unstable_settings = {
  initialRouteName: "index",
};

export default function TipsLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen
        name="[tipId]"
        options={{
          animation: "fade_from_bottom",
          animationDuration: 260,
          gestureEnabled: true,
        }}
      />
    </Stack>
  );
}
