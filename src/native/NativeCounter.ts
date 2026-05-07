import { NativeEventEmitter, NativeModules } from "react-native";
import NativeCounterModule from "../../specs/NativeCounter";
import type { Spec } from "../../specs/NativeCounter";

type NativeCounterModuleShape = Spec & {
  addListener: (eventName: string) => void;
  removeListeners: (count: number) => void;
};

const resolvedNativeCounterModule = (NativeCounterModule ??
  NativeModules.NativeCounter) as NativeCounterModuleShape | null;

if (!resolvedNativeCounterModule) {
  throw new Error(
    "NativeCounter module is not available in this build. Reinstall the latest development build APK and run with `expo start --dev-client`."
  );
}

export const nativeCounter = {
  getValue: () => resolvedNativeCounterModule.getValue(),
  increment: () => resolvedNativeCounterModule.increment(),
  decrement: () => resolvedNativeCounterModule.decrement(),
  reset: () => resolvedNativeCounterModule.reset(),
  configureInactivity: (timeoutMs: number, intervalMs: number) =>
    resolvedNativeCounterModule.configureInactivity(timeoutMs, intervalMs),
  clearInactivity: () => resolvedNativeCounterModule.clearInactivity(),
  startGradualReset: (intervalMs: number) => resolvedNativeCounterModule.startGradualReset(intervalMs),
  stopGradualReset: () => resolvedNativeCounterModule.stopGradualReset(),
};

export function subscribeToNativeCounterValue(
  onValueChanged: (payload: { value: number; isGradualResetActive: boolean }) => void
): () => void {
  const emitter = new NativeEventEmitter(resolvedNativeCounterModule as never);
  const subscription = emitter.addListener(
    "NativeCounter:onValueChanged",
    (payload: { value?: number; isGradualResetActive?: boolean }) => {
      onValueChanged({
        value: payload.value ?? 0,
        isGradualResetActive: payload.isGradualResetActive ?? false,
      });
    }
  );
  return () => subscription.remove();
}

