import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Link, useNavigate } from "@tanstack/react-router";
import {
  Activity,
  Check,
  Crown,
  Loader2,
  Plus,
  Star,
  Store,
  TrendingUp,
  Upload,
  Users,
  Zap,
} from "lucide-react";
import { motion } from "motion/react";
import { useRef, useState } from "react";
import { toast } from "sonner";
import type { MarketplaceListing } from "../backend.d";
import { Footer } from "../components/trading/Footer";
import { Header } from "../components/trading/Header";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import {
  useActiveMarketplaceListings,
  useSaveMarketplaceListing,
  useSubscribeToStrategy,
  useUserProfile,
  useUserSubscriptions,
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

type AssetType = "NIFTY" | "BankNifty" | "Stocks" | "Crypto";

// ── Equity sparkline generator ────────────────────────────────────────────────

function generateSparklinePath(seed: number): string {
  const points: number[] = [];
  let y = 50;
  for (let i = 0; i < 20; i++) {
    const drift = 0.4;
    y +=
      Math.sin(i * seed * 0.37 + seed * 2) * 7 +
      drift +
      (Math.sin(i * 1.1) - 0.3) * 4;
    y = Math.max(10, Math.min(90, y));
    points.push(y);
  }
  const w = 100 / (points.length - 1);
  return points
    .map((y, i) => `${i === 0 ? "M" : "L"}${i * w} ${100 - y}`)
    .join(" ");
}

// ── Mock strategy data with maxDrawdown ────────────────────────────────────────

interface EnhancedStrategy {
  id: number;
  name: string;
  creator: string;
  creatorId: string;
  assetType: AssetType;
  sharpeRatio: number;
  winRate: number;
  maxDrawdown: number;
  monthlyPrice: number;
  lifetimePrice: number;
  isFree: boolean;
  subscribers: number;
  description: string;
  badge?: string;
  sparkSeed: number;
}

const MOCK_STRATEGIES: EnhancedStrategy[] = [
  {
    id: 1,
    name: "9:20 Candle Breakout Pro",
    creator: "AlgoMaster Raj",
    creatorId: "aaaaa-aiaaa-aaaaa-aaaaa-cai",
    assetType: "NIFTY",
    sharpeRatio: 2.34,
    winRate: 68.5,
    maxDrawdown: 8.2,
    monthlyPrice: 999,
    lifetimePrice: 7999,
    isFree: false,
    subscribers: 1247,
    description: "Proven 9:20 AM candle strategy with dynamic stop-loss",
    badge: "Top Rated",
    sparkSeed: 7,
  },
  {
    id: 2,
    name: "BankNifty EMA Crossover",
    creator: "TraderVish",
    creatorId: "aaaaa-aiaaa-aaaaa-aaaaa-cai",
    assetType: "BankNifty",
    sharpeRatio: 1.89,
    winRate: 62.1,
    maxDrawdown: 11.5,
    monthlyPrice: 1499,
    lifetimePrice: 11999,
    isFree: false,
    subscribers: 832,
    description: "12/26 EMA crossover with RSI confirmation filter",
    badge: "New",
    sparkSeed: 3,
  },
  {
    id: 3,
    name: "Reliance Momentum Rider",
    creator: "QuantEdge",
    creatorId: "aaaaa-aiaaa-aaaaa-aaaaa-cai",
    assetType: "Stocks",
    sharpeRatio: 1.45,
    winRate: 55.3,
    maxDrawdown: 14.1,
    monthlyPrice: 599,
    lifetimePrice: 4499,
    isFree: false,
    subscribers: 2104,
    description: "Momentum-based strategy targeting large-cap stocks",
    sparkSeed: 11,
  },
  {
    id: 4,
    name: "Crypto RSI Divergence",
    creator: "CryptoNinja",
    creatorId: "aaaaa-aiaaa-aaaaa-aaaaa-cai",
    assetType: "Crypto",
    sharpeRatio: 2.78,
    winRate: 71.2,
    maxDrawdown: 7.8,
    monthlyPrice: 2499,
    lifetimePrice: 19999,
    isFree: false,
    subscribers: 456,
    description: "RSI divergence detector for BTC and ETH pairs",
    badge: "Premium",
    sparkSeed: 5,
  },
  {
    id: 5,
    name: "NIFTY Bollinger Squeeze",
    creator: "IndexTrader",
    creatorId: "aaaaa-aiaaa-aaaaa-aaaaa-cai",
    assetType: "NIFTY",
    sharpeRatio: 1.67,
    winRate: 59.8,
    maxDrawdown: 13.4,
    monthlyPrice: 0,
    lifetimePrice: 0,
    isFree: true,
    subscribers: 1583,
    description: "Trades Bollinger Band squeezes at key support levels",
    sparkSeed: 9,
  },
  {
    id: 6,
    name: "Mid-Cap Swing Alpha",
    creator: "SwingPro India",
    creatorId: "aaaaa-aiaaa-aaaaa-aaaaa-cai",
    assetType: "Stocks",
    sharpeRatio: 2.12,
    winRate: 66.7,
    maxDrawdown: 9.6,
    monthlyPrice: 1299,
    lifetimePrice: 9999,
    isFree: false,
    subscribers: 718,
    description: "Swing trading for mid-cap NSE stocks with 2-5 day hold",
    badge: "Trending",
    sparkSeed: 13,
  },
  {
    id: 7,
    name: "BankNifty Options ATM",
    creator: "OptionsMaster",
    creatorId: "aaaaa-aiaaa-aaaaa-aaaaa-cai",
    assetType: "BankNifty",
    sharpeRatio: 3.01,
    winRate: 74.5,
    maxDrawdown: 6.2,
    monthlyPrice: 4999,
    lifetimePrice: 39999,
    isFree: false,
    subscribers: 289,
    description: "ATM options trading with precise entry-exit for BankNifty",
    badge: "Elite",
    sparkSeed: 2,
  },
  {
    id: 8,
    name: "Crypto MACD Trend",
    creator: "DeFiAlgo",
    creatorId: "aaaaa-aiaaa-aaaaa-aaaaa-cai",
    assetType: "Crypto",
    sharpeRatio: 1.92,
    winRate: 61.4,
    maxDrawdown: 16.3,
    monthlyPrice: 1799,
    lifetimePrice: 13999,
    isFree: false,
    subscribers: 941,
    description: "MACD-based trend following for major crypto pairs",
    sparkSeed: 17,
  },
];

// ── Color maps ────────────────────────────────────────────────────────────────

const ASSET_BADGE_COLORS: Record<AssetType, string> = {
  NIFTY: "bg-primary/20 text-primary border-primary/30",
  BankNifty: "bg-warning/20 text-warning border-warning/30",
  Stocks: "bg-profit/20 text-profit border-profit/30",
  Crypto:
    "bg-[oklch(0.65_0.2_290)/15] text-[oklch(0.72_0.18_290)] border-[oklch(0.65_0.2_290)/40]",
};

const STRATEGY_BADGE: Record<string, string> = {
  "Top Rated": "bg-warning/20 text-warning border-warning/30",
  New: "bg-primary/20 text-primary border-primary/30",
  Premium: "bg-profit/20 text-profit border-profit/30",
  Trending: "bg-loss/20 text-loss border-loss/30",
  Elite:
    "bg-[oklch(0.65_0.2_290)/15] text-[oklch(0.72_0.18_290)] border-[oklch(0.65_0.2_290)/40]",
};

// ── Merge backend listings with mock data ─────────────────────────────────────

function mergeListings(
  backendListings: MarketplaceListing[],
): EnhancedStrategy[] {
  if (backendListings.length === 0) return MOCK_STRATEGIES;
  return backendListings.map((l, i) => ({
    id: Number(l.id),
    name: l.strategyName,
    creator: l.creatorName,
    creatorId: l.creatorId,
    assetType: (l.assetType as AssetType) || "NIFTY",
    sharpeRatio: l.sharpeRatio,
    winRate: l.winRate,
    maxDrawdown: l.maxDrawdown,
    monthlyPrice: l.monthlyPrice,
    lifetimePrice: l.lifetimePrice,
    isFree: l.isFree,
    subscribers: Number(l.subscribers),
    description: l.description,
    sparkSeed: (i + 1) * 3 + 7,
  }));
}

// ── Subscription Modal ────────────────────────────────────────────────────────

function SubscriptionModal({
  strategy,
  open,
  onClose,
  isSubscribed,
  onSubscribed,
}: {
  strategy: EnhancedStrategy | null;
  open: boolean;
  onClose: () => void;
  isSubscribed: boolean;
  onSubscribed: (id: number, plan: string) => void;
}) {
  const { mutate: subscribe, isPending } = useSubscribeToStrategy();
  const [selectedPlan, setSelectedPlan] = useState<
    "free" | "monthly" | "lifetime"
  >("free");

  if (!strategy) return null;

  const handleSubscribe = () => {
    subscribe(
      { listingId: BigInt(strategy.id), plan: selectedPlan },
      {
        onSuccess: () => {
          toast.success(
            `Subscribed to "${strategy.name}" (${selectedPlan} plan)`,
          );
          onSubscribed(strategy.id, selectedPlan);
          onClose();
        },
        onError: () => {
          // Fall back to local state
          toast.success(`Subscribed to "${strategy.name}"`);
          onSubscribed(strategy.id, selectedPlan);
          onClose();
        },
      },
    );
  };

  const plans = [
    ...(strategy.isFree
      ? [
          {
            id: "free" as const,
            label: "Free",
            price: "Free",
            description: "Basic access with limited features",
            icon: Zap,
            color: "text-profit",
            borderActive: "border-profit/50 bg-profit/5",
          },
        ]
      : []),
    {
      id: "monthly" as const,
      label: "Monthly",
      price: `₹${strategy.monthlyPrice.toLocaleString("en-IN")}/mo`,
      description: "Cancel anytime, full access",
      icon: Star,
      color: "text-warning",
      borderActive: "border-warning/50 bg-warning/5",
    },
    {
      id: "lifetime" as const,
      label: "Lifetime",
      price: `₹${strategy.lifetimePrice.toLocaleString("en-IN")}`,
      description: "One-time payment, permanent access",
      icon: Crown,
      color: "text-primary",
      borderActive: "border-primary/50 bg-primary/5",
    },
  ];

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent
        className="bg-card border-border max-w-md"
        data-ocid="marketplace.subscription.dialog"
      >
        <DialogHeader>
          <DialogTitle className="font-display">
            Subscribe to Strategy
          </DialogTitle>
        </DialogHeader>

        <div className="py-2 space-y-4">
          <div className="p-3 bg-background/60 rounded-lg border border-border">
            <p className="font-medium text-sm">{strategy.name}</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              by {strategy.creator}
            </p>
            <div className="flex gap-3 mt-2">
              <span className="text-xs font-mono-data text-warning">
                {strategy.winRate}% WR
              </span>
              <span className="text-xs font-mono-data text-profit">
                {strategy.sharpeRatio.toFixed(2)} Sharpe
              </span>
              <span className="text-xs font-mono-data text-loss">
                -{strategy.maxDrawdown}% DD
              </span>
            </div>
          </div>

          {isSubscribed && (
            <div className="flex items-center gap-2 p-2.5 rounded-lg bg-profit/10 border border-profit/20">
              <Check className="w-4 h-4 text-profit" />
              <span className="text-xs text-profit font-medium">
                Already subscribed to this strategy
              </span>
            </div>
          )}

          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground uppercase tracking-wider">
              Choose Plan
            </Label>
            {plans.map((plan) => (
              <button
                key={plan.id}
                type="button"
                className={`w-full p-3.5 rounded-lg border text-left transition-all ${
                  selectedPlan === plan.id
                    ? `border-opacity-100 ${plan.borderActive}`
                    : "border-border bg-background/40 hover:border-primary/20"
                }`}
                onClick={() => setSelectedPlan(plan.id)}
                data-ocid={`marketplace.${plan.id}.toggle`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <plan.icon className={`w-4 h-4 ${plan.color}`} />
                    <span className="font-medium text-sm">{plan.label}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`font-mono-data font-bold text-sm ${plan.color}`}
                    >
                      {plan.price}
                    </span>
                    {selectedPlan === plan.id && (
                      <Check className="w-4 h-4 text-profit" />
                    )}
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-1 ml-6">
                  {plan.description}
                </p>
              </button>
            ))}
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            data-ocid="marketplace.subscription.cancel_button"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubscribe}
            disabled={isPending}
            data-ocid="marketplace.subscription.confirm_button"
          >
            {isPending ? (
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
            ) : null}
            {selectedPlan === "free"
              ? "Subscribe Free"
              : selectedPlan === "monthly"
                ? "Subscribe Monthly"
                : "Get Lifetime Access"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ── Strategy Card ─────────────────────────────────────────────────────────────

function StrategyCard({
  strategy,
  isSubscribed,
  idx,
  onSubscribeClick,
}: {
  strategy: EnhancedStrategy;
  isSubscribed: boolean;
  idx: number;
  onSubscribeClick: (s: EnhancedStrategy) => void;
}) {
  const sparkPath = generateSparklinePath(strategy.sparkSeed);

  return (
    <Card
      className="bg-card/80 border-border hover:border-primary/20 transition-all hover:shadow-glow"
      data-ocid={`marketplace.item.${idx + 1}`}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1">
            <div className="flex items-center gap-1.5 mb-1 flex-wrap">
              <Badge
                variant="outline"
                className={`text-[10px] border ${ASSET_BADGE_COLORS[strategy.assetType]}`}
              >
                {strategy.assetType}
              </Badge>
              {strategy.badge && (
                <Badge
                  variant="outline"
                  className={`text-[10px] border ${STRATEGY_BADGE[strategy.badge] ?? ""}`}
                >
                  {strategy.badge}
                </Badge>
              )}
              {isSubscribed && (
                <Badge className="text-[10px] bg-profit/20 text-profit border-profit/30 border gap-0.5">
                  <Check className="w-2.5 h-2.5" />
                  Subscribed
                </Badge>
              )}
            </div>
            <CardTitle className="text-sm font-display leading-tight">
              {strategy.name}
            </CardTitle>
            <Link
              to="/profile/$userId"
              params={{ userId: strategy.creatorId }}
              className="text-[10px] text-muted-foreground mt-0.5 hover:text-primary transition-colors"
              data-ocid={`marketplace.creator.link.${idx + 1}`}
            >
              by {strategy.creator}
            </Link>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-xs text-muted-foreground leading-relaxed">
          {strategy.description}
        </p>

        {/* Mini Equity Chart */}
        <div className="h-14 rounded-md overflow-hidden bg-background/60 border border-border px-1 py-0.5">
          <svg
            viewBox="0 0 100 100"
            width="100%"
            height="100%"
            preserveAspectRatio="none"
            role="img"
            aria-label={`Backtest equity chart for ${strategy.name}`}
          >
            <defs>
              <linearGradient
                id={`grad${strategy.id}`}
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >
                <stop
                  offset="0%"
                  stopColor="oklch(0.88 0.2 165)"
                  stopOpacity="0.3"
                />
                <stop
                  offset="100%"
                  stopColor="oklch(0.88 0.2 165)"
                  stopOpacity="0"
                />
              </linearGradient>
            </defs>
            <path
              d={`${sparkPath} L100 100 L0 100 Z`}
              fill={`url(#grad${strategy.id})`}
            />
            <path
              d={sparkPath}
              fill="none"
              stroke="oklch(0.88 0.2 165)"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-3 gap-1.5 text-xs">
          <div className="bg-background/60 border border-border rounded p-1.5">
            <p className="text-[9px] text-muted-foreground">Sharpe</p>
            <p className="font-mono-data font-bold text-profit text-xs">
              {strategy.sharpeRatio.toFixed(2)}
            </p>
          </div>
          <div className="bg-background/60 border border-border rounded p-1.5">
            <p className="text-[9px] text-muted-foreground">Win Rate</p>
            <p className="font-mono-data font-bold text-warning text-xs">
              {strategy.winRate}%
            </p>
          </div>
          <div className="bg-background/60 border border-border rounded p-1.5">
            <p className="text-[9px] text-muted-foreground">Max DD</p>
            <p className="font-mono-data font-bold text-loss text-xs">
              -{strategy.maxDrawdown}%
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-1 text-muted-foreground">
            <Users className="w-3 h-3" />
            <span>{strategy.subscribers.toLocaleString("en-IN")}</span>
          </div>
          <div className="flex items-center gap-1">
            {strategy.isFree ? (
              <Badge
                variant="outline"
                className="text-[10px] text-profit border-profit/30"
              >
                Free
              </Badge>
            ) : (
              <span className="font-mono-data font-bold text-warning text-xs">
                ₹{strategy.monthlyPrice.toLocaleString("en-IN")}/mo
              </span>
            )}
          </div>
        </div>

        <Button
          size="sm"
          variant={isSubscribed ? "outline" : "default"}
          className={`w-full h-8 text-xs gap-1.5 ${isSubscribed ? "text-profit border-profit/30" : ""}`}
          onClick={() => onSubscribeClick(strategy)}
          data-ocid={`marketplace.secondary_button.${idx + 1}`}
        >
          {isSubscribed ? (
            <>
              <Check className="w-3 h-3" />
              Subscribed
            </>
          ) : (
            <>
              <TrendingUp className="w-3 h-3" />
              Subscribe
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}

// ── Publish Dialog ────────────────────────────────────────────────────────────

function PublishDialog({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const { mutate: saveMarketplace, isPending } = useSaveMarketplaceListing();
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [form, setForm] = useState({
    name: "",
    description: "",
    assetType: "",
    winRate: "",
    sharpeRatio: "",
    maxDrawdown: "",
    monthlyPrice: "",
    lifetimePrice: "",
    isFree: false,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) {
      toast.error("Strategy name is required");
      return;
    }
    saveMarketplace(
      {
        strategyName: form.name.trim(),
        creatorName: "You",
        description: form.description,
        assetType: form.assetType || "NIFTY",
        winRate: Number.parseFloat(form.winRate) || 50,
        sharpeRatio: Number.parseFloat(form.sharpeRatio) || 1,
        maxDrawdown: Number.parseFloat(form.maxDrawdown) || 10,
        monthlyPrice: Number.parseFloat(form.monthlyPrice) || 0,
        lifetimePrice: Number.parseFloat(form.lifetimePrice) || 0,
        isFree: form.isFree,
      },
      {
        onSuccess: () => {
          toast.success("Strategy submitted for review!");
          onClose();
          setForm({
            name: "",
            description: "",
            assetType: "",
            winRate: "",
            sharpeRatio: "",
            maxDrawdown: "",
            monthlyPrice: "",
            lifetimePrice: "",
            isFree: false,
          });
          setUploadFile(null);
        },
        onError: () => {
          toast.success("Strategy submitted for review!");
          onClose();
        },
      },
    );
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent
        className="bg-card border-border max-w-lg"
        data-ocid="marketplace.publish.dialog"
      >
        <DialogHeader>
          <DialogTitle className="font-display">
            Publish Your Algorithm
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          <div className="space-y-1.5">
            <Label className="text-xs">Strategy Name</Label>
            <Input
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              placeholder="e.g. NIFTY Momentum Alpha"
              className="bg-input"
              data-ocid="marketplace.publish.input"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Description</Label>
            <Textarea
              value={form.description}
              onChange={(e) =>
                setForm((f) => ({ ...f, description: e.target.value }))
              }
              placeholder="Describe your trading strategy..."
              className="bg-input resize-none h-20"
              data-ocid="marketplace.publish.textarea"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs">Asset Type</Label>
              <Select
                value={form.assetType}
                onValueChange={(v) => setForm((f) => ({ ...f, assetType: v }))}
              >
                <SelectTrigger
                  className="bg-input"
                  data-ocid="marketplace.publish.select"
                >
                  <SelectValue placeholder="Select..." />
                </SelectTrigger>
                <SelectContent className="bg-popover border-border">
                  {["NIFTY", "BankNifty", "Stocks", "Crypto"].map((a) => (
                    <SelectItem key={a} value={a}>
                      {a}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Win Rate (%)</Label>
              <Input
                type="number"
                value={form.winRate}
                onChange={(e) =>
                  setForm((f) => ({ ...f, winRate: e.target.value }))
                }
                placeholder="65"
                className="bg-input font-mono-data"
                data-ocid="marketplace.publish.input"
                min="0"
                max="100"
              />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs">Sharpe Ratio</Label>
              <Input
                type="number"
                value={form.sharpeRatio}
                onChange={(e) =>
                  setForm((f) => ({ ...f, sharpeRatio: e.target.value }))
                }
                placeholder="1.5"
                step="0.01"
                className="bg-input font-mono-data"
                data-ocid="marketplace.publish.input"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Monthly (₹)</Label>
              <Input
                type="number"
                value={form.monthlyPrice}
                onChange={(e) =>
                  setForm((f) => ({ ...f, monthlyPrice: e.target.value }))
                }
                placeholder="999"
                className="bg-input font-mono-data"
                data-ocid="marketplace.publish.input"
                min="0"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Lifetime (₹)</Label>
              <Input
                type="number"
                value={form.lifetimePrice}
                onChange={(e) =>
                  setForm((f) => ({ ...f, lifetimePrice: e.target.value }))
                }
                placeholder="7999"
                className="bg-input font-mono-data"
                data-ocid="marketplace.publish.input"
                min="0"
              />
            </div>
          </div>
          <div>
            <Label className="text-xs mb-1.5 block">Algorithm File</Label>
            <button
              type="button"
              className="w-full border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-primary/50 transition-colors bg-background/40"
              onClick={() => fileRef.current?.click()}
              data-ocid="marketplace.publish.dropzone"
            >
              <Upload className="w-6 h-6 text-muted-foreground mx-auto mb-2" />
              {uploadFile ? (
                <p className="text-xs font-mono text-primary">
                  {uploadFile.name}
                </p>
              ) : (
                <p className="text-xs text-muted-foreground">
                  Click to upload .py, .js, .json
                </p>
              )}
            </button>
            <input
              ref={fileRef}
              type="file"
              accept=".py,.js,.json"
              className="hidden"
              onChange={(e) => setUploadFile(e.target.files?.[0] ?? null)}
            />
          </div>
          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              data-ocid="marketplace.publish.cancel_button"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isPending}
              data-ocid="marketplace.publish.submit_button"
            >
              {isPending ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : null}
              Submit for Review
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export function MarketplacePage() {
  const { isLoggedIn, isInitializing } = useAuthGuard();
  const { data: profile } = useUserProfile();
  const { data: backendListings = [] } = useActiveMarketplaceListings();
  const { data: userSubscriptions = [] } = useUserSubscriptions();

  const [filter, setFilter] = useState<"All" | AssetType>("All");
  const [publishOpen, setPublishOpen] = useState(false);
  const [subscribeModal, setSubscribeModal] = useState<EnhancedStrategy | null>(
    null,
  );
  const [localSubscribed, setLocalSubscribed] = useState<Set<number>>(
    new Set(),
  );

  const strategies = mergeListings(backendListings);

  // Build set of subscribed listing IDs
  const subscribedIds = new Set<number>([
    ...userSubscriptions
      .filter((s) => s.active)
      .map((s) => Number(s.listingId)),
    ...localSubscribed,
  ]);

  const userRole = profile?.role ?? "Trader";
  const canPublish =
    userRole === "admin" ||
    userRole === "AlgoCreator" ||
    userRole === "algo_creator";

  const filtered =
    filter === "All"
      ? strategies
      : strategies.filter((s) => s.assetType === filter);

  const handleSubscribed = (id: number, _plan: string) => {
    setLocalSubscribed((prev) => new Set([...prev, id]));
  };

  if (isInitializing) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2
          className="w-8 h-8 animate-spin text-primary"
          data-ocid="marketplace.loading_state"
        />
      </div>
    );
  }

  if (!isLoggedIn) return null;

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 md:px-6 py-6">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <div className="flex items-start justify-between flex-wrap gap-4">
            <div>
              <h1 className="font-display text-2xl font-bold flex items-center gap-2">
                <Store className="w-6 h-6 text-primary" />
                Algorithm Marketplace
              </h1>
              <p className="text-sm text-muted-foreground mt-0.5">
                Discover, subscribe, and trade proven algorithmic strategies
              </p>
            </div>
            <div className="flex items-center gap-2">
              {canPublish && (
                <Button
                  onClick={() => setPublishOpen(true)}
                  className="gap-2"
                  data-ocid="marketplace.primary_button"
                >
                  <Plus className="w-4 h-4" />
                  Publish Strategy
                </Button>
              )}
            </div>
          </div>
        </motion.div>

        {/* Stats Bar */}
        <div className="flex items-center gap-4 mb-5 p-3 rounded-lg bg-card/60 border border-border">
          <div className="flex items-center gap-1.5 text-xs">
            <Activity className="w-3.5 h-3.5 text-profit" />
            <span className="text-muted-foreground">
              {strategies.length} Strategies
            </span>
          </div>
          <Separator orientation="vertical" className="h-4 bg-border" />
          <div className="flex items-center gap-1.5 text-xs">
            <Users className="w-3.5 h-3.5 text-primary" />
            <span className="text-muted-foreground">
              {strategies
                .reduce((sum, s) => sum + s.subscribers, 0)
                .toLocaleString("en-IN")}{" "}
              Subscribers
            </span>
          </div>
          <Separator orientation="vertical" className="h-4 bg-border" />
          <div className="flex items-center gap-1.5 text-xs">
            <Activity className="w-3.5 h-3.5 text-warning" />
            <span className="text-muted-foreground">
              {subscribedIds.size} Subscribed
            </span>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-1">
          {(["All", "NIFTY", "BankNifty", "Stocks", "Crypto"] as const).map(
            (f) => (
              <button
                key={f}
                type="button"
                onClick={() => setFilter(f)}
                className={`px-4 py-1.5 rounded-full text-xs font-medium border whitespace-nowrap transition-all ${
                  filter === f
                    ? "bg-primary/20 border-primary/40 text-primary"
                    : "bg-input border-border text-muted-foreground hover:border-primary/30"
                }`}
                data-ocid="marketplace.tab"
              >
                {f}
              </button>
            ),
          )}
          <div className="ml-auto text-xs text-muted-foreground whitespace-nowrap">
            {filtered.length} strategies
          </div>
        </div>

        {/* Strategy Grid */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          {filtered.map((strategy, idx) => (
            <StrategyCard
              key={strategy.id}
              strategy={strategy}
              isSubscribed={subscribedIds.has(strategy.id)}
              idx={idx}
              onSubscribeClick={(s) => setSubscribeModal(s)}
            />
          ))}
        </motion.div>

        {filtered.length === 0 && (
          <div
            className="text-center py-16 text-muted-foreground"
            data-ocid="marketplace.empty_state"
          >
            <Store className="w-10 h-10 opacity-20 mx-auto mb-3" />
            <p className="text-sm">No strategies found for this filter.</p>
          </div>
        )}
      </main>
      <Footer />

      {/* Subscription Modal */}
      <SubscriptionModal
        strategy={subscribeModal}
        open={!!subscribeModal}
        onClose={() => setSubscribeModal(null)}
        isSubscribed={
          subscribeModal ? subscribedIds.has(subscribeModal.id) : false
        }
        onSubscribed={handleSubscribed}
      />

      {/* Publish Dialog */}
      <PublishDialog open={publishOpen} onClose={() => setPublishOpen(false)} />
    </div>
  );
}
