import { CalendarDays, ChevronRight, Clock3 } from "@tamagui/lucide-icons";
import type { AndroidBlockableApp } from "expo-app-blocker";
import { LinearGradient } from "expo-linear-gradient";
import type { ReactNode } from "react";
import type { ImageSourcePropType } from "react-native";
import { Image, StyleSheet } from "react-native";
import { Button, H4, SizableText, View, XStack, YStack } from "tamagui";
import { brandGradient } from "../theme/colors";
import { CategoryGlyph } from "./category-selector";
import { AppAvatarStack } from "./mode-ui";
import { translate, useAppLanguage } from "./translate";

const PLAN_CARD_ICON_SIZE = 44;

export function PlanCard(
  {
    action,
    blockedApps,
    heroIcon,
    heroImage,
    onPress,
    replacementApps,
    repeatText,
    scheduleText,
    subtitle,
    title,
  }: {
    action?: ReactNode;
    blockedApps: AndroidBlockableApp[];
    heroIcon: Parameters<typeof CategoryGlyph>[0]["icon"];
    heroImage?: ImageSourcePropType;
    onPress?: () => void;
    replacementApps: AndroidBlockableApp[];
    repeatText: string;
    scheduleText: string;
    subtitle: string;
    title: string;
  }
) {
  useAppLanguage();

  return (
    <Button
      unstyled
      borderColor="#DDE3FF"
      borderRadius={30}
      borderWidth={1}
      overflow="hidden"
      pressStyle={{ opacity: 0.92 }}
      width="100%"
      onPress={onPress}
    >
      <YStack backgroundColor="white" minHeight={190} position="relative">
        {heroImage ? (
          <Image
            resizeMode="cover"
            source={heroImage}
            style={{ height: "75%", position: "absolute", right: 0, top: 0, width: "100%" }}
          />
        ) : (
          <LinearGradient
            colors={brandGradient}
            end={{ x: 1, y: 1 }}
            start={{ x: 0, y: 0 }}
            style={StyleSheet.absoluteFillObject}
          />
        )}
        <LinearGradient
          colors={[
            "rgba(255, 255, 255, 0)",
            "rgba(255, 255, 255, 0.18)",
            "rgba(255, 255, 255, 0.72)",
            "#FFFFFF",
          ]}
          locations={[0, 0.3, 0.72, 1]}
          pointerEvents="none"
          style={{ bottom: 0, height: "34%", left: 0, position: "absolute", right: 0 }}
        />
        <YStack flex={1} gap={0} justifyContent="space-between" paddingHorizontal={12} paddingVertical={6}>
          <XStack alignItems="center" gap={8} minHeight={50}>
            <View
              alignItems="center"
              backgroundColor="rgba(255,255,255,0.92)"
              borderRadius={12}
              height={42}
              justifyContent="center"
              width={42}
            >
              <CategoryGlyph color="$primary11" icon={heroIcon} size={PLAN_CARD_ICON_SIZE} />
            </View>
            <YStack flex={1} gap={0} minWidth={0}>
              <H4 color="white" fontSize={20} lineHeight={24} numberOfLines={1}>
                {title}
              </H4>
              <SizableText
                color="rgba(255,255,255,0.88)"
                fontSize={14}
                lineHeight={18}
                numberOfLines={1}
              >
                {subtitle}
              </SizableText>
            </YStack>
            {action ?? <ChevronRight color="white" size={20} />}
          </XStack>
          <XStack
            backgroundColor="rgba(255, 255, 255, 1)"
            borderColor="rgba(1, 6, 13, 0)"
            borderRadius={18}
            borderWidth={1}
            overflow="hidden"
            paddingVertical={4}
            paddingHorizontal={8}
            marginTop={-4}
            marginHorizontal={6}
            shadowColor="#483FFF"
            shadowOpacity={0.08}
            shadowRadius={8}
          >
            <PlanAppsColumn apps={blockedApps} dimmed label={translate.t("dashboard.avoid")} />
            <View backgroundColor="rgba(226, 232, 240, 0.5)" marginVertical={5} width={1} />
            <PlanAppsColumn
              apps={replacementApps}
              label={translate.t("dashboard.use")}
            />
          </XStack>

          <XStack
            alignItems="center"
            flexWrap="wrap"
            gap={5}
            minHeight={22}
            paddingHorizontal={2}
          >
            <XStack alignItems="center" gap={5}>
              <Clock3 color="$primary11" size={15} />
              <SizableText
                color="$text11"
                fontSize={14}
                fontWeight="700"
                numberOfLines={1}
              >
                {scheduleText}
              </SizableText>
            </XStack>
            <XStack alignItems="center" flex={1} gap={5} minWidth={100}>
              <CalendarDays color="$primary11" size={15} />
              <SizableText
                color="$text10"
                fontSize={14}
                fontWeight="600"
                numberOfLines={1}
              >
                {repeatText}
              </SizableText>
            </XStack>
          </XStack>
        </YStack>
      </YStack>
    </Button>
  );
}

function PlanAppsColumn(
  {
    apps,
    dimmed = false,
    label,
  }: {
    apps: AndroidBlockableApp[];
    detail?: string;
    dimmed?: boolean;
    label: string;
  }
) {
  return (
    <YStack flex={1} gap={1} minWidth={0} paddingHorizontal={9}>
      <SizableText color="$text11" fontSize={15} fontWeight="800" lineHeight={18} numberOfLines={1}>
        {label}
      </SizableText>
      <XStack alignItems="center" gap={8} minWidth={0}>
      <AppAvatarStack
        apps={apps}
        dimmed={dimmed}
        emptyLabel={translate.t("dashboard.noApps")}
        maxVisible={3}
        avatarSize={PLAN_CARD_ICON_SIZE}
        showOverflow={false}
      />
      </XStack>
      {apps.length ? (
        <SizableText color="$text10" fontSize={14} fontWeight="400" lineHeight={18} numberOfLines={1}>
          {apps.slice(0, 2).map((app) => truncateAppName(app.name)).join(", ")}
        </SizableText>
      ) : null}
      {/* detail is intentionally hidden until the compact metadata layout returns. */}
    </YStack>
  );
}

function truncateAppName(name: string) {
  return name.length > 14 ? `${name.slice(0, 13)}…` : name;
}
