## 2024-03-05 - Pre-computing Search Strings for React State Filtering
**Learning:** In React applications filtering over large datasets (e.g., 20k+ items), calculating normalized strings (using `toLowerCase()`) and concatenating multiple fields inline inside `Array.prototype.filter()` during every render blocks the main thread and causes severe input lag.
**Action:** Always pre-compute and store a normalized search string (e.g., `_searchableText`) on the data objects during initial fetch or parsing, so the render-loop filter is reduced to a simple `includes()` check.
