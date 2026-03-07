import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useNavigate } from "@tanstack/react-router";
import {
  Activity,
  BarChart3,
  DollarSign,
  Loader2,
  Save,
  TrendingDown,
  TrendingUp,
  Trophy,
  Zap,
} from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { toast } from "sonner";
import type { Trade } from "../backend.d";
import { Footer } from "../components/trading/Footer";
import { Header } from "../components/trading/Header";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import {
  useBrokerConfig,
  useMyTrades,
  useSaveBrokerConfig,
  useSetTradingMode,
  useStrategies,
  useToggleAlgorithm,
  useUserProfile,
} from "../hooks/useQueries";

// ── Auth Guard ────────────────────────────────────────────────────────────────

function useAuthGuard() {
  const { identity, isInitializing } = useInternetIdentity();
  const navigate = useNavigate();

  const isLoggedIn = !!identity && !identity.getPrincipal().isAnonymous();

  if (!isInitializing && !isLoggedIn) {
    void navigate({ to: "/login" });
  }

  return { isLoggedIn, isInitializing };
}

// ── Stats Cards ────────────────────────────────────────────────────────────────

function calculateStats(trades: Trade[]) {
  const completed = trades.filter((t) => t.status === "CLOSED" || t.pnl !== 0);
  const totalPnl = trades.reduce((sum, t) => sum + t.pnl, 0);
  const wins = completed.filter((t) => t.pnl > 0);
  const winRate =
    completed.length > 0 ? (wins.length / completed.length) * 100 : 0;
  const activeTrades = trades.filter((t) => t.status === "OPEN").length;
  const portfolioValue = 100000 + totalPnl;
  return { totalPnl, winRate, activeTrades, portfolioValue };
}

interface StatCardProps {
  title: string;
  value: string;
  subtitle?: string;
  icon: React.ElementType;
  positive?: boolean;
  negative?: boolean;
  loading?: boolean;
}

function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  positive,
  negative,
  loading,
}: StatCardProps) {
  return (
    <Card className="bg-card/80 border-border">
      <CardContent className="p-5">
        {loading ? (
          <div className="space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-8 w-32" />
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs text-muted-foreground uppercase tracking-wider font-mono">
                {title}
              </span>
              <Icon
                className={`w-4 h-4 ${positive ? "text-profit" : negative ? "text-loss" : "text-primary"}`}
              />
            </div>
            <div
              className={`font-mono-data text-2xl font-bold ${positive ? "text-profit" : negative ? "text-loss" : "text-foreground"}`}
            >
              {value}
            </div>
            {subtitle && (
              <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}

// ── Equity Chart ──────────────────────────────────────────────────────────────

function EquityChart({ trades }: { trades: Trade[] }) {
  // Build a cumulative equity curve
  const sorted = [...trades].sort(
    (a, b) => Number(a.timestamp) - Number(b.timestamp),
  );
  let equity = 100000;
  const data = [{ time: "Start", equity: 100000 }];
  sorted.forEach((t, i) => {
    equity += t.pnl;
    data.push({
      time: `T${i + 1}`,
      equity: Math.round(equity),
    });
  });

  // If no trades, show flat line
  if (data.length === 1) {
    data.push({ time: "Now", equity: 100000 });
  }

  const isPositive = data[data.length - 1].equity >= data[0].equity;

  return (
    <ResponsiveContainer width="100%" height={200}>
      <AreaChart
        data={data}
        margin={{ top: 5, right: 10, left: 10, bottom: 5 }}
      >
        <defs>
          <linearGradient id="equityGradient" x1="0" y1="0" x2="0" y2="1">
            <stop
              offset="5%"
              stopColor={
                isPositive ? "oklch(0.7 0.18 150)" : "oklch(0.58 0.22 25)"
              }
              stopOpacity={0.3}
            />
            <stop
              offset="95%"
              stopColor={
                isPositive ? "oklch(0.7 0.18 150)" : "oklch(0.58 0.22 25)"
              }
              stopOpacity={0.02}
            />
          </linearGradient>
        </defs>
        <CartesianGrid
          strokeDasharray="3 3"
          stroke="oklch(0.28 0.018 240)"
          opacity={0.5}
        />
        <XAxis
          dataKey="time"
          tick={{ fontSize: 10, fill: "oklch(0.55 0.02 220)" }}
        />
        <YAxis
          tick={{ fontSize: 10, fill: "oklch(0.55 0.02 220)" }}
          tickFormatter={(v: number) => `₹${(v / 1000).toFixed(0)}k`}
          width={55}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: "oklch(0.16 0.01 240)",
            border: "1px solid oklch(0.28 0.018 240)",
            borderRadius: "6px",
            fontSize: "12px",
            color: "oklch(0.92 0.01 210)",
          }}
          formatter={(v: number) => [
            `₹${v.toLocaleString("en-IN")}`,
            "Portfolio",
          ]}
        />
        <Area
          type="monotone"
          dataKey="equity"
          stroke={isPositive ? "oklch(0.7 0.18 150)" : "oklch(0.58 0.22 25)"}
          strokeWidth={2}
          fill="url(#equityGradient)"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}

// ── Broker Config Panel ───────────────────────────────────────────────────────

function BrokerConfigPanel() {
  const { data: config, isLoading } = useBrokerConfig();
  const { mutateAsync: saveConfig, isPending: isSaving } =
    useSaveBrokerConfig();
  const { mutateAsync: toggleAlgo, isPending: isToggling } =
    useToggleAlgorithm();
  const { mutateAsync: setMode, isPending: isSettingMode } =
    useSetTradingMode();

  const [apiKey, setApiKey] = useState("");
  const [apiSecret, setApiSecret] = useState("");

  const handleSave = async () => {
    if (!apiKey && !apiSecret) {
      toast.error("Please enter API credentials.");
      return;
    }
    try {
      await saveConfig({
        apiKey: apiKey || (config?.apiKey ?? ""),
        secret: apiSecret || (config?.secret ?? ""),
        accessToken: config?.accessToken ?? "",
        redirectUrl: config?.redirectUrl ?? "",
        webhook: config?.webhook ?? "",
        paperMode: config?.paperMode ?? true,
        liveMode: config?.liveMode ?? false,
        tradingMode: config?.tradingMode ?? "paper",
      });
      setApiKey("");
      setApiSecret("");
      toast.success("Broker configuration saved.");
    } catch {
      toast.error("Failed to save configuration.");
    }
  };

  const handleToggleAlgo = async () => {
    try {
      await toggleAlgo();
      toast.success(
        config?.algorithmEnabled ? "Algorithm disabled." : "Algorithm enabled.",
      );
    } catch {
      toast.error("Failed to toggle algorithm.");
    }
  };

  const handleModeChange = async (live: boolean) => {
    try {
      await setMode(live ? "live" : "paper");
      toast.success(`Switched to ${live ? "Live" : "Paper"} trading mode.`);
    } catch {
      toast.error("Failed to change trading mode.");
    }
  };

  return (
    <Card className="bg-card/80 border-border" data-ocid="broker.card">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-display flex items-center gap-2">
          <Zap className="w-4 h-4 text-warning" />
          Broker Configuration
        </CardTitle>
        <CardDescription className="text-xs">
          Connect your Upstox account and configure trading mode
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {isLoading ? (
          <div className="space-y-3">
            <Skeleton className="h-9 w-full" />
            <Skeleton className="h-9 w-full" />
          </div>
        ) : (
          <>
            {/* Current status */}
            {config?.apiKey && (
              <div className="flex items-center gap-2 p-2 rounded bg-profit/10 border border-profit/20">
                <div className="w-2 h-2 rounded-full bg-profit animate-pulse-dot" />
                <span className="text-xs text-profit font-mono">
                  Connected: {config.apiKey.slice(0, 8)}…
                </span>
              </div>
            )}

            <div className="space-y-1.5">
              <Label className="text-xs">Upstox API Key</Label>
              <Input
                type="password"
                placeholder={config?.apiKey ? "••••••••" : "Enter API key"}
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                className="bg-input text-sm h-9"
                data-ocid="broker.input"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs">API Secret</Label>
              <Input
                type="password"
                placeholder={config?.secret ? "••••••••" : "Enter API secret"}
                value={apiSecret}
                onChange={(e) => setApiSecret(e.target.value)}
                className="bg-input text-sm h-9"
                data-ocid="broker.input"
              />
            </div>

            <Button
              size="sm"
              onClick={handleSave}
              disabled={isSaving}
              className="w-full gap-2"
              data-ocid="broker.save_button"
            >
              {isSaving ? (
                <Loader2 className="w-3 h-3 animate-spin" />
              ) : (
                <Save className="w-3 h-3" />
              )}
              Save Credentials
            </Button>

            <div className="space-y-3 pt-2 border-t border-border">
              {/* Trading Mode */}
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Trading Mode</p>
                  <p className="text-xs text-muted-foreground">
                    {config?.tradingMode === "live" ? (
                      <span className="text-loss">Live (real money)</span>
                    ) : (
                      <span className="text-profit">Paper (simulated)</span>
                    )}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">Paper</span>
                  <Switch
                    checked={config?.tradingMode === "live"}
                    onCheckedChange={handleModeChange}
                    disabled={isSettingMode}
                    data-ocid="broker.switch"
                  />
                  <span className="text-xs text-muted-foreground">Live</span>
                </div>
              </div>

              {/* Algorithm Toggle */}
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Algorithm</p>
                  <p className="text-xs text-muted-foreground">
                    {config?.algorithmEnabled ? (
                      <span className="text-profit">Running</span>
                    ) : (
                      <span className="text-muted-foreground">Stopped</span>
                    )}
                  </p>
                </div>
                <Switch
                  checked={config?.algorithmEnabled ?? false}
                  onCheckedChange={handleToggleAlgo}
                  disabled={isToggling}
                  data-ocid="broker.switch"
                />
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}

// ── Strategies Panel ──────────────────────────────────────────────────────────

function StrategiesPanel() {
  const { data: strategies, isLoading } = useStrategies();

  return (
    <Card className="bg-card/80 border-border">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-display flex items-center gap-2">
          <Activity className="w-4 h-4 text-primary" />
          Active Strategies
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
          </div>
        ) : !strategies || strategies.length === 0 ? (
          <div
            className="text-center py-8 text-muted-foreground text-sm"
            data-ocid="strategies.empty_state"
          >
            No strategies configured. Visit the Admin panel to add strategies.
          </div>
        ) : (
          <div className="space-y-2">
            {strategies.map((s, idx) => (
              <div
                key={s.id.toString()}
                className="p-3 rounded-lg bg-background/60 border border-border hover:border-primary/20 transition-colors"
                data-ocid={`strategies.item.${idx + 1}`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-sm">{s.name}</span>
                  <Badge
                    variant={s.enabled ? "default" : "secondary"}
                    className={
                      s.enabled
                        ? "bg-profit/20 text-profit border-profit/30 text-xs"
                        : "text-xs"
                    }
                  >
                    {s.enabled ? "Active" : "Disabled"}
                  </Badge>
                </div>
                <div className="grid grid-cols-3 gap-2 text-xs font-mono-data text-muted-foreground">
                  <span>
                    SMA {Number(s.shortWindow)}/{Number(s.longWindow)}
                  </span>
                  <span className="text-loss">SL {s.stopLossPercent}%</span>
                  <span className="text-profit">TP {s.targetPercent}%</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ── Trades Table ──────────────────────────────────────────────────────────────

function TradesTable({
  trades,
  isLoading,
}: { trades: Trade[]; isLoading: boolean }) {
  return (
    <Card className="bg-card/80 border-border">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-display flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-primary" />
            Trade History
          </CardTitle>
          <Badge variant="outline" className="font-mono text-xs">
            {trades.length} trades
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-64">
          <Table>
            <TableHeader>
              <TableRow className="border-border hover:bg-transparent">
                <TableHead className="text-xs text-muted-foreground font-mono">
                  Symbol
                </TableHead>
                <TableHead className="text-xs text-muted-foreground font-mono">
                  Strategy
                </TableHead>
                <TableHead className="text-xs text-muted-foreground font-mono">
                  Side
                </TableHead>
                <TableHead className="text-xs text-muted-foreground font-mono text-right">
                  Qty
                </TableHead>
                <TableHead className="text-xs text-muted-foreground font-mono text-right">
                  Price
                </TableHead>
                <TableHead className="text-xs text-muted-foreground font-mono text-right">
                  P&L
                </TableHead>
                <TableHead className="text-xs text-muted-foreground font-mono">
                  Status
                </TableHead>
                <TableHead className="text-xs text-muted-foreground font-mono">
                  Mode
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                ["sk1", "sk2", "sk3", "sk4"].map((sk) => (
                  <TableRow key={sk} className="border-border">
                    {["a", "b", "c", "d", "e", "f", "g", "h"].map((col) => (
                      <TableCell key={`${sk}-${col}`}>
                        <Skeleton className="h-4 w-full" />
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : trades.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-10">
                    <div
                      data-ocid="trades.empty_state"
                      className="text-muted-foreground text-sm"
                    >
                      No trades yet. Configure a strategy to start trading.
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                trades.map((t, i) => (
                  <TableRow
                    key={t.id.toString()}
                    className="border-border hover:bg-accent/30 transition-colors"
                    data-ocid={`trades.row.${i + 1}`}
                  >
                    <TableCell className="font-mono text-xs font-semibold">
                      {t.symbol}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {t.strategyName}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={
                          t.side === "BUY"
                            ? "text-profit border-profit/30 bg-profit/10 text-xs"
                            : "text-loss border-loss/30 bg-loss/10 text-xs"
                        }
                      >
                        {t.side === "BUY" ? (
                          <TrendingUp className="w-3 h-3 mr-1" />
                        ) : (
                          <TrendingDown className="w-3 h-3 mr-1" />
                        )}
                        {t.side}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-mono-data text-xs text-right">
                      {Number(t.quantity)}
                    </TableCell>
                    <TableCell className="font-mono-data text-xs text-right">
                      ₹
                      {t.price.toLocaleString("en-IN", {
                        maximumFractionDigits: 2,
                      })}
                    </TableCell>
                    <TableCell
                      className={`font-mono-data text-xs text-right font-semibold ${t.pnl > 0 ? "text-profit" : t.pnl < 0 ? "text-loss" : "text-muted-foreground"}`}
                    >
                      {t.pnl !== 0
                        ? `${t.pnl > 0 ? "+" : ""}₹${t.pnl.toLocaleString("en-IN", { maximumFractionDigits: 2 })}`
                        : "—"}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={`text-xs ${t.status === "OPEN" ? "text-primary border-primary/30" : "text-muted-foreground"}`}
                      >
                        {t.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="secondary"
                        className={`text-xs ${t.mode === "live" ? "bg-loss/10 text-loss border-loss/20" : "bg-primary/10 text-primary"}`}
                      >
                        {t.mode}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}

// ── Main Dashboard ────────────────────────────────────────────────────────────

export function DashboardPage() {
  const { isLoggedIn, isInitializing } = useAuthGuard();
  const { data: trades = [], isLoading: tradesLoading } = useMyTrades();
  const { data: profile } = useUserProfile();

  if (isInitializing) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2
          className="w-8 h-8 animate-spin text-primary"
          data-ocid="dashboard.loading_state"
        />
      </div>
    );
  }

  if (!isLoggedIn) return null;

  const stats = calculateStats(trades);

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 md:px-6 py-6">
        {/* Welcome */}
        <motion.div
          className="mb-6"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
        >
          <h1 className="font-display text-2xl font-bold">
            {profile?.name ? `Welcome, ${profile.name}` : "Trading Dashboard"}
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            NIFTY 50 Algorithmic Trading Platform
          </p>
        </motion.div>

        {/* Stats Row */}
        <motion.div
          className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.05 }}
        >
          <StatCard
            title="Portfolio Value"
            value={`₹${stats.portfolioValue.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`}
            icon={DollarSign}
            loading={tradesLoading}
          />
          <StatCard
            title="Total P&L"
            value={`${stats.totalPnl >= 0 ? "+" : ""}₹${stats.totalPnl.toLocaleString("en-IN", { maximumFractionDigits: 2 })}`}
            icon={stats.totalPnl >= 0 ? TrendingUp : TrendingDown}
            positive={stats.totalPnl > 0}
            negative={stats.totalPnl < 0}
            loading={tradesLoading}
          />
          <StatCard
            title="Active Trades"
            value={stats.activeTrades.toString()}
            icon={Activity}
            loading={tradesLoading}
          />
          <StatCard
            title="Win Rate"
            value={`${stats.winRate.toFixed(1)}%`}
            subtitle={`${trades.filter((t) => t.pnl > 0).length}/${trades.filter((t) => t.pnl !== 0).length} trades`}
            icon={Trophy}
            positive={stats.winRate > 50}
            negative={stats.winRate > 0 && stats.winRate <= 50}
            loading={tradesLoading}
          />
        </motion.div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Left column: Broker + Strategies */}
          <motion.div
            className="space-y-4"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
          >
            <BrokerConfigPanel />
            <StrategiesPanel />
          </motion.div>

          {/* Right columns: Equity Chart + Trades */}
          <motion.div
            className="lg:col-span-2 space-y-4"
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.15 }}
          >
            {/* Equity Chart */}
            <Card className="bg-card/80 border-border">
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-display flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-profit" />
                  Portfolio Performance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <EquityChart trades={trades} />
              </CardContent>
            </Card>

            {/* Trades */}
            <TradesTable trades={trades} isLoading={tradesLoading} />
          </motion.div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
