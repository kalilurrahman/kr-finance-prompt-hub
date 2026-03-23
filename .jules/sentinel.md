## 2024-05-20 - Tighten Content Security Policy (CSP)
**Vulnerability:** Permissive Content Security Policy (CSP) in `index.html` containing `'unsafe-eval'` in `script-src` and missing `object-src` and `base-uri` directives.
**Learning:** While Vite requires `'unsafe-eval'` for some development tools, production builds of React/Vite applications typically do not. Including it in the production `index.html` weakens XSS defenses by allowing strings to be evaluated as code.
**Prevention:** Configure CSP strictly for production by omitting `'unsafe-eval'`, and ensure defense-in-depth by setting `object-src 'none'` to block malicious plugins and `base-uri 'none'` to prevent base tag hijacking.
