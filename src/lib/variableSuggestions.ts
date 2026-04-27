/**
 * Curated dropdown suggestions for common prompt parameters.
 * Used by the MetaEngine Workshop to give users recommended choices
 * (companies, geographies, sectors, etc.) instead of free-text only.
 */

export interface SuggestionGroup {
  label: string;
  options: string[];
}

const COMPANIES_INDIA: SuggestionGroup = {
  label: "India · Listed",
  options: [
    "Reliance Industries",
    "Tata Consultancy Services",
    "HDFC Bank",
    "Infosys",
    "ICICI Bank",
    "Bharti Airtel",
    "Larsen & Toubro",
    "Adani Enterprises",
    "Tata Motors",
    "Sun Pharmaceutical",
    "Cipla",
    "Maruti Suzuki",
  ],
};

const COMPANIES_US: SuggestionGroup = {
  label: "US · Mega-cap",
  options: [
    "Apple Inc.",
    "Microsoft",
    "Alphabet (Google)",
    "Amazon",
    "NVIDIA",
    "Meta Platforms",
    "Tesla",
    "Berkshire Hathaway",
    "JPMorgan Chase",
    "Goldman Sachs",
    "Procter & Gamble",
    "ExxonMobil",
  ],
};

const COMPANIES_GLOBAL: SuggestionGroup = {
  label: "Europe / Asia",
  options: [
    "ASML Holding",
    "LVMH",
    "Nestlé",
    "Novo Nordisk",
    "Samsung Electronics",
    "TSMC",
    "Toyota Motor",
    "Saudi Aramco",
    "HSBC",
    "Siemens",
  ],
};

const GEOGRAPHIES: SuggestionGroup = {
  label: "Geographies",
  options: [
    "India",
    "United States",
    "European Union",
    "United Kingdom",
    "China",
    "Southeast Asia (ASEAN)",
    "Middle East & North Africa",
    "Latin America",
    "Sub-Saharan Africa",
    "Japan",
    "Australia & New Zealand",
    "GCC (Gulf Cooperation Council)",
  ],
};

const INDUSTRIES: SuggestionGroup = {
  label: "Industries / Sectors",
  options: [
    "Banking & Financial Services",
    "Pharmaceuticals & Healthcare",
    "Information Technology",
    "FMCG / Consumer Staples",
    "Automotive & Mobility",
    "Energy & Utilities",
    "Telecommunications",
    "Industrial Manufacturing",
    "Real Estate",
    "Retail & E-commerce",
    "Media & Entertainment",
    "Aerospace & Defense",
    "Agriculture & Agritech",
    "Insurance",
  ],
};

const TIME_HORIZONS: SuggestionGroup = {
  label: "Time horizons",
  options: ["3 years", "5 years", "7 years", "10 years", "15 years", "Through next economic cycle"],
};

const DEAL_SIZES: SuggestionGroup = {
  label: "Deal sizes",
  options: ["$100M", "$500M", "$1B", "$2.5B", "$5B", "$10B", "$25B+"],
};

const MULTIPLES: SuggestionGroup = {
  label: "EV/EBITDA multiples",
  options: ["6x", "8x", "10x", "12x", "15x", "20x"],
};

const GROWTH_RATES: SuggestionGroup = {
  label: "Growth rates",
  options: ["5% CAGR", "8% CAGR", "12% CAGR", "15% CAGR", "20% CAGR", "25%+ CAGR"],
};

const MARGINS: SuggestionGroup = {
  label: "EBITDA margins",
  options: ["12%", "15%", "20%", "25%", "30%", "35%+"],
};

const RATIONALES: SuggestionGroup = {
  label: "Strategic rationales",
  options: [
    "Geographic expansion into emerging markets",
    "Vertical integration to capture margin",
    "Technology / capability acquisition",
    "Consolidation to gain market share",
    "Diversification of revenue streams",
    "Cross-sell to existing customer base",
    "Cost synergies & operating leverage",
    "Defensive move against new entrants",
  ],
};

const PORTFOLIOS: SuggestionGroup = {
  label: "Portfolio mixes",
  options: [
    "60% equity, 30% fixed income, 10% alternatives",
    "70% equity, 20% fixed income, 10% cash",
    "50% equity, 40% fixed income, 10% real assets",
    "40% equity, 40% bonds, 20% alternatives",
    "Endowment-style: 30% public equity, 30% PE/VC, 20% real assets, 20% bonds",
  ],
};

/**
 * Map of variable-name patterns → groups of curated suggestions.
 * Lookups are case-insensitive and substring-based for resilience.
 */
const PATTERN_RULES: Array<{ test: RegExp; groups: SuggestionGroup[] }> = [
  { test: /(company|acquirer|target)\s*(name)?$/i, groups: [COMPANIES_INDIA, COMPANIES_US, COMPANIES_GLOBAL] },
  { test: /\bcompany\b/i, groups: [COMPANIES_INDIA, COMPANIES_US, COMPANIES_GLOBAL] },
  { test: /(country|region|geograph|market\s*country)/i, groups: [GEOGRAPHIES] },
  { test: /(industry|sector|vertical)/i, groups: [INDUSTRIES] },
  { test: /(horizon|hold\s*period|investment\s*period|time\s*frame)/i, groups: [TIME_HORIZONS] },
  { test: /(deal\s*size|enterprise\s*value|transaction\s*value|ev$)/i, groups: [DEAL_SIZES] },
  { test: /(multiple|ev\/ebitda|ev_ebitda)/i, groups: [MULTIPLES] },
  { test: /(growth\s*rate|cagr|growth$)/i, groups: [GROWTH_RATES] },
  { test: /(margin)/i, groups: [MARGINS] },
  { test: /(rationale|thesis|strategy\s*for)/i, groups: [RATIONALES] },
  { test: /(portfolio|allocation|asset\s*mix)/i, groups: [PORTFOLIOS] },
];

/**
 * Returns curated suggestion groups for a given variable name, or empty array.
 */
export function getSuggestionsForVariable(varName: string): SuggestionGroup[] {
  for (const rule of PATTERN_RULES) {
    if (rule.test.test(varName)) return rule.groups;
  }
  return [];
}
