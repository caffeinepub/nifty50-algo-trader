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
import { Switch } from "@/components/ui/switch";
import { useNavigate } from "@tanstack/react-router";
import {
  AlertTriangle,
  BarChart3,
  Loader2,
  Save,
  Shield,
  ShieldAlert,
  ShieldCheck,
  TrendingDown,
  Zap,
} from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Footer } from "../components/trading/Footer";
import { Header } from "../components/trading/Header";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import {
  useExtendedRiskSettings,
  useSaveExtendedRiskSettings,
} from "../hooks/useQueries";

function useAuthGuard() {
  const { identity, isInitializing } = useInternetIdentity();
  const navigate = useNavigate();
  const isLoggedIn = !!identity && !identity.getPrincipal().isAnonymous();
  if (!isInitializing && !isLoggedIn) {
    void navigate({ to: "/login" });
  }
  return { isLoggedIn, isInitializing };
}

function getRiskLevel(
  value: number,
  max: number,
): { label: string; color: string; bg: string; pct: number } {
  const pct = Math.min((value / max) * 100, 100);
  if (pct < 40)
    return {
      label: "Low",
      color: "text-profit",
      bg: "bg-profit",
      pct,
    };
  if (pct < 70)
    return {
      label: "Medium",
      color: "text-warning",
      bg: "bg-warning",
      pct,
    };
  return { label: "High", color: "text-loss", bg: "bg-loss", pct };
}

interface RiskMeterProps {
  label: string;
  value: number;
  max: number;
  unit?: string;
}

function RiskMeter({ label, value, max, unit = "" }: RiskMeterProps) {
  const risk = getRiskLevel(value, max);
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-xs">
        <span className="text-muted-foreground">{label}</span>
        <span className={`font-mono-data font-bold ${risk.color}`}>
          {risk.label}
        </span>
      </div>
      <div className="h-1.5 bg-muted rounded-full overflow-hidden">
        <motion.div
          className={`h-full rounded-full ${risk.bg}`}
          initial={{ width: 0 }}
          animate={{ width: `${risk.pct}%` }}
          transition={{ duration: 0.7, ease: "easeOut" }}
        />
      </div>
      <div className="flex items-center justify-between text-[10px] text-muted-foreground font-mono-data">
        <span>0{unit}</span>
        <span>
          {value.toLocaleString("en-IN")}
          {unit}
        </span>
        <span>
          {max.toLocaleString("en-IN")}
          {unit}
        </span>
      </div>
    </div>
  );
}

export function RiskManagementPage() {
  const { isLoggedIn, isInitializing } = useAuthGuard();
  const { data: settings, isLoading } = useExtendedRiskSettings();
  const { mutate: saveSettings, isPending: isSaving } =
    useSaveExtendedRiskSettings();

  const [maxDailyLoss, setMaxDailyLoss] = useState("5000");
  const [maxTradeRisk, setMaxTradeRisk] = useState("2");
  const [maxOpenTrades, setMaxOpenTrades] = useState("5");
  const [capitalAllocation, setCapitalAllocation] = useState("50");
  const [autoStopTrading, setAutoStopTrading] = useState(true);

  useEffect(() => {
    if (settings) {
      setMaxDailyLoss(String(settings.maxDailyLoss));
      setMaxTradeRisk(String(settings.maxTradeRisk));
      setMaxOpenTrades(String(Number(settings.maxOpenTrades)));
      setCapitalAllocation(String(settings.capitalAllocation));
      setAutoStopTrading(settings.autoStopTrading);
    }
  }, [settings]);

  const handleSave = () => {
    const loss = Number.parseFloat(maxDailyLoss);
    const tradeRisk = Number.parseFloat(maxTradeRisk);
    const openTrades = Number.parseInt(maxOpenTrades, 10);
    const capAlloc = Number.parseFloat(capitalAllocation);

    if (Number.isNaN(loss) || loss <= 0) {
      toast.error("Max daily loss must be a positive number");
      return;
    }
    if (Number.isNaN(tradeRisk) || tradeRisk <= 0 || tradeRisk > 100) {
      toast.error("Max trade risk must be between 0 and 100");
      return;
    }
    if (Number.isNaN(openTrades) || openTrades <= 0) {
      toast.error("Max open trades must be a positive integer");
      return;
    }
    if (Number.isNaN(capAlloc) || capAlloc <= 0 || capAlloc > 100) {
      toast.error("Capital allocation must be between 0 and 100");
      return;
    }

    saveSettings(
      {
        maxDailyLoss: loss,
        maxTradeRisk: tradeRisk,
        maxOpenTrades: BigInt(openTrades),
        capitalAllocation: capAlloc,
        autoStopTrading,
      },
      {
        onSuccess: () => toast.success("Risk settings saved successfully"),
        onError: () => toast.error("Failed to save risk settings"),
      },
    );
  };

  if (isInitializing) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2
          className="w-8 h-8 animate-spin text-primary"
          data-ocid="risk.loading_state"
        />
      </div>
    );
  }

  if (!isLoggedIn) return null;

  const lossNum = Number.parseFloat(maxDailyLoss) || 0;
  const tradeRiskNum = Number.parseFloat(maxTradeRisk) || 0;
  const openTradesNum = Number.parseInt(maxOpenTrades, 10) || 0;
  const capAllocNum = Number.parseFloat(capitalAllocation) || 0;

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 max-w-4xl mx-auto w-full px-4 md:px-6 py-6">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-loss/10 border border-loss/20 flex items-center justify-center">
              <ShieldAlert className="w-5 h-5 text-loss" />
            </div>
            <div>
              <h1 className="font-display text-2xl font-bold">
                Risk Management
              </h1>
              <p className="text-sm text-muted-foreground mt-0.5">
                Define protective boundaries for your trading activity
              </p>
            </div>
          </div>
        </motion.div>

        {/* Warning Banner */}
        <motion.div
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-6 flex items-start gap-3 p-4 bg-warning/10 border border-warning/30 rounded-lg"
          data-ocid="risk.panel"
        >
          <AlertTriangle className="w-5 h-5 text-warning flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-warning">
              Auto Stop Trading is active
            </p>
            <p className="text-xs text-warning/80 mt-0.5">
              When enabled, Auto Stop Trading will halt all active strategies
              immediately if the daily loss limit is reached. This protects your
              capital from runaway losses.
            </p>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Settings Form */}
          <motion.div
            className="lg:col-span-2 space-y-5"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.15 }}
          >
            <Card className="bg-card/80 border-border">
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-base font-display flex items-center gap-2">
                      <Shield className="w-4 h-4 text-loss" />
                      Risk Parameters
                    </CardTitle>
                    <CardDescription className="text-xs mt-1">
                      Configure your trading risk boundaries
                    </CardDescription>
                  </div>
                  <Badge className="bg-loss/10 text-loss border-loss/30 border text-[10px]">
                    Critical Settings
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-5">
                {isLoading ? (
                  <div className="space-y-4">
                    {[1, 2, 3, 4].map((sk) => (
                      <div key={sk} className="space-y-2">
                        <div className="h-4 w-32 bg-muted rounded animate-pulse" />
                        <div className="h-9 bg-muted rounded animate-pulse" />
                      </div>
                    ))}
                  </div>
                ) : (
                  <>
                    {/* Max Daily Loss */}
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
                        data-ocid="risk.input"
                      />
                      <p className="text-[10px] text-muted-foreground">
                        Trading stops when daily loss exceeds this amount
                      </p>
                    </div>

                    {/* Max Trade Risk */}
                    <div className="space-y-1.5">
                      <Label className="text-xs flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-warning" />
                        Max Trade Risk (%)
                      </Label>
                      <Input
                        type="number"
                        value={maxTradeRisk}
                        onChange={(e) => setMaxTradeRisk(e.target.value)}
                        placeholder="2"
                        min="0.1"
                        max="100"
                        step="0.1"
                        className="h-9 bg-input font-mono-data"
                        data-ocid="risk.input"
                      />
                      <p className="text-[10px] text-muted-foreground">
                        Maximum risk per individual trade as % of capital
                      </p>
                    </div>

                    {/* Max Open Trades */}
                    <div className="space-y-1.5">
                      <Label className="text-xs flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                        Max Open Trades
                      </Label>
                      <Input
                        type="number"
                        value={maxOpenTrades}
                        onChange={(e) => setMaxOpenTrades(e.target.value)}
                        placeholder="5"
                        min="1"
                        max="50"
                        className="h-9 bg-input font-mono-data"
                        data-ocid="risk.input"
                      />
                      <p className="text-[10px] text-muted-foreground">
                        Maximum concurrent open positions allowed
                      </p>
                    </div>

                    {/* Capital Allocation */}
                    <div className="space-y-1.5">
                      <Label className="text-xs flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-profit" />
                        Capital Allocation (%)
                      </Label>
                      <Input
                        type="number"
                        value={capitalAllocation}
                        onChange={(e) => setCapitalAllocation(e.target.value)}
                        placeholder="50"
                        min="1"
                        max="100"
                        step="1"
                        className="h-9 bg-input font-mono-data"
                        data-ocid="risk.input"
                      />
                      <p className="text-[10px] text-muted-foreground">
                        Percentage of total capital deployed in trading
                      </p>
                    </div>

                    {/* Auto Stop Trading Toggle */}
                    <div className="flex items-start gap-4 p-4 bg-background/60 rounded-lg border border-border">
                      <Switch
                        checked={autoStopTrading}
                        onCheckedChange={setAutoStopTrading}
                        data-ocid="risk.switch"
                        className="data-[state=checked]:bg-loss mt-0.5 flex-shrink-0"
                      />
                      <div className="flex-1">
                        <Label className="text-sm font-medium cursor-pointer">
                          Auto Stop Trading
                        </Label>
                        <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                          Automatically halt all active strategies when the max
                          daily loss limit is reached. Strongly recommended for
                          live trading.
                        </p>
                        {autoStopTrading && (
                          <Badge className="mt-2 bg-loss/10 text-loss border-loss/30 border text-[10px]">
                            <ShieldCheck className="w-3 h-3 mr-1" />
                            Protection: ACTIVE
                          </Badge>
                        )}
                      </div>
                    </div>

                    <Button
                      onClick={handleSave}
                      disabled={isSaving}
                      className="w-full gap-2"
                      data-ocid="risk.save_button"
                    >
                      {isSaving ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Save className="w-4 h-4" />
                      )}
                      {isSaving ? "Saving..." : "Save Risk Settings"}
                    </Button>
                  </>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Risk Dashboard */}
          <motion.div
            className="space-y-4"
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            {/* Risk Overview */}
            <Card className="bg-card/80 border-border">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-display flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-primary" />
                  Risk Exposure
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <RiskMeter
                  label="Daily Loss Limit"
                  value={lossNum}
                  max={50000}
                  unit="₹"
                />
                <RiskMeter
                  label="Trade Risk Level"
                  value={tradeRiskNum}
                  max={20}
                  unit="%"
                />
                <RiskMeter
                  label="Open Positions"
                  value={openTradesNum}
                  max={20}
                />
                <RiskMeter
                  label="Capital Deployed"
                  value={capAllocNum}
                  max={100}
                  unit="%"
                />
              </CardContent>
            </Card>

            {/* Quick Reference */}
            <Card className="bg-card/80 border-border">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-display flex items-center gap-2">
                  <Zap className="w-4 h-4 text-warning" />
                  Quick Reference
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {[
                  {
                    icon: TrendingDown,
                    label: "Daily Loss",
                    value: `₹${lossNum.toLocaleString("en-IN")}`,
                    color: "text-loss",
                  },
                  {
                    icon: Shield,
                    label: "Trade Risk",
                    value: `${tradeRiskNum}%`,
                    color: "text-warning",
                  },
                  {
                    icon: BarChart3,
                    label: "Max Trades",
                    value: String(openTradesNum),
                    color: "text-primary",
                  },
                  {
                    icon: Zap,
                    label: "Capital",
                    value: `${capAllocNum}%`,
                    color: "text-profit",
                  },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="flex items-center justify-between p-2.5 rounded-lg bg-background/60 border border-border"
                  >
                    <div className="flex items-center gap-2">
                      <item.icon className={`w-3.5 h-3.5 ${item.color}`} />
                      <span className="text-xs text-muted-foreground">
                        {item.label}
                      </span>
                    </div>
                    <span
                      className={`font-mono-data text-sm font-bold ${item.color}`}
                    >
                      {item.value}
                    </span>
                  </div>
                ))}
                <div className="flex items-center justify-between p-2.5 rounded-lg bg-background/60 border border-border">
                  <div className="flex items-center gap-2">
                    <ShieldAlert className="w-3.5 h-3.5 text-loss" />
                    <span className="text-xs text-muted-foreground">
                      Auto Stop
                    </span>
                  </div>
                  <Badge
                    variant="outline"
                    className={
                      autoStopTrading
                        ? "text-profit border-profit/30 text-[10px]"
                        : "text-muted-foreground text-[10px]"
                    }
                  >
                    {autoStopTrading ? "ON" : "OFF"}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* Professional tip */}
            <Card className="bg-card/80 border-primary/10">
              <CardContent className="p-4">
                <p className="text-[10px] text-muted-foreground leading-relaxed">
                  <span className="font-semibold text-primary">
                    Professional Tip:{" "}
                  </span>
                  Most professional traders risk no more than 1-2% of capital
                  per trade and set a daily loss limit at 5-6% of account value.
                </p>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
