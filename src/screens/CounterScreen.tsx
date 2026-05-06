import { StatusBar } from "expo-status-bar";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

import { CounterButton } from "../components/CounterButton";
import { useCounterLogic } from "../hooks/useCounterLogic";

export function CounterScreen() {
  const {
    count,
    increment,
    decrement,
    reset,
    startFastIncrement,
    stopFastIncrement,
    startFastDecrement,
    stopFastDecrement,
  } = useCounterLogic();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Counter</Text>
      <Text style={styles.count}>{count}</Text>

      <View style={styles.buttonRow}>
        <CounterButton
          label="Increment"
          onPress={increment}
          onLongPress={startFastIncrement}
          onPressOut={stopFastIncrement}
        />
        <CounterButton
          label="Decrement"
          onPress={decrement}
          onLongPress={startFastDecrement}
          onPressOut={stopFastDecrement}
        />
        <CounterButton label="Reset" onPress={reset} />
      </View>

      <Text style={styles.hint}>
        Every 5th increment adds 5. Long-press increment/decrement to move faster. The counter auto-decrements after 4 seconds of inactivity.
      </Text>
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    color: "#0f172a",
  },
  count: {
    marginTop: 12,
    fontSize: 56,
    fontWeight: "800",
    color: "#111827",
  },
  buttonRow: {
    flexDirection: "row",
    marginTop: 24,
    gap: 10,
  },
  hint: {
    marginTop: 20,
    fontSize: 12,
    color: "#475569",
    textAlign: "center",
  },
});

