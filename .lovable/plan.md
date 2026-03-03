

# Financial Engineering & Advisory Prompts Reference — PWA

## Overview
A beautiful, mobile-first PWA reference app containing ~1,500 curated Senior Partner/MD-level finance & economics prompts across three AI platforms (Perplexity, Claude, Google Gemini). Styled to match the dark/gold theme of your existing portfolio sites (kalilurrahman.lovable.app / kr-quantum-hub.lovable.app).

---

## Design & Theme
- **Dark mode default** with gold accents, matching your existing portfolio brand
- **Theme switcher**: Dark, Light, Sepia, Midnight (consistent with your other sites)
- **Header**: "KR" logo + "KALILUR RAHMAN" branding, nav links (HOME → portfolio site, Knowledge Hub, AI Agents, Digital Hub, Q-Ref → Quantum Hub), search bar, favorites toggle
- **Footer**: Consistent with portfolio site footer — social links, copyright, "Made with ❤️ by Kalilur Rahman"
- **PWA**: Installable from browser, offline-ready with service worker caching all prompt data

---

## Core Features

### 1. Hero Section
- Animated title: "Financial Engineering & Advisory *Prompts* Reference"
- Subtitle: "Your executive prompt compendium. 1,500+ curated prompts across 3 AI platforms."
- Status badge: "● 1,500+ curated prompts · Offline ready"

### 2. Multi-Level Filtering System
- **By AI Platform** (tab row with icons): All Platforms | 🟣 Perplexity | 🟠 Claude | 🔵 Google Gemini
- **By Domain** (category pills): All Domains | Corporate Strategy & Growth | Mergers & Acquisitions | Investment Banking & Equity Research | Private Equity & Venture Capital | Economics & Macroeconomic Analysis | FP&A & Budgeting
- **Live search bar** with keyboard shortcut (press /)
- **Counter**: "X prompts · Y showing"

### 3. Prompt Cards Grid
- Responsive grid (4 columns desktop → 2 tablet → 1 mobile)
- Each card shows: category icon, prompt title (truncated), AI platform badge, domain tag, preview snippet
- Click to expand full prompt in a modal/drawer
- **Copy to clipboard** button on each prompt
- **Save to favorites** (heart icon, persisted in localStorage)

### 4. Prompt Detail View (Modal/Drawer)
- Full prompt text with proper formatting
- AI platform indicator with color coding
- Domain & sub-category tags
- Copy button (copies full prompt text)
- Favorite toggle
- Share button (copy link)

### 5. Favorites Section
- Toggle to view only saved/favorited prompts
- Persisted in localStorage for offline access

### 6. Analytics Dashboard (Top Section)
- Horizontal bar chart showing prompt count by domain (similar to the Google Gemini HTML reference)
- Platform distribution donut/pie chart

---

## Data Organization
All prompt data stored as static JSON files in `src/data/`:
- `perplexity-prompts.json` — 500 prompts (from uploaded JSON)
- `claude-prompts.json` — 500 prompts (parsed from TXT file)
- `gemini-prompts.json` — 500 prompts (parsed from PDF)

Each prompt normalized to: `{ id, title, content, category, platform, domain }`

---

## Pages & Routes
- `/` — Main prompt reference (hero + filters + grid)
- `/favorites` — Saved prompts view
- `/install` — PWA install prompt page

---

## Mobile Experience
- Bottom navigation bar on mobile for quick access
- Swipe-friendly card interactions
- Full-screen prompt reader mode
- Touch-optimized filter chips

