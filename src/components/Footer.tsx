import { Github, Linkedin, Twitter, Mail, Heart } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-border/50 bg-secondary/30">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col items-center gap-6 md:flex-row md:justify-between">
          {/* Branding */}
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg gradient-gold font-display text-xs font-bold text-primary-foreground">
              KR
            </div>
            <div>
              <p className="font-display text-sm font-semibold tracking-wider">KALILUR RAHMAN</p>
              <p className="text-xs text-muted-foreground">Financial Engineering & Advisory</p>
            </div>
          </div>

          {/* Social Links */}
          <div className="flex items-center gap-3">
            <SocialLink href="https://github.com/kalilurrahman" icon={<Github className="h-4 w-4" />} label="GitHub Profile" />
            <SocialLink href="https://linkedin.com/in/kalilurrahman" icon={<Linkedin className="h-4 w-4" />} label="LinkedIn Profile" />
            <SocialLink href="https://twitter.com/krahman" icon={<Twitter className="h-4 w-4" />} label="Twitter Profile" />
            <SocialLink href="mailto:kalilur_r@outlook.com" icon={<Mail className="h-4 w-4" />} label="Send Email" />
          </div>

          {/* Copyright */}
          <div className="text-center text-xs text-muted-foreground md:text-right">
            <p>
              Made with <Heart className="inline h-3 w-3 text-gold fill-gold" /> by Kalilur Rahman
            </p>
            <p className="mt-1">© {new Date().getFullYear()} All Rights Reserved</p>
          </div>
        </div>
      </div>
    </footer>
  );
}

function SocialLink({ href, icon, label }: { href: string; icon: React.ReactNode; label: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      className="flex h-8 w-8 items-center justify-center rounded-lg border border-border/50 text-muted-foreground transition-all hover:border-gold hover:text-gold hover:glow-gold"
    >
      {icon}
    </a>
  );
}
