# Data Management (`src/data`) Directory

The `data` directory contains the raw prompt content and the TypeScript parsing logic that structures the data for the **Financial Engineering & Advisory Prompts Reference** application.

The logic here handles standardizing disparate data formats (JSON, TXT, inline objects) into a uniform `Prompt` array consumed by the application.

## 📁 Source Files

### 1. `claude-prompts-full.txt`
- Contains prompts specifically designed for the Claude AI platform.
- It is a raw text file where prompts are separated by lines like `PROMPT X - <Title>`.
- The text file structure is parsed at runtime (or build-time via Vite's `?raw` loader).

### 2. `perplexity-prompts.json`
- Contains structured prompts designed for the Perplexity AI platform.
- It is an array of objects representing an `id`, `title`, `category`, and `content`.
- It is imported directly as a typed JSON module.

### 3. `prompts-library.json`
- Contains structured prompts specifically designed for Google Gemini.
- Uses fields like `id`, `title`, `category`, and `prompt_text`.

### 4. `prompts.ts`
The core parser and standardizer. This file is critical for inferring domains, parsing unstructured text, mapping disparate object keys (like `prompt_text` vs `content`), and exposing the unified dataset.

## 🧠 Parsing & Standardization Logic

The `prompts.ts` module handles the following transformations:

### Domain Inference (`inferDomain()`)
Not all raw prompts come with a standardized domain. The `inferDomain(title, content)` function analyzes the combined text to categorize the prompt into one of the 6 core domains:
- "Corporate Strategy & Growth"
- "Mergers & Acquisitions"
- "Investment Banking & Equity Research"
- "Private Equity & Venture Capital"
- "Economics & Macroeconomic Analysis"
- "FP&A & Budgeting"

It uses strategic keyword matching (e.g., "fp&a", "lbo", "macroeconom", "m&a", "fairness opinion") to automate categorization accurately.

### Parsing Claude Prompts (`parseClaudePrompts()`)
- It splits the `claudeRaw` string using regular expressions matching the `PROMPT [NUMBER] -` pattern.
- It extracts the title, removes decorative lines (`---`), and captures the body content.
- It automatically infers the domain and constructs `Prompt` objects with `platform: "claude"`.

### Normalizing Perplexity Data (`normalizePerplexity()`)
- Takes the raw JSON array (`perplexity-prompts.json`).
- Truncates overly long titles (using `.slice(0, 80)` or the first ellipsis) to ensure the UI remains clean.
- Maps the native `category` to a standardized `Domain` (using `categoryToDomain` mapping) or falls back to `inferDomain`.
- Sets `platform: "perplexity"`.

### Normalizing Gemini Data (`normalizeGemini()`)
- Normalizes objects from `prompts-library.json` specifically curated for Google Gemini.
- Maps the `prompt_text` key to the uniform `content` key.
- Resolves domains through mapping or fallback keyword inference.
- Sets `platform: "gemini"`.

## 🔄 Data Flow

1. **Source Loading**: The application imports unstructured JSON and TXT documents.
2. **Transformations**: The files undergo schema standardization in `prompts.ts`, enforcing strict mapping formats.
3. **Cache Storage**: The parsed payload is cached locally (`_allPrompts`) for speedy access without backend interaction.
4. **Access Control**: Exposed strictly by the functions detailed below.

## 📤 Exported APIs

- **`getAllPrompts(): Prompt[]`**: Returns the combined, standardized array of all 1,120 prompts. It caches the result in memory (`_allPrompts`) after the initial parsing.
- **`getPromptStats()`**: Analyzes the generated dataset and returns aggregated statistics (`total`, `byPlatform`, `byDomain`) used by the `Analytics.tsx` and `Hero.tsx` components for visual breakdowns.
