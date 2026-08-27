import { LinearGradient } from "expo-linear-gradient";
import { StatusBar } from "expo-status-bar";
import { useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { TipCard } from "../../../components/tips/TipCard";
import { tips } from "../../../data/tips";
import type { TipCategory } from "../../../data/tips";

const categories: ("All" | TipCategory)[] = ["All", "Detox", "Environment", "Focus", "Rehabit"];

export default function TipsScreen() {
  const insets = useSafeAreaInsets();
  const [activeCategory, setActiveCategory] = useState<(typeof categories)[number]>("All");
  const visibleTips =
    activeCategory === "All" ? tips : tips.filter((tip) => tip.category === activeCategory);

  return (
    <View style={styles.screen}>
      <StatusBar style="dark" />
      <LinearGradient
        colors={["#F8FAFC", "#F2F5FF", "#F8FAFC"]}
        locations={[0, 0.5, 1]}
        style={StyleSheet.absoluteFill}
      />
      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: Math.max(insets.bottom, 18) + 124 }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.header, { paddingTop: insets.top + 24 }]}>
          <Text style={styles.eyebrow}>USE YOUR PHONE ON PURPOSE</Text>
          <Text style={styles.heading}>Tips</Text>
          <Text style={styles.intro}>
            Small changes that replace automatic scrolling with something worth opening.
          </Text>
        </View>

        <ScrollView
          contentContainerStyle={styles.chips}
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.chipScroller}
        >
          {categories.map((category) => {
            const active = category === activeCategory;
            return (
              <Text
                accessibilityRole="button"
                accessibilityState={{ selected: active }}
                key={category}
                onPress={() => setActiveCategory(category)}
                style={[styles.chip, active && styles.activeChip]}
              >
                {category}
              </Text>
            );
          })}
        </ScrollView>

        <View style={styles.feed}>
          {visibleTips.map((tip, index) => (
            <TipCard index={index} key={tip.id} tip={tip} />
          ))}
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
  content: {
    paddingTop: 0,
  },
  header: {
    paddingHorizontal: 20,
  },
  eyebrow: {
    color: "#483FFF",
    fontFamily: "SatoshiBold",
    fontSize: 10,
    letterSpacing: 1.8,
  },
  heading: {
    color: "#1F2430",
    fontFamily: "SatoshiBlack",
    fontSize: 52,
    letterSpacing: -2,
    lineHeight: 58,
    marginTop: 4,
  },
  intro: {
    color: "#707785",
    fontFamily: "Satoshi",
    fontSize: 16,
    lineHeight: 22,
    marginTop: 8,
    maxWidth: 345,
  },
  chipScroller: {
    marginTop: 24,
  },
  chips: {
    gap: 8,
    paddingHorizontal: 20,
  },
  chip: {
    backgroundColor: "rgba(255,255,255,0.72)",
    borderColor: "#E2E8F0",
    borderRadius: 999,
    borderWidth: 1,
    color: "#707785",
    fontFamily: "SatoshiBold",
    fontSize: 12,
    overflow: "hidden",
    paddingHorizontal: 16,
    paddingVertical: 9,
  },
  activeChip: {
    backgroundColor: "#EEF3FF",
    borderColor: "rgba(72, 63, 255, 0.24)",
    color: "#483FFF",
  },
  feed: {
    gap: 16,
    marginTop: 18,
    paddingHorizontal: 20,
  },
});
