import { Search, Heart, Home, BookOpen, Bot, Globe, Atom, Cpu, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AppearanceMenu } from "@/components/AppearanceMenu";
import { Link, useLocation } from "react-router-dom";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface HeaderProps {
  search: string;
  onSearchChange: (val: string) => void;
  showFavorites: boolean;
  onToggleFavorites: () => void;
  favCount: number;
}

export function Header({ search, onSearchChange, showFavorites, onToggleFavorites, favCount }: HeaderProps) {
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const inAppLinks = [
    { href: "/library", icon: <BookOpen className="h-3.5 w-3.5" />, label: "FINPROMPT" },
    { href: "/engine", icon: <Cpu className="h-3.5 w-3.5" />, label: "META-ENGINE" },
  ];

  const externalLinks = [
    { href: "https://kalilurrahman.lovable.app", icon: <Home className="h-3.5 w-3.5" />, label: "Home" },
    { href: "https://kalilurrahman.lovable.app", icon: <Bot className="h-3.5 w-3.5" />, label: "AI Agents" },
    { href: "https://kalilurrahman.lovable.app", icon: <Globe className="h-3.5 w-3.5" />, label: "Digital Hub" },
    { href: "https://kr-quantum-hub.lovable.app", icon: <Atom className="h-3.5 w-3.5" />, label: "Q-Ref" },
  ];

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
        <div className="container mx-auto flex items-center justify-between gap-4 px-4 py-3">
          {/* Logo */}
          <a
            href="https://kalilurrahman.lovable.app"
            aria-label="Kalilur Rahman Homepage"
            className="flex items-center gap-2 shrink-0"
            target="_blank"
            rel="noopener noreferrer"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-lg gradient-gold font-display text-sm font-bold text-primary-foreground shadow-sm shadow-gold/20">
              KR
            </div>
            <span className="hidden font-display text-sm font-semibold tracking-wider text-foreground sm:block">
              KALILUR RAHMAN
            </span>
          </a>

          {/* Desktop Nav */}
          <nav className="hidden items-center gap-1 lg:flex" aria-label="Main navigation">
            {/* In-app links via React Router */}
            {inAppLinks.map((link) => {
              const isActive = location.pathname === link.href;
              return (
                <Link
                  key={link.href}
                  to={link.href}
                  aria-label={`Go to ${link.label}`}
                  aria-current={isActive ? "page" : undefined}
                  className={cn(
                    "flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-semibold transition-all",
                    isActive
                      ? "bg-gold/10 text-gold border border-gold/30"
                      : "text-muted-foreground hover:text-gold hover:bg-secondary/50"
                  )}
                >
                  {link.icon}
                  {link.label}
                </Link>
              );
            })}

            <span className="mx-1 h-4 w-px bg-border/60" />

            {/* External links */}
            {externalLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:text-gold hover:bg-secondary/50"
              >
                {link.icon}
                {link.label}
              </a>
            ))}
          </nav>

          {/* Search + Favorites + Appearance */}
          <div className="flex items-center gap-2 flex-1 max-w-md">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search prompts... (press /)"
                aria-label="Search prompts"
                className="pl-9 h-9 bg-secondary/50 border-border/50 text-sm"
                value={search}
                onChange={(e) => onSearchChange(e.target.value)}
              />
            </div>
            <Button
              variant={showFavorites ? "default" : "outline"}
              size="icon"
              className={cn("h-9 w-9 shrink-0 relative", showFavorites && "bg-gold hover:bg-gold/90 border-gold")}
              onClick={onToggleFavorites}
              aria-label="Toggle favorites view"
              aria-pressed={showFavorites}
            >
              <Heart className={`h-4 w-4 ${showFavorites ? "fill-current" : ""}`} />
              {favCount > 0 && (
                <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-gold text-[10px] font-bold text-primary-foreground shadow-sm">
                  {favCount > 99 ? "99+" : favCount}
                </span>
              )}
            </Button>
            <AppearanceMenu />
            {/* Mobile menu toggle */}
            <button
              className="lg:hidden flex items-center justify-center h-9 w-9 rounded-md border border-border/50 text-muted-foreground hover:text-foreground transition-colors"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label={mobileOpen ? "Close navigation" : "Open navigation"}
              aria-expanded={mobileOpen}
            >
              {mobileOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </button>
          </div>
        </div>

        {/* Mobile Nav Drawer */}
        {mobileOpen && (
          <div className="lg:hidden border-t border-border/50 bg-background/95 backdrop-blur-xl px-4 py-4 animate-fade-in-up">
            <div className="flex flex-col gap-1">
              <p className="text-[9px] font-semibold tracking-widest uppercase text-muted-foreground/60 px-2 pb-1">This App</p>
              {inAppLinks.map((link) => {
                const isActive = location.pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    to={link.href}
                    onClick={() => setMobileOpen(false)}
                    className={cn(
                      "flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium transition-all",
                      isActive
                        ? "bg-gold/10 text-gold"
                        : "text-muted-foreground hover:bg-secondary/60 hover:text-foreground"
                    )}
                  >
                    {link.icon}
                    {link.label}
                  </Link>
                );
              })}
              <div className="my-2 h-px bg-border/50" />
              <p className="text-[9px] font-semibold tracking-widest uppercase text-muted-foreground/60 px-2 pb-1">External</p>
              {externalLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm text-muted-foreground hover:bg-secondary/60 hover:text-foreground transition-all"
                >
                  {link.icon}
                  {link.label}
                </a>
              ))}
            </div>
          </div>
        )}
      </header>
    </>
  );
}
