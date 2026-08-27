import { BlurView } from "expo-blur";
import { useRef, useState } from "react";
import {
  FlatList,
  Pressable,
  StyleSheet,
} from "react-native";
import type { NativeScrollEvent, NativeSyntheticEvent } from "react-native";
import { Button, SizableText, View, XStack, YStack } from "tamagui";

import { ALL_PLAN_WEEKDAYS } from "../data/android-reward";
import type { PlanWeekday } from "../data/android-reward";
import { ShadowCard } from "./shadow.card";

type TimeTarget = "start" | "end";
type Period = "a.m." | "p.m.";

const HOURS = Array.from({ length: 12 }, (_, index) => index + 1);
const MINUTES = Array.from({ length: 60 }, (_, index) => index);
const PERIODS: Period[] = ["a.m.", "p.m."];
const CUSTOM_MINUTES = Array.from({ length: 999 }, (_, index) => index + 1);
const DAY_LABELS: Record<PlanWeekday, string> = {
  1: "L",
  2: "M",
  3: "M",
  4: "J",
  5: "V",
  6: "S",
  7: "D",
};
const DAY_SHORT_NAMES: Record<PlanWeekday, string> = {
  1: "Lun",
  2: "Mar",
  3: "Mié",
  4: "Jue",
  5: "Vie",
  6: "Sáb",
  7: "Dom",
};
const ROW_HEIGHT = 40;
const VISIBLE_ROWS = 5;
const WHEEL_HEIGHT = ROW_HEIGHT * VISIBLE_ROWS;

function timeParts(totalMinutes: number) {
  const hour24 = Math.floor(totalMinutes / 60) % 24;
  return {
    hour: hour24 % 12 || 12,
    minute: totalMinutes % 60,
    period: (hour24 >= 12 ? "p.m." : "a.m.") as Period,
  };
}

function toTotalMinutes(hour: number, minute: number, period: Period) {
  const hour24 = period === "p.m." ? (hour % 12) + 12 : hour % 12;
  return hour24 * 60 + minute;
}

function formatTime(totalMinutes: number) {
  const { hour, minute, period } = timeParts(totalMinutes);
  return `${hour}:${String(minute).padStart(2, "0")} ${period}`;
}

function recurrenceLabel(weekdays: PlanWeekday[]) {
  if (weekdays.length === 7) return "Todos los días";
  if (weekdays.length === 5 && [1, 2, 3, 4, 5].every((day) => weekdays.includes(day as PlanWeekday))) {
    return "Lunes a viernes";
  }
  return weekdays.map((day) => DAY_SHORT_NAMES[day]).join(", ");
}

function TimeChip({ active, value, onPress }: { active: boolean; value: number; onPress: () => void }) {
  return (
    <Button
      unstyled
      alignItems="center"
      backgroundColor={active ? "#483FFF" : "rgba(255, 255, 255, 0.72)"}
      borderColor={active ? "#483FFF" : "#E2E8F0"}
      borderRadius={99}
      borderWidth={1}
      justifyContent="center"
      minWidth={112}
      paddingHorizontal="$3"
      paddingVertical="$2.5"
      pressStyle={{ opacity: 0.74 }}
      onPress={onPress}
    >
      <SizableText color={active ? "white" : "$text11"} fontWeight="800" size="$4">
        {formatTime(value)}
      </SizableText>
    </Button>
  );
}

function TimeRow({
  active,
  label,
  value,
  onPress,
}: {
  active: boolean;
  label: string;
  value: number;
  onPress: () => void;
}) {
  return (
    <XStack alignItems="center" justifyContent="space-between" minHeight={70} paddingHorizontal="$5">
      <SizableText color="$text11" fontWeight="700" size="$5">{label}:</SizableText>
      <TimeChip active={active} value={value} onPress={onPress} />
    </XStack>
  );
}

function Wheel<T extends number | string>({
  values,
  selected,
  width,
  formatValue = String,
  onChange,
}: {
  values: T[];
  selected: T;
  width: number;
  formatValue?: (value: T) => string;
  onChange: (value: T) => void;
}) {
  const listRef = useRef<FlatList<T>>(null);
  const selectedIndex = Math.max(0, values.indexOf(selected));

  const selectAtOffset = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const index = Math.max(0, Math.min(values.length - 1, Math.round(event.nativeEvent.contentOffset.y / ROW_HEIGHT)));
    const value = values[index];
    if (value !== undefined && value !== selected) onChange(value);
  };

  return (
    <FlatList
      contentContainerStyle={styles.wheelContent}
      data={values}
      decelerationRate="fast"
      getItemLayout={(_, index) => ({ index, length: ROW_HEIGHT, offset: ROW_HEIGHT * index })}
      initialScrollIndex={selectedIndex}
      keyExtractor={(item, index) => `${String(item)}-${index}`}
      nestedScrollEnabled
      ref={listRef}
      showsVerticalScrollIndicator={false}
      snapToAlignment="start"
      snapToInterval={ROW_HEIGHT}
      style={{ height: WHEEL_HEIGHT, width }}
      onMomentumScrollEnd={selectAtOffset}
      onScrollEndDrag={selectAtOffset}
      renderItem={({ item, index }) => {
        const distance = Math.abs(index - selectedIndex);
        return (
          <Pressable
            style={[styles.wheelRow, { opacity: distance === 0 ? 1 : distance === 1 ? 0.48 : 0.18 }]}
            onPress={() => {
              listRef.current?.scrollToIndex({ animated: true, index });
              onChange(item);
            }}
          >
            <SizableText color="$text11" fontWeight={distance === 0 ? "800" : "600"} size="$5">
              {formatValue(item)}
            </SizableText>
          </Pressable>
        );
      }}
    />
  );
}

function GlassTimePicker({
  value,
  onChange,
  onClose,
}: {
  value: number;
  onChange: (minutes: number) => void;
  onClose: () => void;
}) {
  const { hour, minute, period } = timeParts(value);
  const update = (nextHour: number, nextMinute: number, nextPeriod: Period) => {
    onChange(toTotalMinutes(nextHour, nextMinute, nextPeriod));
  };

  return (
    <Pressable style={styles.pickerBackdrop} onPress={onClose}>
      <Pressable style={styles.pickerShadow} onPress={(event) => event.stopPropagation()}>
        <View borderRadius={26} flex={1} overflow="hidden">
          <BlurView
            blurReductionFactor={4}
            experimentalBlurMethod="dimezisBlurView"
            intensity={62}
            pointerEvents="none"
            style={StyleSheet.absoluteFill}
            tint="systemUltraThinMaterialLight"
          />
          <View pointerEvents="none" style={styles.pickerOverlay} />
          <View pointerEvents="none" style={styles.pickerHighlight} />
          <View pointerEvents="none" style={styles.selectedRow} />
          <XStack alignItems="center" flex={1} justifyContent="center">
            <Wheel values={HOURS} selected={hour} width={72} onChange={(next) => update(next, minute, period)} />
            <Wheel values={MINUTES} selected={minute} width={72} formatValue={(next) => String(next).padStart(2, "0")} onChange={(next) => update(hour, next, period)} />
            <Wheel values={PERIODS} selected={period} width={82} onChange={(next) => update(hour, minute, next)} />
          </XStack>
        </View>
      </Pressable>
    </Pressable>
  );
}

export function GlassMinutePicker({ value, onChange }: { value: number; onChange: (minutes: number) => void }) {
  const selected = CUSTOM_MINUTES.includes(value) ? value : CUSTOM_MINUTES[0] ?? 1;

  return (
    <View alignSelf="center" style={[styles.pickerShadow, styles.minutePickerShadow]}>
      <View borderRadius={26} flex={1} overflow="hidden">
        <BlurView
          blurReductionFactor={4}
          experimentalBlurMethod="dimezisBlurView"
          intensity={62}
          pointerEvents="none"
          style={StyleSheet.absoluteFill}
          tint="systemUltraThinMaterialLight"
        />
        <View pointerEvents="none" style={styles.pickerOverlay} />
        <View pointerEvents="none" style={styles.pickerHighlight} />
        <View pointerEvents="none" style={styles.selectedRow} />
        <XStack alignItems="center" flex={1} justifyContent="center">
          <Wheel
            formatValue={(minutes) => `${minutes} min`}
            selected={selected}
            values={CUSTOM_MINUTES}
            width={176}
            onChange={onChange}
          />
        </XStack>
      </View>
    </View>
  );
}

export function ScheduleCard({
  endMinute,
  startMinute,
  weekdays,
  onTimeChange,
  onWeekdaysChange,
}: {
  endMinute: number;
  startMinute: number;
  weekdays: PlanWeekday[];
  onTimeChange: (target: TimeTarget, minutes: number) => void;
  onWeekdaysChange: (weekdays: PlanWeekday[]) => void;
}) {
  const [openTarget, setOpenTarget] = useState<TimeTarget | null>(null);
  const activeValue = openTarget === "start" ? startMinute : endMinute;

  const toggleWeekday = (day: PlanWeekday) => {
    const selected = weekdays.includes(day);
    if (selected && weekdays.length === 1) return;
    onWeekdaysChange(
      selected
        ? weekdays.filter((entry) => entry !== day)
        : [...weekdays, day].sort((first, second) => first - second),
    );
  };

  return (
    <YStack gap="$2" position="relative">
      <ShadowCard padding={0} tone="sky">
        <TimeRow active={openTarget === "start"} label="Inicio" value={startMinute} onPress={() => setOpenTarget("start")} />
        <TimeRow active={openTarget === "end"} label="Fin" value={endMinute} onPress={() => setOpenTarget("end")} />
      </ShadowCard>
      <ShadowCard padding={0} tone="surface">
        <XStack alignItems="center" gap={6} justifyContent="space-between" minHeight={76} paddingHorizontal="$4">
          {ALL_PLAN_WEEKDAYS.map((day) => {
            const selected = weekdays.includes(day);
            return (
              <Button
                key={day}
                unstyled
                alignItems="center"
                backgroundColor={selected ? "$primary9" : "rgba(255, 255, 255, 0.7)"}
                borderColor={selected ? "$primary9" : "#E2E8F0"}
                borderRadius={99}
                borderWidth={1}
                flex={1}
                height={36}
                justifyContent="center"
                maxWidth={38}
                pressStyle={{ opacity: 0.72 }}
                onPress={() => toggleWeekday(day)}
              >
                <SizableText color={selected ? "white" : "$text11"} fontWeight="800" size="$3">
                  {DAY_LABELS[day]}
                </SizableText>
              </Button>
            );
          })}
        </XStack>
      </ShadowCard>
      <SizableText color="$text10" fontWeight="600" paddingLeft="$2" size="$3">
        {recurrenceLabel(weekdays)}
      </SizableText>
      {openTarget ? (
        <GlassTimePicker
          value={activeValue}
          onChange={(minutes) => onTimeChange(openTarget, minutes)}
          onClose={() => setOpenTarget(null)}
        />
      ) : null}
    </YStack>
  );
}

const styles = StyleSheet.create({
  pickerBackdrop: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 20,
  },
  pickerShadow: {
    borderColor: "rgba(255, 255, 255, 0.9)",
    borderRadius: 27,
    borderWidth: 1,
    elevation: 14,
    height: 206,
    shadowColor: "#1D7FA7",
    shadowOffset: { height: 7, width: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    width: 264,
  },
  minutePickerShadow: {
    width: 206,
  },
  pickerOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(238, 242, 255, 0.76)",
  },
  pickerHighlight: {
    backgroundColor: "rgba(255, 255, 255, 0.94)",
    height: 1,
    left: 20,
    position: "absolute",
    right: 20,
    top: 1,
  },
  selectedRow: {
    backgroundColor: "rgba(255, 255, 255, 0.72)",
    borderColor: "rgba(255, 255, 255, 0.96)",
    borderRadius: 18,
    borderWidth: 1,
    height: ROW_HEIGHT,
    left: 13,
    position: "absolute",
    right: 13,
    top: (206 - ROW_HEIGHT) / 2,
  },
  wheelContent: {
    paddingVertical: ROW_HEIGHT * 2,
  },
  wheelRow: {
    alignItems: "center",
    height: ROW_HEIGHT,
    justifyContent: "center",
  },
});
