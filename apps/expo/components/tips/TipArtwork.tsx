import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { StyleSheet, Text, View } from "react-native";

import type { Tip } from "../../data/tips";

export function TipArtwork({ compact = false, tip }: { compact?: boolean; tip: Tip }) {
  if (tip.cardLayout === "schedule") {
    return (
      <View style={[styles.schedule, compact && styles.compactSchedule]}>
        <View style={[styles.timePill, { borderColor: `${tip.accentColor}44` }]}>
          <Text style={[styles.time, { color: tip.foregroundColor }]}>12:30</Text>
          <Text style={[styles.duration, { color: tip.accentColor }]}>15 min</Text>
        </View>
        <View style={[styles.connector, { backgroundColor: `${tip.accentColor}55` }]} />
        <View style={[styles.timePill, { borderColor: `${tip.accentColor}44` }]}>
          <Text style={[styles.time, { color: tip.foregroundColor }]}>19:00</Text>
          <Text style={[styles.duration, { color: tip.accentColor }]}>20 min</Text>
        </View>
      </View>
    );
  }

  if (tip.cardLayout === "index") {
    return (
      <View style={[styles.appGrid, compact && styles.compactGrid]}>
        {[
          ["READ", "book-open-page-variant-outline"],
          ["LEARN", "school-outline"],
          ["RESET", "weather-sunset"],
          ["MOVE", "run"],
        ].map(([label, icon]) => (
          <View key={label} style={[styles.appTile, { borderColor: `${tip.accentColor}30` }]}>
            <MaterialCommunityIcons color={tip.accentColor} name={icon as never} size={compact ? 19 : 25} />
            <Text style={[styles.tileLabel, { color: tip.foregroundColor }]}>{label}</Text>
          </View>
        ))}
      </View>
    );
  }

  return (
    <View style={[styles.orbit, compact && styles.compactOrbit]}>
      <View style={[styles.orbitRing, { borderColor: `${tip.accentColor}40` }]} />
      <View style={[styles.orbitDot, { backgroundColor: tip.accentColor }]} />
      <View style={[styles.iconDisc, { backgroundColor: `${tip.accentColor}20` }]}>
        <MaterialCommunityIcons color={tip.accentColor} name={tip.icon} size={compact ? 36 : 54} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  orbit: {
    alignItems: "center",
    height: 170,
    justifyContent: "center",
    width: 170,
  },
  compactOrbit: {
    height: 116,
    width: 116,
  },
  orbitRing: {
    borderRadius: 999,
    borderWidth: 1,
    bottom: 0,
    left: 0,
    position: "absolute",
    right: 0,
    top: 0,
  },
  orbitDot: {
    borderRadius: 10,
    height: 10,
    position: "absolute",
    right: 15,
    top: 27,
    width: 10,
  },
  iconDisc: {
    alignItems: "center",
    borderRadius: 999,
    height: "68%",
    justifyContent: "center",
    width: "68%",
  },
  schedule: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
  },
  compactSchedule: {
    transform: [{ scale: 0.86 }],
  },
  timePill: {
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.38)",
    borderRadius: 18,
    borderWidth: 1,
    paddingHorizontal: 15,
    paddingVertical: 11,
  },
  time: {
    fontFamily: "SatoshiBold",
    fontSize: 18,
  },
  duration: {
    fontFamily: "SatoshiBold",
    fontSize: 10,
    marginTop: 2,
    textTransform: "uppercase",
  },
  connector: {
    height: 1,
    width: 18,
  },
  appGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    width: 180,
  },
  compactGrid: {
    width: 150,
  },
  appTile: {
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.42)",
    borderRadius: 16,
    borderWidth: 1,
    gap: 5,
    justifyContent: "center",
    minHeight: 66,
    width: "47%",
  },
  tileLabel: {
    fontFamily: "SatoshiBold",
    fontSize: 9,
    letterSpacing: 0.7,
  },
});
