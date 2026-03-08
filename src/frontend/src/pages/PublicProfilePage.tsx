import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Principal } from "@icp-sdk/core/principal";
import { useParams } from "@tanstack/react-router";
import {
  Activity,
  BarChart3,
  Calendar,
  Loader2,
  Star,
  TrendingUp,
  UserCheck,
  Users,
  Zap,
} from "lucide-react";
import { motion } from "motion/react";
import { useMemo } from "react";
import { toast } from "sonner";
import { Footer } from "../components/trading/Footer";
import { Header } from "../components/trading/Header";
import { useFollowUser, usePublicUserProfile } from "../hooks/useQueries";

function generateEquitySparkline(seed: number): string {
  const points: [number, number][] = [];
  let y = 50 + (seed % 20);
  for (let i = 0; i < 20; i++) {
    y += Math.sin(i * seed * 0.3 + seed) * 8 + (Math.random() - 0.45) * 6;
    y = Math.max(10, Math.min(90, y));
    points.push([i * 5, y]);
  }
  const d = points
    .map(([x, y], i) => `${i === 0 ? "M" : "L"}${x} ${100 - y}`)
    .join(" ");
  return d;
}

const MOCK_STRATEGIES = [
  {
    name: "9:20 Candle Breakout",
    assetType: "NIFTY",
    winRate: 68.5,
    sharpeRatio: 2.34,
    maxDrawdown: 8.2,
    subscribers: 1247,
    sparkSeed: 7,
  },
  {
    name: "EMA Momentum Filter",
    assetType: "BankNifty",
    winRate: 62.1,
    sharpeRatio: 1.89,
    maxDrawdown: 11.5,
    subscribers: 832,
    sparkSeed: 3,
  },
  {
    name: "Bollinger Squeeze Pro",
    assetType: "NIFTY",
    winRate: 59.8,
    sharpeRatio: 1.67,
    maxDrawdown: 14.1,
    subscribers: 483,
    sparkSeed: 11,
  },
];

const ASSET_COLORS: Record<string, string> = {
  NIFTY: "bg-primary/20 text-primary border-primary/30",
  BankNifty: "bg-warning/20 text-warning border-warning/30",
  Stocks: "bg-profit/20 text-profit border-profit/30",
  Crypto:
    "bg-[oklch(0.65_0.2_290)/15] text-[oklch(0.72_0.18_290)] border-[oklch(0.65_0.2_290)/40]",
};

function getInitials(name: string): string {
  return name
    .split(" ")
    .slice(0, 2)
    .map((n) => n[0])
    .join("")
    .toUpperCase();
}

function getAvatarColor(name: string): string {
  const colors = [
    "bg-primary/20 text-primary border-primary/40",
    "bg-profit/20 text-profit border-profit/40",
    "bg-warning/20 text-warning border-warning/40",
    "bg-[oklch(0.65_0.2_290)/15] text-[oklch(0.72_0.18_290)] border-[oklch(0.65_0.2_290)/40]",
  ];
  const idx = name.charCodeAt(0) % colors.length;
  return colors[idx];
}

function formatDate(ts: bigint): string {
  const ms = Number(ts) > 1e12 ? Number(ts) / 1e6 : Number(ts);
  return new Date(ms).toLocaleDateString("en-IN", {
    year: "numeric",
    month: "long",
  });
}

function NotFoundState() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-muted/30 border border-border flex items-center justify-center mx-auto">
            <Users className="w-8 h-8 text-muted-foreground opacity-40" />
          </div>
          <div>
            <h2 className="font-display text-xl font-bold">
              Profile Not Found
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              This user profile does not exist or is unavailable.
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

export function PublicProfilePage() {
  const { userId } = useParams({ from: "/profile/$userId" });

  const principal = useMemo(() => {
    try {
      return Principal.fromText(userId);
    } catch {
      return null;
    }
  }, [userId]);

  const { data: profile, isLoading } = usePublicUserProfile(principal);
  const { mutate: followUser, isPending: isFollowing } = useFollowUser();

  const handleFollow = () => {
    if (!principal) return;
    followUser(principal, {
      onSuccess: () => toast.success("Now following this creator!"),
      onError: () => toast.error("Failed to follow user"),
    });
  };

  if (!principal) return <NotFoundState />;

  if (isLoading) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <Loader2
            className="w-8 h-8 animate-spin text-primary"
            data-ocid="profile.loading_state"
          />
        </main>
        <Footer />
      </div>
    );
  }

  if (!profile) return <NotFoundState />;

  const isAlgoCreator =
    profile.role === "AlgoCreator" || profile.role === "algo_creator";
  const followersCount = Number(profile.followersCount);
  const avatarColor = getAvatarColor(profile.name || "U");

  // Mock stats (profile doesn't store these directly)
  const mockTotalProfit = 284750;
  const mockSharpeRatio = 2.1;
  const mockStrategies = 12;

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 max-w-5xl mx-auto w-full px-4 md:px-6 py-8">
        {/* Profile Header */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <Card className="bg-card/80 border-border overflow-hidden">
            {/* Background accent */}
            <div className="h-20 bg-gradient-to-r from-primary/5 via-primary/10 to-transparent" />
            <CardContent className="p-6 pt-0 -mt-10">
              <div className="flex flex-col sm:flex-row gap-5 items-start sm:items-end">
                {/* Avatar */}
                <div
                  className={`w-20 h-20 rounded-2xl border-2 flex items-center justify-center text-2xl font-bold flex-shrink-0 ${avatarColor}`}
                  style={{ boxShadow: "0 0 24px oklch(0.86 0.18 205 / 0.15)" }}
                >
                  {getInitials(profile.name || "U")}
                </div>

                <div className="flex-1 space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <h1 className="font-display text-2xl font-bold">
                      {profile.name || "Unknown Trader"}
                    </h1>
                    {isAlgoCreator && (
                      <Badge className="bg-primary/20 text-primary border-primary/40 border text-[10px] font-mono gap-1">
                        <Zap className="w-3 h-3" />
                        Algo Creator
                      </Badge>
                    )}
                    {profile.role === "admin" && (
                      <Badge className="bg-loss/20 text-loss border-loss/40 border text-[10px]">
                        Admin
                      </Badge>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                    <Badge variant="outline" className="text-[10px]">
                      {profile.experienceLevel || "Trader"}
                    </Badge>
                    {profile.tradingMarket && (
                      <Badge
                        variant="outline"
                        className={`text-[10px] ${ASSET_COLORS[profile.tradingMarket] ?? "text-muted-foreground"}`}
                      >
                        {profile.tradingMarket}
                      </Badge>
                    )}
                    {profile.country && (
                      <span className="flex items-center gap-1">
                        <span>🌏</span>
                        {profile.country}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                    <Calendar className="w-3 h-3" />
                    <span>
                      Joined{" "}
                      {profile.joinedAt
                        ? formatDate(profile.joinedAt)
                        : "recently"}
                    </span>
                  </div>
                </div>

                <Button
                  size="sm"
                  onClick={handleFollow}
                  disabled={isFollowing}
                  className="gap-1.5 shrink-0"
                  data-ocid="profile.primary_button"
                >
                  {isFollowing ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <UserCheck className="w-3.5 h-3.5" />
                  )}
                  Follow
                </Button>
              </div>

              {/* Stats Row */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-6">
                {[
                  {
                    icon: BarChart3,
                    label: "Strategies",
                    value: String(mockStrategies),
                    color: "text-primary",
                  },
                  {
                    icon: Users,
                    label: "Followers",
                    value: followersCount.toLocaleString("en-IN"),
                    color: "text-profit",
                  },
                  {
                    icon: TrendingUp,
                    label: "Total Profit",
                    value: `₹${mockTotalProfit.toLocaleString("en-IN")}`,
                    color: "text-profit",
                  },
                  {
                    icon: Star,
                    label: "Sharpe Ratio",
                    value: mockSharpeRatio.toFixed(1),
                    color: "text-warning",
                  },
                ].map((stat) => (
                  <div
                    key={stat.label}
                    className="p-3 bg-background/60 border border-border rounded-lg"
                  >
                    <div className="flex items-center gap-1.5 mb-1">
                      <stat.icon className={`w-3.5 h-3.5 ${stat.color}`} />
                      <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-mono">
                        {stat.label}
                      </span>
                    </div>
                    <p
                      className={`font-mono-data text-lg font-bold ${stat.color}`}
                    >
                      {stat.value}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Strategies Section */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
        >
          <div className="flex items-center gap-2 mb-4">
            <Activity className="w-4 h-4 text-primary" />
            <h2 className="font-display text-lg font-semibold">
              Published Strategies
            </h2>
            <Badge variant="outline" className="text-xs font-mono">
              {MOCK_STRATEGIES.length}
            </Badge>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {MOCK_STRATEGIES.map((strategy, i) => {
              const sparkPath = generateEquitySparkline(strategy.sparkSeed);
              return (
                <motion.div
                  key={strategy.name}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 + i * 0.07 }}
                >
                  <Card
                    className="bg-card/80 border-border hover:border-primary/20 transition-all hover:shadow-glow"
                    data-ocid={`profile.strategies.item.${i + 1}`}
                  >
                    <CardHeader className="pb-2">
                      <div className="flex items-start justify-between">
                        <div>
                          <Badge
                            variant="outline"
                            className={`text-[10px] border mb-1.5 ${ASSET_COLORS[strategy.assetType] ?? ""}`}
                          >
                            {strategy.assetType}
                          </Badge>
                          <CardTitle className="text-sm font-display leading-tight">
                            {strategy.name}
                          </CardTitle>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {/* Sparkline equity chart */}
                      <div className="h-16 rounded-md overflow-hidden bg-background/60 border border-border p-1">
                        <svg
                          viewBox="0 0 95 100"
                          width="100%"
                          height="100%"
                          preserveAspectRatio="none"
                          role="img"
                          aria-label={`Equity chart for ${strategy.name}`}
                        >
                          <defs>
                            <linearGradient
                              id={`sparkGrad${i}`}
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
                            d={`${sparkPath} L95 100 L0 100 Z`}
                            fill={`url(#sparkGrad${i})`}
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

                      <div className="grid grid-cols-3 gap-1.5 text-xs">
                        <div className="bg-background/60 border border-border rounded p-1.5">
                          <p className="text-[9px] text-muted-foreground">
                            Win
                          </p>
                          <p className="font-mono-data font-bold text-warning text-xs">
                            {strategy.winRate}%
                          </p>
                        </div>
                        <div className="bg-background/60 border border-border rounded p-1.5">
                          <p className="text-[9px] text-muted-foreground">
                            Sharpe
                          </p>
                          <p className="font-mono-data font-bold text-profit text-xs">
                            {strategy.sharpeRatio.toFixed(2)}
                          </p>
                        </div>
                        <div className="bg-background/60 border border-border rounded p-1.5">
                          <p className="text-[9px] text-muted-foreground">DD</p>
                          <p className="font-mono-data font-bold text-loss text-xs">
                            -{strategy.maxDrawdown}%
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <Users className="w-3 h-3" />
                          <span>
                            {strategy.subscribers.toLocaleString("en-IN")}
                          </span>
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-6 text-[10px] px-2 gap-1"
                          data-ocid={`profile.strategies.secondary_button.${i + 1}`}
                        >
                          <TrendingUp className="w-2.5 h-2.5" />
                          Subscribe
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      </main>
      <Footer />
    </div>
  );
}
