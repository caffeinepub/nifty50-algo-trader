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
import { Textarea } from "@/components/ui/textarea";
import { useNavigate } from "@tanstack/react-router";
import {
  Activity,
  Loader2,
  Plus,
  Star,
  Store,
  TrendingUp,
  Upload,
  Users,
} from "lucide-react";
import { motion } from "motion/react";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { Footer } from "../components/trading/Footer";
import { Header } from "../components/trading/Header";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { useUserProfile } from "../hooks/useQueries";

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

interface MarketplaceStrategy {
  id: number;
  name: string;
  creator: string;
  assetType: AssetType;
  sharpeRatio: number;
  winRate: number;
  price: number;
  subscribers: number;
  description: string;
  badge?: string;
}

const MOCK_STRATEGIES: MarketplaceStrategy[] = [
  {
    id: 1,
    name: "9:20 Candle Breakout Pro",
    creator: "AlgoMaster Raj",
    assetType: "NIFTY",
    sharpeRatio: 2.34,
    winRate: 68.5,
    price: 999,
    subscribers: 1247,
    description: "Proven 9:20 AM candle strategy with dynamic stop-loss",
    badge: "Top Rated",
  },
  {
    id: 2,
    name: "BankNifty EMA Crossover",
    creator: "TraderVish",
    assetType: "BankNifty",
    sharpeRatio: 1.89,
    winRate: 62.1,
    price: 1499,
    subscribers: 832,
    description: "12/26 EMA crossover with RSI confirmation filter",
    badge: "New",
  },
  {
    id: 3,
    name: "Reliance Momentum Rider",
    creator: "QuantEdge",
    assetType: "Stocks",
    sharpeRatio: 1.45,
    winRate: 55.3,
    price: 599,
    subscribers: 2104,
    description: "Momentum-based strategy targeting large-cap stocks",
  },
  {
    id: 4,
    name: "Crypto RSI Divergence",
    creator: "CryptoNinja",
    assetType: "Crypto",
    sharpeRatio: 2.78,
    winRate: 71.2,
    price: 2499,
    subscribers: 456,
    description: "RSI divergence detector for BTC and ETH pairs",
    badge: "Premium",
  },
  {
    id: 5,
    name: "NIFTY Bollinger Squeeze",
    creator: "IndexTrader",
    assetType: "NIFTY",
    sharpeRatio: 1.67,
    winRate: 59.8,
    price: 799,
    subscribers: 1583,
    description: "Trades Bollinger Band squeezes at key support levels",
  },
  {
    id: 6,
    name: "Mid-Cap Swing Alpha",
    creator: "SwingPro India",
    assetType: "Stocks",
    sharpeRatio: 2.12,
    winRate: 66.7,
    price: 1299,
    subscribers: 718,
    description: "Swing trading for mid-cap NSE stocks with 2-5 day hold",
    badge: "Trending",
  },
  {
    id: 7,
    name: "BankNifty Options ATM",
    creator: "OptionsMaster",
    assetType: "BankNifty",
    sharpeRatio: 3.01,
    winRate: 74.5,
    price: 4999,
    subscribers: 289,
    description: "ATM options trading with precise entry-exit for BankNifty",
    badge: "Elite",
  },
  {
    id: 8,
    name: "Crypto MACD Trend",
    creator: "DeFiAlgo",
    assetType: "Crypto",
    sharpeRatio: 1.92,
    winRate: 61.4,
    price: 1799,
    subscribers: 941,
    description: "MACD-based trend following for major crypto pairs",
  },
];

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

export function MarketplacePage() {
  const { isLoggedIn, isInitializing } = useAuthGuard();
  const { data: profile } = useUserProfile();
  const [filter, setFilter] = useState<"All" | AssetType>("All");
  const [publishOpen, setPublishOpen] = useState(false);
  const [subscribedIds, setSubscribedIds] = useState<Set<number>>(new Set());
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const [publishForm, setPublishForm] = useState({
    name: "",
    description: "",
    assetType: "",
    price: "",
  });

  const userRole = profile?.role ?? "Trader";
  const canPublish = userRole === "admin" || userRole === "AlgoCreator";

  const filtered =
    filter === "All"
      ? MOCK_STRATEGIES
      : MOCK_STRATEGIES.filter((s) => s.assetType === filter);

  const handleSubscribe = (id: number, name: string) => {
    setSubscribedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
        toast.info(`Unsubscribed from "${name}"`);
      } else {
        next.add(id);
        toast.success(`Subscribed to "${name}"`);
      }
      return next;
    });
  };

  const handlePublish = (e: React.FormEvent) => {
    e.preventDefault();
    if (!publishForm.name.trim()) {
      toast.error("Strategy name is required");
      return;
    }
    toast.success("Strategy submitted for review!");
    setPublishOpen(false);
    setPublishForm({ name: "", description: "", assetType: "", price: "" });
    setUploadFile(null);
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
                Discover and subscribe to proven trading algorithms
              </p>
            </div>
            {canPublish && (
              <Button
                onClick={() => setPublishOpen(true)}
                className="gap-2"
                data-ocid="marketplace.primary_button"
              >
                <Plus className="w-4 h-4" />
                Publish Your Algorithm
              </Button>
            )}
          </div>
        </motion.div>

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
            <Card
              key={strategy.id}
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
                    </div>
                    <CardTitle className="text-sm font-display leading-tight">
                      {strategy.name}
                    </CardTitle>
                    <p className="text-[10px] text-muted-foreground mt-0.5">
                      by {strategy.creator}
                    </p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {strategy.description}
                </p>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="bg-background/60 border border-border rounded p-2">
                    <p className="text-[10px] text-muted-foreground">Sharpe</p>
                    <p className="font-mono-data font-bold text-profit">
                      {strategy.sharpeRatio.toFixed(2)}
                    </p>
                  </div>
                  <div className="bg-background/60 border border-border rounded p-2">
                    <p className="text-[10px] text-muted-foreground">
                      Win Rate
                    </p>
                    <p className="font-mono-data font-bold text-warning">
                      {strategy.winRate}%
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <Users className="w-3 h-3" />
                    <span>{strategy.subscribers.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center gap-1 text-warning">
                    <Star className="w-3 h-3 fill-current" />
                    <span className="font-mono-data font-bold">
                      ₹{strategy.price.toLocaleString("en-IN")}/mo
                    </span>
                  </div>
                </div>

                <Button
                  size="sm"
                  variant={
                    subscribedIds.has(strategy.id) ? "outline" : "default"
                  }
                  className={`w-full h-8 text-xs gap-1.5 ${subscribedIds.has(strategy.id) ? "text-profit border-profit/30" : ""}`}
                  onClick={() => handleSubscribe(strategy.id, strategy.name)}
                  data-ocid={`marketplace.secondary_button.${idx + 1}`}
                >
                  {subscribedIds.has(strategy.id) ? (
                    <>
                      <Activity className="w-3 h-3" />
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
          ))}
        </motion.div>
      </main>
      <Footer />

      {/* Publish Dialog */}
      <Dialog open={publishOpen} onOpenChange={setPublishOpen}>
        <DialogContent
          className="bg-card border-border max-w-lg"
          data-ocid="marketplace.dialog"
        >
          <DialogHeader>
            <DialogTitle className="font-display">
              Publish Your Algorithm
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handlePublish} className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label className="text-xs">Strategy Name</Label>
              <Input
                value={publishForm.name}
                onChange={(e) =>
                  setPublishForm((f) => ({ ...f, name: e.target.value }))
                }
                placeholder="e.g. NIFTY Momentum Alpha"
                className="bg-input"
                data-ocid="marketplace.input"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Description</Label>
              <Textarea
                value={publishForm.description}
                onChange={(e) =>
                  setPublishForm((f) => ({
                    ...f,
                    description: e.target.value,
                  }))
                }
                placeholder="Describe your trading strategy..."
                className="bg-input resize-none h-20"
                data-ocid="marketplace.textarea"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs">Asset Type</Label>
                <Select
                  value={publishForm.assetType}
                  onValueChange={(v) =>
                    setPublishForm((f) => ({ ...f, assetType: v }))
                  }
                >
                  <SelectTrigger
                    className="bg-input"
                    data-ocid="marketplace.select"
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
                <Label className="text-xs">Monthly Price (₹)</Label>
                <Input
                  type="number"
                  value={publishForm.price}
                  onChange={(e) =>
                    setPublishForm((f) => ({ ...f, price: e.target.value }))
                  }
                  placeholder="999"
                  className="bg-input font-mono-data"
                  data-ocid="marketplace.input"
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
                data-ocid="marketplace.dropzone"
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
                onClick={() => setPublishOpen(false)}
                data-ocid="marketplace.cancel_button"
              >
                Cancel
              </Button>
              <Button type="submit" data-ocid="marketplace.submit_button">
                Submit for Review
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
