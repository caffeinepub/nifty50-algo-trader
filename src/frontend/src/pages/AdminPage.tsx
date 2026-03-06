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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Activity,
  AlertTriangle,
  BarChart3,
  DollarSign,
  Loader2,
  Plus,
  ShieldCheck,
  ToggleLeft,
  ToggleRight,
  TrendingDown,
  TrendingUp,
  Users,
} from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import type { Trade } from "../backend.d";
import { Footer } from "../components/trading/Footer";
import { Header } from "../components/trading/Header";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import {
  useAddStrategy,
  useAdminStats,
  useAllTrades,
  useStrategies,
  useToggleStrategy,
} from "../hooks/useQueries";

function useAuthGuard() {
  const { isInitializing } = useInternetIdentity();
  return { isInitializing };
}

// ── Stats Card ────────────────────────────────────────────────────────────────

function AdminStatCard({
  title,
  value,
  icon: Icon,
  color = "text-primary",
  loading,
}: {
  title: string;
  value: string | number;
  icon: React.ElementType;
  color?: string;
  loading?: boolean;
}) {
  return (
    <Card className="bg-card/80 border-border">
      <CardContent className="p-5">
        {loading ? (
          <div className="space-y-2">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-8 w-28" />
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs text-muted-foreground uppercase tracking-wider font-mono">
                {title}
              </span>
              <Icon className={`w-4 h-4 ${color}`} />
            </div>
            <div className="font-mono-data text-2xl font-bold">{value}</div>
          </>
        )}
      </CardContent>
    </Card>
  );
}

// ── Overview Tab ──────────────────────────────────────────────────────────────

function OverviewTab() {
  const { data: stats, isLoading } = useAdminStats();

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <AdminStatCard
          title="Total Users"
          value={stats ? Number(stats.totalUsers) : "—"}
          icon={Users}
          loading={isLoading}
        />
        <AdminStatCard
          title="Total Trades"
          value={stats ? Number(stats.totalTrades) : "—"}
          icon={BarChart3}
          loading={isLoading}
        />
        <AdminStatCard
          title="Total P&L"
          value={
            stats
              ? `${stats.totalPnl >= 0 ? "+" : ""}₹${stats.totalPnl.toLocaleString("en-IN", { maximumFractionDigits: 2 })}`
              : "—"
          }
          icon={DollarSign}
          color={
            stats
              ? stats.totalPnl >= 0
                ? "text-profit"
                : "text-loss"
              : "text-primary"
          }
          loading={isLoading}
        />
        <AdminStatCard
          title="Open Trades"
          value={stats ? Number(stats.openTrades) : "—"}
          icon={Activity}
          loading={isLoading}
        />
      </div>

      <Card className="bg-card/80 border-border">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-display">System Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              {
                label: "Backend Canister",
                status: "Online",
                color: "text-profit",
              },
              {
                label: "Market Data Feed",
                status: "Active",
                color: "text-profit",
              },
              {
                label: "Algorithm Engine",
                status: "Ready",
                color: "text-warning",
              },
            ].map((item) => (
              <div
                key={item.label}
                className="flex items-center gap-3 p-3 rounded-lg bg-background/60 border border-border"
              >
                <div
                  className={`w-2 h-2 rounded-full ${item.color === "text-profit" ? "bg-profit" : "bg-warning"} animate-pulse-dot`}
                />
                <div>
                  <p className="text-xs text-muted-foreground">{item.label}</p>
                  <p className={`text-sm font-semibold ${item.color}`}>
                    {item.status}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ── Users Tab ─────────────────────────────────────────────────────────────────

function UsersTab() {
  const MOCK_USERS = [
    {
      id: "user-1",
      name: "Arjun Sharma",
      email: "arjun@example.com",
      role: "user",
      trades: 24,
      pnl: 12450,
    },
    {
      id: "user-2",
      name: "Priya Patel",
      email: "priya@example.com",
      role: "user",
      trades: 38,
      pnl: -3210,
    },
    {
      id: "user-3",
      name: "Vikram Singh",
      email: "vikram@example.com",
      role: "user",
      trades: 61,
      pnl: 28730,
    },
    {
      id: "user-4",
      name: "Deepa Nair",
      email: "deepa@example.com",
      role: "admin",
      trades: 15,
      pnl: 8900,
    },
    {
      id: "user-5",
      name: "Rajesh Kumar",
      email: "rajesh@example.com",
      role: "user",
      trades: 7,
      pnl: 1200,
    },
  ];

  return (
    <Card className="bg-card/80 border-border">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-display flex items-center gap-2">
            <Users className="w-4 h-4 text-primary" />
            Registered Users
          </CardTitle>
          <Badge variant="outline" className="font-mono text-xs">
            {MOCK_USERS.length} users
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow className="border-border hover:bg-transparent">
              {["Name", "Email", "Role", "Trades", "P&L", "Status"].map((h) => (
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
            {MOCK_USERS.map((u, i) => (
              <TableRow
                key={u.id}
                className="border-border hover:bg-accent/20 transition-colors"
                data-ocid={`admin.users.row.${i + 1}`}
              >
                <TableCell className="text-sm font-medium">{u.name}</TableCell>
                <TableCell className="text-xs text-muted-foreground font-mono">
                  {u.email}
                </TableCell>
                <TableCell>
                  <Badge
                    variant="outline"
                    className={
                      u.role === "admin"
                        ? "text-warning border-warning/30 text-xs"
                        : "text-xs"
                    }
                  >
                    {u.role}
                  </Badge>
                </TableCell>
                <TableCell className="font-mono-data text-xs">
                  {u.trades}
                </TableCell>
                <TableCell
                  className={`font-mono-data text-xs font-semibold ${u.pnl >= 0 ? "text-profit" : "text-loss"}`}
                >
                  {u.pnl >= 0 ? "+" : ""}₹{u.pnl.toLocaleString("en-IN")}
                </TableCell>
                <TableCell>
                  <Badge
                    variant="outline"
                    className="text-profit border-profit/30 bg-profit/5 text-xs"
                  >
                    Active
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
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
  });

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
      });
      setForm({
        name: "",
        shortWindow: "9",
        longWindow: "21",
        stopLossPercent: "2",
        targetPercent: "4",
        positionSize: "50",
      });
      toast.success("Strategy added successfully.");
    } catch {
      toast.error("Failed to add strategy.");
    }
  };

  return (
    <div className="space-y-4">
      {/* Add Strategy Form */}
      <Card className="bg-card/80 border-border">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-display flex items-center gap-2">
            <Plus className="w-4 h-4 text-profit" />
            Add New Strategy
          </CardTitle>
          <CardDescription className="text-xs">
            Configure a new MA Crossover strategy
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAdd} className="space-y-3">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              <div className="col-span-2 md:col-span-3 space-y-1.5">
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
              <div className="space-y-1.5">
                <Label className="text-xs">Short Window</Label>
                <Input
                  type="number"
                  value={form.shortWindow}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, shortWindow: e.target.value }))
                  }
                  placeholder="9"
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
                  placeholder="21"
                  min="3"
                  max="500"
                  className="h-9 text-sm bg-input font-mono-data"
                  data-ocid="admin.strategy.input"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Position Size (lots)</Label>
                <Input
                  type="number"
                  value={form.positionSize}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, positionSize: e.target.value }))
                  }
                  placeholder="50"
                  min="1"
                  className="h-9 text-sm bg-input font-mono-data"
                  data-ocid="admin.strategy.input"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Stop Loss (%)</Label>
                <Input
                  type="number"
                  value={form.stopLossPercent}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, stopLossPercent: e.target.value }))
                  }
                  placeholder="2"
                  step="0.1"
                  min="0.1"
                  max="50"
                  className="h-9 text-sm bg-input font-mono-data"
                  data-ocid="admin.strategy.input"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Target Profit (%)</Label>
                <Input
                  type="number"
                  value={form.targetPercent}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, targetPercent: e.target.value }))
                  }
                  placeholder="4"
                  step="0.1"
                  min="0.1"
                  max="100"
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

      {/* Strategies List */}
      <Card className="bg-card/80 border-border">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-display">
            Strategy Management
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="border-border hover:bg-transparent">
                {[
                  "Name",
                  "SMA Windows",
                  "Stop Loss",
                  "Target",
                  "Lot Size",
                  "Status",
                  "Action",
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
                    {["a", "b", "c", "d", "e", "f", "g"].map((col) => (
                      <TableCell key={`${sk}-${col}`}>
                        <Skeleton className="h-4 w-full" />
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : !strategies || strategies.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    <div
                      data-ocid="admin.strategies.empty_state"
                      className="text-muted-foreground text-sm"
                    >
                      No strategies yet. Add one above.
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
                    <TableCell className="font-medium text-sm">
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
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleToggle(s.id, s.name)}
                        disabled={isToggling}
                        className="h-7 gap-1.5 text-xs"
                        data-ocid={`admin.strategies.toggle.${i + 1}`}
                      >
                        {s.enabled ? (
                          <ToggleRight className="w-4 h-4 text-profit" />
                        ) : (
                          <ToggleLeft className="w-4 h-4 text-muted-foreground" />
                        )}
                        {s.enabled ? "Disable" : "Enable"}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

// ── Trades Tab ────────────────────────────────────────────────────────────────

function AllTradesTab() {
  const { data: trades = [], isLoading } = useAllTrades();

  return (
    <Card className="bg-card/80 border-border">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-display flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-primary" />
            All System Trades
          </CardTitle>
          <Badge variant="outline" className="font-mono text-xs">
            {trades.length} total
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-96">
          <Table data-ocid="admin.trades.table">
            <TableHeader>
              <TableRow className="border-border hover:bg-transparent">
                {[
                  "User",
                  "Symbol",
                  "Strategy",
                  "Side",
                  "Qty",
                  "Price",
                  "P&L",
                  "Status",
                  "Mode",
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
                ["sk1", "sk2", "sk3", "sk4", "sk5"].map((sk) => (
                  <TableRow key={sk} className="border-border">
                    {["a", "b", "c", "d", "e", "f", "g", "h", "i"].map(
                      (col) => (
                        <TableCell key={`${sk}-${col}`}>
                          <Skeleton className="h-4 w-full" />
                        </TableCell>
                      ),
                    )}
                  </TableRow>
                ))
              ) : (trades as Trade[]).length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-10">
                    <div
                      data-ocid="admin.trades.empty_state"
                      className="text-muted-foreground text-sm"
                    >
                      No trades in the system yet.
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                (trades as Trade[]).map((t, i) => (
                  <TableRow
                    key={t.id.toString()}
                    className="border-border hover:bg-accent/20 transition-colors"
                    data-ocid={`admin.trades.row.${i + 1}`}
                  >
                    <TableCell className="font-mono text-xs text-muted-foreground">
                      {t.userId.slice(0, 8)}…
                    </TableCell>
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
                    <TableCell className="font-mono-data text-xs">
                      {Number(t.quantity)}
                    </TableCell>
                    <TableCell className="font-mono-data text-xs">
                      ₹
                      {t.price.toLocaleString("en-IN", {
                        maximumFractionDigits: 2,
                      })}
                    </TableCell>
                    <TableCell
                      className={`font-mono-data text-xs font-semibold ${t.pnl > 0 ? "text-profit" : t.pnl < 0 ? "text-loss" : "text-muted-foreground"}`}
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
  const { isInitializing } = useAuthGuard();
  const [authenticated, setAuthenticated] = useState(
    () => sessionStorage.getItem("admin_auth") === "1",
  );

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
          <Tabs defaultValue="overview">
            <TabsList className="mb-4 bg-card/60">
              <TabsTrigger
                value="overview"
                data-ocid="admin.tab"
                className="gap-1.5 text-xs"
              >
                <Activity className="w-3.5 h-3.5" />
                Overview
              </TabsTrigger>
              <TabsTrigger
                value="users"
                data-ocid="admin.tab"
                className="gap-1.5 text-xs"
              >
                <Users className="w-3.5 h-3.5" />
                Users
              </TabsTrigger>
              <TabsTrigger
                value="strategies"
                data-ocid="admin.tab"
                className="gap-1.5 text-xs"
              >
                <BarChart3 className="w-3.5 h-3.5" />
                Strategies
              </TabsTrigger>
              <TabsTrigger
                value="trades"
                data-ocid="admin.tab"
                className="gap-1.5 text-xs"
              >
                <TrendingUp className="w-3.5 h-3.5" />
                Trades
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview">
              <OverviewTab />
            </TabsContent>
            <TabsContent value="users">
              <UsersTab />
            </TabsContent>
            <TabsContent value="strategies">
              <StrategiesTab />
            </TabsContent>
            <TabsContent value="trades">
              <AllTradesTab />
            </TabsContent>
          </Tabs>
        </motion.div>
      </main>
      <Footer />
    </div>
  );
}
