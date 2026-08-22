import { TrendingUp } from "@tamagui/lucide-icons";
import dayjs from "dayjs";
import weekday from "dayjs/plugin/weekday";
import { SizableText, View, XStack, YStack } from "tamagui";

import { OverviewStore } from "../data/overview.store";
import { ShadowCard } from "./shadow.card";

dayjs.extend(weekday);

const DAY_LABELS = ["L", "M", "X", "J", "V", "S", "D"];

export const WeeklySummary = () => {
  const dailyValues = DAY_LABELS.map((_, day) => {
    const dayStart = dayjs().weekday(day).startOf("day").valueOf();
    const dayEnd = dayjs().weekday(day).endOf("day").valueOf();
    return OverviewStore.hoursSaved({ from: dayStart, to: dayEnd });
  });
  const maxValue = Math.max(...dailyValues, 0);
  const chartMaximum = Math.max(maxValue, 4);
  const savedThisWeek = OverviewStore.hoursSaved({
    from: dayjs().weekday(0).startOf("week").valueOf(),
    to: dayjs().valueOf(),
  });
  const savedLastWeek = OverviewStore.hoursSaved({
    from: dayjs().weekday(-7).startOf("week").valueOf(),
    to: dayjs().weekday(-7).endOf("week").valueOf(),
  });
  const trend = savedLastWeek > 0 ? ((savedThisWeek - savedLastWeek) / savedLastWeek) * 100 : 0;

  return (
    <ShadowCard padding="$5" tone="aqua">
      <YStack gap="$4">
        <XStack gap="$3" height={142}>
          <YStack justifyContent="space-between" paddingBottom={25} width={30}>
            <SizableText color="$text6" fontSize="$2">{chartMaximum.toFixed(0)}h</SizableText>
            <SizableText color="$text6" fontSize="$2">{(chartMaximum / 2).toFixed(0)}h</SizableText>
            <SizableText color="$text6" fontSize="$2">0h</SizableText>
          </YStack>
          <XStack alignItems="flex-end" flex={1} gap="$2">
            {dailyValues.map((value, day) => {
              const isToday = dayjs().weekday(day).isSame(dayjs(), "day");
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
            <SizableText color="$text11" fontSize="$7" fontWeight="900">
              {`${Math.floor(savedThisWeek)}h ${Math.round((savedThisWeek % 1) * 60)}m`}
            </SizableText>
          </YStack>
          <YStack alignItems="flex-end" gap="$1">
            <SizableText color="$text6" fontSize="$2">Tendencia</SizableText>
            <XStack alignItems="center" gap="$1">
              <TrendingUp color="$primary11" size={17} />
              <SizableText color="$primary11" fontSize="$6" fontWeight="900">
                {`${trend >= 0 ? "+" : ""}${Math.round(trend)}%`}
              </SizableText>
            </XStack>
          </YStack>
        </XStack>
      </YStack>
    </ShadowCard>
  );
};
