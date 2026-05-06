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

## Getting started

### Prerequisites

- Node.js (LTS recommended)
- npm
- Expo Go app on a mobile device

### Run locally

```bash
npm install
npx expo start
```

Then scan the QR code using Expo Go.

## Project structure

- `App.tsx` - app entry and screen mounting
- `src/screens/CounterScreen.tsx` - screen UI and button wiring
- `src/hooks/useCounterLogic.ts` - core counter behavior and timer logic
- `src/components/CounterButton.tsx` - reusable button component

## Implementation notes

- Business logic is kept in a dedicated hook (`useCounterLogic`) so UI remains focused on rendering.
- Timer handles are stored in refs to avoid unnecessary re-renders.
- Functional state updates are used to keep behavior correct during rapid interactions.
- All timers are cleaned up during reset/unmount to prevent leaks and duplicate updates.
