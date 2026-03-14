## 2026-03-06 - Added ARIA labels to Modal and Pagination Controls
**Learning:** Found several icon-only or symbolic buttons (like '✕', '← PREV', 'NEXT →') in the `Library.tsx` component that lack clear accessibility labels, making them difficult to navigate via screen readers.
**Action:** Always ensure that any button containing only an icon or abbreviated/symbolic text has a descriptive `aria-label` attribute to improve keyboard and screen reader accessibility.

## 2026-03-06 - Added ARIA labels to Social Links in Footer
**Learning:** Found that custom wrapper components for icon-only links (like `SocialLink` in `Footer.tsx`) often forget to forward accessibility labels, causing them to be completely silent or unhelpful to screen readers.
**Action:** When creating wrapper components for links or buttons that only contain icons, always require an explicit `aria-label` or accessible text prop and pass it down to the underlying interactive element to ensure screen reader accessibility.
