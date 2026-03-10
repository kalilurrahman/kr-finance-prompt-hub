## 2024-05-15 - [Prevent UI crash on malformed local storage data]
**Vulnerability:** In `useFavorites.ts` and `useTerminalFavorites.ts`, `new Set(JSON.parse(stored))` was used without validating if the parsed data is an array. A malformed payload (e.g., `{"hack": "true"}`) injected into `localStorage` would throw a `TypeError` (since `Set` requires an iterable) and crash the React component tree.
**Learning:** `localStorage` is technically user input and can be modified outside the app's standard flow (e.g., via browser dev tools or extensions). Assuming its strict type signature leads to fragility.
**Prevention:** Always validate parsed JSON from `localStorage` using type guards (like `Array.isArray()`) before passing it to strict constructors.
