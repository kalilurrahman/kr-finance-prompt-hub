import { useState } from "react";
import { Link } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Resources } from "@/components/Resources";
import { ArrowLeft, Download } from "lucide-react";

export default function ResourcesPage() {
  const [search, setSearch] = useState("");

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header
        search={search}
        onSearchChange={setSearch}
        showFavorites={false}
        onToggleFavorites={() => {}}
        favCount={0}
      />

      <main className="container mx-auto flex-1 px-4 py-8 max-w-5xl">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 mb-5 text-xs font-medium text-muted-foreground hover:text-gold transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to home
        </Link>

        <header className="mb-8">
          <div className="flex items-center gap-2 mb-3">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-gold/30 bg-gold/10 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-widest text-gold">
              <Download className="h-3 w-3" />
              Downloads
            </span>
            <span className="text-[11px] text-muted-foreground/85 font-mono">
              FINPROMPT · Offline Resources
            </span>
          </div>
          <h1 className="font-display text-2xl sm:text-4xl font-bold leading-tight text-foreground">
            Downloadable Prompt Libraries
          </h1>
          <p className="mt-2 text-sm sm:text-base text-muted-foreground max-w-2xl leading-relaxed">
            Full prompt collections curated for each AI platform. Download once and use offline
            with your preferred assistant — no account required.
          </p>
        </header>

        <Resources />
      </main>

      <Footer />
    </div>
  );
}
