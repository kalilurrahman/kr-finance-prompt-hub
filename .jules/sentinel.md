## 2023-10-27 - [Client-Side Security]
**Vulnerability:** Client-side authentication logic in `src/pages/Admin.tsx` was initially implemented using `import.meta.env.VITE_ADMIN_PASSWORD`.
**Learning:** This approach compiles the secret directly into the client bundle, exposing it to anyone inspecting the source code, rendering it an insecure "security theater".
**Prevention:** Avoid implementing authentication logic entirely on the client side without a proper backend. Instead, focus on other security enhancements such as input validation and proper escaping.

## 2023-10-27 - [XSS Prevention in File Downloads]
**Vulnerability:** The `escapeHtml` function in `src/utils/downloadPrompt.ts` did not escape single quotes, creating a potential XSS vulnerability when generating HTML and PDF files from user-controlled prompt data.
**Learning:** Even internal utility functions for escaping HTML need to be comprehensive, covering all typical injection vectors, including single quotes.
**Prevention:** Always use established, robust HTML escaping libraries or ensure custom functions cover all characters: `&`, `<`, `>`, `"`, and `'`.
## 2025-03-07 - [Unsafe DOM sink document.write removal]
**Vulnerability:** Use of `document.write` and `window.open("", "_blank")` to generate dynamic printable PDF views in `downloadAsPdf`.
**Learning:** Even when inputs are sanitized (via `escapeHtml`), static code analysis tools and modern security best practices flag `document.write` and implicitly-linked `window.open` as dangerous (potential XSS sinks and cross-window leakage vectors).
**Prevention:** Replace `document.write` with secure Blob URLs (`URL.createObjectURL`) and explicitly use `"noopener,noreferrer"` window features when opening new tabs.
## 2025-03-09 - [Insecure Cookie Configuration]
**Vulnerability:** The UI state cookie (`sidebar:state`) in `src/components/ui/sidebar.tsx` was set without `SameSite` or `Secure` attributes.
**Learning:** Even UI state cookies can be subject to Cross-Site Request Forgery (CSRF) or exposed over unencrypted connections if they are not explicitly configured properly.
**Prevention:** Always append explicit security attributes (`SameSite=Lax` and `Secure`) to all `document.cookie` assignments.
