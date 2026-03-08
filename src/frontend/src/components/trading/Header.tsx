import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Link, useNavigate } from "@tanstack/react-router";
import {
  Activity,
  AlertTriangle,
  Bell,
  CheckCheck,
  ChevronDown,
  FlaskConical,
  LayoutDashboard,
  LogOut,
  ShieldCheck,
  Target,
  TrendingUp,
  Zap,
} from "lucide-react";
import type { Notification } from "../../backend.d";
import { useInternetIdentity } from "../../hooks/useInternetIdentity";
import {
  useIsAdmin,
  useMarkNotificationsRead,
  useMyNotifications,
  useNotificationUnreadCount,
} from "../../hooks/useQueries";

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
    <div className="border-b border-primary/15 bg-secondary/60 overflow-hidden h-8 flex items-center">
      <div className="flex items-center shrink-0 px-3 border-r border-primary/20 h-full">
        <Activity
          className="w-3 h-3 text-primary mr-1.5 animate-pulse-dot"
          style={{ filter: "drop-shadow(0 0 4px oklch(0.86 0.18 205 / 0.8))" }}
        />
        <span className="text-xs font-mono font-bold tracking-widest text-neon-primary">
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

// ── Notification Icon ─────────────────────────────────────────────────────────

function getNotifIcon(type: string) {
  switch (type) {
    case "trade_executed":
    case "TradeExecuted":
      return <TrendingUp className="w-3.5 h-3.5 text-profit" />;
    case "stop_loss_hit":
    case "StopLossHit":
      return <AlertTriangle className="w-3.5 h-3.5 text-loss" />;
    case "target_hit":
    case "TargetHit":
      return <Target className="w-3.5 h-3.5 text-primary" />;
    case "strategy_started":
    case "StrategyStarted":
      return <Zap className="w-3.5 h-3.5 text-profit" />;
    case "strategy_stopped":
    case "StrategyStopped":
      return <Activity className="w-3.5 h-3.5 text-warning" />;
    default:
      return <Bell className="w-3.5 h-3.5 text-primary" />;
  }
}

function formatRelativeTime(ts: bigint): string {
  const ms = Number(ts) > 1e12 ? Number(ts) / 1e6 : Number(ts);
  const diff = Date.now() - ms;
  if (diff < 60000) return "just now";
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
  return `${Math.floor(diff / 86400000)}d ago`;
}

const MOCK_NOTIFICATIONS: Notification[] = [
  {
    id: BigInt(1),
    userId: "demo",
    notificationType: "trade_executed",
    read: false,
    message: "NIFTY50 BUY executed at ₹22,415 — MA Crossover strategy",
    emailEnabled: true,
    timestamp: BigInt(Date.now() - 120000),
  },
  {
    id: BigInt(2),
    userId: "demo",
    notificationType: "target_hit",
    read: false,
    message: "Target hit on BANKNIFTY position — P&L +₹3,750",
    emailEnabled: false,
    timestamp: BigInt(Date.now() - 3600000),
  },
  {
    id: BigInt(3),
    userId: "demo",
    notificationType: "strategy_started",
    read: true,
    message: "9:20 Candle Strategy activated for today's session",
    emailEnabled: true,
    timestamp: BigInt(Date.now() - 14400000),
  },
  {
    id: BigInt(4),
    userId: "demo",
    notificationType: "stop_loss_hit",
    read: true,
    message: "Stop loss hit on INFY position — SL at ₹1,730",
    emailEnabled: false,
    timestamp: BigInt(Date.now() - 86400000),
  },
];

function NotificationBell({ isLoggedIn }: { isLoggedIn: boolean }) {
  const { data: notifications = [] } = useMyNotifications();
  const { data: unreadCount = BigInt(0) } = useNotificationUnreadCount();
  const { mutate: markRead } = useMarkNotificationsRead();

  if (!isLoggedIn) return null;

  // Use real notifications if available, else mock
  const displayNotifs: Notification[] =
    notifications.length > 0 ? notifications : MOCK_NOTIFICATIONS;
  const unread =
    Number(unreadCount) > 0
      ? Number(unreadCount)
      : MOCK_NOTIFICATIONS.filter((n) => !n.read).length;

  const handleMarkAllRead = () => {
    markRead(undefined, {
      onSuccess: () => {},
    });
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="relative p-2 h-8 w-8"
          data-ocid="nav.notifications.button"
        >
          <Bell className="w-4 h-4 text-muted-foreground hover:text-foreground" />
          {unread > 0 && (
            <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-loss text-white text-[9px] font-bold flex items-center justify-center leading-none">
              {unread > 9 ? "9+" : unread}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="end"
        className="w-80 p-0 bg-popover border-border"
        data-ocid="nav.notifications.popover"
      >
        <div className="flex items-center justify-between px-3 py-2.5 border-b border-border">
          <div className="flex items-center gap-2">
            <Bell className="w-3.5 h-3.5 text-primary" />
            <span className="text-sm font-display font-semibold">
              Notifications
            </span>
            {unread > 0 && (
              <Badge className="bg-loss/20 text-loss border-loss/30 border text-[10px] px-1.5 py-0.5 h-4">
                {unread}
              </Badge>
            )}
          </div>
          {unread > 0 && (
            <button
              type="button"
              onClick={handleMarkAllRead}
              className="text-[10px] text-primary hover:text-primary/80 flex items-center gap-1 transition-colors"
              data-ocid="nav.notifications.secondary_button"
            >
              <CheckCheck className="w-3 h-3" />
              Mark all read
            </button>
          )}
        </div>

        <ScrollArea className="max-h-80">
          {displayNotifs.length === 0 ? (
            <div
              className="flex flex-col items-center justify-center py-10 gap-2 text-muted-foreground"
              data-ocid="nav.notifications.empty_state"
            >
              <Bell className="w-6 h-6 opacity-20" />
              <p className="text-xs">No notifications yet</p>
            </div>
          ) : (
            <div className="py-1">
              {displayNotifs.map((n, i) => (
                <div
                  key={n.id.toString()}
                  className={`flex gap-3 px-3 py-2.5 hover:bg-accent/20 transition-colors ${!n.read ? "bg-primary/5" : ""}`}
                  data-ocid={`nav.notifications.item.${i + 1}`}
                >
                  <div className="flex-shrink-0 mt-0.5">
                    {getNotifIcon(n.notificationType)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p
                      className={`text-xs leading-relaxed ${!n.read ? "text-foreground font-medium" : "text-muted-foreground"}`}
                    >
                      {n.message}
                    </p>
                    <p className="text-[10px] text-muted-foreground/60 mt-0.5">
                      {formatRelativeTime(n.timestamp)}
                    </p>
                  </div>
                  {!n.read && (
                    <div className="flex-shrink-0 mt-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-primary block" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}

// ── Main Header ───────────────────────────────────────────────────────────────

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
    <header
      className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-primary/20"
      style={{ boxShadow: "0 1px 0 oklch(0.86 0.18 205 / 0.12)" }}
    >
      <TickerBar />
      <nav className="flex items-center justify-between px-4 md:px-6 h-14">
        {/* Logo */}
        <Link
          to="/"
          className="flex items-center gap-2.5 group"
          data-ocid="nav.link"
        >
          <div
            className="w-8 h-8 rounded-md bg-primary/10 border border-primary/40 flex items-center justify-center group-hover:bg-primary/20 transition-colors"
            style={{ boxShadow: "0 0 12px oklch(0.86 0.18 205 / 0.2)" }}
          >
            <TrendingUp className="w-4 h-4 text-primary" />
          </div>
          <span className="font-display font-bold text-lg tracking-tight hidden sm:block">
            NIFTY50<span className="text-neon-primary">Algo</span>
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
          {/* Notification Bell */}
          <NotificationBell isLoggedIn={isLoggedIn} />

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
          ) : null}
        </div>
      </nav>
    </header>
  );
}
