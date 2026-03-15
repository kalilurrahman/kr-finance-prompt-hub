## 2026-03-06 - Added ARIA labels to Modal and Pagination Controls
**Learning:** Found several icon-only or symbolic buttons (like '✕', '← PREV', 'NEXT →') in the `Library.tsx` component that lack clear accessibility labels, making them difficult to navigate via screen readers.
**Action:** Always ensure that any button containing only an icon or abbreviated/symbolic text has a descriptive `aria-label` attribute to improve keyboard and screen reader accessibility.

## 2026-03-13 - Fixed nested ARIA controls in Card Component
**Learning:** Adding `role="button"` and `tabIndex` to a parent container (like a Card) that also contains nested interactive elements (like Action Buttons) creates invalid HTML and a confusing experience for screen readers.
**Action:** When making card components interactive, use the "overlay button" pattern. Place an invisible `<button className="absolute inset-0 z-0">` inside the `relative` positioned card to handle clicks/focus, and ensure nested buttons have `relative z-10` to keep them accessible and above the overlay button. Ensure not to use `opacity-0` if the overlay needs a visible focus ring.
