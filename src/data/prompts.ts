import type { Prompt, Domain, Platform } from "@/types/prompt";
import perplexityRaw from "./perplexity-prompts.json";
import claudeRaw from "./claude-prompts.txt?raw";

// Category mapping for perplexity data
const categoryToDomain: Record<string, Domain> = {
  Strategy: "Corporate Strategy & Growth",
  "M&A": "Mergers & Acquisitions",
  "Equity Research": "Investment Banking & Equity Research",
  "Private Equity": "Private Equity & Venture Capital",
  Macroeconomics: "Economics & Macroeconomic Analysis",
  "FP&A / Finance": "FP&A & Budgeting",
};

function inferDomain(title: string, content: string): Domain {
  const text = (title + " " + content).toLowerCase();
  if (text.includes("fp&a") || text.includes("budgeting") || text.includes("operating plan") || text.includes("financial planning") || text.includes("zero-based") || text.includes("treasury") || text.includes("forecasting"))
    return "FP&A & Budgeting";
  if (text.includes("macroeconom") || text.includes("geopolitical") || text.includes("monetary policy") || text.includes("central bank") || text.includes("emerging market") || text.includes("sovereign") || text.includes("inflation") || text.includes("gdp"))
    return "Economics & Macroeconomic Analysis";
  if (text.includes("private equity") || text.includes("venture capital") || text.includes("lbo") || text.includes("buyout") || text.includes("portfolio company") || text.includes("vc ") || text.includes("series a") || text.includes("series b"))
    return "Private Equity & Venture Capital";
  if (text.includes("equity research") || text.includes("stock pitch") || text.includes("earnings") || text.includes("initiat") || text.includes("coverage") || text.includes("ipo") || text.includes("valuation") || text.includes("fairness opinion"))
    return "Investment Banking & Equity Research";
  if (text.includes("m&a") || text.includes("merger") || text.includes("acquisition") || text.includes("due diligence") || text.includes("synergy") || text.includes("carve-out") || text.includes("spin-off") || text.includes("sell-side") || text.includes("integration"))
    return "Mergers & Acquisitions";
  return "Corporate Strategy & Growth";
}

function parseClaudePrompts(raw: string): Prompt[] {
  const prompts: Prompt[] = [];
  const sections = raw.split(/\nPROMPT\s+(\d+)\s*[—–-]\s*/);

  for (let i = 1; i < sections.length; i += 2) {
    const num = parseInt(sections[i]);
    const body = sections[i + 1];
    if (!body) continue;

    const lines = body.trim().split("\n");
    const title = lines[0]?.replace(/^[─\-─]+$/, "").trim() || `Claude Prompt ${num}`;

    // Find content start (after the decorative line)
    let contentStart = 1;
    for (let j = 1; j < lines.length; j++) {
      if (/^[─\-]+$/.test(lines[j].trim())) {
        contentStart = j + 1;
        break;
      }
    }

    const content = lines.slice(contentStart).join("\n").trim();
    if (!content) continue;

    const domain = inferDomain(title, content);

    prompts.push({
      id: `claude-${num}`,
      title: `${title}`,
      content,
      category: title,
      platform: "claude",
      domain,
    });
  }

  return prompts;
}

// Gemini representative prompts from PDF
const geminiPrompts: Prompt[] = [
  {
    id: "gemini-500",
    title: 'The "Agentic CEO" Strategic Supervision Framework',
    content: 'Act as a Global Managing Director. Design the \'Strategic Supervision\' framework for a CEO in the 2027 Agentic AI era. Detail the shift from task execution to orchestration. Outline how to eliminate \'Shadow AI\' risks while capturing the 13% revenue increase seen by AI-mature leaders. Define the \'Decision-to-Execution\' engine architecture that allows an organization to respond at the speed of change. Format as the ultimate C-Suite Master Strategy for 2027.',
    category: "Agentic AI Strategy",
    platform: "gemini",
    domain: "Corporate Strategy & Growth",
  },
  {
    id: "gemini-483",
    title: 'SEC "AI-Washing" Forensic Compliance Audit',
    content: "Act as a Chief Compliance Officer. The SEC is actively targeting 'AI-Washing' where automation claims exceed reality. Conduct a forensic audit of our public disclosures. Separate pilot programs from commercially mature functionality. Evaluate if margin expansion narratives in the MD&A have clear data provenance. Format as a Compliance Audit Report with a Red/Amber/Green risk alignment table.",
    category: "Compliance & Regulatory",
    platform: "gemini",
    domain: "Investment Banking & Equity Research",
  },
  {
    id: "gemini-494",
    title: '"12 is the New 5" EBITDA Growth Mandate',
    content: "Act as a Bain Senior Partner. In the '12 is the new 5' era, EBITDA growth must hit 12% to offset vanishing multiple expansion. Design a proactive sourcing system to identify companies years before they trade. Use unique strategy filters to determine an asset's 'Full Potential' before any other bidder. Address the use of clinician-centric digital tools for margin expansion. Format as an Investment Thesis Brief.",
    category: "PE Deal Sourcing",
    platform: "gemini",
    domain: "Private Equity & Venture Capital",
  },
  {
    id: "gemini-1",
    title: "McKinsey Market Entry into India's $1T Digital Roadmap",
    content: "Act as a Senior Partner at McKinsey & Company. Design a hypothesis-driven market entry strategy for India's $1 trillion digital economy roadmap, covering TAM sizing with top-down and bottom-up methodologies, competitive intensity heat map for top 5 incumbents, regulatory risk scorecard, three entry-mode options (greenfield, JV, acquisition) with NPV and risk-adjusted IRR, and a 90-day action plan with RACI matrix. Format as a McKinsey-style Strategy Deck Outline.",
    category: "Market Entry",
    platform: "gemini",
    domain: "Corporate Strategy & Growth",
  },
  {
    id: "gemini-2",
    title: "Sovereign AI Green Mandate Advisory",
    content: "Act as a Senior Advisor at Strategy&. Evaluate the implications of sovereign AI green mandates on corporate capital allocation and ESG strategy. Analyze how governments are tying AI deployment permits to sustainability commitments. Model the impact on WACC, carbon credit pricing, and green bond issuance. Provide a framework for corporations to align AI investments with sovereign ESG requirements. Format as a Policy Impact Assessment with a Decision Matrix.",
    category: "ESG & Policy",
    platform: "gemini",
    domain: "Corporate Strategy & Growth",
  },
  {
    id: "gemini-3",
    title: "Digital Twin Logistics Optimization Model",
    content: "Act as a Managing Director at BCG GAMMA. Design a Digital Twin framework for a global logistics network to optimize supply chain resilience. Cover real-time simulation of disruption scenarios, predictive maintenance scheduling, inventory positioning optimization, and carbon footprint reduction modeling. Include ROI analysis, implementation roadmap, and integration with existing ERP systems. Format as a BCG Digital Transformation Case Study.",
    category: "Digital Transformation",
    platform: "gemini",
    domain: "Corporate Strategy & Growth",
  },
  {
    id: "gemini-4",
    title: "Megadeal Refinancing Logic in Rising Rate Environment",
    content: "Act as a Managing Director in Goldman Sachs' Leveraged Finance group. Structure a $15B+ megadeal refinancing in a rising rate environment. Analyze the optimal debt mix between Term Loan B, Senior Secured Notes, and High Yield bonds. Model interest rate hedging strategies using swaps and caps. Evaluate covenant headroom under stress scenarios and rating agency implications. Format as a Capital Markets Execution Memo.",
    category: "Debt Capital Markets",
    platform: "gemini",
    domain: "Mergers & Acquisitions",
  },
  {
    id: "gemini-5",
    title: "OECD Pillar Two Operational Due Diligence",
    content: "Act as a Partner at Deloitte Tax. Conduct operational due diligence on the impact of OECD Pillar Two (Global Minimum Tax of 15%) on a multinational's M&A strategy. Assess Qualified Domestic Minimum Top-up Tax (QDMTT) implications across 20+ jurisdictions. Model the effective tax rate impact on deal valuation and synergy realization. Evaluate holding structure optimization. Format as a Tax DD Report with Jurisdiction-by-Jurisdiction Impact Table.",
    category: "Tax & Regulatory",
    platform: "gemini",
    domain: "Mergers & Acquisitions",
  },
  {
    id: "gemini-6",
    title: "Cross-Border Tax Residency Arbitrage Strategy",
    content: "Act as a Senior International Tax Partner at EY. Design a cross-border tax residency strategy for a technology company with IP-heavy revenues across US, EU, and APAC. Evaluate treaty benefits, permanent establishment risks, and transfer pricing adjustments. Model the after-tax cash flow impact of restructuring from a centralized to a principal model. Address CbCR reporting and substance requirements. Format as an International Tax Planning Memo.",
    category: "International Tax",
    platform: "gemini",
    domain: "Mergers & Acquisitions",
  },
  {
    id: "gemini-7",
    title: "BillionToOne Diagnostics Equity Research Proof Points",
    content: "Act as a Senior Equity Research Analyst at Cowen. Build an institutional-quality research report on next-generation prenatal diagnostics, using BillionToOne as the case study. Analyze the total addressable market for cell-free DNA testing, competitive positioning vs. Natera and Illumina, unit economics and reimbursement landscape, and path to profitability. Include DCF valuation with explicit assumptions and bull/base/bear price targets. Format as an Initiation of Coverage Report.",
    category: "Healthcare Equity Research",
    platform: "gemini",
    domain: "Investment Banking & Equity Research",
  },
  {
    id: "gemini-8",
    title: "CET1 Capital Deployment Optimization",
    content: "Act as a Senior Bank Strategist at Oliver Wyman. Design a CET1 capital optimization strategy for a G-SIB seeking to maximize ROE while maintaining regulatory buffers. Model the trade-offs between share buybacks, dividend increases, organic loan growth, and M&A. Analyze RWA optimization techniques including securitization, credit risk transfer, and portfolio rebalancing. Format as a Board Strategy Presentation with Scenario Analysis.",
    category: "Bank Strategy",
    platform: "gemini",
    domain: "Investment Banking & Equity Research",
  },
  {
    id: "gemini-9",
    title: "Fama-French Alpha Screening Framework",
    content: "Act as a Senior Quantitative Portfolio Manager at AQR Capital Management. Build a systematic alpha screening framework using the Fama-French five-factor model plus momentum. Design factor construction methodology, backtesting protocol with transaction cost modeling, and out-of-sample validation. Include regime-conditional factor performance analysis and multi-factor portfolio construction with risk parity weighting. Format as a Quantitative Research Paper Outline.",
    category: "Quantitative Finance",
    platform: "gemini",
    domain: "Investment Banking & Equity Research",
  },
  {
    id: "gemini-10",
    title: "DPI Restoration Strategy for Vintage PE Funds",
    content: "Act as a Managing Partner at a top-tier Private Equity firm. Design a DPI (Distributions to Paid-In) restoration strategy for a 2018-2020 vintage fund facing LP pressure. Analyze exit pathway optimization including IPO, strategic sale, secondary transactions, and continuation vehicles. Model the impact of each path on fund-level IRR and DPI. Address LP communication strategy and NAV bridge analysis. Format as an LP Advisory Committee Presentation.",
    category: "PE Fund Strategy",
    platform: "gemini",
    domain: "Private Equity & Venture Capital",
  },
  {
    id: "gemini-11",
    title: "16,000-Company PE Exit Backlog Navigator",
    content: "Act as a Senior Director at Bain & Company's Private Equity practice. Analyze the unprecedented 16,000-company PE exit backlog and design a strategic framework for GPs to prioritize and execute exits. Evaluate alternative exit routes: continuation funds, GP-led secondaries, partial sales, dividend recaps, and strategic M&A. Model the optimal timing and exit route for different portfolio company profiles. Format as a PE Industry Insights Report.",
    category: "PE Exit Strategy",
    platform: "gemini",
    domain: "Private Equity & Venture Capital",
  },
  {
    id: "gemini-12",
    title: "GEFI Risk Contagion Modeling",
    content: "Act as a Senior Economist at the BIS (Bank for International Settlements). Model the contagion channels of Geoeconomic Fragmentation Index (GEFI) risk across sovereign credit, trade flows, and capital markets. Analyze how trade decoupling scenarios between US-China affect global supply chains, commodity prices, and financial stability. Build a stress testing framework for portfolio exposure to GEFI risk. Format as a BIS Working Paper Outline with Data Tables.",
    category: "Geopolitical Risk",
    platform: "gemini",
    domain: "Economics & Macroeconomic Analysis",
  },
  {
    id: "gemini-13",
    title: "IMF Sovereign ALM with Contingent Claims Analysis",
    content: "Act as a Senior Economist at the IMF's Fiscal Affairs Department. Design a Sovereign Asset-Liability Management (ALM) framework using Contingent Claims Analysis (CCA). Model the sovereign balance sheet including explicit and contingent liabilities, foreign reserve adequacy, and the distance-to-distress metric. Apply the Merton model to estimate sovereign credit risk and optimal debt management strategy. Format as an IMF Technical Assistance Report.",
    category: "Sovereign Finance",
    platform: "gemini",
    domain: "Economics & Macroeconomic Analysis",
  },
  {
    id: "gemini-14",
    title: '"AI Lift and Economic Drift" Macro Model',
    content: "Act as the Chief Economist at McKinsey Global Institute. Build a comprehensive macroeconomic model quantifying the 'AI Lift' (productivity gains from AI adoption) against 'Economic Drift' (structural unemployment, inequality, and social costs). Model GDP impact across developed and emerging economies, sector-by-sector labor displacement and augmentation, and implications for monetary and fiscal policy. Format as an MGI Research Report with Data-Rich Exhibits.",
    category: "AI Economics",
    platform: "gemini",
    domain: "Economics & Macroeconomic Analysis",
  },
  {
    id: "gemini-15",
    title: "Airport Authority Revenue Validation Model",
    content: "Act as a Senior Director at Alvarez & Marsal advising an airport authority on revenue forecasting and budget validation. Build a comprehensive revenue model covering aeronautical fees, non-aeronautical revenue (retail, parking, advertising), and capital grants. Include passenger traffic forecasting using econometric models, stress testing under pandemic and economic downturn scenarios, and comparison to FAA/ACI benchmarks. Format as a Budget Validation Report.",
    category: "Public Sector Finance",
    platform: "gemini",
    domain: "FP&A & Budgeting",
  },
  {
    id: "gemini-16",
    title: "Decision-Grade Forecasting Architecture",
    content: "Act as a VP of FP&A at a Fortune 100 technology company. Design a 'Decision-Grade' forecasting system that replaces traditional quarterly re-forecasting with continuous, driver-based, AI-augmented predictions. Cover the architecture of real-time data pipelines, ML model selection for demand sensing, integration with ERP and CRM systems, and governance for forecast accountability. Format as an FP&A Transformation Blueprint.",
    category: "FP&A Innovation",
    platform: "gemini",
    domain: "FP&A & Budgeting",
  },
  {
    id: "gemini-17",
    title: "Budget Slacking Detection Framework",
    content: "Act as a CFO at a global manufacturing company. Design a systematic framework to detect and eliminate 'budget slacking' — the practice of managers deliberately underestimating revenue or overestimating costs to create easy-to-beat targets. Include statistical methods for identifying patterns, benchmarking techniques against external data, incentive redesign recommendations, and a governance model for challenge sessions. Format as a CFO's Budget Integrity Playbook.",
    category: "Budget Governance",
    platform: "gemini",
    domain: "FP&A & Budgeting",
  },
  {
    id: "gemini-18",
    title: "Jedox Digital Twin Financial Planning",
    content: "Act as a Senior Finance Transformation Consultant at PwC. Design a Digital Twin financial planning implementation using Jedox or comparable EPM platform. Create a connected planning architecture that links strategic planning, operational planning, and financial consolidation in real-time. Cover driver-based modeling, scenario planning with Monte Carlo simulation, automated variance analysis, and predictive analytics integration. Format as a Technology Implementation Blueprint.",
    category: "EPM Technology",
    platform: "gemini",
    domain: "FP&A & Budgeting",
  },
];

function normalizePerplexity(raw: typeof perplexityRaw): Prompt[] {
  return (raw as { id: number; title: string; category: string; content: string }[]).map((p) => {
    const domain = categoryToDomain[p.category] || inferDomain(p.title, p.content);
    // Shorten title
    const shortTitle = p.title.length > 80 
      ? p.title.slice(0, p.title.indexOf("...") > 0 ? p.title.indexOf("...") : 80).trim()
      : p.title;
    return {
      id: `perplexity-${p.id}`,
      title: shortTitle,
      content: p.content,
      category: p.category,
      platform: "perplexity" as Platform,
      domain,
    };
  });
}

let _allPrompts: Prompt[] | null = null;

export function getAllPrompts(): Prompt[] {
  if (_allPrompts) return _allPrompts;

  const perplexity = normalizePerplexity(perplexityRaw);
  const claude = parseClaudePrompts(claudeRaw);

  _allPrompts = [...perplexity, ...claude, ...geminiPrompts];
  return _allPrompts;
}

export function getPromptStats() {
  const all = getAllPrompts();
  const byPlatform: Record<string, number> = {};
  const byDomain: Record<string, number> = {};
  
  all.forEach((p) => {
    byPlatform[p.platform] = (byPlatform[p.platform] || 0) + 1;
    byDomain[p.domain] = (byDomain[p.domain] || 0) + 1;
  });

  return { total: all.length, byPlatform, byDomain };
}
