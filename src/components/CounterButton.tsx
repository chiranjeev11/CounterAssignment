import React, { memo } from "react";
import { Pressable, StyleSheet, Text } from "react-native";

type CounterButtonProps = {
  label: string;
  onPress: () => void;
};

export const CounterButton = memo(function CounterButton({ label, onPress }: CounterButtonProps) {
  return (
    <Pressable onPress={onPress} style={styles.button}>
      <Text style={styles.buttonText}>{label}</Text>
    </Pressable>
  );
});

const styles = StyleSheet.create({
  button: {
    backgroundColor: "#111827",
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 10,
    minWidth: 95,
    alignItems: "center",
  },
  buttonText: {
    color: "#ffffff",
    fontWeight: "600",
  },
});

