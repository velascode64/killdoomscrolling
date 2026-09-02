import type { ImageSourcePropType } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";
import { DarkTheme } from "@react-navigation/native";
import { Cog } from "@tamagui/lucide-icons";
import { Button, Heading, Image, View, XStack } from "tamagui";

import { useTheme } from "./theme-provider";

export const Header = ({ isSticky, ...props }: React.ComponentProps<typeof XStack> & { isSticky?: boolean }) => {
  const { theme } = useTheme();

  const insets = useSafeAreaInsets();
  return (
    <XStack
      alignItems="center"
      justifyContent="space-between"
      backgroundColor={theme === "light" ? "#FFF" : DarkTheme.colors.background}
      marginBottom="$1"
      paddingHorizontal="$4"
      paddingBottom="$3"
      paddingTop={insets.top + 8}
      borderColor={"$grey3"}
      borderBottomWidth={isSticky ? 1 : 0}
      {...props}
    >
      <XStack space="$2" alignItems="center">
        <View alignItems="center" height={44} justifyContent="center" overflow="hidden" width={44}>
          <Image
            source={
              // eslint-disable-next-line @typescript-eslint/no-var-requires
              require("../assets/images/rehabbit-splash.png") as ImageSourcePropType
            }
            height={64}
            resizeMode="contain"
            tintColor="#483FFF"
            width={64}
          />
        </View>
        <Heading color="$text11">Rehabbit</Heading>
      </XStack>
      <Button
        backgroundColor={"$background1"}
        shadowColor={"black"}
        shadowOpacity={0.1}
        shadowRadius={6}
        pressStyle={{
          backgroundColor: "$grey3",
          borderColor: "$grey3",
        }}
        borderRadius={999}
        borderWidth={1}
        borderColor={"$grey3"}
        shadowOffset={{ width: 0, height: 2 }}
        width={48}
        onPress={() => {
          router.push("/settings");
        }}
        height={48}
      >
        <Cog color="#868686" />
      </Button>
    </XStack>
  );
};
