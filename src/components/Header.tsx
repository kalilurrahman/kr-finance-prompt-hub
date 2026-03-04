import { Search, Heart, Home, BookOpen, Bot, Globe, Atom } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface HeaderProps {
  search: string;
  onSearchChange: (val: string) => void;
  showFavorites: boolean;
  onToggleFavorites: () => void;
  favCount: number;
}

export function Header({ search, onSearchChange, showFavorites, onToggleFavorites, favCount }: HeaderProps) {
  return (
    <header className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
      <div className="container mx-auto flex items-center justify-between gap-4 px-4 py-3">
        {/* Logo */}
        <a href="https://kalilurrahman.lovable.app" className="flex items-center gap-2 shrink-0" target="_blank" rel="noopener noreferrer">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg gradient-gold font-display text-sm font-bold text-primary-foreground">
            KR
          </div>
          <span className="hidden font-display text-sm font-semibold tracking-wider text-foreground sm:block">
            KALILUR RAHMAN
          </span>
        </a>

        {/* Nav Links - Hidden on mobile */}
        <nav className="hidden items-center gap-1 lg:flex">
          <NavItem href="https://kalilurrahman.lovable.app" icon={<Home className="h-3.5 w-3.5" />} label="Home" />
          <NavItem href="https://kalilurrahman.lovable.app" icon={<BookOpen className="h-3.5 w-3.5" />} label="Knowledge Hub" />
          <NavItem href="https://kalilurrahman.lovable.app" icon={<Bot className="h-3.5 w-3.5" />} label="AI Agents" />
          <NavItem href="https://kalilurrahman.lovable.app" icon={<Globe className="h-3.5 w-3.5" />} label="Digital Hub" />
          <NavItem href="https://kr-quantum-hub.lovable.app" icon={<Atom className="h-3.5 w-3.5" />} label="Q-Ref" />
          <a href="/library" className="flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:text-gold hover:bg-secondary/50">
            <BookOpen className="h-3.5 w-3.5" />
            FINPROMPT
          </a>
        </nav>

        {/* Search + Favorites */}
        <div className="flex items-center gap-2 flex-1 max-w-md">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search prompts... (press /)"
              className="pl-9 h-9 bg-secondary/50 border-border/50 text-sm"
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
            />
          </div>
          <Button
            variant={showFavorites ? "default" : "outline"}
            size="icon"
            className="h-9 w-9 shrink-0 relative"
            onClick={onToggleFavorites}
          >
            <Heart className={`h-4 w-4 ${showFavorites ? "fill-current" : ""}`} />
            {favCount > 0 && (
              <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-gold text-[10px] font-bold text-primary-foreground">
                {favCount > 99 ? "99+" : favCount}
              </span>
            )}
          </Button>
        </div>
      </div>
    </header>
  );
}

function NavItem({ href, icon, label }: { href: string; icon: React.ReactNode; label: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:text-gold hover:bg-secondary/50"
    >
      {icon}
      {label}
    </a>
  );
}
