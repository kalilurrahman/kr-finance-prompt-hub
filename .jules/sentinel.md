## 2024-05-15 - [Prevent UI crash on malformed local storage data]
**Vulnerability:** In `useFavorites.ts` and `useTerminalFavorites.ts`, `new Set(JSON.parse(stored))` was used without validating if the parsed data is an array. A malformed payload (e.g., `{"hack": "true"}`) injected into `localStorage` would throw a `TypeError` (since `Set` requires an iterable) and crash the React component tree.
**Learning:** `localStorage` is technically user input and can be modified outside the app's standard flow (e.g., via browser dev tools or extensions). Assuming its strict type signature leads to fragility.
**Prevention:** Always validate parsed JSON from `localStorage` using type guards (like `Array.isArray()`) before passing it to strict constructors.

## 2025-01-30 - [Missing Security Headers]
**Vulnerability:** The application was missing a Content Security Policy (CSP) header in `index.html`. This is a risk because without a CSP, the application relies entirely on client-side React code to prevent Cross-Site Scripting (XSS).
**Learning:** React SPAs built with Vite need explicit CSP configuration via a meta tag or server headers. Since there's no backend to serve headers, the meta tag is the appropriate solution. The CSP needs to allow 'unsafe-eval' for local Vite dev servers and 'unsafe-inline' for styling, but is otherwise restricted to 'self' and allowed CDNs for fonts/images.
**Prevention:** Always ensure a base `<meta http-equiv="Content-Security-Policy">` exists in `index.html` for SPAs that do not have a server to inject HTTP response headers.
## 2024-05-24 - [Log Injection via Unsanitized Location Pathname]
**Vulnerability:** The application was passing `location.pathname` directly from `useLocation` to `console.error` without sanitization. This allows an attacker to manipulate the URL path with malicious content that gets logged verbatim, potentially causing log injection or XSS depending on the log ingestion and rendering setup.
**Learning:** Client-side URL components (like `location.pathname`, `search`, etc.) should be treated as untrusted user input, even when used in diagnostic logging within the browser.
**Prevention:** Always encode URI components or sanitize them using appropriate methods (like `encodeURIComponent()`) before logging them to the console or sending them to a remote logging service.
## 2025-03-15 - [Defense-in-depth HTML output XSS mitigation]
**Vulnerability:** Even though supposedly "static" constants like `SITE_NAME`, `AUTHOR`, and `SITE_URL` were interpolated into an HTML string for downloads (`downloadAsHtml`, `downloadAsPdf`), they were not explicitly sanitized, leaving a small gap for potential XSS if those constants were later modified or fetched externally.
**Learning:** For defense-in-depth, ALL variables interpolated into an HTML execution context (even hardcoded constants) must be sanitized. Relying on "it's static" is brittle and can lead to regressions.
**Prevention:** Always use `escapeHtml()` for HTML content interpolation and `encodeURI()` or `encodeURIComponent()` for URL/Href interpolations.
