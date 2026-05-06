import { useCallback, useEffect, useRef, useState } from "react";

const INACTIVITY_TIMEOUT_MS = 4000;
const AUTO_DECREMENT_INTERVAL_MS = 1000;
const GRADUAL_RESET_INTERVAL_MS = 80;

export type CounterLogic = {
  count: number;
  increment: () => void;
  decrement: () => void;
  reset: () => void;
};

export function useCounterLogic(): CounterLogic {
  const [count, setCount] = useState(0);
  const [incrementPressCount, setIncrementPressCount] = useState(0);
  const [isResetting, setIsResetting] = useState(false);

  const inactivityTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const autoDecrementIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const gradualResetIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const clearAutoDecrement = useCallback(() => {
    if (autoDecrementIntervalRef.current) {
      clearInterval(autoDecrementIntervalRef.current);
      autoDecrementIntervalRef.current = null;
    }
  }, []);

  const clearInactivityTimeout = useCallback(() => {
    if (inactivityTimeoutRef.current) {
      clearTimeout(inactivityTimeoutRef.current);
      inactivityTimeoutRef.current = null;
    }
  }, []);

  const clearGradualReset = useCallback(() => {
    if (gradualResetIntervalRef.current) {
      clearInterval(gradualResetIntervalRef.current);
      gradualResetIntervalRef.current = null;
    }
    setIsResetting(false);
  }, []);

  const restartInactivityTimer = useCallback(() => {
    clearInactivityTimeout();
    clearAutoDecrement();

    inactivityTimeoutRef.current = setTimeout(() => {
      autoDecrementIntervalRef.current = setInterval(() => {
        setCount((prev) => Math.max(0, prev - 1));
      }, AUTO_DECREMENT_INTERVAL_MS);
    }, INACTIVITY_TIMEOUT_MS);
  }, [clearAutoDecrement, clearInactivityTimeout]);

  const stopResetIfRunning = useCallback(() => {
    if (isResetting) {
      clearGradualReset();
    }
  }, [clearGradualReset, isResetting]);

  const increment = useCallback(() => {
    stopResetIfRunning();
    setIncrementPressCount((prevPressCount) => {
      const nextPressCount = prevPressCount + 1;
      const incrementBy = nextPressCount % 5 === 0 ? 5 : 1;

      setCount((prev) => prev + incrementBy);
      return nextPressCount;
    });
    restartInactivityTimer();
  }, [restartInactivityTimer, stopResetIfRunning]);

  const decrement = useCallback(() => {
    stopResetIfRunning();
    setCount((prev) => Math.max(0, prev - 1));
    restartInactivityTimer();
  }, [restartInactivityTimer, stopResetIfRunning]);

  const reset = useCallback(() => {
    clearAutoDecrement();
    clearInactivityTimeout();
    clearGradualReset();

    setIsResetting(true);
    gradualResetIntervalRef.current = setInterval(() => {
      setCount((prev) => {
        if (prev <= 0) {
          clearGradualReset();
          return 0;
        }
        return prev - 1;
      });
    }, GRADUAL_RESET_INTERVAL_MS);
  }, [clearAutoDecrement, clearGradualReset, clearInactivityTimeout]);

  useEffect(() => {
    restartInactivityTimer();
    return () => {
      clearAutoDecrement();
      clearInactivityTimeout();
      clearGradualReset();
    };
  }, [clearAutoDecrement, clearGradualReset, clearInactivityTimeout, restartInactivityTimer]);

  return { count, increment, decrement, reset };
}

