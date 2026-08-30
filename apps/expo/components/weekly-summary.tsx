import { LinearGradient } from "expo-linear-gradient";
import { observer } from "mobx-react-lite";
import { StyleSheet, Text, View } from "react-native";

import { OverviewStore } from "../data/overview.store";

export const WeeklySummary = observer(() => {
  const prevented = OverviewStore.totalPrevented;
  const focusedMinutes = OverviewStore.focusedMinutes;

  return (
    <LinearGradient
      colors={["#1F2847", "#314176", "#483FFF"]}
      end={{ x: 1, y: 1 }}
      start={{ x: 0, y: 0 }}
      style={styles.card}
    >
      <View style={styles.header}>
        <Text style={styles.title}>Resumen</Text>
      </View>
      <View style={styles.metrics}>
        <View style={styles.metric}>
          <Text style={styles.value}>{prevented}x</Text>
          <Text style={styles.label}>Evitados</Text>
        </View>
        <View style={styles.metric}>
          <Text style={styles.value}>{focusedMinutes} MIN</Text>
          <Text style={styles.label}>Tiempo ahorrado</Text>
        </View>
      </View>
    </LinearGradient>
  );
});

const styles = StyleSheet.create({
  card: {
    borderRadius: 30,
    minHeight: 184,
    overflow: "hidden",
    padding: 22,
  },
  header: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  label: {
    color: "rgba(236, 242, 255, 0.76)",
    fontFamily: "Satoshi",
    fontSize: 15,
    lineHeight: 20,
    marginTop: 2,
  },
  metric: {
    flex: 1,
  },
  metrics: {
    flexDirection: "row",
    gap: 18,
    marginTop: "auto",
  },
  title: {
    color: "#FFFFFF",
    fontFamily: "SatoshiBlack",
    fontSize: 32,
    letterSpacing: -0.8,
    lineHeight: 37,
  },
  value: {
    color: "#FFFFFF",
    fontFamily: "SatoshiBlack",
    fontSize: 28,
    letterSpacing: -0.4,
    lineHeight: 33,
  },
});
