# Counter Assignment (React Native + Expo)

This project implements a counter screen with non-trivial behavior using **React Native core concepts** (state, hooks, effects, timers) and minimal dependencies.

## How to run

```bash
npm install
npx expo start
```

Then open in **Expo Go** on your phone using the QR code.

## Project structure

- `App.tsx`: app entry point (renders the screen)
- `src/screens/CounterScreen.tsx`: UI layout (display + buttons)
- `src/hooks/useCounterLogic.ts`: business logic (state + rules + timers)
- `src/components/CounterButton.tsx`: small reusable button component

## Requirements covered

- **Counter state** stored in React state (`useState`) inside `useCounterLogic()`.
- **Increment / Decrement / Reset** functions exposed by the hook and used by UI.
- **Non-trivial behaviors implemented**:
  - Every **5th** increment press increases by **5** (otherwise +1).
  - Decrement clamps at **0** (never goes negative).
  - If there is **no interaction for 4 seconds**, counter auto-decrements every 1 second.
  - Reset **gradually** brings the value to 0 (not an instant jump).
- **Edge cases** handled:
  - Rapid taps use functional state updates (`setCount(prev => ...)`).
  - Reset while updating: user interaction cancels the gradual reset.
  - Timers are cleaned up on unmount to avoid leaks.

## Logic design (what lives where, and why)

### Where state is stored

All state is kept inside `useCounterLogic()`:

- `count`: the counter value
- `incrementPressCount`: counts how many times the user pressed Increment (needed for the “every 5th increment” rule)
- Timer handles in refs:
  - inactivity timeout handle
  - auto-decrement interval handle
  - gradual reset interval handle

**Why**: the screen stays “dumb” and mostly presentational. This separation makes the logic easier to test and reason about.

### Why timer handles are in `useRef`

Timer IDs are **mutable implementation details**, not UI state. Keeping them in refs avoids unnecessary re-renders and makes it easy to start/stop timers.

## Interview: questions they can ask (based on this code)

### React / state correctness

- Why use functional updates like `setCount(prev => prev + 1)`?
- What problem happens if you write `setCount(count + 1)` under rapid taps?
- Why is `incrementPressCount` separate from `count`?

### Timer / effect correctness

- Why do we clear old intervals/timeouts before starting new ones?
- What is the cleanup function in `useEffect` doing and why is it required?
- What happens if you forget to clear intervals on unmount?

### Architecture / performance

- Why separate logic into a hook (`useCounterLogic`) instead of keeping everything in `CounterScreen`?
- Why is `CounterButton` memoized and why are handlers memoized with `useCallback`?
- What would cause unnecessary re-renders here?

### Behavioral edge cases

- What happens if the user hits Reset and immediately hits Increment?
- How do you ensure the counter never goes negative even during auto-decrement?

## Tradeoffs / notes

- Gradual reset steps down by 1 at a fixed interval; for very large values this could take longer. A faster approach would “step” down by larger chunks for large numbers while still showing intermediate values.

