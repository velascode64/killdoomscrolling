import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { router, useLocalSearchParams } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import Animated, { FadeIn, FadeInDown } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { TipArtwork } from "../../../components/tips/TipArtwork";
import { getTipById } from "../../../data/tips";

export default function TipDetailScreen() {
  const { tipId } = useLocalSearchParams<{ tipId: string }>();
  const insets = useSafeAreaInsets();
  const tip = getTipById(tipId);

  if (!tip) {
    return (
      <View style={[styles.missing, { paddingTop: insets.top }]}>
        <Text style={styles.missingTitle}>Tip not found</Text>
        <Text onPress={() => router.back()} style={styles.missingAction}>
          Go back
        </Text>
      </View>
    );
  }

  const isDarkHero = tip.cardLayout === "featured";

  return (
    <View style={styles.screen}>
      <StatusBar style={isDarkHero ? "light" : "dark"} />
      <ScrollView contentContainerStyle={{ paddingBottom: Math.max(insets.bottom, 24) + 34 }}>
        <Animated.View
          entering={FadeIn.duration(280)}
          style={[styles.hero, { backgroundColor: tip.backgroundColor, paddingTop: insets.top + 12 }]}
        >
          <View style={[styles.heroGlow, { backgroundColor: `${tip.accentColor}18` }]} />
          <Text
            accessibilityRole="button"
            onPress={() => router.back()}
            style={[
              styles.backButton,
              {
                backgroundColor: `${tip.foregroundColor}14`,
                borderColor: `${tip.foregroundColor}2A`,
                color: tip.foregroundColor,
              },
            ]}
          >
            ‹
          </Text>

          <View style={styles.heroArtwork}>
            <TipArtwork tip={tip} />
          </View>

          <View style={styles.heroCopy}>
            <View style={styles.metadata}>
              <Text style={[styles.category, { color: tip.accentColor }]}>{tip.category}</Text>
              <View style={[styles.metadataDot, { backgroundColor: tip.accentColor }]} />
              <Text style={[styles.readTime, { color: tip.foregroundColor }]}>{tip.readTime} min read</Text>
            </View>
            <Text style={[styles.title, { color: tip.foregroundColor }]}>{tip.title}</Text>
            <Text style={[styles.description, { color: tip.foregroundColor }]}>{tip.description}</Text>
          </View>
        </Animated.View>

        <View style={styles.article}>
          {tip.sections.map((section, sectionIndex) => (
            <Animated.View
              entering={FadeInDown.delay(90 + sectionIndex * 80).duration(360)}
              key={section.title}
              style={styles.section}
            >
              <Text style={styles.sectionTitle}>{section.title}</Text>
              {section.body.map((paragraph) => (
                <Text key={paragraph} style={styles.body}>
                  {paragraph}
                </Text>
              ))}
              {section.items?.map((item, itemIndex) => (
                <View key={item} style={styles.itemRow}>
                  <View style={[styles.itemMarker, { backgroundColor: `${tip.accentColor}18` }]}>
                    {section.numbered ? (
                      <Text style={[styles.itemNumber, { color: tip.accentColor }]}>{itemIndex + 1}</Text>
                    ) : (
                      <MaterialCommunityIcons
                        color={tip.accentColor}
                        name="arrow-right"
                        size={15}
                      />
                    )}
                  </View>
                  <Text style={styles.itemText}>{item}</Text>
                </View>
              ))}
            </Animated.View>
          ))}

          <View style={[styles.closingCard, { backgroundColor: tip.backgroundColor }]}>
            <MaterialCommunityIcons color={tip.accentColor} name={tip.icon} size={24} />
            <Text style={[styles.closingText, { color: tip.foregroundColor }]}>Choose intention over reflex.</Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    backgroundColor: "#F8FAFC",
    flex: 1,
  },
  hero: {
    minHeight: 520,
    overflow: "hidden",
    paddingBottom: 34,
    paddingHorizontal: 20,
  },
  heroGlow: {
    borderRadius: 260,
    height: 420,
    position: "absolute",
    right: -180,
    top: -150,
    width: 420,
  },
  backButton: {
    borderRadius: 999,
    borderWidth: 1,
    fontFamily: "Satoshi",
    fontSize: 35,
    height: 46,
    lineHeight: 40,
    overflow: "hidden",
    textAlign: "center",
    width: 46,
  },
  heroArtwork: {
    alignItems: "center",
    height: 188,
    justifyContent: "center",
  },
  heroCopy: {
    marginTop: "auto",
  },
  metadata: {
    alignItems: "center",
    flexDirection: "row",
    gap: 8,
  },
  category: {
    fontFamily: "SatoshiBold",
    fontSize: 11,
    letterSpacing: 1.4,
    textTransform: "uppercase",
  },
  metadataDot: {
    borderRadius: 4,
    height: 4,
    width: 4,
  },
  readTime: {
    fontFamily: "Satoshi",
    fontSize: 12,
    opacity: 0.65,
  },
  title: {
    fontFamily: "SatoshiBlack",
    fontSize: 42,
    letterSpacing: -1.7,
    lineHeight: 43,
    marginTop: 12,
  },
  description: {
    fontFamily: "Satoshi",
    fontSize: 16,
    lineHeight: 22,
    marginTop: 14,
    maxWidth: 350,
    opacity: 0.76,
  },
  article: {
    paddingHorizontal: 22,
    paddingTop: 36,
  },
  section: {
    borderBottomColor: "#E2E8F0",
    borderBottomWidth: 1,
    marginBottom: 28,
    paddingBottom: 28,
  },
  sectionTitle: {
    color: "#1F2430",
    fontFamily: "SatoshiBlack",
    fontSize: 25,
    letterSpacing: -0.6,
    lineHeight: 30,
    marginBottom: 14,
  },
  body: {
    color: "#707785",
    fontFamily: "Satoshi",
    fontSize: 17,
    lineHeight: 27,
    marginBottom: 13,
  },
  itemRow: {
    alignItems: "flex-start",
    flexDirection: "row",
    gap: 12,
    marginTop: 12,
  },
  itemMarker: {
    alignItems: "center",
    borderRadius: 999,
    height: 28,
    justifyContent: "center",
    marginTop: 1,
    width: 28,
  },
  itemNumber: {
    fontFamily: "SatoshiBold",
    fontSize: 12,
  },
  itemText: {
    color: "#594C53",
    flex: 1,
    fontFamily: "SatoshiBold",
    fontSize: 15,
    lineHeight: 22,
    paddingTop: 3,
  },
  closingCard: {
    alignItems: "center",
    borderRadius: 24,
    flexDirection: "row",
    gap: 12,
    padding: 20,
  },
  closingText: {
    flex: 1,
    fontFamily: "SatoshiBlack",
    fontSize: 18,
    lineHeight: 22,
  },
  missing: {
    alignItems: "center",
    backgroundColor: "#F8FAFC",
    flex: 1,
    justifyContent: "center",
  },
  missingTitle: {
    color: "#1F2430",
    fontFamily: "SatoshiBlack",
    fontSize: 28,
  },
  missingAction: {
    color: "#4F46E5",
    fontFamily: "SatoshiBold",
    fontSize: 16,
    marginTop: 16,
  },
});
