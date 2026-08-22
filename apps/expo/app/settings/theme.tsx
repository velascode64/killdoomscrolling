import { Check, Sun } from "@tamagui/lucide-icons";
import { ListItem, View, YGroup, YStack } from "tamagui";
import { Container } from "../../components/container";

const Theme = () => {
  return (
    <Container paddingVertical={"$4"}>
      <YStack space="$3">
        <YGroup alignSelf="center" bordered size="$4">
          <YGroup.Item>
            <ListItem
              icon={
                <View backgroundColor="$blue2" borderRadius={"$3"} padding="$2">
                  <Sun color="$text11" size={24} />
                </View>
              }
              iconAfter={<Check color="$primary11" size={18} strokeWidth={2.5} />}
            >
              <ListItem.Text>Tema claro</ListItem.Text>
            </ListItem>
          </YGroup.Item>
        </YGroup>
      </YStack>
    </Container>
  );
};

export default Theme;
