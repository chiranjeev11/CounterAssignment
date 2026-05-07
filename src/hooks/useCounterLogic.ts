import { useCallback, useEffect, useRef, useState } from "react";
import { nativeCounter, subscribeToNativeCounterValue } from "../native/NativeCounter";

const INACTIVITY_TIMEOUT_MS = 4000;
const AUTO_DECREMENT_INTERVAL_MS = 1000;
const GRADUAL_RESET_INTERVAL_MS = 90;
const FAST_PRESS_INTERVAL_MS = 140;

export type CounterLogic = {
  count: number;
  increment: () => void;
  decrement: () => void;
  reset: () => void;
  startFastIncrement: () => void;
  stopFastIncrement: () => void;
  startFastDecrement: () => void;
  stopFastDecrement: () => void;
};

export function useCounterLogic(): CounterLogic {
  const [count, setCount] = useState(0);
  const [isResetting, setIsResetting] = useState(false);

  const fastIncrementIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const fastDecrementIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const suppressNextIncrementTapRef = useRef(false);
  const suppressNextDecrementTapRef = useRef(false);

  const clearGradualReset = useCallback(() => {
    nativeCounter.stopGradualReset();
    setIsResetting(false);
  }, []);

  const clearFastIncrement = useCallback(() => {
    if (fastIncrementIntervalRef.current) {
      clearInterval(fastIncrementIntervalRef.current);
      fastIncrementIntervalRef.current = null;
    }
  }, []);

  const clearFastDecrement = useCallback(() => {
    if (fastDecrementIntervalRef.current) {
      clearInterval(fastDecrementIntervalRef.current);
      fastDecrementIntervalRef.current = null;
    }
  }, []);

  const stopResetIfRunning = useCallback(() => {
    if (isResetting) {
      clearGradualReset();
    }
  }, [clearGradualReset, isResetting]);

  const performIncrement = useCallback(() => {
    stopResetIfRunning();
    const nextValue = nativeCounter.increment();
    setCount(nextValue);
  }, [stopResetIfRunning]);

  const increment = useCallback(() => {
    if (suppressNextIncrementTapRef.current) {
      suppressNextIncrementTapRef.current = false;
      return;
    }
    performIncrement();
  }, [performIncrement]);

  const performDecrement = useCallback(() => {
    stopResetIfRunning();
    const nextValue = nativeCounter.decrement();
    setCount(nextValue);
  }, [stopResetIfRunning]);

  const decrement = useCallback(() => {
    if (suppressNextDecrementTapRef.current) {
      suppressNextDecrementTapRef.current = false;
      return;
    }
    performDecrement();
  }, [performDecrement]);

  const reset = useCallback(() => {
    clearGradualReset();
    clearFastIncrement();
    clearFastDecrement();

    setIsResetting(true);
    nativeCounter.startGradualReset(GRADUAL_RESET_INTERVAL_MS);
  }, [clearFastDecrement, clearFastIncrement, clearGradualReset]);

  const startFastIncrement = useCallback(() => {
    clearFastIncrement();
    suppressNextIncrementTapRef.current = true;
    performIncrement();
    fastIncrementIntervalRef.current = setInterval(() => {
      performIncrement();
    }, FAST_PRESS_INTERVAL_MS);
  }, [clearFastIncrement, performIncrement]);

  const stopFastIncrement = useCallback(() => {
    clearFastIncrement();
  }, [clearFastIncrement]);

  const startFastDecrement = useCallback(() => {
    clearFastDecrement();
    suppressNextDecrementTapRef.current = true;
    performDecrement();
    fastDecrementIntervalRef.current = setInterval(() => {
      performDecrement();
    }, FAST_PRESS_INTERVAL_MS);
  }, [clearFastDecrement, performDecrement]);

  const stopFastDecrement = useCallback(() => {
    clearFastDecrement();
  }, [clearFastDecrement]);

  useEffect(() => {
    setCount(nativeCounter.getValue());
    nativeCounter.configureInactivity(INACTIVITY_TIMEOUT_MS, AUTO_DECREMENT_INTERVAL_MS);
    const unsubscribe = subscribeToNativeCounterValue((payload) => {
      setCount(payload.value);
      setIsResetting(payload.isGradualResetActive);
    });
    return () => {
      unsubscribe();
      nativeCounter.clearInactivity();
      clearGradualReset();
      clearFastIncrement();
      clearFastDecrement();
    };
  }, [
    clearFastDecrement,
    clearFastIncrement,
    clearGradualReset,
  ]);

  return {
    count,
    increment,
    decrement,
    reset,
    startFastIncrement,
    stopFastIncrement,
    startFastDecrement,
    stopFastDecrement,
  };
}

