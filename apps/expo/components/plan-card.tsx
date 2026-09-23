import { CalendarDays, ChevronRight, Clock3 } from "@tamagui/lucide-icons";
import type { AndroidBlockableApp } from "expo-app-blocker";
import { LinearGradient } from "expo-linear-gradient";
import type { ReactNode } from "react";
import type { ImageSourcePropType } from "react-native";
import { Image, StyleSheet } from "react-native";
import { BlurView } from "expo-blur";
import { Button, H4, SizableText, View, XStack, YStack } from "tamagui";
import { CategoryGlyph } from "./category-selector";
import { AppAvatarStack } from "./mode-ui";
import { translate, useAppLanguage } from "./translate";

const PLAN_CARD_HERO_ICON_SIZE = 25;
const PLAN_CARD_APP_AVATAR_SIZE = 40;
const PLAN_CARD_META_ICON_SIZE = 12;

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
      <YStack backgroundColor="white" height={178} position="relative">
        {heroImage ? (
          <Image
            resizeMode="cover"
            source={heroImage}
            style={{ height: "100%", position: "absolute", right: 0, top: 0, width: "100%" }}
          />
        ) : (
          <LinearGradient
            colors={["#1F2847", "#314176", "#483FFF"]}
            end={{ x: 1, y: 1 }}
            start={{ x: 0, y: 0 }}
            style={StyleSheet.absoluteFillObject}
          />
        )}
        <LinearGradient
          colors={[
            "rgba(255,255,255,0)",
            "rgba(255,255,255,0.04)",
            "rgba(255, 255, 255, 0.66)",
            "rgba(255, 255, 255, 0.97)",
            "#FFFFFF",
          ]}
          locations={[0, 0.35, 0.62, 0.84, 1]}
          pointerEvents="none"
          style={{ bottom: 0, height: "90%", left: 0, position: "absolute", right: 0 }}
        />
        <YStack flex={1} position="relative">
          <XStack alignItems="center" gap={7} left={12} position="absolute" right={12} top={20}>
            <View
              alignItems="center"
              backgroundColor="rgba(255,255,255,0.28)"
              borderColor="rgba(255,255,255,0.38)"
              borderRadius={16}
              borderWidth={1}
              height={38}
              justifyContent="center"
              overflow="hidden"
              position="relative"
              width={38}
            >
              <BlurView
                intensity={24}
                pointerEvents="none"
                style={StyleSheet.absoluteFillObject}
                tint="light"
              />
              <CategoryGlyph color="white" icon={heroIcon} size={PLAN_CARD_HERO_ICON_SIZE} />
            </View>
            <YStack flex={1} gap={0} minWidth={0}>
              <H4 color="white" fontSize={17} fontWeight="700" lineHeight={20} numberOfLines={1}>
                {title}
              </H4>
              <SizableText
                color="rgba(255,255,255,0.88)"
                fontSize={13}
                lineHeight={16}
                numberOfLines={1}
              >
                {subtitle}
              </SizableText>
            </YStack>
            {action ?? <ChevronRight color="white" size={18} />}
          </XStack>
          <XStack
            backgroundColor="#FFFFFF"
            borderRadius={16}
            overflow="hidden"
            paddingVertical={18}
            paddingHorizontal={8}
            left={10}
            position="absolute"
            right={18}
            shadowColor="#483FFF"
            shadowOpacity={0.06}
            shadowRadius={6}
            top={67}
          >
            <PlanAppsColumn apps={blockedApps} dimmed label={translate.t("dashboard.avoid")} />
            <View backgroundColor="rgba(210, 218, 235, 0.7)" marginVertical={3} width={1} />
            <PlanAppsColumn
              apps={replacementApps}
              label={translate.t("dashboard.use")}
            />
          </XStack>

          <XStack
            alignItems="center"
            flexWrap="wrap"
            gap={10}
            bottom={8}
            left={14}
            paddingHorizontal={2}
            position="absolute"
            right={14}
          >
            <XStack alignItems="center" gap={4}>
              <Clock3 color="$primary11" size={PLAN_CARD_META_ICON_SIZE} />
              <SizableText
                color="$text11"
                fontSize={12.5}
                fontWeight="700"
                numberOfLines={1}
              >
                {scheduleText}
              </SizableText>
            </XStack>
            <XStack alignItems="center" flex={1} gap={4} minWidth={100}>
              <CalendarDays color="$primary11" size={PLAN_CARD_META_ICON_SIZE} />
              <SizableText
                color="$text10"
                fontSize={12.5}
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
    <YStack flex={1} minWidth={0} paddingHorizontal={6}>
      <XStack alignItems="center" gap={7} minWidth={0}>
        <AppAvatarStack
          apps={apps}
          dimmed={dimmed}
          emptyLabel={translate.t("dashboard.noApps")}
          maxVisible={2}
          avatarSize={PLAN_CARD_APP_AVATAR_SIZE}
          showOverflow
        />
        <YStack flex={1} gap={0} minWidth={0}>
          <SizableText color="$text11" fontSize={13} fontWeight="800" lineHeight={16} numberOfLines={1}>
            {label}
          </SizableText>
          {apps.length ? (
            <SizableText color="$text10" fontSize={12} fontWeight="400" lineHeight={15} numberOfLines={1}>
              {apps.slice(0, 2).map((app) => truncateAppName(app.name)).join(", ")}
            </SizableText>
          ) : null}
        </YStack>
      </XStack>
      {/* detail is intentionally hidden until the compact metadata layout returns. */}
    </YStack>
  );
}

function truncateAppName(name: string) {
  return name.length > 14 ? `${name.slice(0, 13)}…` : name;
}
