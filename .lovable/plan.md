
Goal: fix the landing-page prompt modal so long prompt content is always scrollable (without affecting Copy/Download/Favorite actions).

What I found:
- The landing page modal uses `PromptDetail` (`src/components/PromptDetail.tsx`).
- It currently relies on Radix `ScrollArea` with `maxHeight` but no guaranteed fixed inner height.
- `DialogContent` base component includes `grid` by default (`src/components/ui/dialog.tsx`), while `PromptDetail` tries to use `flex`. This can create layout ambiguity and prevent the scroll region from getting a proper constrained height.
- FINPROMPT’s modal works because it uses a simple, explicit pattern: `max-h[...] + flex flex-col + body flex-1 overflow-y-auto`.

Implementation plan:
1. Update `src/components/PromptDetail.tsx` modal layout to a deterministic flex structure.
   - Force dialog container to flex-column (`!flex !flex-col`) and keep `max-h-[85vh] overflow-hidden`.
   - Keep header fixed at top and actions fixed at bottom.

2. Replace the current `ScrollArea` usage in `PromptDetail` with a native scroll body:
   - Use a middle wrapper like `className="flex-1 min-h-0 overflow-y-auto px-6 py-4"`.
   - Keep the prompt text block inside (`whitespace-pre-wrap`, mono font, readable line height).
   - This mirrors the working FINPROMPT modal behavior and avoids Radix height edge-cases.

3. Keep all action buttons unchanged.
   - Copy/Save/Download/Share section remains exactly as-is in behavior and location.

4. (Optional hardening) If needed after step 2, add `overscroll-contain` to the scrollable content area to prevent scroll-chain issues on trackpads/mobile.

5. Verification checklist after change:
   - On `/`, open “The Lazard Due Diligence Orchestration & Red Flag Tracker”.
   - Confirm full prompt can be scrolled top-to-bottom with mouse wheel, trackpad, and scrollbar drag.
   - Confirm footer actions remain visible/pinned.
   - Confirm modal close button and overlay-close still work.
   - Quick responsive check at mobile width to ensure scrolling still works.

Why this will fix it:
- The failure mode is layout/height constraint, not button logic.
- Native `overflow-y-auto` inside a guaranteed `flex-1 min-h-0` container is the most reliable pattern in this codebase (already proven in `Library.tsx`).

Files involved:
- `src/components/PromptDetail.tsx` (primary fix)
- No changes expected in `src/components/ui/dialog.tsx` unless fallback is needed
