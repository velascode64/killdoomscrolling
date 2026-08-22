import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { router } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";
import Animated, {
  FadeInDown,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

import type { Tip } from "../../data/tips";
import { TipArtwork } from "./TipArtwork";

export function TipCard({ index, tip }: { index: number; tip: Tip }) {
  const pressed = useSharedValue(0);
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: 1 - pressed.value * 0.018 }],
  }));

  const openTip = () => {
    router.push(`/tips/${tip.id}`);
  };

  const isFeatured = tip.cardLayout === "featured";
  const isCentered = tip.cardLayout === "centered";

  return (
    <Animated.View
      entering={FadeInDown.delay(index * 65).duration(420)}
      style={animatedStyle}
    >
      <Pressable
        accessibilityHint="Opens the complete advice article"
        accessibilityRole="button"
        accessibilityLabel={tip.title}
        onPress={openTip}
        onPressIn={() => {
          pressed.value = withTiming(1, { duration: 100 });
        }}
        onPressOut={() => {
          pressed.value = withTiming(0, { duration: 170 });
        }}
        style={[
          styles.card,
          { backgroundColor: tip.backgroundColor },
          isFeatured && styles.featuredCard,
          isCentered && styles.centeredCard,
        ]}
      >
        <View style={[styles.glow, { backgroundColor: `${tip.accentColor}18` }]} />

        <View style={styles.topRow}>
          <View style={[styles.badge, { backgroundColor: `${tip.accentColor}20` }]}>
            <Text style={[styles.badgeText, { color: tip.accentColor }]}>{tip.category}</Text>
          </View>
          <Text style={[styles.readTime, { color: tip.foregroundColor }]}>{tip.readTime} min</Text>
        </View>

        {isFeatured && (
          <View style={styles.featuredArtwork}>
            <TipArtwork compact tip={tip} />
          </View>
        )}

        {tip.cardLayout === "offset" && (
          <View style={styles.offsetArtwork}>
            <TipArtwork compact tip={tip} />
          </View>
        )}

        {isCentered && (
          <View style={styles.centerArtwork}>
            <TipArtwork compact tip={tip} />
          </View>
        )}

        {tip.cardLayout === "schedule" && (
          <View style={styles.scheduleArtwork}>
            <TipArtwork compact tip={tip} />
          </View>
        )}

        <View
          style={[
            styles.copy,
            isFeatured && styles.featuredCopy,
            tip.cardLayout === "offset" && styles.offsetCopy,
            isCentered && styles.centeredCopy,
            tip.cardLayout === "schedule" && styles.scheduleCopy,
            tip.cardLayout === "index" && styles.indexCopy,
          ]}
        >
          <Text style={[styles.title, { color: tip.foregroundColor }, isFeatured && styles.featuredTitle]}>
            {tip.title}
          </Text>
          {!isCentered && tip.cardLayout !== "index" && (
            <Text style={[styles.description, { color: tip.foregroundColor }]}>{tip.description}</Text>
          )}
        </View>

        {tip.cardLayout === "index" && (
          <View style={styles.indexArtwork}>
            <TipArtwork compact tip={tip} />
          </View>
        )}

        <View style={[styles.arrow, { backgroundColor: `${tip.foregroundColor}12` }]}>
          <MaterialCommunityIcons color={tip.foregroundColor} name="arrow-top-right" size={20} />
        </View>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 30,
    minHeight: 244,
    overflow: "hidden",
    padding: 22,
    position: "relative",
  },
  featuredCard: {
    minHeight: 316,
  },
  centeredCard: {
    minHeight: 300,
  },
  glow: {
    borderRadius: 180,
    height: 280,
    position: "absolute",
    right: -100,
    top: -130,
    width: 280,
  },
  topRow: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    zIndex: 2,
  },
  badge: {
    borderRadius: 999,
    paddingHorizontal: 11,
    paddingVertical: 7,
  },
  badgeText: {
    fontFamily: "SatoshiBold",
    fontSize: 10,
    letterSpacing: 1.2,
    textTransform: "uppercase",
  },
  readTime: {
    fontFamily: "Satoshi",
    fontSize: 12,
    opacity: 0.62,
  },
  copy: {
    marginTop: 70,
    maxWidth: "82%",
    zIndex: 2,
  },
  featuredCopy: {
    marginTop: "auto",
    maxWidth: "84%",
  },
  offsetCopy: {
    marginTop: 64,
    maxWidth: "63%",
  },
  centeredCopy: {
    alignSelf: "center",
    marginTop: 13,
    maxWidth: "92%",
  },
  scheduleCopy: {
    marginTop: 80,
    maxWidth: "84%",
  },
  indexCopy: {
    marginTop: 30,
    maxWidth: "58%",
  },
  title: {
    fontFamily: "SatoshiBlack",
    fontSize: 27,
    letterSpacing: -0.8,
    lineHeight: 30,
  },
  featuredTitle: {
    fontSize: 34,
    letterSpacing: -1.2,
    lineHeight: 36,
  },
  description: {
    fontFamily: "Satoshi",
    fontSize: 14,
    lineHeight: 19,
    marginTop: 10,
    opacity: 0.75,
  },
  arrow: {
    alignItems: "center",
    borderRadius: 999,
    bottom: 20,
    height: 42,
    justifyContent: "center",
    position: "absolute",
    right: 20,
    width: 42,
  },
  featuredArtwork: {
    position: "absolute",
    right: 26,
    top: 65,
  },
  offsetArtwork: {
    position: "absolute",
    right: 22,
    top: 72,
  },
  centerArtwork: {
    alignSelf: "center",
    marginTop: 8,
  },
  scheduleArtwork: {
    left: 14,
    position: "absolute",
    right: 14,
    top: 70,
  },
  indexArtwork: {
    position: "absolute",
    right: 20,
    top: 67,
  },
});
