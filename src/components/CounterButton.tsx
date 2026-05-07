import React, { memo } from "react";
import { StyleSheet, Text, TouchableOpacity } from "react-native";

type CounterButtonProps = {
  label: string;
  onPress: () => void;
  onLongPress?: () => void;
  onPressOut?: () => void;
};

export const CounterButton = memo(function CounterButton({
  label,
  onPress,
  onLongPress,
  onPressOut,
}: CounterButtonProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      onLongPress={onLongPress}
      onPressOut={onPressOut}
      delayLongPress={260}
      activeOpacity={0.6}
      style={styles.button}
    >
      <Text style={styles.buttonText}>{label}</Text>
    </TouchableOpacity>
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

