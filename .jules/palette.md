## 2024-03-06 - Make Interactive Div Cards Keyboard Accessible
**Learning:** Interactive `div` components (like `PromptCard` using `<Card onClick={...}>`) are completely inaccessible to keyboard users by default, meaning they cannot be tabbed to or activated via Enter/Space.
**Action:** When making custom interactive card components that act as buttons, always include `role="button"`, `tabIndex={0}`, an `onKeyDown` handler to trigger the action on `Enter` or `Space`, and proper `focus-visible` styling (e.g. `focus-visible:ring-2`) to show focus state without relying purely on hover.
## 2024-03-09 - Focus Visible Rings on Custom Interactive Elements
**Learning:** Custom interactive elements like pill buttons or toggle lists are missing standard focus outlines, leaving keyboard navigators confused about what element is currently selected.
**Action:** When creating raw `<button>` elements outside of shadcn-ui components, ensure they use the `focus-visible` Tailwind classes (e.g. `focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 focus-visible:ring-offset-background`) to explicitly show focus state via a ring, and proper ARIA states (like `aria-pressed`).
## 2024-03-20 - Keyboard Accessibility for Hover Actions
**Learning:** Inner interactive elements that are hidden until hover (e.g. `opacity-0 group-hover:opacity-100`) become inaccessible for keyboard navigation. Tabbing to them works, but they remain invisible, resulting in "ghost focus".
**Action:** When hiding inner actions behind a hover state using group hover, always pair `group-hover:opacity-100` with `focus-within:opacity-100 group-focus:opacity-100` on the container, and ensure the inner focusable elements themselves have clear `focus-visible` styles.
