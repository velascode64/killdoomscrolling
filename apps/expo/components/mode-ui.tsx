import { LinearGradient } from "expo-linear-gradient";
import type { ReactNode } from "react";
import { Image, StyleSheet } from "react-native";
import Svg, { Circle, Defs, LinearGradient as SvgLinearGradient, Stop } from "react-native-svg";
import { Button, SizableText, View, XStack, YStack } from "tamagui";

import type { AndroidBlockableApp } from "expo-app-blocker";

import { brandGlow, brandGradient } from "../theme/colors";

export const MODE_INK = "#003B5C";
export const MODE_MUTED = "#36586F";
export const MODE_BORDER = "#CFEBF0";

export function BrandGradientFill() {
  return (
    <LinearGradient
      colors={brandGradient}
      end={{ x: 1, y: 1 }}
      pointerEvents="none"
      start={{ x: 0, y: 0 }}
      style={StyleSheet.absoluteFill}
    />
  );
}

export function GradientButton({
  children,
  disabled = false,
  icon,
  onPress,
}: {
  children: ReactNode;
  disabled?: boolean;
  icon?: ReactNode;
  onPress: () => void;
}) {
  return (
    <Button
      unstyled
      height={56}
      borderRadius="$4"
      overflow="hidden"
      opacity={disabled ? 0.5 : 1}
      disabled={disabled}
      onPress={onPress}
    >
      <BrandGradientFill />
      <XStack flex={1} alignItems="center" justifyContent="center" space="$2">
        {icon}
        <SizableText color="white" fontWeight="900" fontSize="$5">
          {children}
        </SizableText>
      </XStack>
    </Button>
  );
}

export function ModeRadial({
  duration,
  label,
  progress,
  size = 252,
}: {
  duration: number;
  label?: string;
  progress?: number;
  size?: number;
}) {
  const strokeWidth = 13;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const durationProgress = duration / 60;
  const clampedProgress = Math.max(0.05, Math.min(1, progress ?? durationProgress));
  const offset = circumference * (1 - clampedProgress);
  const durationFontSize = size >= 230 ? 52 : 44;

  return (
    <View alignSelf="center" width={size} height={size} alignItems="center" justifyContent="center">
      <View
        position="absolute"
        width={size - 20}
        height={size - 20}
        borderRadius={999}
        backgroundColor={brandGlow}
        opacity={0.1}
      />
      <Svg width={size} height={size}>
        <Defs>
          <SvgLinearGradient id="mode-radial" x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0" stopColor={brandGradient[0]} />
            <Stop offset="0.5" stopColor={brandGradient[1]} />
            <Stop offset="1" stopColor={brandGradient[2]} />
          </SvgLinearGradient>
        </Defs>
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={MODE_BORDER}
          strokeWidth={strokeWidth}
        />
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="url(#mode-radial)"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={`${circumference} ${circumference}`}
          strokeDashoffset={offset}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </Svg>
      <YStack position="absolute" alignItems="center" space="$1">
        <SizableText
          adjustsFontSizeToFit
          color={MODE_INK}
          fontFamily="SatoshiBlack"
          fontSize={durationFontSize}
          letterSpacing={-1}
          lineHeight={durationFontSize + 6}
          maxFontSizeMultiplier={1}
          numberOfLines={1}
          textAlign="center"
          width={size - 52}
        >
          {`${duration}:00`}
        </SizableText>
        {label ? (
          <SizableText color={MODE_MUTED} fontSize="$5" fontWeight="700" maxFontSizeMultiplier={1.1}>
            {label}
          </SizableText>
        ) : null}
      </YStack>
    </View>
  );
}

export function AppAvatarStack({
  apps,
  emptyLabel = "Agregar",
  maxVisible = 3,
  onPress,
}: {
  apps: AndroidBlockableApp[];
  emptyLabel?: string;
  maxVisible?: number;
  onPress?: () => void;
}) {
  const visibleApps = apps.slice(0, maxVisible);
  const extra = apps.length - visibleApps.length;

  return (
    <Button unstyled onPress={onPress} disabled={!onPress} pressStyle={{ opacity: 0.75 }}>
      <XStack alignItems="center">
        {visibleApps.map((app, index) => (
          <View
            key={app.packageName}
            width={42}
            height={42}
            marginLeft={index ? -10 : 0}
            borderRadius={999}
            overflow="hidden"
            borderWidth={2}
            borderColor="$background2"
            backgroundColor="$primary3"
            alignItems="center"
            justifyContent="center"
            zIndex={maxVisible - index}
          >
            {app.iconBase64 ? (
              <Image
                source={{ uri: `data:image/png;base64,${app.iconBase64}` }}
                style={{ width: 42, height: 42 }}
              />
            ) : (
              <SizableText color={MODE_INK} fontWeight="900">
                {app.name.slice(0, 1).toUpperCase()}
              </SizableText>
            )}
          </View>
        ))}
        {extra > 0 && (
          <View
            width={42}
            height={42}
            marginLeft={-10}
            borderRadius={999}
            borderWidth={2}
            borderColor="$background2"
            backgroundColor="$grey2"
            alignItems="center"
            justifyContent="center"
          >
            <SizableText color={MODE_INK} fontWeight="900">
              {`+${extra}`}
            </SizableText>
          </View>
        )}
        {!apps.length && (
          <View
            height={42}
            paddingHorizontal="$3"
            borderRadius={999}
            borderWidth={1}
            borderColor="$grey3"
            alignItems="center"
            justifyContent="center"
          >
            <SizableText color={MODE_MUTED} fontWeight="700">
              {emptyLabel}
            </SizableText>
          </View>
        )}
      </XStack>
    </Button>
  );
}
