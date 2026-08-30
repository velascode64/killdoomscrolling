import { router, Stack } from "expo-router";
import { observer } from "mobx-react-lite";
import { Button, SizableText } from "tamagui";

export const unstable_settings = {
  initialRouteName: "modal",
};

const SettingsLayout = observer(() => {
  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{
          title: "Ajustes",
          presentation: "modal",
          headerRight: () => {
            return (
              <Button
                pressStyle={{
                  backgroundColor: "transparent",
                  borderWidth: 0,
                }}
                onPress={() => {
                  router.back();
                }}
                borderWidth={0}
                size="$4"
                backgroundColor={"transparent"}
              >
                <SizableText color="$text11" size="$4">
                  Listo
                </SizableText>
              </Button>
            );
          },
        }}
      />
      <Stack.Screen
        name="delete-app-data"
        options={{
          title: "Eliminar mis datos",
          presentation: "modal",
          headerRight: () => {
            return (
              <Button
                pressStyle={{
                  backgroundColor: "transparent",
                  borderWidth: 0,
                }}
                onPress={() => {
                  router.back();
                }}
                borderWidth={0}
                size="$4"
                backgroundColor={"transparent"}
              >
                <SizableText color="$text11" size="$4">
                  Cancelar
                </SizableText>
              </Button>
            );
          },
        }}
      />
      <Stack.Screen
        name="app-icon"
        options={{
          title: "App Icon",
        }}
      />
      <Stack.Screen
        name="theme"
        options={{
          title: "Tema",
        }}
      />
      <Stack.Screen name="permissions" options={{ title: "Permisos" }} />
      <Stack.Screen name="privacy" options={{ title: "Privacidad y datos" }} />
      <Stack.Screen name="terms" options={{ title: "Términos y condiciones" }} />
      <Stack.Screen name="about" options={{ title: "Acerca de" }} />
    </Stack>
  );
});

export default SettingsLayout;
