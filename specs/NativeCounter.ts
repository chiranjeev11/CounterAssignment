import type { TurboModule } from "react-native";
import { TurboModuleRegistry } from "react-native";

export interface Spec extends TurboModule {
  getValue(): number;
  increment(): number;
  decrement(): number;
  reset(): number;
  configureInactivity(timeoutMs: number, intervalMs: number): void;
  clearInactivity(): void;
  startGradualReset(intervalMs: number): void;
  stopGradualReset(): void;
  addListener(eventName: string): void;
  removeListeners(count: number): void;
}

export default TurboModuleRegistry.get<Spec>("NativeCounter");

