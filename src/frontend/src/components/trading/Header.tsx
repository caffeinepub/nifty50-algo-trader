import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Link, useNavigate } from "@tanstack/react-router";
import {
  Activity,
  ChevronDown,
  FlaskConical,
  LayoutDashboard,
  LogOut,
  ShieldCheck,
  TrendingUp,
} from "lucide-react";
import { useInternetIdentity } from "../../hooks/useInternetIdentity";
import { useIsAdmin } from "../../hooks/useQueries";

const NIFTY_TICKERS = [
  { sym: "RELIANCE", price: "2847.35", chg: "+1.24%" },
  { sym: "TCS", price: "3912.10", chg: "+0.87%" },
  { sym: "HDFC", price: "1621.45", chg: "-0.32%" },
  { sym: "INFY", price: "1487.20", chg: "+2.14%" },
  { sym: "ICICIBANK", price: "1089.75", chg: "+0.56%" },
  { sym: "SBIN", price: "742.30", chg: "-0.19%" },
  { sym: "BAJFINANCE", price: "6834.50", chg: "+1.78%" },
  { sym: "WIPRO", price: "462.85", chg: "+0.43%" },
  { sym: "HCLTECH", price: "1352.60", chg: "+0.91%" },
  { sym: "NIFTY50", price: "22,543.85", chg: "+0.68%" },
];

function TickerBar() {
  return (
    <div className="border-b border-border bg-card/50 overflow-hidden h-8 flex items-center">
      <div className="flex items-center shrink-0 px-3 border-r border-border h-full">
        <Activity className="w-3 h-3 text-primary mr-1.5 animate-pulse-dot" />
        <span className="text-xs font-mono text-muted-foreground font-semibold tracking-widest">
          LIVE
        </span>
      </div>
      <div className="overflow-hidden flex-1">
        <div className="flex animate-ticker whitespace-nowrap">
          {[...NIFTY_TICKERS, ...NIFTY_TICKERS].map((t, i) => (
            <span
              key={`ticker-${t.sym}-${i}`}
              className="inline-flex items-center gap-1.5 px-4 text-xs font-mono"
            >
              <span className="text-muted-foreground">{t.sym}</span>
              <span className="text-foreground font-semibold">{t.price}</span>
              <span
                className={t.chg.startsWith("+") ? "text-profit" : "text-loss"}
              >
                {t.chg}
              </span>
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

export function Header() {
  const { identity, clear, isInitializing } = useInternetIdentity();
  const { data: isAdmin } = useIsAdmin();
  const navigate = useNavigate();
  const isLoggedIn = !!identity && !identity.getPrincipal().isAnonymous();

  const handleLogout = () => {
    clear();
    void navigate({ to: "/" });
  };

  return (
    <header className="sticky top-0 z-50 bg-background/95 backdrop-blur border-b border-border">
      <TickerBar />
      <nav className="flex items-center justify-between px-4 md:px-6 h-14">
        {/* Logo */}
        <Link
          to="/"
          className="flex items-center gap-2.5 group"
          data-ocid="nav.link"
        >
          <div className="w-8 h-8 rounded-md bg-primary/10 border border-primary/30 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
            <TrendingUp className="w-4 h-4 text-primary" />
          </div>
          <span className="font-display font-bold text-lg tracking-tight hidden sm:block">
            NIFTY50<span className="text-primary">Algo</span>
          </span>
        </Link>

        {/* Nav Links */}
        {isLoggedIn && (
          <div className="hidden md:flex items-center gap-1">
            <Link
              to="/dashboard"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm text-muted-foreground hover:text-foreground hover:bg-accent transition-colors [&.active]:text-primary [&.active]:bg-primary/10"
              data-ocid="nav.link"
            >
              <LayoutDashboard className="w-4 h-4" />
              Dashboard
            </Link>
            <Link
              to="/dashboard/backtest"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm text-muted-foreground hover:text-foreground hover:bg-accent transition-colors [&.active]:text-primary [&.active]:bg-primary/10"
              data-ocid="nav.link"
            >
              <FlaskConical className="w-4 h-4" />
              Backtest
            </Link>
            {isAdmin && (
              <Link
                to="/admin"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm text-muted-foreground hover:text-foreground hover:bg-accent transition-colors [&.active]:text-primary [&.active]:bg-primary/10"
                data-ocid="nav.link"
              >
                <ShieldCheck className="w-4 h-4" />
                Admin
              </Link>
            )}
          </div>
        )}

        {/* Auth Controls */}
        <div className="flex items-center gap-2">
          {isInitializing ? (
            <div className="h-8 w-20 bg-muted animate-pulse rounded-md" />
          ) : isLoggedIn ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-1.5"
                  data-ocid="nav.dropdown_menu"
                >
                  <span className="hidden sm:block text-xs font-mono text-muted-foreground">
                    {identity.getPrincipal().toString().slice(0, 8)}…
                  </span>
                  <ChevronDown className="w-3 h-3 text-muted-foreground" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-44">
                <DropdownMenuItem asChild>
                  <Link to="/dashboard" data-ocid="nav.link">
                    <LayoutDashboard className="w-4 h-4 mr-2" />
                    Dashboard
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/dashboard/backtest" data-ocid="nav.link">
                    <FlaskConical className="w-4 h-4 mr-2" />
                    Backtest
                  </Link>
                </DropdownMenuItem>
                {isAdmin && (
                  <DropdownMenuItem asChild>
                    <Link to="/admin" data-ocid="nav.link">
                      <ShieldCheck className="w-4 h-4 mr-2" />
                      Admin Panel
                    </Link>
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-destructive focus:text-destructive"
                  onClick={handleLogout}
                  data-ocid="nav.button"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <>
              <Button asChild variant="ghost" size="sm" data-ocid="nav.link">
                <Link to="/login">Sign In</Link>
              </Button>
              <Button
                asChild
                size="sm"
                className="hidden sm:flex"
                data-ocid="nav.primary_button"
              >
                <Link to="/register">Get Started</Link>
              </Button>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}
