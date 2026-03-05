## 2023-10-27 - [Client-Side Security]
**Vulnerability:** Client-side authentication logic in `src/pages/Admin.tsx` was initially implemented using `import.meta.env.VITE_ADMIN_PASSWORD`.
**Learning:** This approach compiles the secret directly into the client bundle, exposing it to anyone inspecting the source code, rendering it an insecure "security theater".
**Prevention:** Avoid implementing authentication logic entirely on the client side without a proper backend. Instead, focus on other security enhancements such as input validation and proper escaping.

## 2023-10-27 - [XSS Prevention in File Downloads]
**Vulnerability:** The `escapeHtml` function in `src/utils/downloadPrompt.ts` did not escape single quotes, creating a potential XSS vulnerability when generating HTML and PDF files from user-controlled prompt data.
**Learning:** Even internal utility functions for escaping HTML need to be comprehensive, covering all typical injection vectors, including single quotes.
**Prevention:** Always use established, robust HTML escaping libraries or ensure custom functions cover all characters: `&`, `<`, `>`, `"`, and `'`.
