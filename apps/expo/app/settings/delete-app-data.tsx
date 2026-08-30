import { router } from "expo-router";
import { Alert } from "react-native";
import { Button, Label, SizableText, View, XStack, YStack } from "tamagui";
import { Container } from "../../components/container";
import { AppSettings } from "../../data/app.settings";
import { OverviewStore } from "../../data/overview.store";

const DeleteAppData = () => (
  <Container paddingVertical={"$4"}>
    <YStack space="$3">
      <View flexDirection="row" justifyContent="flex-end">
        <YStack space="$2">
          <Label size="$3" lineHeight={21} htmlFor={"delete-popover"}>
            Se eliminarán tus modos, respuestas de onboarding, estadísticas y
            eventos sincronizados. Esta acción no se puede deshacer.
          </Label>

          <XStack space="$2" alignItems="center" marginTop="$2">
            <Button
              size="$3"
              flex={1}
              justifyContent="center"
              flexDirection="row"
              onPress={() => router.back()}
            >
              <SizableText fontWeight={"bold"}>Cancelar</SizableText>
            </Button>
            <Button
              variant="outlined"
              flex={1}
              borderColor={"rgba(255,0,0,0.2)"}
              borderWidth={1}
              size="$3"
              backgroundColor={"rgba(255,0,0,0.1)"}
              onPress={async () => {
                try {
                  await AppSettings.dangerouslyDeleteAllData();
                  await OverviewStore.init();
                  router.replace("/");
                } catch (error) {
                  console.warn("Unable to delete Rehabbit data", error);
                  Alert.alert("No se pudieron eliminar los datos", "Conéctate a internet e inténtalo nuevamente para eliminar también los datos sincronizados.");
                }
              }}
            >
              <SizableText color="red" fontWeight={"bold"}>
                Eliminar mis datos
              </SizableText>
            </Button>
          </XStack>
        </YStack>
      </View>
    </YStack>
  </Container>
);

export default DeleteAppData;
