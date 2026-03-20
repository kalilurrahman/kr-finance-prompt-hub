## 2026-03-06 - Added ARIA labels to Modal and Pagination Controls
**Learning:** Found several icon-only or symbolic buttons (like '✕', '← PREV', 'NEXT →') in the `Library.tsx` component that lack clear accessibility labels, making them difficult to navigate via screen readers.
**Action:** Always ensure that any button containing only an icon or abbreviated/symbolic text has a descriptive `aria-label` attribute to improve keyboard and screen reader accessibility.

## 2026-03-13 - Fixed nested ARIA controls in Card Component
**Learning:** Adding `role="button"` and `tabIndex` to a parent container (like a Card) that also contains nested interactive elements (like Action Buttons) creates invalid HTML and a confusing experience for screen readers.
**Action:** When making card components interactive, use the "overlay button" pattern. Place an invisible `<button className="absolute inset-0 z-0">` inside the `relative` positioned card to handle clicks/focus, and ensure nested buttons have `relative z-10` to keep them accessible and above the overlay button. Ensure not to use `opacity-0` if the overlay needs a visible focus ring.

## 2026-03-20 - Adding dynamic ARIA labels to Pagination and Navigation links
**Learning:** Found that "Load More" buttons and Icon/Logo links often lack specific context about the current state, missing critical context for screen readers. For example, a "Load More" button just announcing "Load More" does not indicate how many items will be loaded. Navigation links with no text or acronyms don't announce properly.
**Action:** Always provide descriptive `aria-label` attributes. For buttons that change state based on context (like load more with a specific count), dynamically update the `aria-label` to provide the screen reader with the current state (e.g. `aria-label={\`Load more prompts, \${remainingCount} remaining\`}`).

## 2026-03-17 - Adding ARIA attributes to generated filter/sort buttons
**Learning:** Found that many interactive filter and sort buttons generated via maps lacked `aria-pressed` and `aria-current` attributes, causing screen readers to misidentify their selection state.
**Action:** When creating lists of buttons that act as toggles, filters, or pagination controls, always ensure that attributes like `aria-pressed={isActive}` or `aria-current={isActive ? 'page' : undefined}` are applied so their state is properly announced to assistive technologies.

## 2025-03-18 - Clear Filters Button in Empty State
**Learning:** Adding a "Clear Filters" button in a "No results found" empty state significantly improves UX by providing a one-click actionable escape hatch, rather than just telling users to "try adjusting filters".
**Action:** Always provide an actionable reset/clear button in empty states caused by filtering or searching.
## 2024-05-18 - Missing ARIA Labels on Search Inputs
**Learning:** Search inputs that rely only on a visual `placeholder` attribute or an icon for context often lack proper identification for screen reader users. This is a common accessibility gap in modern web apps.
**Action:** When adding or auditing search bars (like the one in `Library.tsx`), always ensure an `aria-label` (e.g., `aria-label="Search prompts"`) is added to the `<input>` element if an explicit `<label>` is not present.
