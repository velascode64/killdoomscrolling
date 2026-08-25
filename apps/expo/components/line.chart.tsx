import type { Text as ReactNativeText } from "react-native";
import { LineChart as LineChartGifted } from "react-native-gifted-charts";
import { H4, Paragraph, Text, View, YStack } from "tamagui";

import { useTheme as useThemeBase } from "./theme-provider";
import { chartColors } from "../theme/colors";

export const LineChart = ({
  data,
  dummy,
  labelSuffix = "x",
}: {
  data: {
    date: string;
    value: number;
    label?: string;
    labelTextStyle?: React.ComponentProps<typeof ReactNativeText>["style"];
  }[];
  labelSuffix?: string;
  dummy?: boolean;
}) => {
  const themeBase = useThemeBase();
  return (
    <View position="relative">
      {dummy && (
        <View
          position="absolute"
          top={0}
          left={0}
          right={0}
          bottom={0}
          backgroundColor={themeBase.theme === "light" ? "rgba(255,255,255,0.7)" : "rgba(20,20,20,0.7)"}
          zIndex={99}
          flexDirection="row"
          alignItems="center"
          paddingBottom={"$6"}
          justifyContent="center"
        >
          <YStack flex={1}>
            <H4 fontWeight={"bold"} fontSize={"$5"} textAlign="center">
              Collecting data
            </H4>
            <Paragraph textAlign="center" lineHeight={20}>
              We are collecting data for this chart. It will be available in a few days.
            </Paragraph>
          </YStack>
        </View>
      )}
      <LineChartGifted
        areaChart
        data={data}
        hideDataPoints
        spacing={20}
        color={chartColors.primary}
        thickness={3}
        height={130}
        startFillColor={chartColors.secondary}
        endFillColor={chartColors.track}
        startOpacity={0.9}
        endOpacity={0.2}
        initialSpacing={0}
        noOfSections={2}
        yAxisColor={chartColors.grid}
        yAxisThickness={1}
        rulesType="dashed"
        rulesColor={chartColors.grid}
        yAxisTextStyle={{ color: chartColors.label, fontFamily: "Satoshi", fontSize: 12 }}
        yAxisLabelSuffix={labelSuffix}
        yAxisLabelWidth={30}
        scrollToEnd
        yAxisLabelContainerStyle={{}}
        yAxisTextNumberOfLines={3}
        rulesThickness={1}
        dataPointLabelShiftX={2}
        horizontalRulesStyle={{ color: chartColors.grid }}
        xAxisColor={chartColors.grid}
        animationDuration={1000}
        isAnimated
        pointerConfig={{
          pointerStripHeight: 160,
          pointerStripColor: chartColors.secondary,
          pointerStripWidth: 2,
          pointerColor: chartColors.primary,
          radius: 6,
          pointerLabelWidth: 100,
          pointerLabelHeight: 90,
          activatePointersOnLongPress: true,
          autoAdjustPointerLabelPosition: false,
          pointerLabelComponent: (items: [{ date: string; value: string }]) => {
            return (
              <View
                style={{
                  height: 90,
                  width: 100,
                  justifyContent: "center",
                  marginTop: -30,
                  marginLeft: -40,
                }}
                backgroundColor={chartColors.primary}
              >
                <Text style={{ color: "white", fontSize: 14, marginBottom: 6, textAlign: "center" }}>
                  {items[0].date}
                </Text>

                <View
                  style={{ paddingHorizontal: 14, paddingVertical: 6, borderRadius: 16, backgroundColor: "white" }}
                  backgroundColor={"white"}
                >
                  <Text style={{ fontWeight: "bold", textAlign: "center", color: "black" }}>
                    {"$" + items[0].value + ".0"}
                  </Text>
                </View>
              </View>
            );
          },
        }}
      />
    </View>
  );
};
