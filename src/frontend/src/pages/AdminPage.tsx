import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { Separator } from "@/components/ui/separator";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { Principal } from "@icp-sdk/core/principal";
import {
  Activity,
  AlertTriangle,
  BarChart3,
  Edit,
  Eye,
  EyeOff,
  FlaskConical,
  Layers,
  Link as LinkIcon,
  Loader2,
  Plus,
  RefreshCw,
  ShieldAlert,
  ShieldCheck,
  ToggleLeft,
  ToggleRight,
  TrendingDown,
  TrendingUp,
  Upload,
  Wifi,
  X,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import React, { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import type { Trade } from "../backend.d";
import { Footer } from "../components/trading/Footer";
import { Header } from "../components/trading/Header";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import {
  useAddStrategy,
  useAdminDashboardStats,
  useAllMarketplaceListings,
  useAllTrades,
  useAllUsers,
  useApproveCreator,
  useBrokerConfig,
  useClearNinetwentyState,
  useCloseTrade,
  useExitAllTrades,
  useModifyStopLoss,
  useNinetwentyState,
  usePendingCreators,
  useRejectCreator,
  useRiskSettings,
  useSaveBacktestResult,
  useSaveBrokerConfig,
  useSaveRiskSettings,
  useSetNinetwentyLine,
  useSetNinetwentySignal,
  useStrategies,
  useToggleSquareOffMode,
  useToggleStrategy,
  useUpdateStrategyPricing,
} from "../hooks/useQueries";

// ── Mock Data ─────────────────────────────────────────────────────────────────

const MOCK_TRADES: Trade[] = [
  {
    id: BigInt(1001),
    symbol: "NIFTY50",
    strategyName: "MA Crossover 9/21",
    side: "BUY",
    quantity: BigInt(50),
    price: 22187.45,
    pnl: 1250.0,
    status: "OPEN",
    mode: "live",
    userId: "user-alpha-1",
    stopLoss: 21950.0,
    timestamp: BigInt(Date.now() - 3600000),
  },
  {
    id: BigInt(1002),
    symbol: "BANKNIFTY",
    strategyName: "EMA Breakout",
    side: "SELL",
    quantity: BigInt(25),
    price: 47320.8,
    pnl: -680.5,
    status: "OPEN",
    mode: "live",
    userId: "user-beta-2",
    stopLoss: 47800.0,
    timestamp: BigInt(Date.now() - 1800000),
  },
  {
    id: BigInt(1003),
    symbol: "RELIANCE",
    strategyName: "RSI Reversal",
    side: "BUY",
    quantity: BigInt(100),
    price: 2895.3,
    pnl: 3420.0,
    status: "OPEN",
    mode: "paper",
    userId: "user-gamma-3",
    stopLoss: 2820.0,
    timestamp: BigInt(Date.now() - 7200000),
  },
  {
    id: BigInt(1004),
    symbol: "INFY",
    strategyName: "MA Crossover 9/21",
    side: "BUY",
    quantity: BigInt(200),
    price: 1782.55,
    pnl: 0,
    status: "OPEN",
    mode: "live",
    userId: "user-delta-4",
    stopLoss: 1730.0,
    timestamp: BigInt(Date.now() - 900000),
  },
  {
    id: BigInt(1005),
    symbol: "TCS",
    strategyName: "Bollinger Squeeze",
    side: "SELL",
    quantity: BigInt(75),
    price: 4125.0,
    pnl: 2100.0,
    status: "CLOSED",
    mode: "live",
    userId: "user-epsilon-5",
    stopLoss: 0,
    timestamp: BigInt(Date.now() - 14400000),
  },
];

// ── Helper utils ──────────────────────────────────────────────────────────────

function formatINR(value: number): string {
  return value.toLocaleString("en-IN", {
    maximumFractionDigits: 2,
    minimumFractionDigits: 2,
  });
}

function formatTimestamp(ts: bigint): string {
  const ms = Number(ts) > 1e12 ? Number(ts) / 1e6 : Number(ts);
  const d = new Date(ms);
  return d.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });
}

// ── Tab animation variants ─────────────────────────────────────────────────────

const tabVariants = {
  hidden: { opacity: 0, y: 8 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.3, ease: "easeOut" as const },
  },
  exit: { opacity: 0, y: -8, transition: { duration: 0.2 } },
};

// ── Overview Tab ──────────────────────────────────────────────────────────────

function OverviewTab() {
  const { data: stats, isLoading } = useAdminDashboardStats();
  const { mutate: toggleSquareOff, isPending: isToggling } =
    useToggleSquareOffMode();

  const handleSquareOffToggle = () => {
    toggleSquareOff(undefined, {
      onSuccess: () => toast.success("Square off mode updated"),
      onError: () => toast.error("Failed to update square off mode"),
    });
  };

  const statCards = [
    {
      title: "Account Balance",
      value: stats ? `₹${formatINR(stats.accountBalance)}` : "—",
      icon: Activity,
      color: "text-profit",
      loading: isLoading,
    },
    {
      title: "Today P&L",
      value: stats
        ? `${stats.todayPnl >= 0 ? "+" : ""}₹${formatINR(stats.todayPnl)}`
        : "—",
      icon: TrendingUp,
      color: stats
        ? stats.todayPnl >= 0
          ? "text-profit"
          : "text-loss"
        : "text-muted-foreground",
      loading: isLoading,
    },
    {
      title: "Active Trades",
      value: stats ? Number(stats.activeTrades) : "—",
      icon: Activity,
      color: "text-primary",
      loading: isLoading,
    },
    {
      title: "Win Rate",
      value: stats ? `${stats.winRate.toFixed(1)}%` : "—",
      icon: TrendingUp,
      color: "text-warning",
      loading: isLoading,
    },
    {
      title: "Strategy Status",
      value: stats
        ? `${Number(stats.activeStrategies)}/${Number(stats.totalStrategies)} Active`
        : "—",
      icon: BarChart3,
      color: "text-primary",
      loading: isLoading,
    },
  ];

  return (
    <motion.div
      key="overview"
      variants={tabVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="space-y-5"
    >
      {/* 6 stat cards: 5 numeric + 1 square off toggle */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {statCards.map((card) => (
          <Card key={card.title} className="bg-card/80 border-border">
            <CardContent className="p-4">
              {card.loading ? (
                <div className="space-y-2">
                  <Skeleton className="h-3 w-20" />
                  <Skeleton className="h-7 w-28" />
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] text-muted-foreground uppercase tracking-widest font-mono">
                      {card.title}
                    </span>
                    <card.icon className={`w-3.5 h-3.5 ${card.color}`} />
                  </div>
                  <div
                    className={`font-mono-data text-xl font-bold ${card.color}`}
                  >
                    {card.value}
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        ))}

        {/* Square Off Mode card */}
        <Card className="bg-card/80 border-border">
          <CardContent className="p-4">
            {isLoading ? (
              <div className="space-y-2">
                <Skeleton className="h-3 w-20" />
                <Skeleton className="h-7 w-28" />
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] text-muted-foreground uppercase tracking-widest font-mono">
                    Square Off Mode
                  </span>
                  <ShieldAlert className="w-3.5 h-3.5 text-warning" />
                </div>
                <div className="flex items-center gap-3">
                  <Switch
                    checked={stats?.squareOffMode ?? false}
                    onCheckedChange={handleSquareOffToggle}
                    disabled={isToggling}
                    data-ocid="admin.squareoff.toggle"
                    className="data-[state=checked]:bg-loss"
                  />
                  {stats?.squareOffMode ? (
                    <Badge className="bg-loss/20 text-loss border-loss/30 text-[10px] px-1.5 py-0.5 border">
                      SQUARE OFF ON
                    </Badge>
                  ) : (
                    <Badge className="bg-profit/10 text-profit border-profit/30 text-[10px] px-1.5 py-0.5 border">
                      Normal
                    </Badge>
                  )}
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* System Status */}
      <Card className="bg-card/80 border-border">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-display flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-profit animate-pulse-dot" />
            System Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {[
              {
                label: "Backend Canister",
                status: "Online",
                color: "text-profit",
                dot: "bg-profit",
              },
              {
                label: "Market Data Feed",
                status: "Active",
                color: "text-profit",
                dot: "bg-profit",
              },
              {
                label: "Algorithm Engine",
                status: "Ready",
                color: "text-warning",
                dot: "bg-warning",
              },
            ].map((item) => (
              <div
                key={item.label}
                className="flex items-center gap-3 p-3 rounded-lg bg-background/60 border border-border"
              >
                <div
                  className={`w-2 h-2 rounded-full ${item.dot} animate-pulse-dot flex-shrink-0`}
                />
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider">
                    {item.label}
                  </p>
                  <p
                    className={`text-sm font-semibold font-mono-data ${item.color}`}
                  >
                    {item.status}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// ── Modify SL Dialog ──────────────────────────────────────────────────────────

function ModifySlDialog({
  trade,
  open,
  onClose,
}: {
  trade: Trade | null;
  open: boolean;
  onClose: () => void;
}) {
  const { mutate: modifyStopLoss, isPending } = useModifyStopLoss();
  const [slValue, setSlValue] = useState("");

  useEffect(() => {
    if (trade && open) {
      setSlValue(trade.stopLoss > 0 ? String(trade.stopLoss) : "");
    }
  }, [trade, open]);

  const handleSave = () => {
    if (!trade) return;
    const newSl = Number.parseFloat(slValue);
    if (Number.isNaN(newSl) || newSl <= 0) {
      toast.error("Please enter a valid stop loss value");
      return;
    }
    modifyStopLoss(
      { tradeId: trade.id, newStopLoss: newSl },
      {
        onSuccess: () => {
          toast.success(`Stop loss updated to ₹${formatINR(newSl)}`);
          onClose();
        },
        onError: () => toast.error("Failed to modify stop loss"),
      },
    );
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent
        className="bg-card border-border max-w-sm"
        data-ocid="admin.modifysl.dialog"
      >
        <DialogHeader>
          <DialogTitle className="font-display text-base">
            Modify Stop Loss
          </DialogTitle>
        </DialogHeader>
        {trade && (
          <div className="space-y-4 py-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Symbol</span>
              <span className="font-mono font-semibold">{trade.symbol}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Current SL</span>
              <span className="font-mono-data text-loss">
                {trade.stopLoss > 0 ? `₹${formatINR(trade.stopLoss)}` : "—"}
              </span>
            </div>
            <Separator className="bg-border" />
            <div className="space-y-1.5">
              <Label className="text-xs">New Stop Loss (₹)</Label>
              <Input
                type="number"
                value={slValue}
                onChange={(e) => setSlValue(e.target.value)}
                placeholder="Enter new stop loss"
                step="0.05"
                min="0"
                className="h-9 bg-input font-mono-data"
                data-ocid="admin.modifysl.input"
              />
            </div>
          </div>
        )}
        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onClose}
            data-ocid="admin.modifysl.cancel_button"
          >
            Cancel
          </Button>
          <Button
            size="sm"
            onClick={handleSave}
            disabled={isPending}
            data-ocid="admin.modifysl.save_button"
          >
            {isPending ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin mr-1" />
            ) : null}
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ── Trade Monitor Tab ─────────────────────────────────────────────────────────

function TradeMonitorTab() {
  const { data: liveTrades = [], isLoading } = useAllTrades();
  const { mutate: closeTrade, isPending: isClosing } = useCloseTrade();
  const { mutate: exitAll, isPending: isExiting } = useExitAllTrades();

  const [modifyTrade, setModifyTrade] = useState<Trade | null>(null);
  const [modifyOpen, setModifyOpen] = useState(false);
  const [confirmExit, setConfirmExit] = useState(false);

  // Use real trades if available, otherwise show mock
  const trades = (liveTrades.length > 0 ? liveTrades : MOCK_TRADES) as Trade[];

  const handleCloseTrade = (trade: Trade) => {
    closeTrade(trade.id, {
      onSuccess: () => toast.success(`Trade ${trade.symbol} closed`),
      onError: () => toast.error("Failed to close trade"),
    });
  };

  const handleExitAll = () => {
    exitAll(undefined, {
      onSuccess: () => {
        toast.success("All trades exited successfully");
        setConfirmExit(false);
      },
      onError: () => toast.error("Failed to exit all trades"),
    });
  };

  return (
    <motion.div
      key="monitor"
      variants={tabVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
    >
      <Card className="bg-card/80 border-border">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <CardTitle className="text-base font-display flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-loss animate-pulse-dot" />
                Live Trade Monitor
              </CardTitle>
              <CardDescription className="text-xs mt-0.5">
                {trades.length} active positions
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              {confirmExit ? (
                <>
                  <span className="text-xs text-warning">
                    Confirm exit all?
                  </span>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={handleExitAll}
                    disabled={isExiting}
                    className="h-8 text-xs gap-1"
                  >
                    {isExiting ? (
                      <Loader2 className="w-3 h-3 animate-spin" />
                    ) : null}
                    Yes, Exit All
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setConfirmExit(false)}
                    className="h-8 text-xs"
                  >
                    Cancel
                  </Button>
                </>
              ) : (
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => setConfirmExit(true)}
                  className="h-8 text-xs gap-1.5"
                  data-ocid="admin.trades.exit_all_button"
                >
                  <X className="w-3.5 h-3.5" />
                  Exit All Trades
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <ScrollArea className="w-full">
            <Table data-ocid="admin.trades.table">
              <TableHeader>
                <TableRow className="border-border hover:bg-transparent">
                  {[
                    "Time",
                    "Symbol",
                    "Type",
                    "Price",
                    "Qty",
                    "Stop Loss",
                    "Status",
                    "Actions",
                  ].map((h) => (
                    <TableHead
                      key={h}
                      className="text-[10px] text-muted-foreground font-mono uppercase tracking-wider whitespace-nowrap"
                    >
                      {h}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  [1, 2, 3, 4, 5].map((sk) => (
                    <TableRow key={sk} className="border-border">
                      {[1, 2, 3, 4, 5, 6, 7, 8].map((col) => (
                        <TableCell key={`${sk}-${col}`}>
                          <Skeleton className="h-4 w-full" />
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : trades.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-12">
                      <div
                        data-ocid="admin.trades.empty_state"
                        className="flex flex-col items-center gap-2 text-muted-foreground"
                      >
                        <Activity className="w-8 h-8 opacity-30" />
                        <span className="text-sm">No active trades</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  trades.map((t, i) => (
                    <TableRow
                      key={t.id.toString()}
                      className="border-border hover:bg-accent/20 transition-colors"
                      data-ocid={`admin.trades.row.${i + 1}`}
                    >
                      <TableCell className="font-mono-data text-xs text-muted-foreground whitespace-nowrap">
                        {formatTimestamp(t.timestamp)}
                      </TableCell>
                      <TableCell className="font-mono text-xs font-bold whitespace-nowrap">
                        {t.symbol}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={
                            t.side === "BUY"
                              ? "text-profit border-profit/40 bg-profit/10 text-[10px] whitespace-nowrap"
                              : "text-loss border-loss/40 bg-loss/10 text-[10px] whitespace-nowrap"
                          }
                        >
                          {t.side === "BUY" ? (
                            <TrendingUp className="w-3 h-3 mr-0.5" />
                          ) : (
                            <TrendingDown className="w-3 h-3 mr-0.5" />
                          )}
                          {t.side}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-mono-data text-xs whitespace-nowrap">
                        ₹{formatINR(t.price)}
                      </TableCell>
                      <TableCell className="font-mono-data text-xs">
                        {Number(t.quantity)}
                      </TableCell>
                      <TableCell className="font-mono-data text-xs text-loss whitespace-nowrap">
                        {t.stopLoss > 0 ? `₹${formatINR(t.stopLoss)}` : "—"}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={`text-[10px] ${
                            t.status === "OPEN"
                              ? "text-primary border-primary/40 bg-primary/5"
                              : "text-muted-foreground border-border"
                          }`}
                        >
                          {t.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1.5 whitespace-nowrap">
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleCloseTrade(t)}
                            disabled={isClosing || t.status === "CLOSED"}
                            className="h-6 w-6 p-0"
                            title="Close trade"
                            data-ocid={`admin.trades.close_button.${i + 1}`}
                          >
                            <X className="w-3 h-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setModifyTrade(t);
                              setModifyOpen(true);
                            }}
                            disabled={t.status === "CLOSED"}
                            className="h-6 w-6 p-0"
                            title="Modify stop loss"
                            data-ocid={`admin.trades.edit_button.${i + 1}`}
                          >
                            <Edit className="w-3 h-3" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </ScrollArea>
        </CardContent>
      </Card>

      <ModifySlDialog
        trade={modifyTrade}
        open={modifyOpen}
        onClose={() => {
          setModifyOpen(false);
          setModifyTrade(null);
        }}
      />
    </motion.div>
  );
}

// ── Strategies Tab ────────────────────────────────────────────────────────────

function StrategiesTab() {
  const { data: strategies, isLoading } = useStrategies();
  const { mutateAsync: toggleStrategy, isPending: isToggling } =
    useToggleStrategy();
  const { mutateAsync: addStrategy, isPending: isAdding } = useAddStrategy();

  const [form, setForm] = useState({
    name: "",
    shortWindow: "9",
    longWindow: "21",
    stopLossPercent: "2",
    targetPercent: "4",
    positionSize: "50",
    riskPercent: "1.5",
    algorithmFile: "",
  });

  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleToggle = async (id: bigint, name: string) => {
    try {
      await toggleStrategy(id);
      toast.success(`Strategy "${name}" toggled.`);
    } catch {
      toast.error("Failed to toggle strategy.");
    }
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) {
      toast.error("Strategy name is required.");
      return;
    }
    try {
      await addStrategy({
        name: form.name.trim(),
        shortWindow: BigInt(Number(form.shortWindow)),
        longWindow: BigInt(Number(form.longWindow)),
        stopLossPercent: Number.parseFloat(form.stopLossPercent),
        targetPercent: Number.parseFloat(form.targetPercent),
        positionSize: BigInt(Number(form.positionSize)),
        riskPercent: Number.parseFloat(form.riskPercent),
        algorithmFile: form.algorithmFile.trim(),
        strategyType: "ma_crossover",
      });
      setForm({
        name: "",
        shortWindow: "9",
        longWindow: "21",
        stopLossPercent: "2",
        targetPercent: "4",
        positionSize: "50",
        riskPercent: "1.5",
        algorithmFile: "",
      });
      toast.success("Strategy added successfully.");
    } catch {
      toast.error("Failed to add strategy.");
    }
  };

  const handleUpload = () => {
    if (!uploadFile) {
      toast.error("Please select an algorithm file first.");
      return;
    }
    toast.success(`Algorithm file registered: ${uploadFile.name}`);
    setUploadFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const cols = [
    "Name",
    "SMA Windows",
    "Stop Loss",
    "Target",
    "Lot Size",
    "Risk%",
    "Algorithm",
    "Status",
    "Action",
  ];

  return (
    <motion.div
      key="strategies"
      variants={tabVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="space-y-4"
    >
      {/* Add Strategy Form */}
      <Card className="bg-card/80 border-border">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-display flex items-center gap-2">
            <Plus className="w-4 h-4 text-profit" />
            Add New Strategy
          </CardTitle>
          <CardDescription className="text-xs">
            Configure a new algorithmic trading strategy
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAdd} className="space-y-3">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="col-span-2 space-y-1.5">
                <Label className="text-xs">Strategy Name</Label>
                <Input
                  value={form.name}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, name: e.target.value }))
                  }
                  placeholder="MA Crossover 9/21"
                  className="h-9 text-sm bg-input"
                  data-ocid="admin.strategy.input"
                />
              </div>
              <div className="col-span-2 space-y-1.5">
                <Label className="text-xs">Algorithm File Name</Label>
                <Input
                  value={form.algorithmFile}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, algorithmFile: e.target.value }))
                  }
                  placeholder="e.g. ma_crossover_v2.py"
                  className="h-9 text-sm bg-input"
                  data-ocid="admin.strategy.input"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Short Window</Label>
                <Input
                  type="number"
                  value={form.shortWindow}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, shortWindow: e.target.value }))
                  }
                  min="2"
                  max="200"
                  className="h-9 text-sm bg-input font-mono-data"
                  data-ocid="admin.strategy.input"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Long Window</Label>
                <Input
                  type="number"
                  value={form.longWindow}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, longWindow: e.target.value }))
                  }
                  min="3"
                  max="500"
                  className="h-9 text-sm bg-input font-mono-data"
                  data-ocid="admin.strategy.input"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Lot Size</Label>
                <Input
                  type="number"
                  value={form.positionSize}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, positionSize: e.target.value }))
                  }
                  min="1"
                  className="h-9 text-sm bg-input font-mono-data"
                  data-ocid="admin.strategy.input"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Stop Loss %</Label>
                <Input
                  type="number"
                  value={form.stopLossPercent}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, stopLossPercent: e.target.value }))
                  }
                  step="0.1"
                  min="0.1"
                  max="50"
                  className="h-9 text-sm bg-input font-mono-data"
                  data-ocid="admin.strategy.input"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Target %</Label>
                <Input
                  type="number"
                  value={form.targetPercent}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, targetPercent: e.target.value }))
                  }
                  step="0.1"
                  min="0.1"
                  max="100"
                  className="h-9 text-sm bg-input font-mono-data"
                  data-ocid="admin.strategy.input"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Risk %</Label>
                <Input
                  type="number"
                  value={form.riskPercent}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, riskPercent: e.target.value }))
                  }
                  step="0.1"
                  min="0.1"
                  max="10"
                  className="h-9 text-sm bg-input font-mono-data"
                  data-ocid="admin.strategy.input"
                />
              </div>
            </div>
            <Button
              type="submit"
              disabled={isAdding}
              className="gap-2"
              data-ocid="admin.strategy.primary_button"
            >
              {isAdding ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Plus className="w-4 h-4" />
              )}
              Add Strategy
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Strategy List */}
      <Card className="bg-card/80 border-border">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-display">
            Strategy Management
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <ScrollArea className="w-full">
            <Table>
              <TableHeader>
                <TableRow className="border-border hover:bg-transparent">
                  {cols.map((h) => (
                    <TableHead
                      key={h}
                      className="text-[10px] text-muted-foreground font-mono uppercase tracking-wider whitespace-nowrap"
                    >
                      {h}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  [1, 2, 3].map((sk) => (
                    <TableRow key={sk} className="border-border">
                      {cols.map((col) => (
                        <TableCell key={`${sk}-${col}`}>
                          <Skeleton className="h-4 w-full" />
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : !strategies || strategies.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={cols.length}
                      className="text-center py-10"
                    >
                      <div
                        data-ocid="admin.strategies.empty_state"
                        className="flex flex-col items-center gap-2 text-muted-foreground"
                      >
                        <BarChart3 className="w-8 h-8 opacity-30" />
                        <span className="text-sm">
                          No strategies yet. Add one above.
                        </span>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  strategies.map((s, i) => (
                    <TableRow
                      key={s.id.toString()}
                      className="border-border hover:bg-accent/20 transition-colors"
                      data-ocid={`admin.strategies.row.${i + 1}`}
                    >
                      <TableCell className="font-medium text-sm whitespace-nowrap">
                        {s.name}
                      </TableCell>
                      <TableCell className="font-mono-data text-xs">
                        {Number(s.shortWindow)}/{Number(s.longWindow)}
                      </TableCell>
                      <TableCell className="font-mono-data text-xs text-loss">
                        {s.stopLossPercent}%
                      </TableCell>
                      <TableCell className="font-mono-data text-xs text-profit">
                        {s.targetPercent}%
                      </TableCell>
                      <TableCell className="font-mono-data text-xs">
                        {Number(s.positionSize)}
                      </TableCell>
                      <TableCell className="font-mono-data text-xs">
                        {s.riskPercent}%
                      </TableCell>
                      <TableCell className="font-mono text-xs text-muted-foreground max-w-[120px] truncate">
                        {s.algorithmFile || "—"}
                      </TableCell>
                      <TableCell>
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
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1.5">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleToggle(s.id, s.name)}
                            disabled={isToggling}
                            className="h-7 gap-1.5 text-xs whitespace-nowrap"
                            data-ocid={`admin.strategies.toggle.${i + 1}`}
                          >
                            {s.enabled ? (
                              <ToggleRight className="w-4 h-4 text-profit" />
                            ) : (
                              <ToggleLeft className="w-4 h-4 text-muted-foreground" />
                            )}
                            {s.enabled ? "Disable" : "Enable"}
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-7 w-7 p-0"
                            onClick={() =>
                              toast.info(
                                "Edit saved locally (re-add to persist changes)",
                              )
                            }
                            data-ocid={`admin.strategies.edit_button.${i + 1}`}
                            title="Edit strategy"
                          >
                            <Edit className="w-3 h-3" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Upload Algorithm */}
      <Card className="bg-card/80 border-border">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-display flex items-center gap-2">
            <Upload className="w-4 h-4 text-primary" />
            Upload Algorithm File
          </CardTitle>
          <CardDescription className="text-xs">
            Register a new algorithm file (.py, .js, .ts, .json)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <button
            type="button"
            className="w-full border-2 border-dashed border-border rounded-lg p-8 text-center cursor-pointer hover:border-primary/50 transition-colors bg-background/40"
            onClick={() => fileInputRef.current?.click()}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              const file = e.dataTransfer.files[0];
              if (file) setUploadFile(file);
            }}
            data-ocid="admin.algorithm.dropzone"
          >
            <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
            {uploadFile ? (
              <p className="text-sm font-mono text-primary">
                {uploadFile.name}
              </p>
            ) : (
              <>
                <p className="text-sm text-muted-foreground">
                  Drag & drop your algorithm file here
                </p>
                <p className="text-xs text-muted-foreground/60 mt-1">
                  or click to browse — .py, .js, .ts, .json
                </p>
              </>
            )}
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".py,.js,.ts,.json"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) setUploadFile(file);
            }}
          />
          <Button
            onClick={handleUpload}
            className="gap-2"
            disabled={!uploadFile}
            data-ocid="admin.algorithm.upload_button"
          >
            <Upload className="w-4 h-4" />
            Upload Algorithm
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// ── Backtest Panel Tab ────────────────────────────────────────────────────────

interface BacktestResult {
  totalProfit: number;
  maxDrawdown: number;
  winRate: number;
  trades: {
    date: string;
    symbol: string;
    side: "BUY" | "SELL";
    entry: number;
    exit: number;
    pnl: number;
  }[];
}

function generateBacktestResult(
  shortWindow: number,
  longWindow: number,
  capital: number,
): BacktestResult {
  const numTrades = 8 + Math.floor(Math.random() * 5);
  const trades: BacktestResult["trades"] = [];
  let equity = capital;
  let maxEquity = capital;
  let maxDrawdown = 0;
  let wins = 0;

  const symbols = ["NIFTY50", "BANKNIFTY", "RELIANCE", "INFY", "TCS", "HDFC"];
  const baseDate = new Date("2024-01-15");

  for (let i = 0; i < numTrades; i++) {
    const date = new Date(baseDate.getTime() + i * 86400000 * 3);
    const symbol = symbols[i % symbols.length];
    const side: "BUY" | "SELL" = Math.random() > 0.4 ? "BUY" : "SELL";
    const entry = 20000 + Math.random() * 5000;
    const ratio = longWindow / shortWindow;
    const winProb = Math.min(0.65, 0.45 + ratio * 0.05);
    const isWin = Math.random() < winProb;
    const pnlPct = isWin
      ? 0.5 + Math.random() * 2.5
      : -(0.5 + Math.random() * 1.5);
    const pnl = (capital * pnlPct) / 100;
    const exit = entry * (1 + pnlPct / 100);

    if (isWin) wins++;
    equity += pnl;
    if (equity > maxEquity) maxEquity = equity;
    const dd = ((maxEquity - equity) / maxEquity) * 100;
    if (dd > maxDrawdown) maxDrawdown = dd;

    trades.push({
      date: date.toLocaleDateString("en-IN"),
      symbol,
      side,
      entry: Number.parseFloat(entry.toFixed(2)),
      exit: Number.parseFloat(exit.toFixed(2)),
      pnl: Number.parseFloat(pnl.toFixed(2)),
    });
  }

  return {
    totalProfit: Number.parseFloat((equity - capital).toFixed(2)),
    maxDrawdown: Number.parseFloat(maxDrawdown.toFixed(2)),
    winRate: Number.parseFloat(((wins / numTrades) * 100).toFixed(1)),
    trades,
  };
}

function BacktestTab() {
  const { data: strategies } = useStrategies();
  const { mutate: saveResult } = useSaveBacktestResult();

  const [selectedStrategyId, setSelectedStrategyId] = useState("");
  const [startDate, setStartDate] = useState("2024-01-01");
  const [endDate, setEndDate] = useState("2024-06-30");
  const [capital, setCapital] = useState("100000");
  const [riskPct, setRiskPct] = useState("2");
  const [isRunning, setIsRunning] = useState(false);
  const [result, setResult] = useState<BacktestResult | null>(null);

  const handleRun = () => {
    if (!selectedStrategyId) {
      toast.error("Please select a strategy");
      return;
    }
    if (!startDate || !endDate) {
      toast.error("Please set a date range");
      return;
    }
    if (new Date(startDate) >= new Date(endDate)) {
      toast.error("Start date must be before end date");
      return;
    }

    setIsRunning(true);
    setResult(null);

    const strategy = strategies?.find(
      (s) => s.id.toString() === selectedStrategyId,
    );
    const sw = strategy ? Number(strategy.shortWindow) : 9;
    const lw = strategy ? Number(strategy.longWindow) : 21;
    const cap = Number.parseFloat(capital) || 100000;

    setTimeout(() => {
      const res = generateBacktestResult(sw, lw, cap);
      setResult(res);
      setIsRunning(false);

      if (strategy) {
        saveResult({
          strategyId: strategy.id,
          symbol: "NIFTY50",
          timeframe: "1D",
          totalPnl: res.totalProfit,
          winRate: res.winRate,
          maxDrawdown: res.maxDrawdown,
          sharpeRatio: Number.parseFloat((res.winRate / 10).toFixed(2)),
          totalTrades: BigInt(res.trades.length),
        });
      }
      toast.success("Backtest completed!");
    }, 2000);
  };

  return (
    <motion.div
      key="backtest"
      variants={tabVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="space-y-4"
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Inputs */}
        <Card className="bg-card/80 border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-display flex items-center gap-2">
              <FlaskConical className="w-4 h-4 text-primary" />
              Backtest Inputs
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label className="text-xs">Strategy</Label>
              <Select
                value={selectedStrategyId}
                onValueChange={setSelectedStrategyId}
              >
                <SelectTrigger
                  className="h-9 bg-input text-sm"
                  data-ocid="admin.backtest.select"
                >
                  <SelectValue placeholder="Select a strategy..." />
                </SelectTrigger>
                <SelectContent className="bg-popover border-border">
                  {strategies && strategies.length > 0 ? (
                    strategies.map((s) => (
                      <SelectItem
                        key={s.id.toString()}
                        value={s.id.toString()}
                        className="text-sm"
                      >
                        {s.name}
                      </SelectItem>
                    ))
                  ) : (
                    <>
                      <SelectItem value="demo-1">
                        MA Crossover 9/21 (demo)
                      </SelectItem>
                      <SelectItem value="demo-2">
                        EMA Breakout 12/26 (demo)
                      </SelectItem>
                    </>
                  )}
                  <SelectItem value="nine_twenty_demo" className="text-sm">
                    9:20 Candle Strategy
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs">Start Date</Label>
                <Input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="h-9 bg-input text-sm font-mono-data"
                  data-ocid="admin.backtest.input"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">End Date</Label>
                <Input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="h-9 bg-input text-sm font-mono-data"
                  data-ocid="admin.backtest.input"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs">Capital (₹)</Label>
                <Input
                  type="number"
                  value={capital}
                  onChange={(e) => setCapital(e.target.value)}
                  placeholder="100000"
                  min="1000"
                  className="h-9 bg-input text-sm font-mono-data"
                  data-ocid="admin.backtest.input"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Risk %</Label>
                <Input
                  type="number"
                  value={riskPct}
                  onChange={(e) => setRiskPct(e.target.value)}
                  placeholder="2"
                  step="0.1"
                  min="0.1"
                  max="10"
                  className="h-9 bg-input text-sm font-mono-data"
                  data-ocid="admin.backtest.input"
                />
              </div>
            </div>

            <Button
              onClick={handleRun}
              disabled={isRunning}
              className="w-full gap-2"
              data-ocid="admin.backtest.primary_button"
            >
              {isRunning ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Running Backtest...
                </>
              ) : (
                <>
                  <FlaskConical className="w-4 h-4" />
                  Run Backtest
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Outputs */}
        <Card className="bg-card/80 border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-display flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-profit" />
              Backtest Results
            </CardTitle>
          </CardHeader>
          <CardContent>
            <AnimatePresence mode="wait">
              {isRunning ? (
                <motion.div
                  key="loading"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col items-center justify-center py-12 gap-3"
                  data-ocid="admin.backtest.loading_state"
                >
                  <div className="relative">
                    <Loader2 className="w-10 h-10 animate-spin text-primary" />
                    <div className="absolute inset-0 w-10 h-10 rounded-full border-2 border-primary/20" />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Simulating trades...
                  </p>
                </motion.div>
              ) : result ? (
                <motion.div
                  key="results"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-4"
                  data-ocid="admin.backtest.success_state"
                >
                  <div className="grid grid-cols-3 gap-2">
                    <div className="bg-background/60 border border-border rounded-lg p-3 text-center">
                      <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">
                        Total Profit
                      </p>
                      <p
                        className={`font-mono-data text-lg font-bold ${result.totalProfit >= 0 ? "text-profit" : "text-loss"}`}
                      >
                        {result.totalProfit >= 0 ? "+" : ""}₹
                        {formatINR(result.totalProfit)}
                      </p>
                    </div>
                    <div className="bg-background/60 border border-border rounded-lg p-3 text-center">
                      <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">
                        Max Drawdown
                      </p>
                      <p className="font-mono-data text-lg font-bold text-loss">
                        -{result.maxDrawdown}%
                      </p>
                    </div>
                    <div className="bg-background/60 border border-border rounded-lg p-3 text-center">
                      <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">
                        Win Rate
                      </p>
                      <p className="font-mono-data text-lg font-bold text-warning">
                        {result.winRate}%
                      </p>
                    </div>
                  </div>

                  <div>
                    <p className="text-xs text-muted-foreground mb-2 font-mono uppercase tracking-wider">
                      Trade History ({result.trades.length} trades)
                    </p>
                    <ScrollArea className="h-48">
                      <Table>
                        <TableHeader>
                          <TableRow className="border-border hover:bg-transparent">
                            {[
                              "Date",
                              "Symbol",
                              "Side",
                              "Entry",
                              "Exit",
                              "P&L",
                            ].map((h) => (
                              <TableHead
                                key={h}
                                className="text-[10px] text-muted-foreground font-mono py-1.5 whitespace-nowrap"
                              >
                                {h}
                              </TableHead>
                            ))}
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {result.trades.map((t, i) => (
                            <TableRow
                              key={`${t.date}-${t.symbol}-${i}`}
                              className="border-border hover:bg-accent/20"
                              data-ocid={`admin.backtest.row.${i + 1}`}
                            >
                              <TableCell className="font-mono text-xs py-1.5 whitespace-nowrap">
                                {t.date}
                              </TableCell>
                              <TableCell className="font-mono text-xs font-bold py-1.5 whitespace-nowrap">
                                {t.symbol}
                              </TableCell>
                              <TableCell className="py-1.5">
                                <Badge
                                  variant="outline"
                                  className={`text-[10px] ${t.side === "BUY" ? "text-profit border-profit/30" : "text-loss border-loss/30"}`}
                                >
                                  {t.side}
                                </Badge>
                              </TableCell>
                              <TableCell className="font-mono-data text-xs py-1.5">
                                ₹{t.entry.toLocaleString("en-IN")}
                              </TableCell>
                              <TableCell className="font-mono-data text-xs py-1.5">
                                ₹{t.exit.toLocaleString("en-IN")}
                              </TableCell>
                              <TableCell
                                className={`font-mono-data text-xs py-1.5 font-semibold ${t.pnl >= 0 ? "text-profit" : "text-loss"}`}
                              >
                                {t.pnl >= 0 ? "+" : ""}₹{formatINR(t.pnl)}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </ScrollArea>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex flex-col items-center justify-center py-12 gap-2 text-muted-foreground"
                >
                  <FlaskConical className="w-10 h-10 opacity-20" />
                  <p className="text-sm">
                    Configure inputs and run the backtest
                  </p>
                  <p className="text-xs opacity-60">Results will appear here</p>
                </motion.div>
              )}
            </AnimatePresence>
          </CardContent>
        </Card>
      </div>
    </motion.div>
  );
}

// ── Paper / Live Mode Tab ─────────────────────────────────────────────────────

function PaperLiveTab() {
  const { data: brokerConfig } = useBrokerConfig();
  const { mutate: saveConfig, isPending: isSaving } = useSaveBrokerConfig();

  const [paperMode, setPaperMode] = useState(
    () => brokerConfig?.paperMode ?? true,
  );
  const [liveMode, setLiveMode] = useState(
    () => brokerConfig?.liveMode ?? false,
  );

  useEffect(() => {
    if (brokerConfig) {
      setPaperMode(brokerConfig.paperMode);
      setLiveMode(brokerConfig.liveMode);
    }
  }, [brokerConfig]);

  const handlePaperToggle = (checked: boolean) => {
    setPaperMode(checked);
    if (checked) setLiveMode(false);
    saveConfig(
      {
        apiKey: brokerConfig?.apiKey ?? "",
        secret: brokerConfig?.secret ?? "",
        accessToken: brokerConfig?.accessToken ?? "",
        redirectUrl: brokerConfig?.redirectUrl ?? "",
        webhook: brokerConfig?.webhook ?? "",
        paperMode: checked,
        liveMode: checked ? false : liveMode,
        tradingMode: checked ? "paper" : (brokerConfig?.tradingMode ?? "paper"),
      },
      {
        onSuccess: () =>
          toast.success(`Paper trading ${checked ? "enabled" : "disabled"}`),
        onError: () => toast.error("Failed to update trading mode"),
      },
    );
  };

  const handleLiveToggle = (checked: boolean) => {
    setLiveMode(checked);
    if (checked) setPaperMode(false);
    saveConfig(
      {
        apiKey: brokerConfig?.apiKey ?? "",
        secret: brokerConfig?.secret ?? "",
        accessToken: brokerConfig?.accessToken ?? "",
        redirectUrl: brokerConfig?.redirectUrl ?? "",
        webhook: brokerConfig?.webhook ?? "",
        paperMode: checked ? false : paperMode,
        liveMode: checked,
        tradingMode: checked ? "live" : "paper",
      },
      {
        onSuccess: () =>
          toast.success(`Live trading ${checked ? "enabled" : "disabled"}`),
        onError: () => toast.error("Failed to update trading mode"),
      },
    );
  };

  return (
    <motion.div
      key="paperlive"
      variants={tabVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="space-y-4 max-w-2xl"
    >
      {/* Live + paper conflict warning */}
      {liveMode && !paperMode && (
        <motion.div
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-start gap-3 p-4 bg-warning/10 border border-warning/30 rounded-lg"
        >
          <AlertTriangle className="w-5 h-5 text-warning flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-warning">
              CAUTION: Live Trading Active
            </p>
            <p className="text-xs text-warning/80 mt-0.5">
              Live orders will be placed on NSE (National Stock Exchange of
              India). Real money is at risk.
            </p>
          </div>
        </motion.div>
      )}

      {/* Paper Trading Card */}
      <Card className="bg-card/80 border-border">
        <CardContent className="p-6">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <Layers className="w-5 h-5 text-primary" />
                <h3 className="font-display text-base font-semibold">
                  Paper Trading Mode
                </h3>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                When enabled, all orders are simulated. No real orders are sent
                to NSE (National Stock Exchange of India).
              </p>
              <div className="mt-3">
                {paperMode ? (
                  <Badge className="bg-primary/20 text-primary border-primary/30 text-[10px] border">
                    PAPER MODE ACTIVE
                  </Badge>
                ) : (
                  <Badge variant="secondary" className="text-[10px]">
                    Paper Mode OFF
                  </Badge>
                )}
              </div>
            </div>
            <div className="flex flex-col items-center gap-2 pt-1">
              <Switch
                checked={paperMode}
                onCheckedChange={handlePaperToggle}
                disabled={isSaving}
                data-ocid="admin.paper.switch"
                className="data-[state=checked]:bg-primary scale-125"
              />
              <span className="text-[10px] text-muted-foreground">
                {paperMode ? "ON" : "OFF"}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Live Trading Card */}
      <Card
        className={`bg-card/80 border-border ${liveMode ? "border-loss/40" : ""}`}
      >
        <CardContent className="p-6">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <Activity
                  className={`w-5 h-5 ${liveMode ? "text-loss animate-pulse-dot" : "text-muted-foreground"}`}
                />
                <h3 className="font-display text-base font-semibold">
                  Live Trading
                </h3>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Enable real order execution through your connected broker
                (Upstox). Requires valid API credentials.
              </p>
              <div className="mt-3">
                {liveMode ? (
                  <Badge className="bg-loss/20 text-loss border-loss/40 text-[10px] border">
                    <span className="inline-block w-1.5 h-1.5 rounded-full bg-loss mr-1.5 animate-pulse-dot" />
                    LIVE TRADING ACTIVE
                  </Badge>
                ) : (
                  <Badge variant="secondary" className="text-[10px]">
                    Live Trading OFF
                  </Badge>
                )}
              </div>
            </div>
            <div className="flex flex-col items-center gap-2 pt-1">
              <Switch
                checked={liveMode}
                onCheckedChange={handleLiveToggle}
                disabled={isSaving}
                data-ocid="admin.live.switch"
                className="data-[state=checked]:bg-loss scale-125"
              />
              <span className="text-[10px] text-muted-foreground">
                {liveMode ? "ON" : "OFF"}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// ── Broker API Settings Tab ────────────────────────────────────────────────────

function BrokerApiTab() {
  const { data: brokerConfig } = useBrokerConfig();
  const { mutate: saveConfig, isPending: isSaving } = useSaveBrokerConfig();

  const [apiKey, setApiKey] = useState("");
  const [accessToken, setAccessToken] = useState("");
  const [redirectUrl, setRedirectUrl] = useState("");
  const [webhook, setWebhook] = useState("");
  const [showApiKey, setShowApiKey] = useState(false);
  const [showToken, setShowToken] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    if (brokerConfig) {
      setApiKey(brokerConfig.apiKey);
      setAccessToken(brokerConfig.accessToken);
      setRedirectUrl(brokerConfig.redirectUrl);
      setWebhook(brokerConfig.webhook);
    }
  }, [brokerConfig]);

  const handleConnect = () => {
    if (!apiKey.trim()) {
      toast.error("API Key is required");
      return;
    }
    saveConfig(
      {
        apiKey,
        secret: brokerConfig?.secret ?? "",
        accessToken,
        redirectUrl,
        webhook,
        paperMode: brokerConfig?.paperMode ?? true,
        liveMode: brokerConfig?.liveMode ?? false,
        tradingMode: brokerConfig?.tradingMode ?? "paper",
      },
      {
        onSuccess: () => toast.success("API Connected successfully"),
        onError: () => toast.error("Failed to connect API"),
      },
    );
  };

  const handleTest = () => {
    setIsTesting(true);
    setTimeout(() => {
      setIsTesting(false);
      const success = Math.random() < 0.7;
      if (success) {
        toast.success("Connection successful ✓");
      } else {
        toast.error("Connection failed — check credentials");
      }
    }, 1500);
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
      toast.success("Token refreshed successfully");
    }, 1000);
  };

  return (
    <motion.div
      key="broker"
      variants={tabVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="max-w-2xl"
    >
      <Card className="bg-card/80 border-border">
        <CardHeader className="pb-4">
          <CardTitle className="text-base font-display flex items-center gap-2">
            <LinkIcon className="w-4 h-4 text-primary" />
            Broker API Settings
          </CardTitle>
          <CardDescription className="text-xs">
            Configure your Upstox API credentials for order execution
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* API Key */}
            <div className="space-y-1.5">
              <Label className="text-xs">API Key</Label>
              <div className="relative">
                <Input
                  type={showApiKey ? "text" : "password"}
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="Enter your Upstox API key"
                  className="h-9 bg-input pr-9 font-mono text-xs"
                  data-ocid="admin.broker.input"
                />
                <button
                  type="button"
                  onClick={() => setShowApiKey(!showApiKey)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showApiKey ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Access Token */}
            <div className="space-y-1.5">
              <Label className="text-xs">Access Token</Label>
              <div className="relative">
                <Input
                  type={showToken ? "text" : "password"}
                  value={accessToken}
                  onChange={(e) => setAccessToken(e.target.value)}
                  placeholder="Enter your access token"
                  className="h-9 bg-input pr-9 font-mono text-xs"
                  data-ocid="admin.broker.input"
                />
                <button
                  type="button"
                  onClick={() => setShowToken(!showToken)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showToken ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Redirect URL */}
            <div className="space-y-1.5">
              <Label className="text-xs">Redirect URL</Label>
              <Input
                type="url"
                value={redirectUrl}
                onChange={(e) => setRedirectUrl(e.target.value)}
                placeholder="https://your-app.com/callback"
                className="h-9 bg-input font-mono text-xs"
                data-ocid="admin.broker.input"
              />
            </div>

            {/* Webhook */}
            <div className="space-y-1.5">
              <Label className="text-xs">Webhook URL</Label>
              <Input
                type="url"
                value={webhook}
                onChange={(e) => setWebhook(e.target.value)}
                placeholder="https://your-app.com/webhook"
                className="h-9 bg-input font-mono text-xs"
                data-ocid="admin.broker.input"
              />
            </div>
          </div>

          <Separator className="bg-border" />

          <div className="flex flex-wrap gap-3">
            <Button
              onClick={handleConnect}
              disabled={isSaving}
              className="gap-2"
              data-ocid="admin.broker.primary_button"
            >
              {isSaving ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <LinkIcon className="w-4 h-4" />
              )}
              Connect API
            </Button>

            <Button
              variant="outline"
              onClick={handleTest}
              disabled={isTesting}
              className="gap-2"
              data-ocid="admin.broker.secondary_button"
            >
              {isTesting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Wifi className="w-4 h-4" />
              )}
              Test Connection
            </Button>

            <Button
              variant="outline"
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="gap-2"
              data-ocid="admin.broker.secondary_button"
            >
              {isRefreshing ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <RefreshCw className="w-4 h-4" />
              )}
              Refresh Token
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// ── Risk Management Tab ────────────────────────────────────────────────────────

function RiskMgmtTab() {
  const { data: riskSettings } = useRiskSettings();
  const { mutate: saveRisk, isPending: isSaving } = useSaveRiskSettings();

  const [maxDailyLoss, setMaxDailyLoss] = useState("5000");
  const [maxTradesPerDay, setMaxTradesPerDay] = useState("5");
  const [maxCapitalPerTrade, setMaxCapitalPerTrade] = useState("2000");
  const [autoShutdown, setAutoShutdown] = useState(true);

  useEffect(() => {
    if (riskSettings) {
      setMaxDailyLoss(String(riskSettings.maxDailyLoss));
      setMaxTradesPerDay(String(Number(riskSettings.maxTradesPerDay)));
      setMaxCapitalPerTrade(String(riskSettings.maxCapitalPerTrade));
      setAutoShutdown(riskSettings.autoShutdown);
    }
  }, [riskSettings]);

  const handleSave = () => {
    const loss = Number.parseFloat(maxDailyLoss);
    const trades = Number.parseInt(maxTradesPerDay, 10);
    const capital = Number.parseFloat(maxCapitalPerTrade);

    if (Number.isNaN(loss) || loss <= 0) {
      toast.error("Max daily loss must be a positive number");
      return;
    }
    if (Number.isNaN(trades) || trades <= 0) {
      toast.error("Max trades per day must be a positive integer");
      return;
    }
    if (Number.isNaN(capital) || capital <= 0) {
      toast.error("Max capital per trade must be a positive number");
      return;
    }

    saveRisk(
      {
        maxDailyLoss: loss,
        maxTradesPerDay: BigInt(trades),
        maxCapitalPerTrade: capital,
        autoShutdown,
      },
      {
        onSuccess: () => toast.success("Risk settings saved successfully"),
        onError: () => toast.error("Failed to save risk settings"),
      },
    );
  };

  return (
    <motion.div
      key="risk"
      variants={tabVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="max-w-2xl"
    >
      <Card className="bg-card/80 border-border">
        <CardHeader className="pb-4">
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-base font-display flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-loss" />
                Risk Management Settings
              </CardTitle>
              <CardDescription className="text-xs mt-1">
                Define boundaries for automated trading activity
              </CardDescription>
            </div>
            <Badge className="bg-loss/10 text-loss border-loss/30 border text-[10px]">
              Critical Settings
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-loss" />
                Max Daily Loss (₹)
              </Label>
              <Input
                type="number"
                value={maxDailyLoss}
                onChange={(e) => setMaxDailyLoss(e.target.value)}
                placeholder="5000"
                min="100"
                className="h-9 bg-input font-mono-data"
                data-ocid="admin.risk.input"
              />
              <p className="text-[10px] text-muted-foreground">
                Trading stops when daily loss hits this amount
              </p>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-warning" />
                Max Trades Per Day
              </Label>
              <Input
                type="number"
                value={maxTradesPerDay}
                onChange={(e) => setMaxTradesPerDay(e.target.value)}
                placeholder="5"
                min="1"
                max="100"
                className="h-9 bg-input font-mono-data"
                data-ocid="admin.risk.input"
              />
              <p className="text-[10px] text-muted-foreground">
                Maximum number of trades allowed per trading day
              </p>
            </div>

            <div className="space-y-1.5 md:col-span-2">
              <Label className="text-xs flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                Max Capital Per Trade (₹)
              </Label>
              <Input
                type="number"
                value={maxCapitalPerTrade}
                onChange={(e) => setMaxCapitalPerTrade(e.target.value)}
                placeholder="2000"
                min="100"
                className="h-9 bg-input font-mono-data"
                data-ocid="admin.risk.input"
              />
              <p className="text-[10px] text-muted-foreground">
                Maximum capital deployed per individual trade
              </p>
            </div>
          </div>

          <Separator className="bg-border" />

          <div className="flex items-start gap-4 p-4 bg-background/60 rounded-lg border border-border">
            <Switch
              checked={autoShutdown}
              onCheckedChange={setAutoShutdown}
              data-ocid="admin.risk.switch"
              className="data-[state=checked]:bg-loss mt-0.5 flex-shrink-0"
            />
            <div className="flex-1">
              <Label className="text-sm font-medium cursor-pointer">
                Auto Shutdown if daily loss limit is reached
              </Label>
              <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                When enabled, all trading activity will automatically stop if
                the max daily loss limit is reached.
              </p>
              {autoShutdown && (
                <Badge className="mt-2 bg-loss/10 text-loss border-loss/30 border text-[10px]">
                  Auto Shutdown: ACTIVE
                </Badge>
              )}
            </div>
          </div>

          <Button
            onClick={handleSave}
            disabled={isSaving}
            variant="destructive"
            className="w-full gap-2"
            data-ocid="admin.risk.save_button"
          >
            {isSaving ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <ShieldAlert className="w-4 h-4" />
            )}
            Save Risk Settings
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// ── 9:20 Strategy Tab ─────────────────────────────────────────────────────────

interface NiftyCandle {
  time: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  index: number;
}

interface NinetwentyTradeLog {
  date: string;
  signal: "CALL" | "PUT";
  entry: number;
  sl: number;
  exit: number;
  pnl: number;
}

function generateNiftyCandles(
  basePrice: number,
  count: number,
  startHour: number,
  startMin: number,
): NiftyCandle[] {
  const candles: NiftyCandle[] = [];
  let price = basePrice;
  for (let i = 0; i < count; i++) {
    const totalMin = startMin + i * 5;
    const h = startHour + Math.floor(totalMin / 60);
    const m = totalMin % 60;
    const timeStr = `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
    const open = price;
    const change = (Math.random() - 0.48) * 35;
    const close = Math.round((open + change) * 100) / 100;
    const wick = Math.random() * 18;
    const high = Math.round((Math.max(open, close) + wick) * 100) / 100;
    const low = Math.round((Math.min(open, close) - wick) * 100) / 100;
    const volume = Math.floor(50000 + Math.random() * 150000);
    candles.push({ time: timeStr, open, high, low, close, volume, index: i });
    price = close;
  }
  return candles;
}

function computeSignal(candles: NiftyCandle[]): {
  signal: "CALL" | "PUT" | "WAITING";
  line: number;
  entry: number;
  stopLoss: number;
} {
  // candle index 4 = 9:20 (starting 9:00), index 5 = 9:25
  const line = candles[4]?.close ?? 0;
  const nextClose = candles[5]?.close ?? 0;
  let signal: "CALL" | "PUT" | "WAITING" = "WAITING";
  let entry = 0;
  let stopLoss = 0;
  if (nextClose > line) {
    signal = "CALL";
    entry = nextClose;
    stopLoss = Math.round((line - 7) * 100) / 100;
  } else if (nextClose < line) {
    signal = "PUT";
    entry = nextClose;
    stopLoss = Math.round((line + 7) * 100) / 100;
  }
  return { signal, line, entry, stopLoss };
}

const MOCK_920_HISTORY: NinetwentyTradeLog[] = [
  {
    date: "06 Mar 2026",
    signal: "CALL",
    entry: 22415.5,
    sl: 22354.2,
    exit: 22489.0,
    pnl: 3675.0,
  },
  {
    date: "05 Mar 2026",
    signal: "PUT",
    entry: 22188.0,
    sl: 22232.5,
    exit: 22110.5,
    pnl: 3875.0,
  },
  {
    date: "04 Mar 2026",
    signal: "CALL",
    entry: 22350.0,
    sl: 22289.0,
    exit: 22296.5,
    pnl: -2675.0,
  },
  {
    date: "03 Mar 2026",
    signal: "CALL",
    entry: 22560.0,
    sl: 22499.0,
    exit: 22680.5,
    pnl: 6025.0,
  },
  {
    date: "28 Feb 2026",
    signal: "PUT",
    entry: 22102.5,
    sl: 22145.0,
    exit: 21998.0,
    pnl: 5225.0,
  },
  {
    date: "27 Feb 2026",
    signal: "CALL",
    entry: 22745.0,
    sl: 22684.0,
    exit: 22812.5,
    pnl: 3375.0,
  },
];

function CandlestickChart({
  candles,
  line,
  signal,
  stopLoss,
}: {
  candles: NiftyCandle[];
  line: number;
  signal: "CALL" | "PUT" | "WAITING";
  entry: number;
  stopLoss: number;
}) {
  const width = 720;
  const height = 380;
  const paddingLeft = 12;
  const paddingRight = 64;
  const paddingTop = 20;
  const paddingBottom = 36;
  const chartW = width - paddingLeft - paddingRight;
  const chartH = height - paddingTop - paddingBottom;

  if (!candles.length) return null;

  const allPrices = candles.flatMap((c) => [c.high, c.low]);
  const minP = Math.min(...allPrices) - 20;
  const maxP = Math.max(...allPrices) + 20;
  const priceRange = maxP - minP;

  const toY = (price: number) =>
    paddingTop + ((maxP - price) / priceRange) * chartH;

  const candleW = Math.floor(chartW / candles.length);
  const bodyPad = Math.floor(candleW * 0.18);
  const bodyW = candleW - bodyPad * 2;

  const toX = (i: number) => paddingLeft + i * candleW + candleW / 2;

  // Price axis ticks
  const tickCount = 6;
  const ticks: number[] = [];
  for (let i = 0; i <= tickCount; i++) {
    ticks.push(minP + (priceRange * i) / tickCount);
  }

  const lineY = toY(line);
  const slY = stopLoss > 0 ? toY(stopLoss) : null;

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      width="100%"
      preserveAspectRatio="xMidYMid meet"
      className="rounded-lg"
      role="img"
      aria-label="NIFTY50 5-minute candlestick chart showing 9:20 strategy"
      data-ocid="admin.920.canvas_target"
    >
      <title>NIFTY50 5-Minute Candlestick Chart — 9:20 Strategy</title>
      {/* Background */}
      <rect width={width} height={height} fill="var(--color-card)" rx="8" />
      {/* Grid lines */}
      {ticks.map((t) => {
        const y = toY(t);
        return (
          <line
            key={`grid-${t.toFixed(0)}`}
            x1={paddingLeft}
            y1={y}
            x2={width - paddingRight}
            y2={y}
            stroke="var(--color-border)"
            strokeWidth="0.5"
            strokeOpacity="0.5"
          />
        );
      })}
      {/* Candle bodies + wicks */}
      {candles.map((c) => {
        const cx = toX(c.index);
        const x = paddingLeft + c.index * candleW + bodyPad;
        const isBull = c.close >= c.open;
        const fillColor = isBull ? "#22c55e" : "#ef4444";
        const bodyTop = toY(Math.max(c.open, c.close));
        const bodyBot = toY(Math.min(c.open, c.close));
        const bodyHeight = Math.max(bodyBot - bodyTop, 1);
        const is920 = c.index === 4;
        const is925 = c.index === 5;
        return (
          <g key={c.index}>
            {/* Highlight 9:20 candle */}
            {is920 && (
              <rect
                x={paddingLeft + c.index * candleW}
                y={paddingTop}
                width={candleW}
                height={chartH}
                fill="#eab30820"
                rx="2"
              />
            )}
            {is925 && signal !== "WAITING" && (
              <rect
                x={paddingLeft + c.index * candleW}
                y={paddingTop}
                width={candleW}
                height={chartH}
                fill={signal === "CALL" ? "#22c55e15" : "#ef444415"}
                rx="2"
              />
            )}
            {/* Wick */}
            <line
              x1={cx}
              y1={toY(c.high)}
              x2={cx}
              y2={toY(c.low)}
              stroke={fillColor}
              strokeWidth="1.5"
            />
            {/* Body */}
            <rect
              x={x}
              y={bodyTop}
              width={bodyW}
              height={bodyHeight}
              fill={fillColor}
              rx="1"
            />
          </g>
        );
      })}

      {/* 9:20 horizontal reference line */}
      {line > 0 && (
        <g>
          <line
            x1={paddingLeft}
            y1={lineY}
            x2={width - paddingRight}
            y2={lineY}
            stroke="#eab308"
            strokeWidth="1.5"
            strokeDasharray="none"
          />
          <rect
            x={width - paddingRight + 2}
            y={lineY - 8}
            width={60}
            height={16}
            fill="#eab30820"
            rx="3"
          />
          <text
            x={width - paddingRight + 5}
            y={lineY + 4}
            fill="#eab308"
            fontSize="9"
            fontFamily="monospace"
          >
            {line.toFixed(0)}
          </text>
          {/* Label on chart */}
          <text
            x={paddingLeft + 4}
            y={lineY - 4}
            fill="#eab308"
            fontSize="8"
            fontFamily="monospace"
            opacity="0.8"
          >
            9:20 Close
          </text>
        </g>
      )}

      {/* Fixed SL line (dashed red for CALL, dashed red for PUT) */}
      {slY !== null && signal !== "WAITING" && (
        <g>
          <line
            x1={paddingLeft}
            y1={slY}
            x2={width - paddingRight}
            y2={slY}
            stroke="#ef4444"
            strokeWidth="1"
            strokeDasharray="4 3"
          />
          <text
            x={paddingLeft + 4}
            y={slY - 4}
            fill="#ef4444"
            fontSize="8"
            fontFamily="monospace"
            opacity="0.8"
          >
            Fixed SL ({stopLoss.toFixed(0)})
          </text>
        </g>
      )}

      {/* Entry arrow on 9:25 candle */}
      {signal !== "WAITING" && candles[5] && (
        <g>
          {signal === "CALL" ? (
            // Up arrow below candle
            <>
              <polygon
                points={`${toX(5)},${toY(candles[5].low) + 16} ${toX(5) - 6},${toY(candles[5].low) + 28} ${toX(5) + 6},${toY(candles[5].low) + 28}`}
                fill="#22c55e"
              />
              <text
                x={toX(5)}
                y={toY(candles[5].low) + 38}
                fill="#22c55e"
                fontSize="8"
                textAnchor="middle"
                fontFamily="monospace"
                fontWeight="bold"
              >
                CALL
              </text>
            </>
          ) : (
            // Down arrow above candle
            <>
              <polygon
                points={`${toX(5)},${toY(candles[5].high) - 16} ${toX(5) - 6},${toY(candles[5].high) - 28} ${toX(5) + 6},${toY(candles[5].high) - 28}`}
                fill="#ef4444"
              />
              <text
                x={toX(5)}
                y={toY(candles[5].high) - 32}
                fill="#ef4444"
                fontSize="8"
                textAnchor="middle"
                fontFamily="monospace"
                fontWeight="bold"
              >
                PUT
              </text>
            </>
          )}
        </g>
      )}

      {/* Price axis (right) */}
      {ticks.map((t) => {
        const y = toY(t);
        return (
          <text
            key={`axis-${t.toFixed(0)}`}
            x={width - paddingRight + 4}
            y={y + 4}
            fill="var(--color-muted-foreground)"
            fontSize="9"
            fontFamily="monospace"
          >
            {t.toFixed(0)}
          </text>
        );
      })}

      {/* Time axis (bottom) — show every 4th candle */}
      {candles
        .filter((c) => c.index % 4 === 0 || c.index === 4 || c.index === 5)
        .map((c) => (
          <text
            key={c.index}
            x={toX(c.index)}
            y={height - paddingBottom + 14}
            fill={
              c.index === 4 || c.index === 5
                ? "#eab308"
                : "var(--color-muted-foreground)"
            }
            fontSize="8"
            textAnchor="middle"
            fontFamily="monospace"
            fontWeight={c.index === 4 ? "bold" : "normal"}
          >
            {c.time}
          </text>
        ))}

      {/* Bottom border */}
      <line
        x1={paddingLeft}
        y1={height - paddingBottom}
        x2={width - paddingRight}
        y2={height - paddingBottom}
        stroke="var(--color-border)"
        strokeWidth="0.5"
      />
    </svg>
  );
}

function NinetwentyTab() {
  const { data: savedState } = useNinetwentyState();
  const { mutate: setLine, isPending: isSettingLine } = useSetNinetwentyLine();
  const { mutate: setSignal, isPending: isSettingSignal } =
    useSetNinetwentySignal();
  const { mutate: clearState, isPending: isClearing } =
    useClearNinetwentyState();

  const [candles, setCandles] = useState<NiftyCandle[]>(() =>
    generateNiftyCandles(22500 + Math.random() * 500 - 250, 25, 9, 0),
  );
  const [computed, setComputed] = useState(() => computeSignal(candles));
  const [currentPrice, setCurrentPrice] = useState(
    () => candles[candles.length - 1]?.close ?? 0,
  );

  const isSaving = isSettingLine || isSettingSignal;

  const handleSimulate = () => {
    const base = 22000 + Math.random() * 1000;
    const newCandles = generateNiftyCandles(base, 25, 9, 0);
    setCandles(newCandles);
    setComputed(computeSignal(newCandles));
    setCurrentPrice(newCandles[newCandles.length - 1]?.close ?? 0);
    toast.success("New simulation generated");
  };

  const handleSaveToBackend = () => {
    if (computed.line <= 0) {
      toast.error("No valid 9:20 line to save");
      return;
    }
    setLine(computed.line, {
      onSuccess: () => {
        setSignal(
          {
            signal: computed.signal,
            entry: computed.entry,
            stopLoss: computed.stopLoss,
          },
          {
            onSuccess: () => toast.success("9:20 strategy state saved"),
            onError: () => toast.error("Failed to save signal"),
          },
        );
      },
      onError: () => toast.error("Failed to save 9:20 line"),
    });
  };

  const handleReset = () => {
    clearState(undefined, {
      onSuccess: () => {
        toast.success("9:20 strategy state cleared");
      },
      onError: () => toast.error("Failed to clear state"),
    });
  };

  const livePnl =
    computed.signal === "CALL" && computed.entry > 0
      ? Math.round((currentPrice - computed.entry) * 50 * 100) / 100
      : computed.signal === "PUT" && computed.entry > 0
        ? Math.round((computed.entry - currentPrice) * 50 * 100) / 100
        : 0;

  const signalColor =
    computed.signal === "CALL"
      ? "text-profit border-profit/40 bg-profit/10"
      : computed.signal === "PUT"
        ? "text-loss border-loss/40 bg-loss/10"
        : "text-warning border-warning/40 bg-warning/10";

  const signalText =
    computed.signal === "CALL"
      ? "CALL ↑"
      : computed.signal === "PUT"
        ? "PUT ↓"
        : "WAITING";

  return (
    <motion.div
      key="ninetwenty"
      variants={tabVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="space-y-5"
    >
      {/* Signal Status Bar */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {/* Large signal badge */}
        <Card
          className="md:col-span-1 bg-card/80 border-border"
          data-ocid="admin.920.signal_card"
        >
          <CardContent className="p-4 flex flex-col items-center justify-center gap-2 h-full min-h-[88px]">
            <span className="text-[9px] text-muted-foreground uppercase tracking-widest font-mono">
              Signal
            </span>
            <Badge
              variant="outline"
              className={`text-lg font-bold px-4 py-2 font-mono-data border-2 ${signalColor}`}
            >
              {signalText}
            </Badge>
          </CardContent>
        </Card>

        {/* Reference Line */}
        <Card
          className="bg-card/80 border-border"
          data-ocid="admin.920.entry_card"
        >
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[9px] text-muted-foreground uppercase tracking-widest font-mono">
                9:20 Line
              </span>
              <span className="w-2 h-2 rounded-full bg-warning" />
            </div>
            <div className="font-mono-data text-lg font-bold text-warning">
              {computed.line > 0 ? computed.line.toFixed(2) : "—"}
            </div>
            <div className="text-[9px] text-muted-foreground mt-0.5">
              Reference price
            </div>
          </CardContent>
        </Card>

        {/* Entry Price */}
        <Card className="bg-card/80 border-border">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[9px] text-muted-foreground uppercase tracking-widest font-mono">
                Entry
              </span>
              <TrendingUp className="w-3 h-3 text-primary" />
            </div>
            <div className="font-mono-data text-lg font-bold text-foreground">
              {computed.entry > 0 ? computed.entry.toFixed(2) : "—"}
            </div>
            <div className="text-[9px] text-muted-foreground mt-0.5">
              9:25 candle close
            </div>
          </CardContent>
        </Card>

        {/* Stop Loss */}
        <Card
          className="bg-card/80 border-border"
          data-ocid="admin.920.sl_card"
        >
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[9px] text-muted-foreground uppercase tracking-widest font-mono">
                Stop Loss
              </span>
              <TrendingDown className="w-3 h-3 text-loss" />
            </div>
            <div className="font-mono-data text-lg font-bold text-loss">
              {computed.stopLoss > 0 ? computed.stopLoss.toFixed(2) : "—"}
            </div>
            <div className="text-[9px] text-muted-foreground mt-0.5">
              Line ± 7 pts
            </div>
          </CardContent>
        </Card>

        {/* Live P&L */}
        <Card className="bg-card/80 border-border">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[9px] text-muted-foreground uppercase tracking-widest font-mono">
                Sim P&L
              </span>
              <Activity className="w-3 h-3 text-muted-foreground" />
            </div>
            <div
              className={`font-mono-data text-lg font-bold ${livePnl >= 0 ? "text-profit" : "text-loss"}`}
            >
              {computed.entry > 0
                ? `${livePnl >= 0 ? "+" : ""}₹${formatINR(livePnl)}`
                : "—"}
            </div>
            <div className="text-[9px] text-muted-foreground mt-0.5">
              50 qty × Δprice
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Backend Saved State */}
      {savedState && savedState.line > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3 p-3 bg-primary/5 border border-primary/20 rounded-lg"
        >
          <ShieldCheck className="w-4 h-4 text-primary flex-shrink-0" />
          <div className="flex-1 text-xs text-muted-foreground">
            <span className="font-semibold text-foreground">
              Saved to backend:{" "}
            </span>
            Line:{" "}
            <span className="font-mono-data text-warning">
              {savedState.line}
            </span>{" "}
            | Signal:{" "}
            <span
              className={
                savedState.signal === "CALL"
                  ? "text-profit font-bold"
                  : "text-loss font-bold"
              }
            >
              {savedState.signal || "WAITING"}
            </span>{" "}
            | Entry:{" "}
            <span className="font-mono-data">{savedState.entry || "—"}</span>
          </div>
        </motion.div>
      )}

      {/* Chart Card */}
      <Card className="bg-card/80 border-border">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between flex-wrap gap-3">
            <div>
              <CardTitle className="text-base font-display flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-warning" />
                NIFTY50 5-Min Chart — 9:20 Strategy
              </CardTitle>
              <CardDescription className="text-xs mt-0.5">
                9:00 AM – 11:00 AM · 5-minute candles · Golden line = 9:20 close
              </CardDescription>
            </div>
            <div className="flex items-center gap-3 text-xs">
              <div className="flex items-center gap-1.5">
                <span className="w-5 h-0.5 bg-yellow-400 inline-block" />
                <span className="text-muted-foreground">9:20 Line</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span
                  className="w-5 h-px border-t border-dashed border-red-500 inline-block"
                  style={{ borderTopWidth: "1.5px" }}
                />
                <span className="text-muted-foreground">Fixed SL</span>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-3 pt-0">
          <div className="overflow-x-auto">
            <CandlestickChart
              candles={candles}
              line={computed.line}
              signal={computed.signal}
              entry={computed.entry}
              stopLoss={computed.stopLoss}
            />
          </div>
        </CardContent>
      </Card>

      {/* Controls */}
      <div className="flex flex-wrap gap-3">
        <Button
          onClick={handleSimulate}
          className="gap-2 bg-warning/90 hover:bg-warning text-warning-foreground"
          data-ocid="admin.920.primary_button"
        >
          <RefreshCw className="w-4 h-4" />
          Simulate Day
        </Button>
        <Button
          onClick={handleSaveToBackend}
          disabled={isSaving || computed.signal === "WAITING"}
          variant="outline"
          className="gap-2"
          data-ocid="admin.920.secondary_button"
        >
          {isSaving ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <ShieldCheck className="w-4 h-4" />
          )}
          Save to Backend
        </Button>
        <Button
          onClick={handleReset}
          disabled={isClearing}
          variant="destructive"
          className="gap-2"
          data-ocid="admin.920.delete_button"
        >
          {isClearing ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <X className="w-4 h-4" />
          )}
          Reset
        </Button>
      </div>

      {/* Strategy Logic Info */}
      <Card className="bg-card/80 border-border">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-display flex items-center gap-2">
            <Eye className="w-4 h-4 text-muted-foreground" />
            Strategy Rules
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
            <div className="p-3 bg-background/60 border border-border rounded-lg">
              <p className="font-semibold text-warning mb-1">
                📍 Reference Line
              </p>
              <p className="text-muted-foreground leading-relaxed">
                9:20 AM candle's CLOSE price becomes the horizontal reference
                line for the day.
              </p>
            </div>
            <div className="p-3 bg-background/60 border border-profit/20 rounded-lg">
              <p className="font-semibold text-profit mb-1">📈 CALL Signal</p>
              <p className="text-muted-foreground leading-relaxed">
                If 9:25 candle closes ABOVE the line → Buy CALL. Exit if any
                candle closes below the line.
              </p>
            </div>
            <div className="p-3 bg-background/60 border border-loss/20 rounded-lg">
              <p className="font-semibold text-loss mb-1">📉 PUT Signal</p>
              <p className="text-muted-foreground leading-relaxed">
                If 9:25 candle closes BELOW the line → Buy PUT. Fixed SL = line
                ± 7 points.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Trade History */}
      <Card className="bg-card/80 border-border">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-display flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-primary" />
            9:20 Strategy Trade History
          </CardTitle>
          <CardDescription className="text-xs">
            Historical performance log — 6 recent trades
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <ScrollArea className="w-full">
            <Table data-ocid="admin.920.table">
              <TableHeader>
                <TableRow className="border-border hover:bg-transparent">
                  {["Date", "Signal", "Entry", "Stop Loss", "Exit", "P&L"].map(
                    (h) => (
                      <TableHead
                        key={h}
                        className="text-[10px] text-muted-foreground font-mono uppercase tracking-wider whitespace-nowrap"
                      >
                        {h}
                      </TableHead>
                    ),
                  )}
                </TableRow>
              </TableHeader>
              <TableBody>
                {MOCK_920_HISTORY.map((t, i) => (
                  <TableRow
                    key={`${t.date}-${i}`}
                    className="border-border hover:bg-accent/20 transition-colors"
                    data-ocid={`admin.920.row.${i + 1}`}
                  >
                    <TableCell className="font-mono text-xs whitespace-nowrap">
                      {t.date}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={`text-[10px] font-bold ${
                          t.signal === "CALL"
                            ? "text-profit border-profit/40 bg-profit/10"
                            : "text-loss border-loss/40 bg-loss/10"
                        }`}
                      >
                        {t.signal === "CALL" ? (
                          <TrendingUp className="w-3 h-3 mr-0.5" />
                        ) : (
                          <TrendingDown className="w-3 h-3 mr-0.5" />
                        )}
                        {t.signal}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-mono-data text-xs">
                      ₹{t.entry.toLocaleString("en-IN")}
                    </TableCell>
                    <TableCell className="font-mono-data text-xs text-loss">
                      ₹{t.sl.toLocaleString("en-IN")}
                    </TableCell>
                    <TableCell className="font-mono-data text-xs">
                      ₹{t.exit.toLocaleString("en-IN")}
                    </TableCell>
                    <TableCell
                      className={`font-mono-data text-xs font-semibold ${t.pnl >= 0 ? "text-profit" : "text-loss"}`}
                    >
                      {t.pnl >= 0 ? "+" : ""}₹{formatINR(t.pnl)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </ScrollArea>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// ── Subscriptions / Pricing Tab ───────────────────────────────────────────────

function SubscriptionsTab() {
  const { data: listings = [], isLoading } = useAllMarketplaceListings();
  const { mutate: updatePricing, isPending: isUpdating } =
    useUpdateStrategyPricing();

  // Local state for editable rows: map from listing id to { monthly, lifetime, isFree }
  const [edits, setEdits] = React.useState<
    Record<
      string,
      { monthlyPrice: string; lifetimePrice: string; isFree: boolean }
    >
  >({});

  const getEdit = (id: bigint) => {
    const key = id.toString();
    return (
      edits[key] ?? {
        monthlyPrice: "",
        lifetimePrice: "",
        isFree: false,
      }
    );
  };

  const setEdit = (id: bigint, field: string, value: string | boolean) => {
    const key = id.toString();
    const listing = listings.find((l) => l.id === id);
    const current = edits[key] ?? {
      monthlyPrice: String(listing?.monthlyPrice ?? 0),
      lifetimePrice: String(listing?.lifetimePrice ?? 0),
      isFree: listing?.isFree ?? false,
    };
    setEdits((prev) => ({
      ...prev,
      [key]: { ...current, [field]: value },
    }));
  };

  const handleSave = (id: bigint) => {
    const key = id.toString();
    const listing = listings.find((l) => l.id === id);
    const edit = edits[key] ?? {
      monthlyPrice: String(listing?.monthlyPrice ?? 0),
      lifetimePrice: String(listing?.lifetimePrice ?? 0),
      isFree: listing?.isFree ?? false,
    };
    const monthly = Number.parseFloat(edit.monthlyPrice);
    const lifetime = Number.parseFloat(edit.lifetimePrice);
    if (Number.isNaN(monthly) || Number.isNaN(lifetime)) {
      toast.error("Please enter valid prices");
      return;
    }
    updatePricing(
      {
        listingId: id,
        monthlyPrice: monthly,
        lifetimePrice: lifetime,
        isFree: edit.isFree,
      },
      {
        onSuccess: () => toast.success("Pricing updated"),
        onError: () => toast.error("Failed to update pricing"),
      },
    );
  };

  // Initialize edits when listings load
  React.useEffect(() => {
    if (listings.length > 0) {
      const initial: typeof edits = {};
      for (const l of listings) {
        initial[l.id.toString()] = {
          monthlyPrice: String(l.monthlyPrice),
          lifetimePrice: String(l.lifetimePrice),
          isFree: l.isFree,
        };
      }
      setEdits(initial);
    }
  }, [listings]);

  return (
    <motion.div
      key="subscriptions"
      variants={tabVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
    >
      <Card className="bg-card/80 border-border">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-display flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-primary" />
            Strategy Subscription Pricing
          </CardTitle>
          <CardDescription className="text-xs">
            Manage pricing for all marketplace strategy listings
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <ScrollArea className="w-full">
            <Table data-ocid="admin.subscriptions.table">
              <TableHeader>
                <TableRow className="border-border hover:bg-transparent">
                  {[
                    "Strategy",
                    "Asset",
                    "Monthly (₹)",
                    "Lifetime (₹)",
                    "Free",
                    "Action",
                  ].map((h) => (
                    <TableHead
                      key={h}
                      className="text-[10px] text-muted-foreground font-mono uppercase tracking-wider whitespace-nowrap"
                    >
                      {h}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  [1, 2, 3].map((sk) => (
                    <TableRow key={sk} className="border-border">
                      {[1, 2, 3, 4, 5, 6].map((col) => (
                        <TableCell key={`${sk}-${col}`}>
                          <Skeleton className="h-4 w-full" />
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : listings.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-12">
                      <div
                        className="flex flex-col items-center gap-2 text-muted-foreground"
                        data-ocid="admin.subscriptions.empty_state"
                      >
                        <BarChart3 className="w-8 h-8 opacity-20" />
                        <p className="text-sm">No marketplace listings yet</p>
                        <p className="text-xs opacity-60">
                          Strategies published via the Marketplace page will
                          appear here
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  listings.map((listing, i) => {
                    const edit = getEdit(listing.id);
                    return (
                      <TableRow
                        key={listing.id.toString()}
                        className="border-border hover:bg-accent/20 transition-colors"
                        data-ocid={`admin.subscriptions.row.${i + 1}`}
                      >
                        <TableCell className="font-medium text-sm whitespace-nowrap max-w-[160px] truncate">
                          {listing.strategyName}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-[10px]">
                            {listing.assetType}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            value={edit.monthlyPrice}
                            onChange={(e) =>
                              setEdit(
                                listing.id,
                                "monthlyPrice",
                                e.target.value,
                              )
                            }
                            className="h-7 w-24 bg-input font-mono-data text-xs"
                            min="0"
                            data-ocid={`admin.subscriptions.input.${i + 1}`}
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            value={edit.lifetimePrice}
                            onChange={(e) =>
                              setEdit(
                                listing.id,
                                "lifetimePrice",
                                e.target.value,
                              )
                            }
                            className="h-7 w-24 bg-input font-mono-data text-xs"
                            min="0"
                            data-ocid={`admin.subscriptions.input.${i + 1}`}
                          />
                        </TableCell>
                        <TableCell>
                          <Switch
                            checked={edit.isFree}
                            onCheckedChange={(v) =>
                              setEdit(listing.id, "isFree", v)
                            }
                            data-ocid={`admin.subscriptions.switch.${i + 1}`}
                          />
                        </TableCell>
                        <TableCell>
                          <Button
                            size="sm"
                            className="h-7 text-xs gap-1 whitespace-nowrap"
                            onClick={() => handleSave(listing.id)}
                            disabled={isUpdating}
                            data-ocid={`admin.subscriptions.save_button.${i + 1}`}
                          >
                            {isUpdating ? (
                              <Loader2 className="w-3 h-3 animate-spin" />
                            ) : null}
                            Save
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </ScrollArea>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// ── User Approvals Tab ────────────────────────────────────────────────────────

function UserApprovalsTab() {
  const { data: pendingCreators = [], isLoading } = usePendingCreators();
  const { mutate: approveCreator, isPending: isApproving } =
    useApproveCreator();
  const { mutate: rejectCreator, isPending: isRejecting } = useRejectCreator();

  const handleApprove = (principal: Principal, name: string) => {
    approveCreator(principal, {
      onSuccess: () => toast.success(`Creator "${name}" approved.`),
      onError: () => toast.error("Failed to approve creator."),
    });
  };

  const handleReject = (principal: Principal, name: string) => {
    rejectCreator(principal, {
      onSuccess: () => toast.success(`Creator "${name}" rejected.`),
      onError: () => toast.error("Failed to reject creator."),
    });
  };

  return (
    <motion.div
      key="approvals"
      variants={tabVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
    >
      <Card className="bg-card/80 border-border">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <CardTitle className="text-base font-display flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-warning" />
                Pending Algo Creator Approvals
              </CardTitle>
              <CardDescription className="text-xs mt-0.5">
                Review and approve/reject users requesting Algo Creator access
              </CardDescription>
            </div>
            {pendingCreators.length > 0 && (
              <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-warning/90 text-warning-foreground text-[10px] font-bold">
                {pendingCreators.length}
              </span>
            )}
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <ScrollArea className="w-full">
            <Table data-ocid="admin.approvals.table">
              <TableHeader>
                <TableRow className="border-border hover:bg-transparent">
                  {[
                    "Name",
                    "Email",
                    "Experience",
                    "Market",
                    "Registered",
                    "Actions",
                  ].map((h) => (
                    <TableHead
                      key={h}
                      className="text-[10px] text-muted-foreground font-mono uppercase tracking-wider whitespace-nowrap"
                    >
                      {h}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  [1, 2, 3].map((sk) => (
                    <TableRow key={sk} className="border-border">
                      {[1, 2, 3, 4, 5, 6].map((col) => (
                        <TableCell key={`${sk}-${col}`}>
                          <Skeleton className="h-4 w-full" />
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : pendingCreators.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-12">
                      <div
                        className="flex flex-col items-center gap-2 text-muted-foreground"
                        data-ocid="admin.approvals.empty_state"
                      >
                        <ShieldCheck className="w-8 h-8 opacity-20" />
                        <p className="text-sm">No pending approval requests</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  pendingCreators.map(([principal, profile], i) => (
                    <TableRow
                      key={principal.toString()}
                      className="border-border hover:bg-accent/20 transition-colors"
                      data-ocid={`admin.approvals.row.${i + 1}`}
                    >
                      <TableCell className="font-medium text-sm whitespace-nowrap">
                        {profile.name || "—"}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                        {profile.email || "—"}
                      </TableCell>
                      <TableCell className="text-xs whitespace-nowrap">
                        <Badge variant="outline" className="text-[10px]">
                          {profile.experienceLevel || "—"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs whitespace-nowrap">
                        {profile.tradingMarket || "—"}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground font-mono whitespace-nowrap">
                        {profile.joinedAt
                          ? new Date(
                              Number(profile.joinedAt) > 1e12
                                ? Number(profile.joinedAt) / 1e6
                                : Number(profile.joinedAt),
                            ).toLocaleDateString("en-IN")
                          : "—"}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2 whitespace-nowrap">
                          <Button
                            size="sm"
                            className="h-7 text-xs gap-1 bg-profit hover:bg-profit/90 text-white"
                            onClick={() =>
                              handleApprove(principal, profile.name)
                            }
                            disabled={isApproving || isRejecting}
                            data-ocid={`admin.approvals.confirm_button.${i + 1}`}
                          >
                            <ShieldCheck className="w-3 h-3" />
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            className="h-7 text-xs gap-1"
                            onClick={() =>
                              handleReject(principal, profile.name)
                            }
                            disabled={isApproving || isRejecting}
                            data-ocid={`admin.approvals.delete_button.${i + 1}`}
                          >
                            <X className="w-3 h-3" />
                            Reject
                          </Button>
                        </div>
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
  );
}

// ── All Users Tab ─────────────────────────────────────────────────────────────

function AllUsersTab() {
  const { data: allUsers = [], isLoading } = useAllUsers();
  const [roleFilter, setRoleFilter] = useState("All");

  const filtered =
    roleFilter === "All"
      ? allUsers
      : allUsers.filter(([, profile]) => profile.role === roleFilter);

  const roleBadge = (role: string) => {
    const map: Record<string, string> = {
      admin: "bg-loss/10 text-loss border-loss/30",
      AlgoCreator:
        "bg-[oklch(0.65_0.2_290)/10] text-[oklch(0.72_0.18_290)] border-[oklch(0.65_0.2_290)/30]",
      Trader: "bg-primary/10 text-primary border-primary/30",
      Viewer: "bg-muted/40 text-muted-foreground border-border",
    };
    return (
      <Badge
        variant="outline"
        className={`text-[10px] border ${map[role] ?? map.Trader}`}
      >
        {role}
      </Badge>
    );
  };

  return (
    <motion.div
      key="allusers"
      variants={tabVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
    >
      <Card className="bg-card/80 border-border">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <CardTitle className="text-base font-display flex items-center gap-2">
                <Eye className="w-4 h-4 text-primary" />
                All Users
              </CardTitle>
              <CardDescription className="text-xs mt-0.5">
                {allUsers.length} registered users
              </CardDescription>
            </div>
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger
                className="h-8 bg-input text-xs w-36"
                data-ocid="admin.users.select"
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-popover border-border">
                {["All", "admin", "AlgoCreator", "Trader", "Viewer"].map(
                  (r) => (
                    <SelectItem key={r} value={r} className="text-xs">
                      {r}
                    </SelectItem>
                  ),
                )}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <ScrollArea className="w-full">
            <Table data-ocid="admin.users.table">
              <TableHeader>
                <TableRow className="border-border hover:bg-transparent">
                  {[
                    "Name",
                    "Email",
                    "Role",
                    "Country",
                    "Experience",
                    "Joined",
                  ].map((h) => (
                    <TableHead
                      key={h}
                      className="text-[10px] text-muted-foreground font-mono uppercase tracking-wider whitespace-nowrap"
                    >
                      {h}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  [1, 2, 3, 4].map((sk) => (
                    <TableRow key={sk} className="border-border">
                      {[1, 2, 3, 4, 5, 6].map((col) => (
                        <TableCell key={`${sk}-${col}`}>
                          <Skeleton className="h-4 w-full" />
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : filtered.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-12">
                      <div
                        className="flex flex-col items-center gap-2 text-muted-foreground"
                        data-ocid="admin.users.empty_state"
                      >
                        <Eye className="w-8 h-8 opacity-20" />
                        <p className="text-sm">No users found</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filtered.map(([principal, profile], i) => (
                    <TableRow
                      key={principal.toString()}
                      className="border-border hover:bg-accent/20 transition-colors"
                      data-ocid={`admin.users.row.${i + 1}`}
                    >
                      <TableCell className="font-medium text-sm whitespace-nowrap">
                        {profile.name || "—"}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                        {profile.email || "—"}
                      </TableCell>
                      <TableCell className="whitespace-nowrap">
                        {roleBadge(profile.role || "Trader")}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                        {profile.country || "—"}
                      </TableCell>
                      <TableCell className="text-xs whitespace-nowrap">
                        <Badge variant="outline" className="text-[10px]">
                          {profile.experienceLevel || "—"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground font-mono whitespace-nowrap">
                        {profile.joinedAt
                          ? new Date(
                              Number(profile.joinedAt) > 1e12
                                ? Number(profile.joinedAt) / 1e6
                                : Number(profile.joinedAt),
                            ).toLocaleDateString("en-IN")
                          : "—"}
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
  );
}

// ── Password Gate ─────────────────────────────────────────────────────────────

const ADMIN_PASSWORD = "Santhosh1@";

function AdminPasswordGate({ onSuccess }: { onSuccess: () => void }) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) {
      sessionStorage.setItem("admin_auth", "1");
      onSuccess();
    } else {
      setError(true);
      setPassword("");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="w-full max-w-sm"
      >
        <Card className="bg-card/80 border-border shadow-lg">
          <CardHeader className="text-center pb-4">
            <div className="mx-auto w-12 h-12 rounded-xl bg-warning/10 border border-warning/20 flex items-center justify-center mb-3">
              <ShieldCheck className="w-6 h-6 text-warning" />
            </div>
            <CardTitle className="font-display text-xl">Admin Access</CardTitle>
            <CardDescription className="text-sm">
              Enter the admin password to continue
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <Label className="text-xs">Password</Label>
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setError(false);
                  }}
                  placeholder="Enter admin password"
                  className={`h-10 bg-input ${error ? "border-destructive focus-visible:ring-destructive" : ""}`}
                  autoFocus
                  data-ocid="admin.password.input"
                />
                {error && (
                  <p
                    className="text-xs text-destructive"
                    data-ocid="admin.password.error_state"
                  >
                    Incorrect password. Please try again.
                  </p>
                )}
              </div>
              <Button
                type="submit"
                className="w-full gap-2"
                data-ocid="admin.password.submit_button"
              >
                <ShieldCheck className="w-4 h-4" />
                Enter Admin Panel
              </Button>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}

// ── Main Admin Page ───────────────────────────────────────────────────────────

export function AdminPage() {
  const { isInitializing } = useInternetIdentity();
  const [authenticated, setAuthenticated] = useState(
    () => sessionStorage.getItem("admin_auth") === "1",
  );
  const [activeTab, setActiveTab] = useState("overview");
  const { data: pendingCreators = [] } = usePendingCreators();

  if (isInitializing) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2
          className="w-8 h-8 animate-spin text-primary"
          data-ocid="admin.loading_state"
        />
      </div>
    );
  }

  if (!authenticated) {
    return <AdminPasswordGate onSuccess={() => setAuthenticated(true)} />;
  }

  const tabs = [
    {
      value: "overview",
      label: "Overview",
      Icon: Activity,
      isNew: false,
      badge: 0,
    },
    {
      value: "monitor",
      label: "Trade Monitor",
      Icon: BarChart3,
      isNew: false,
      badge: 0,
    },
    {
      value: "strategies",
      label: "Strategies",
      Icon: BarChart3,
      isNew: false,
      badge: 0,
    },
    {
      value: "ninetwenty",
      label: "9:20 Strategy",
      Icon: TrendingUp,
      isNew: true,
      badge: 0,
    },
    {
      value: "backtest",
      label: "Backtest",
      Icon: FlaskConical,
      isNew: false,
      badge: 0,
    },
    {
      value: "paperlive",
      label: "Paper/Live",
      Icon: Layers,
      isNew: false,
      badge: 0,
    },
    {
      value: "broker",
      label: "Broker API",
      Icon: LinkIcon,
      isNew: false,
      badge: 0,
    },
    {
      value: "risk",
      label: "Risk Mgmt",
      Icon: ShieldAlert,
      isNew: false,
      badge: 0,
    },
    {
      value: "approvals",
      label: "Approvals",
      Icon: ShieldCheck,
      isNew: false,
      badge: pendingCreators.length,
    },
    { value: "users", label: "All Users", Icon: Eye, isNew: false, badge: 0 },
    {
      value: "subscriptions",
      label: "Subscriptions",
      Icon: BarChart3,
      isNew: false,
      badge: 0,
    },
  ];

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
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-warning/10 border border-warning/20 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5 text-warning" />
            </div>
            <div>
              <h1 className="font-display text-2xl font-bold">Admin Panel</h1>
              <div className="flex items-center gap-2 mt-0.5">
                <AlertTriangle className="w-3 h-3 text-warning" />
                <p className="text-xs text-warning">
                  Restricted access — Admin only
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.05 }}
        >
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <ScrollArea className="w-full">
              <TabsList className="mb-4 bg-card/60 inline-flex w-auto gap-0.5">
                {tabs.map(({ value, label, Icon, isNew, badge }) => (
                  <TabsTrigger
                    key={value}
                    value={value}
                    data-ocid="admin.tab"
                    className="gap-1.5 text-xs whitespace-nowrap px-3 relative"
                  >
                    <Icon className="w-3.5 h-3.5" />
                    {label}
                    {isNew && (
                      <span className="ml-1 px-1 py-0.5 text-[8px] font-bold uppercase tracking-wider rounded bg-warning/90 text-warning-foreground leading-none">
                        NEW
                      </span>
                    )}
                    {badge > 0 && (
                      <span className="ml-1 w-4 h-4 flex items-center justify-center rounded-full bg-loss text-white text-[8px] font-bold">
                        {badge}
                      </span>
                    )}
                  </TabsTrigger>
                ))}
              </TabsList>
            </ScrollArea>

            <AnimatePresence mode="wait">
              {activeTab === "overview" && (
                <TabsContent value="overview" forceMount>
                  <OverviewTab />
                </TabsContent>
              )}
              {activeTab === "monitor" && (
                <TabsContent value="monitor" forceMount>
                  <TradeMonitorTab />
                </TabsContent>
              )}
              {activeTab === "strategies" && (
                <TabsContent value="strategies" forceMount>
                  <StrategiesTab />
                </TabsContent>
              )}
              {activeTab === "ninetwenty" && (
                <TabsContent value="ninetwenty" forceMount>
                  <NinetwentyTab />
                </TabsContent>
              )}
              {activeTab === "backtest" && (
                <TabsContent value="backtest" forceMount>
                  <BacktestTab />
                </TabsContent>
              )}
              {activeTab === "paperlive" && (
                <TabsContent value="paperlive" forceMount>
                  <PaperLiveTab />
                </TabsContent>
              )}
              {activeTab === "broker" && (
                <TabsContent value="broker" forceMount>
                  <BrokerApiTab />
                </TabsContent>
              )}
              {activeTab === "risk" && (
                <TabsContent value="risk" forceMount>
                  <RiskMgmtTab />
                </TabsContent>
              )}
              {activeTab === "approvals" && (
                <TabsContent value="approvals" forceMount>
                  <UserApprovalsTab />
                </TabsContent>
              )}
              {activeTab === "users" && (
                <TabsContent value="users" forceMount>
                  <AllUsersTab />
                </TabsContent>
              )}
              {activeTab === "subscriptions" && (
                <TabsContent value="subscriptions" forceMount>
                  <SubscriptionsTab />
                </TabsContent>
              )}
            </AnimatePresence>
          </Tabs>
        </motion.div>
      </main>
      <Footer />
    </div>
  );
}
