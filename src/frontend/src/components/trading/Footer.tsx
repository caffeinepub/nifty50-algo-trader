import { TrendingUp } from "lucide-react";

export function Footer() {
  const year = new Date().getFullYear();
  const href = `https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`;

  return (
    <footer className="border-t border-border bg-card/30 mt-auto">
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-primary" />
          <span className="text-sm font-display font-semibold">
            NIFTY50<span className="text-primary">Algo</span>
          </span>
        </div>
        <p className="text-xs text-muted-foreground text-center">
          © {year}. Built with <span className="text-loss">♥</span> using{" "}
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline"
          >
            caffeine.ai
          </a>
        </p>
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <span>Paper Trading Available</span>
          <span className="w-1 h-1 rounded-full bg-muted-foreground" />
          <span>Powered by ICP</span>
        </div>
      </div>
    </footer>
  );
}
