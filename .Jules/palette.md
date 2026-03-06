## 2026-03-06 - Added ARIA labels to Modal and Pagination Controls
**Learning:** Found several icon-only or symbolic buttons (like '✕', '← PREV', 'NEXT →') in the `Library.tsx` component that lack clear accessibility labels, making them difficult to navigate via screen readers.
**Action:** Always ensure that any button containing only an icon or abbreviated/symbolic text has a descriptive `aria-label` attribute to improve keyboard and screen reader accessibility.
