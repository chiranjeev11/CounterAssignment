# Counter App (React Native + Expo)

A simple counter application built with React Native and Expo.  
The project focuses on clean state management, predictable behavior, and minimal dependencies.

## Features

- Counter display with three actions: **Increment**, **Decrement**, and **Reset**
- Every 5th increment action adds `+5` (otherwise `+1`)
- Decrement never allows the value to go below `0`
- Automatic decrement starts after 4 seconds of inactivity
- Reset gradually reduces the counter to zero (not an instant jump)
- Long-press support on increment/decrement for faster updates

## Tech stack

- React Native
- Expo
- TypeScript
- React Hooks (`useState`, `useEffect`, `useRef`, `useCallback`)
- React Native New Architecture (TurboModule)

## Getting started

### Prerequisites

- Node.js (LTS recommended)
- npm
- Expo Go app on a mobile device (for JS-only flow)
- EAS CLI / Expo dev client (for TurboModule flow)

### Run locally

```bash
npm install
npx expo start
```

Then scan the QR code using Expo Go.

## TurboModule implementation (Advanced)

The project also includes an Android TurboModule implementation for the advanced requirement.

### Native module overview

- Module name: `NativeCounter`
- Android implementation:
  - `android/app/src/main/java/com/anonymous/CounterAssignment/NativeCounterModule.kt`
  - `android/app/src/main/java/com/anonymous/CounterAssignment/NativeCounterPackage.kt`
- TurboModule spec:
  - `specs/NativeCounter.ts`
- JS adapter:
  - `src/native/NativeCounter.ts`

### Methods exposed by TurboModule

- `getValue()`
- `increment()`
- `decrement()`
- `reset()`
- `configureInactivity(timeoutMs, intervalMs)`
- `clearInactivity()`
- `startGradualReset(intervalMs)`
- `stopGradualReset()`

### Data flow (JS <-> Native)

1. UI interactions happen in `CounterScreen`.
2. `useCounterLogic` invokes methods through `src/native/NativeCounter.ts`.
3. Native module updates internal counter state.
4. Native emits `NativeCounter:onValueChanged`.
5. JS subscribes to the event and updates UI state.

This keeps the UI layer mostly presentational while native code owns business state transitions.

### JS vs native implementation differences

- JS implementation: timer/state logic runs in React hook.
- TurboModule implementation: core logic (increment rules, inactivity behavior, gradual reset orchestration) runs in native Android module.
- JS in Turbo mode primarily handles:
  - rendering,
  - gesture wiring,
  - event subscription and display updates.

### Running TurboModule build

TurboModule does not run in Expo Go. Use a dev client:

```bash
npx eas-cli build -p android --profile development
npx expo start --dev-client -c
```

### Current scope and limitation

- The advanced TurboModule implementation in this repository is **Android-first**.
- iOS TurboModule implementation is not included in the current submission.

## Project structure

- `App.tsx` - app entry and screen mounting
- `src/screens/CounterScreen.tsx` - screen UI and button wiring
- `src/hooks/useCounterLogic.ts` - core counter behavior and timer logic
- `src/components/CounterButton.tsx` - reusable button component
- `specs/NativeCounter.ts` - TurboModule contract
- `src/native/NativeCounter.ts` - JS-native adapter for TurboModule
- `android/.../NativeCounterModule.kt` - Android TurboModule implementation

## Implementation notes

- UI and logic are separated (`CounterScreen` vs `useCounterLogic`) for clarity.
- Button interactions support both tap and long-press with controlled repeat behavior.
- Native module emits value updates to keep JS view state in sync.
- Cleanup is handled for timers/listeners to avoid leaks and duplicate updates.
