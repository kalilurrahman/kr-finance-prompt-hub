# Source (`src`) Directory

The `src` directory contains the core application logic and presentation layer for the **Financial Engineering & Advisory Prompts Reference** application.

It is structured to separate concerns, making the codebase scalable and easy to navigate.

## 📁 Structure Overview

Here's what each directory handles:

- **[`components/`](./components/README.md)**: Reusable React components that make up the user interface (e.g., headers, footers, prompt cards, and filter bars). It also includes foundational elements built with `shadcn-ui`.
- **[`data/`](./data/README.md)**: Contains the raw prompt data files (`.json`, `.txt`) and the TypeScript logic (`prompts.ts`) responsible for parsing, inferring domains, and standardizing prompt structures across different AI platforms.
- **`hooks/`**: Custom React hooks (e.g., `use-toast.ts`, `use-mobile.tsx`) for managing UI state and reusable side effects.
- **`lib/`**: Utility functions (e.g., `utils.ts` for class merging) that are used across the application.
- **[`pages/`](./pages/README.md)**: Top-level route components that represent full application views (e.g., the main `Index.tsx` dashboard and the `NotFound.tsx` fallback).
- **`types/`**: Application-wide TypeScript definitions ensuring type safety (e.g., `prompt.ts` which defines the structure of a `Prompt`, its `Domain`, and `Platform`).

## 🛠️ Key Entry Files

- **`App.tsx`**: The main application component that sets up the React Router, query providers (`@tanstack/react-query`), and global UI wrappers like the `Toaster` and `TooltipProvider`. It also defaults the app to a "dark" mode theme.
- **`main.tsx`**: The entry point for Vite that bootstraps the React application and mounts it to the DOM.
- **`index.css` & `App.css`**: Global stylesheets implementing Tailwind CSS directives and custom CSS variables.

## ✨ Development Guidelines

1. **State Management**: Most of the global state is derived or managed by URL parameters or standard React hooks.
2. **Data Fetching**: The app statically parses the localized data during build/runtime, allowing it to function efficiently without a complex backend.
3. **Styling**: Stick to the Tailwind utility classes. For complex components, refer to the pre-configured `shadcn-ui` components.
