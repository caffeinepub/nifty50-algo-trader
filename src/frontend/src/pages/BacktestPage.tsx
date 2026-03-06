import { Alert, AlertDescription } from "@/components/ui/alert";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
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
  AlertCircle,
  BarChart3,
  FlaskConical,
  Loader2,
  Play,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
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
import type { Strategy } from "../backend.d";
import { Footer } from "../components/trading/Footer";
import { Header } from "../components/trading/Header";
import { useActor } from "../hooks/useActor";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import {
  useMyBacktestResults,
  useSaveBacktestResult,
  useStrategies,
} from "../hooks/useQueries";
import { type BacktestMetrics, runBacktest } from "../lib/backtester";

function useAuthGuard() {
  const { identity, isInitializing } = useInternetIdentity();
  const navigate = useNavigate();
  const isLoggedIn = !!identity && !identity.getPrincipal().isAnonymous();
  if (!isInitializing && !isLoggedIn) {
    void navigate({ to: "/login" });
  }
  return { isLoggedIn, isInitializing };
}

// ── Result Summary Cards ──────────────────────────────────────────────────────

function MetricCard({
  label,
  value,
  positive,
  negative,
}: {
  label: string;
  value: string;
  positive?: boolean;
  negative?: boolean;
}) {
  return (
    <div className="p-4 rounded-lg bg-background/80 border border-border">
      <p className="text-xs text-muted-foreground font-mono uppercase tracking-wider mb-1">
        {label}
      </p>
      <p
        className={`font-mono-data text-xl font-bold ${positive ? "text-profit" : negative ? "text-loss" : "text-foreground"}`}
      >
        {value}
      </p>
    </div>
  );
}

// ── Equity Curve Chart ────────────────────────────────────────────────────────

function BacktestEquityChart({ metrics }: { metrics: BacktestMetrics }) {
  const data = metrics.equityCurve.map((p) => ({
    index: `T${p.index}`,
    equity: Math.round(p.equity),
  }));

  const isPositive = metrics.totalPnl >= 0;

  return (
    <ResponsiveContainer width="100%" height={220}>
      <AreaChart
        data={data}
        margin={{ top: 5, right: 10, left: 10, bottom: 5 }}
      >
        <defs>
          <linearGradient id="btEquityGrad" x1="0" y1="0" x2="0" y2="1">
            <stop
              offset="5%"
              stopColor={
                isPositive ? "oklch(0.7 0.18 150)" : "oklch(0.58 0.22 25)"
              }
              stopOpacity={0.35}
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
          opacity={0.4}
        />
        <XAxis
          dataKey="index"
          tick={{ fontSize: 10, fill: "oklch(0.55 0.02 220)" }}
          interval="preserveStartEnd"
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
          formatter={(v: number) => [`₹${v.toLocaleString("en-IN")}`, "Equity"]}
        />
        <Area
          type="monotone"
          dataKey="equity"
          stroke={isPositive ? "oklch(0.7 0.18 150)" : "oklch(0.58 0.22 25)"}
          strokeWidth={2}
          fill="url(#btEquityGrad)"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}

// ── Past Results Table ────────────────────────────────────────────────────────

function PastResultsSection() {
  const { data: results, isLoading } = useMyBacktestResults();
  const { data: strategies } = useStrategies();

  const getStrategyName = (id: bigint) => {
    return strategies?.find((s) => s.id === id)?.name ?? `Strategy ${id}`;
  };

  return (
    <Card className="bg-card/80 border-border">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-display flex items-center gap-2">
          <BarChart3 className="w-4 h-4 text-primary" />
          Past Backtest Results
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-56">
          <Table>
            <TableHeader>
              <TableRow className="border-border hover:bg-transparent">
                {[
                  "Strategy",
                  "Symbol",
                  "Timeframe",
                  "Total P&L",
                  "Win Rate",
                  "Max DD",
                  "Sharpe",
                  "Trades",
                ].map((h) => (
                  <TableHead
                    key={h}
                    className="text-xs text-muted-foreground font-mono"
                  >
                    {h}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                ["sk1", "sk2", "sk3"].map((sk) => (
                  <TableRow key={sk} className="border-border">
                    {["a", "b", "c", "d", "e", "f", "g", "h"].map((col) => (
                      <TableCell key={`${sk}-${col}`}>
                        <Skeleton className="h-4 w-full" />
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : !results || results.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8">
                    <div
                      data-ocid="backtest.empty_state"
                      className="text-muted-foreground text-sm"
                    >
                      No backtest results yet. Run your first backtest above.
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                results.map((r, i) => (
                  <TableRow
                    key={r.id.toString()}
                    className="border-border hover:bg-accent/20 transition-colors"
                    data-ocid={`backtest.row.${i + 1}`}
                  >
                    <TableCell className="text-xs">
                      {getStrategyName(r.strategyId)}
                    </TableCell>
                    <TableCell className="font-mono text-xs">
                      {r.symbol}
                    </TableCell>
                    <TableCell className="text-xs">
                      <Badge variant="outline" className="font-mono text-xs">
                        {r.timeframe}
                      </Badge>
                    </TableCell>
                    <TableCell
                      className={`font-mono-data text-xs font-semibold ${r.totalPnl >= 0 ? "text-profit" : "text-loss"}`}
                    >
                      {r.totalPnl >= 0 ? "+" : ""}₹
                      {r.totalPnl.toLocaleString("en-IN", {
                        maximumFractionDigits: 2,
                      })}
                    </TableCell>
                    <TableCell className="font-mono-data text-xs">
                      {r.winRate.toFixed(1)}%
                    </TableCell>
                    <TableCell className="font-mono-data text-xs text-loss">
                      -{r.maxDrawdown.toFixed(1)}%
                    </TableCell>
                    <TableCell className="font-mono-data text-xs">
                      {r.sharpeRatio.toFixed(2)}
                    </TableCell>
                    <TableCell className="font-mono-data text-xs">
                      {Number(r.totalTrades)}
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

// ── Main Backtest Page ────────────────────────────────────────────────────────

export function BacktestPage() {
  const { isLoggedIn, isInitializing } = useAuthGuard();
  const { data: strategies, isLoading: strategiesLoading } = useStrategies();
  const { mutateAsync: saveResult } = useSaveBacktestResult();
  const { actor } = useActor();

  const [selectedStrategyId, setSelectedStrategyId] = useState<string>("");
  const [symbol, setSymbol] = useState("NIFTY50");
  const [timeframe, setTimeframe] = useState("daily");
  const [limit, setLimit] = useState("500");
  const [isRunning, setIsRunning] = useState(false);
  const [metrics, setMetrics] = useState<BacktestMetrics | null>(null);
  const [runError, setRunError] = useState<string | null>(null);

  const selectedStrategy: Strategy | undefined = strategies?.find(
    (s) => s.id.toString() === selectedStrategyId,
  );

  if (isInitializing) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2
          className="w-8 h-8 animate-spin text-primary"
          data-ocid="backtest.loading_state"
        />
      </div>
    );
  }

  if (!isLoggedIn) return null;

  const handleRunBacktest = async () => {
    if (!selectedStrategy) {
      toast.error("Please select a strategy.");
      return;
    }
    if (!actor) {
      toast.error("Not connected. Please refresh.");
      return;
    }

    setIsRunning(true);
    setRunError(null);
    setMetrics(null);

    try {
      const candles = await actor.getCandles(
        symbol,
        timeframe,
        BigInt(Number(limit)),
      );

      if (candles.length === 0) {
        setRunError(
          `No candle data found for ${symbol} (${timeframe}). The backend may need to be seeded with historical data.`,
        );
        return;
      }

      if (candles.length < Number(selectedStrategy.longWindow) + 5) {
        setRunError(
          `Not enough candle data (${candles.length}) for the strategy window (${Number(selectedStrategy.longWindow)}). Try a shorter window or more data.`,
        );
        return;
      }

      const result = runBacktest(candles, selectedStrategy);
      setMetrics(result);

      // Save result
      await saveResult({
        strategyId: selectedStrategy.id,
        symbol,
        timeframe,
        totalPnl: result.totalPnl,
        winRate: result.winRate,
        maxDrawdown: result.maxDrawdown,
        sharpeRatio: result.sharpeRatio,
        totalTrades: BigInt(result.totalTrades),
      });

      toast.success(
        `Backtest complete. ${result.totalTrades} trades analyzed.`,
      );
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Backtest failed.";
      setRunError(msg);
      toast.error(`Backtest failed: ${msg}`);
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 md:px-6 py-6">
        <motion.div
          className="mb-6"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
        >
          <h1 className="font-display text-2xl font-bold flex items-center gap-2">
            <FlaskConical className="w-6 h-6 text-primary" />
            Strategy Backtester
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Test your strategies against historical NIFTY 50 data
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Config Panel */}
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.05 }}
          >
            <Card className="bg-card/80 border-border">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-display">
                  Backtest Configuration
                </CardTitle>
                <CardDescription className="text-xs">
                  Select strategy, symbol, and timeframe
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Strategy */}
                <div className="space-y-1.5">
                  <Label className="text-xs">Strategy</Label>
                  {strategiesLoading ? (
                    <Skeleton className="h-9 w-full" />
                  ) : (
                    <Select
                      value={selectedStrategyId}
                      onValueChange={setSelectedStrategyId}
                    >
                      <SelectTrigger
                        className="h-9 text-sm"
                        data-ocid="backtest.select"
                      >
                        <SelectValue placeholder="Select strategy..." />
                      </SelectTrigger>
                      <SelectContent>
                        {!strategies || strategies.length === 0 ? (
                          <SelectItem value="none" disabled>
                            No strategies — add via Admin
                          </SelectItem>
                        ) : (
                          strategies.map((s) => (
                            <SelectItem
                              key={s.id.toString()}
                              value={s.id.toString()}
                            >
                              {s.name}
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                  )}
                </div>

                {/* Strategy details preview */}
                {selectedStrategy && (
                  <div className="p-3 rounded-lg bg-primary/5 border border-primary/15 space-y-1.5">
                    <p className="text-xs font-mono text-primary font-semibold">
                      {selectedStrategy.name}
                    </p>
                    <div className="grid grid-cols-2 gap-1 text-xs font-mono-data text-muted-foreground">
                      <span>
                        Short SMA: {Number(selectedStrategy.shortWindow)}
                      </span>
                      <span>
                        Long SMA: {Number(selectedStrategy.longWindow)}
                      </span>
                      <span className="text-loss">
                        SL: {selectedStrategy.stopLossPercent}%
                      </span>
                      <span className="text-profit">
                        TP: {selectedStrategy.targetPercent}%
                      </span>
                    </div>
                  </div>
                )}

                {/* Symbol */}
                <div className="space-y-1.5">
                  <Label className="text-xs">Symbol</Label>
                  <Input
                    value={symbol}
                    onChange={(e) => setSymbol(e.target.value.toUpperCase())}
                    placeholder="NIFTY50"
                    className="h-9 text-sm bg-input font-mono"
                    data-ocid="backtest.input"
                  />
                </div>

                {/* Timeframe */}
                <div className="space-y-1.5">
                  <Label className="text-xs">Timeframe</Label>
                  <Select value={timeframe} onValueChange={setTimeframe}>
                    <SelectTrigger
                      className="h-9 text-sm"
                      data-ocid="backtest.select"
                    >
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="15m">15 Minutes</SelectItem>
                      <SelectItem value="5m">5 Minutes</SelectItem>
                      <SelectItem value="1m">1 Minute</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Candle limit */}
                <div className="space-y-1.5">
                  <Label className="text-xs">Data Limit (candles)</Label>
                  <Input
                    type="number"
                    value={limit}
                    onChange={(e) => setLimit(e.target.value)}
                    placeholder="500"
                    min="50"
                    max="2000"
                    className="h-9 text-sm bg-input font-mono-data"
                    data-ocid="backtest.input"
                  />
                </div>

                <Button
                  onClick={handleRunBacktest}
                  disabled={
                    isRunning || !selectedStrategyId || strategiesLoading
                  }
                  className="w-full gap-2 mt-2"
                  data-ocid="backtest.primary_button"
                >
                  {isRunning ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Running...
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4" />
                      Run Backtest
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </motion.div>

          {/* Results Panel */}
          <motion.div
            className="lg:col-span-2 space-y-4"
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
          >
            <AnimatePresence mode="wait">
              {runError && (
                <motion.div
                  key="error"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                >
                  <Alert variant="destructive" data-ocid="backtest.error_state">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{runError}</AlertDescription>
                  </Alert>
                </motion.div>
              )}

              {isRunning && (
                <motion.div
                  key="loading"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <Card
                    className="bg-card/80 border-border"
                    data-ocid="backtest.loading_state"
                  >
                    <CardContent className="flex flex-col items-center justify-center py-16 gap-3">
                      <Loader2 className="w-8 h-8 animate-spin text-primary" />
                      <p className="text-sm text-muted-foreground">
                        Fetching candles & running strategy...
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>
              )}

              {!isRunning && metrics && (
                <motion.div
                  key="results"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="space-y-4"
                >
                  {/* Summary */}
                  <Card className="bg-card/80 border-border">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-display flex items-center gap-2">
                        <div
                          className={`w-2 h-2 rounded-full ${metrics.totalPnl >= 0 ? "bg-profit" : "bg-loss"}`}
                        />
                        Backtest Results — {symbol} ({timeframe})
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div
                        className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-4"
                        data-ocid="backtest.panel"
                      >
                        <MetricCard
                          label="Total P&L"
                          value={`${metrics.totalPnl >= 0 ? "+" : ""}₹${metrics.totalPnl.toLocaleString("en-IN", { maximumFractionDigits: 2 })}`}
                          positive={metrics.totalPnl > 0}
                          negative={metrics.totalPnl < 0}
                        />
                        <MetricCard
                          label="Win Rate"
                          value={`${metrics.winRate.toFixed(1)}%`}
                          positive={metrics.winRate >= 50}
                          negative={metrics.winRate > 0 && metrics.winRate < 50}
                        />
                        <MetricCard
                          label="Max Drawdown"
                          value={`-${metrics.maxDrawdown.toFixed(1)}%`}
                          negative={metrics.maxDrawdown > 0}
                        />
                        <MetricCard
                          label="Sharpe Ratio"
                          value={metrics.sharpeRatio.toFixed(2)}
                          positive={metrics.sharpeRatio >= 1}
                          negative={metrics.sharpeRatio < 0}
                        />
                        <MetricCard
                          label="Total Trades"
                          value={metrics.totalTrades.toString()}
                        />
                      </div>

                      {/* Equity Curve */}
                      <BacktestEquityChart metrics={metrics} />
                    </CardContent>
                  </Card>

                  {/* Trade Log */}
                  <Card className="bg-card/80 border-border">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base font-display">
                        Trade Log
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                      <ScrollArea className="h-56">
                        <Table>
                          <TableHeader>
                            <TableRow className="border-border hover:bg-transparent">
                              {[
                                "#",
                                "Entry",
                                "Exit",
                                "Entry Price",
                                "Exit Price",
                                "P&L",
                                "Exit Reason",
                              ].map((h) => (
                                <TableHead
                                  key={h}
                                  className="text-xs text-muted-foreground font-mono"
                                >
                                  {h}
                                </TableHead>
                              ))}
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {metrics.trades.length === 0 ? (
                              <TableRow>
                                <TableCell
                                  colSpan={7}
                                  className="text-center py-6 text-muted-foreground text-sm"
                                >
                                  No trades generated
                                </TableCell>
                              </TableRow>
                            ) : (
                              metrics.trades.map((t, i) => (
                                <TableRow
                                  key={`bt-trade-${t.entryIndex}-${t.exitIndex}`}
                                  className="border-border hover:bg-accent/20 transition-colors"
                                  data-ocid={`backtest.trade.row.${i + 1}`}
                                >
                                  <TableCell className="font-mono-data text-xs text-muted-foreground">
                                    {i + 1}
                                  </TableCell>
                                  <TableCell className="font-mono-data text-xs">
                                    {t.entryIndex}
                                  </TableCell>
                                  <TableCell className="font-mono-data text-xs">
                                    {t.exitIndex}
                                  </TableCell>
                                  <TableCell className="font-mono-data text-xs">
                                    ₹
                                    {t.entryPrice.toLocaleString("en-IN", {
                                      maximumFractionDigits: 2,
                                    })}
                                  </TableCell>
                                  <TableCell className="font-mono-data text-xs">
                                    ₹
                                    {t.exitPrice.toLocaleString("en-IN", {
                                      maximumFractionDigits: 2,
                                    })}
                                  </TableCell>
                                  <TableCell
                                    className={`font-mono-data text-xs font-semibold ${t.pnl > 0 ? "text-profit" : t.pnl < 0 ? "text-loss" : "text-muted-foreground"}`}
                                  >
                                    {t.pnl >= 0 ? "+" : ""}₹
                                    {t.pnl.toLocaleString("en-IN", {
                                      maximumFractionDigits: 2,
                                    })}
                                  </TableCell>
                                  <TableCell>
                                    <Badge
                                      variant="outline"
                                      className={`text-xs ${t.exitReason === "TARGET" ? "text-profit border-profit/30" : t.exitReason === "STOPLOSS" ? "text-loss border-loss/30" : "text-muted-foreground"}`}
                                    >
                                      {t.exitReason}
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
                </motion.div>
              )}

              {!isRunning && !metrics && !runError && (
                <motion.div
                  key="idle"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <Card className="bg-card/80 border-border">
                    <CardContent className="flex flex-col items-center justify-center py-20 gap-3">
                      <div className="w-16 h-16 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                        <FlaskConical className="w-8 h-8 text-primary" />
                      </div>
                      <p className="text-sm font-medium">Ready to Backtest</p>
                      <p className="text-xs text-muted-foreground text-center max-w-xs">
                        Select a strategy and click "Run Backtest" to evaluate
                        performance on historical NIFTY 50 data.
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>

        {/* Past Results */}
        <motion.div
          className="mt-4"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
        >
          <PastResultsSection />
        </motion.div>
      </main>
      <Footer />
    </div>
  );
}
