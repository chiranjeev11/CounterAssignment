import { useCallback, useEffect, useRef, useState } from "react";

const INACTIVITY_TIMEOUT_MS = 4000;
const AUTO_DECREMENT_INTERVAL_MS = 1000;
const GRADUAL_RESET_INTERVAL_MS = 80;
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
  const [incrementPressCount, setIncrementPressCount] = useState(0);
  const [isResetting, setIsResetting] = useState(false);

  const inactivityTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const autoDecrementIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const gradualResetIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const fastIncrementIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const fastDecrementIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const suppressNextIncrementTapRef = useRef(false);
  const suppressNextDecrementTapRef = useRef(false);

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

  const performIncrement = useCallback(() => {
    stopResetIfRunning();
    setIncrementPressCount((prevPressCount) => {
      const nextPressCount = prevPressCount + 1;
      const incrementBy = nextPressCount % 5 === 0 ? 5 : 1;

      setCount((prev) => prev + incrementBy);
      return nextPressCount;
    });
    restartInactivityTimer();
  }, [restartInactivityTimer, stopResetIfRunning]);

  const increment = useCallback(() => {
    if (suppressNextIncrementTapRef.current) {
      suppressNextIncrementTapRef.current = false;
      return;
    }
    performIncrement();
  }, [performIncrement]);

  const performDecrement = useCallback(() => {
    stopResetIfRunning();
    setCount((prev) => Math.max(0, prev - 1));
    restartInactivityTimer();
  }, [restartInactivityTimer, stopResetIfRunning]);

  const decrement = useCallback(() => {
    if (suppressNextDecrementTapRef.current) {
      suppressNextDecrementTapRef.current = false;
      return;
    }
    performDecrement();
  }, [performDecrement]);

  const reset = useCallback(() => {
    clearAutoDecrement();
    clearInactivityTimeout();
    clearGradualReset();
    clearFastIncrement();
    clearFastDecrement();

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
  }, [clearAutoDecrement, clearFastDecrement, clearFastIncrement, clearGradualReset, clearInactivityTimeout]);

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
    restartInactivityTimer();
    return () => {
      clearAutoDecrement();
      clearInactivityTimeout();
      clearGradualReset();
      clearFastIncrement();
      clearFastDecrement();
    };
  }, [
    clearAutoDecrement,
    clearFastDecrement,
    clearFastIncrement,
    clearGradualReset,
    clearInactivityTimeout,
    restartInactivityTimer,
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

