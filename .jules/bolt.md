## 2024-03-05 - Pre-computing Search Strings for React State Filtering
**Learning:** In React applications filtering over large datasets (e.g., 20k+ items), calculating normalized strings (using `toLowerCase()`) and concatenating multiple fields inline inside `Array.prototype.filter()` during every render blocks the main thread and causes severe input lag.
**Action:** Always pre-compute and store a normalized search string (e.g., `_searchableText`) on the data objects during initial fetch or parsing, so the render-loop filter is reduced to a simple `includes()` check.

## 2024-03-05 - Optimizing large lists of React components
**Learning:** Re-rendering an entire list of complex components (like `PromptCard`) on trivial state changes (e.g., toggling a single item's favorite state or clicking "Load More") blocks the main thread.
**Action:** Always wrap list items in `React.memo` and pass stable function references (using `useCallback` or `setState` functions directly) to event handlers rather than inline anonymous functions to avoid unnecessary component reconciliation.
