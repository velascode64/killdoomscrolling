import { TrendingUp } from "@tamagui/lucide-icons";
import dayjs from "dayjs";
import weekday from "dayjs/plugin/weekday";
import { observer } from "mobx-react-lite";
import { SizableText, View, XStack, YStack } from "tamagui";

import { OverviewStore } from "../data/overview.store";
import { ShadowCard } from "./shadow.card";

dayjs.extend(weekday);

const DAY_LABELS = ["L", "M", "X", "J", "V", "S", "D"];
const EMPTY_CHART_LEVELS = [90, 78, 67, 55, 45, 34, 24];

export const WeeklySummary = observer(() => {
  const dailyValues = DAY_LABELS.map((_, day) => {
    const dayStart = dayjs().weekday(day).startOf("day").valueOf();
    const dayEnd = dayjs().weekday(day).endOf("day").valueOf();
    return OverviewStore.hoursSaved({ from: dayStart, to: dayEnd });
  });
  const savedThisWeek = OverviewStore.hoursSaved({
    from: dayjs().weekday(0).startOf("week").valueOf(),
    to: dayjs().valueOf(),
  });
  const savedLastWeek = OverviewStore.hoursSaved({
    from: dayjs().weekday(-7).startOf("week").valueOf(),
    to: dayjs().weekday(-7).endOf("week").valueOf(),
  });
  const trend = savedLastWeek > 0 ? ((savedThisWeek - savedLastWeek) / savedLastWeek) * 100 : 0;
  const hasData = OverviewStore.totalInterrupted > 0 || OverviewStore.totalPrevented > 0;
  const chartValues = hasData ? dailyValues : EMPTY_CHART_LEVELS;
  const maxValue = Math.max(...chartValues, 0);
  const chartMaximum = hasData ? Math.max(maxValue, 4) : 100;
  const totalLabel = hasData ? `${Math.floor(savedThisWeek)}h ${Math.round((savedThisWeek % 1) * 60)}m` : "—";
  const trendLabel = hasData ? `${trend >= 0 ? "+" : ""}${Math.round(trend)}%` : "—";

  return (
    <ShadowCard padding="$5" tone="aqua">
      <View position="relative">
        <YStack gap="$4" opacity={hasData ? 1 : 0.38}>
          <XStack gap="$3" height={142}>
            <YStack justifyContent="space-between" paddingBottom={25} width={30}>
              <SizableText color="$text6" fontSize="$2">{hasData ? `${chartMaximum.toFixed(0)}h` : "—"}</SizableText>
              <SizableText color="$text6" fontSize="$2">{hasData ? `${(chartMaximum / 2).toFixed(0)}h` : "—"}</SizableText>
              <SizableText color="$text6" fontSize="$2">{hasData ? "0h" : "—"}</SizableText>
            </YStack>
            <XStack alignItems="flex-end" flex={1} gap="$2">
              {chartValues.map((value, day) => {
                const isToday = hasData && dayjs().weekday(day).isSame(dayjs(), "day");
                const barHeight = Math.max(3, (value / chartMaximum) * 104);
                return (
                  <YStack alignItems="center" flex={1} gap="$2" justifyContent="flex-end" key={DAY_LABELS[day]}>
                    <View
                      backgroundColor={isToday ? "$blue9" : "$blue4"}
                      borderRadius={99}
                      height={barHeight}
                      minHeight={3}
                      width={8}
                    />
                    <SizableText color={isToday ? "$text11" : "$text6"} fontSize="$2" fontWeight={isToday ? "900" : "600"}>
                      {DAY_LABELS[day]}
                    </SizableText>
                  </YStack>
                );
              })}
            </XStack>
          </XStack>

          <View backgroundColor="$borderColor" height={1} />

          <XStack alignItems="flex-end" justifyContent="space-between">
            <YStack gap="$1">
              <SizableText color="$text6" fontSize="$2">Total enfocado</SizableText>
              <SizableText color="$text11" fontSize="$7" fontWeight="900">{totalLabel}</SizableText>
            </YStack>
            <YStack alignItems="flex-end" gap="$1">
              <SizableText color="$text6" fontSize="$2">Tendencia</SizableText>
              <XStack alignItems="center" gap="$1">
                <TrendingUp color="$primary11" size={17} />
                <SizableText color="$primary11" fontSize="$6" fontWeight="900">{trendLabel}</SizableText>
              </XStack>
            </YStack>
          </XStack>
        </YStack>

        {!hasData && (
          <YStack
            alignItems="center"
            backgroundColor="rgba(240, 251, 253, 0.46)"
            borderRadius={22}
            bottom={0}
            justifyContent="center"
            left={0}
            paddingHorizontal="$5"
            right={0}
            top={0}
            position="absolute"
          >
            <YStack alignItems="center" gap="$1" maxWidth={250}>
              <SizableText color="$text11" fontSize="$5" fontWeight="900" textAlign="center">
                Estamos recopilando datos
              </SizableText>
              <SizableText color="$text10" fontSize="$3" lineHeight={19} textAlign="center">
                Una vez recopilemos datos, aquí verás tus estadísticas.
              </SizableText>
            </YStack>
          </YStack>
        )}
      </View>
    </ShadowCard>
  );
});
