## 2024-03-05 - Pre-computing Search Strings for React State Filtering
**Learning:** In React applications filtering over large datasets (e.g., 20k+ items), calculating normalized strings (using `toLowerCase()`) and concatenating multiple fields inline inside `Array.prototype.filter()` during every render blocks the main thread and causes severe input lag.
**Action:** Always pre-compute and store a normalized search string (e.g., `_searchableText`) on the data objects during initial fetch or parsing, so the render-loop filter is reduced to a simple `includes()` check.

## 2024-03-05 - Optimizing large lists of React components
**Learning:** Re-rendering an entire list of complex components (like `PromptCard`) on trivial state changes (e.g., toggling a single item's favorite state or clicking "Load More") blocks the main thread.
**Action:** Always wrap list items in `React.memo` and pass stable function references (using `useCallback` or `setState` functions directly) to event handlers rather than inline anonymous functions to avoid unnecessary component reconciliation.

## 2024-03-05 - Splitting Filter and Sort in React useMemo
**Learning:** In large React list components, combining expensive array sorting and simple predicate filtering into a single `useMemo` forces re-sorting of the entire array whenever the filter condition changes (e.g. toggling a favorite).
**Action:** Split them. Create one `useMemo` for sorting that only depends on sorting parameters, and a second `useMemo` that takes the sorted array and applies the fast filter.

## 2024-03-05 - Single-Pass Array Filtering
**Learning:** Chaining multiple `.filter()` calls on large datasets (like `allPrompts`) creates multiple intermediate arrays and iterates over the data multiple times (e.g. O(3N) instead of O(N)), which can cause input lag and memory churn during rapid filtering (e.g., search).
**Action:** Always combine multiple filter predicates into a single `.filter()` pass to reduce memory allocations and iterations.

## 2026-03-10 - Debouncing React State Filtering
**Learning:** Filtering large datasets synchronously on the main thread on every keystroke causes dropped frames and poor typing performance.
**Action:** Add a debounced search state for complex front-end filtering to ensure snappy UI interaction while delaying the heavy O(N) filtering logic.

## 2026-03-11 - Caching Module-Level Static Data Derivations
**Learning:** Pure functions deriving stats from large static datasets (e.g. `getPromptStats()`) invoked inside React components (like `Hero`) that re-render frequently due to parent state changes (like search input) will execute their O(N) calculations on every single render, unnecessarily blocking the main thread.
**Action:** Cache the result of expensive derivations at the module level if the underlying data is immutable to prevent redundant recalculations during component re-renders.

## 2024-03-12 - [Preventing Re-renders on Controlled Inputs]
**Learning:** In a dashboard with a global search input (`Index.tsx`), controlled input state (`search`) updates on every keystroke. Even if the heavy data filtering is debounced, the parent component re-renders immediately, causing all static siblings (`Hero`, `Analytics`, `Resources`) and independent components (`FilterBar`) to re-render.
**Action:** Wrap large, static, or independently-updating sections of a page in `React.memo()`. This ensures that rapid state updates (like typing in a search bar) only trigger re-renders for the input itself and bypasses the rest of the component tree reconciliation until the debounced value actually changes.
