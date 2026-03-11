## 2024-05-15 - [Prevent UI crash on malformed local storage data]
**Vulnerability:** In `useFavorites.ts` and `useTerminalFavorites.ts`, `new Set(JSON.parse(stored))` was used without validating if the parsed data is an array. A malformed payload (e.g., `{"hack": "true"}`) injected into `localStorage` would throw a `TypeError` (since `Set` requires an iterable) and crash the React component tree.
**Learning:** `localStorage` is technically user input and can be modified outside the app's standard flow (e.g., via browser dev tools or extensions). Assuming its strict type signature leads to fragility.
**Prevention:** Always validate parsed JSON from `localStorage` using type guards (like `Array.isArray()`) before passing it to strict constructors.

## 2025-01-30 - [Missing Security Headers]
**Vulnerability:** The application was missing a Content Security Policy (CSP) header in `index.html`. This is a risk because without a CSP, the application relies entirely on client-side React code to prevent Cross-Site Scripting (XSS).
**Learning:** React SPAs built with Vite need explicit CSP configuration via a meta tag or server headers. Since there's no backend to serve headers, the meta tag is the appropriate solution. The CSP needs to allow 'unsafe-eval' for local Vite dev servers and 'unsafe-inline' for styling, but is otherwise restricted to 'self' and allowed CDNs for fonts/images.
**Prevention:** Always ensure a base `<meta http-equiv="Content-Security-Policy">` exists in `index.html` for SPAs that do not have a server to inject HTTP response headers.
