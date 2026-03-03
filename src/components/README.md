# UI Components (`src/components`) Directory

The `components` directory houses all the reusable, isolated React components that form the user interface of the **Financial Engineering & Advisory Prompts Reference** application.

The design relies heavily on [shadcn-ui](https://ui.shadcn.com/) alongside [Radix Primitives](https://www.radix-ui.com/) to build accessible, unstyled UI components, which are then styled using Tailwind CSS.

## 📁 Component Structure

- **`ui/`**: This subdirectory contains all foundational, low-level UI elements (e.g., `Button`, `Dialog`, `DropdownMenu`, `Card`, `Toast`, `Badge`). These are primarily generated and customized via shadcn-ui. Modifying these files directly will alter the base design system of the application.
- **Top-Level Components**: These are domain-specific, composite components built by combining `ui/` elements.

## 🧱 Key Components

### 1. `Header.tsx` & `Footer.tsx`
These components form the persistent layout wrapper.
- **`Header`**: Contains the main navigation (`NavLink`), branding ("KALILUR RAHMAN"), and a functional search bar that handles quick filtering of the prompts catalog.
- **`Footer`**: Simple, consistent footer acknowledging copyright and links.

### 2. `Hero.tsx`
The expansive hero section displayed at the top of the main index page (`Index.tsx`).
- It presents the core proposition: "Financial Engineering & Advisory Prompts Reference".
- Displays quick stats like "661 curated prompts", "Offline ready", and "3 AI platforms" dynamically.

### 3. `Analytics.tsx`
Provides visual summaries and metrics on the prompt data available.
- Renders the "Prompts by Domain" progress bars showing category breakdowns (e.g., "Corporate Strategy & Growth", "M&A").
- Renders the "Prompts by Platform" visual rings for Perplexity, Claude, and Google Gemini with calculated percentages.

### 4. `FilterBar.tsx`
The interactive controls allowing users to drill down into specific subsets of prompts.
- Controls state for filtering by **Platforms** (e.g., Perplexity vs. Gemini) and **Domains** (e.g., Investment Banking vs. Private Equity).
- Utilizes toggle buttons mapped back to state handlers in the parent `Index.tsx`.

### 5. `PromptCard.tsx`
The primary visual unit displaying individual prompt data.
- Receives a `Prompt` object as a prop.
- Formats the prompt title, platform badge (with matching icon/color), domain classification, and an excerpt of the prompt content.
- Handles user interactions, such as opening the detailed view when clicked.

### 6. `PromptDetail.tsx`
A modal/dialog component providing a comprehensive view of a selected prompt.
- Renders the full `content` and `title`.
- Provides quick actions like "Copy to Clipboard" using utility hooks (`use-toast`).

## 🎨 Styling Philosophy

- **Utility First**: All custom styles rely on Tailwind CSS classes (`className="..."`).
- **Dark Mode Default**: The components are optimized for a dark-mode aesthetic. You'll see frequent use of `dark:bg-gray-800` or global theme variables like `bg-card`, `text-card-foreground`.
- **Merge Utility**: The `cn` function (`lib/utils.ts`) from `clsx` and `tailwind-merge` is extensively used to safely combine base styles with dynamic, prop-driven class overrides.
