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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useNavigate } from "@tanstack/react-router";
import {
  Activity,
  BarChart3,
  Edit,
  Loader2,
  MapPin,
  TrendingDown,
  TrendingUp,
  Trophy,
  UserCheck,
  Users,
} from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { Footer } from "../components/trading/Footer";
import { Header } from "../components/trading/Header";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import {
  useMyBacktestResults,
  useSaveUserProfile,
  useStrategies,
  useUserProfile,
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

function formatJoinDate(ts: bigint): string {
  const ms = Number(ts) > 1e12 ? Number(ts) / 1e6 : Number(ts);
  if (ms < 1000000) return "Recently";
  return new Date(ms).toLocaleDateString("en-IN", {
    month: "long",
    year: "numeric",
  });
}

const COUNTRIES = [
  "India",
  "United States",
  "United Kingdom",
  "Canada",
  "Australia",
  "Singapore",
  "United Arab Emirates",
  "Germany",
  "France",
  "Japan",
  "China",
  "Netherlands",
  "Switzerland",
  "Sweden",
  "Norway",
  "South Korea",
  "Brazil",
  "South Africa",
  "Indonesia",
  "Malaysia",
];

function getRoleBadge(role: string) {
  const map: Record<string, { label: string; className: string }> = {
    admin: { label: "Admin", className: "bg-loss/20 text-loss border-loss/30" },
    AlgoCreator: {
      label: "Algo Creator",
      className:
        "bg-[oklch(0.65_0.2_290)/15] text-[oklch(0.72_0.18_290)] border-[oklch(0.65_0.2_290)/40]",
    },
    Trader: {
      label: "Trader",
      className: "bg-primary/20 text-primary border-primary/30",
    },
    Viewer: {
      label: "Viewer",
      className: "bg-muted/40 text-muted-foreground border-border",
    },
  };
  const r = map[role] ?? map.Trader;
  return (
    <Badge variant="outline" className={`border ${r.className}`}>
      {r.label}
    </Badge>
  );
}

export function AlgoCreatorProfilePage() {
  const { isLoggedIn, isInitializing } = useAuthGuard();
  const { data: profile, isLoading: profileLoading } = useUserProfile();
  const { data: strategies = [], isLoading: strategiesLoading } =
    useStrategies();
  const { data: backtestResults = [], isLoading: resultsLoading } =
    useMyBacktestResults();
  const { mutateAsync: saveProfile, isPending: isSaving } =
    useSaveUserProfile();

  const [editOpen, setEditOpen] = useState(false);
  const [editForm, setEditForm] = useState({
    name: "",
    country: "",
    experienceLevel: "",
    tradingMarket: "",
  });

  const handleEditOpen = () => {
    if (profile) {
      setEditForm({
        name: profile.name,
        country: profile.country,
        experienceLevel: profile.experienceLevel,
        tradingMarket: profile.tradingMarket,
      });
    }
    setEditOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;
    try {
      await saveProfile({
        ...profile,
        name: editForm.name.trim(),
        country: editForm.country,
        experienceLevel: editForm.experienceLevel,
        tradingMarket: editForm.tradingMarket,
      });
      toast.success("Profile updated successfully.");
      setEditOpen(false);
    } catch {
      toast.error("Failed to update profile.");
    }
  };

  // Stats derived from backtest results
  const avgWinRate =
    backtestResults.length > 0
      ? backtestResults.reduce((s, r) => s + r.winRate, 0) /
        backtestResults.length
      : 0;
  const avgSharpe =
    backtestResults.length > 0
      ? backtestResults.reduce((s, r) => s + r.sharpeRatio, 0) /
        backtestResults.length
      : 0;

  if (isInitializing) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2
          className="w-8 h-8 animate-spin text-primary"
          data-ocid="profile.loading_state"
        />
      </div>
    );
  }

  if (!isLoggedIn) return null;

  const initials = profile?.name
    ? profile.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "TR";

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 max-w-5xl mx-auto w-full px-4 md:px-6 py-6">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Profile Header */}
          <Card className="bg-card/80 border-border">
            <CardContent className="p-6">
              {profileLoading ? (
                <div className="flex items-start gap-5">
                  <Skeleton className="w-20 h-20 rounded-full" />
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-6 w-48" />
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                </div>
              ) : (
                <div className="flex items-start justify-between flex-wrap gap-5">
                  <div className="flex items-start gap-5">
                    {/* Avatar */}
                    <div className="w-20 h-20 rounded-full bg-primary/20 border-2 border-primary/30 flex items-center justify-center text-primary text-2xl font-bold font-display flex-shrink-0">
                      {initials}
                    </div>

                    {/* Info */}
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h1 className="font-display text-xl font-bold">
                          {profile?.name ?? "Trader"}
                        </h1>
                        {profile?.role && getRoleBadge(profile.role)}
                        {profile?.pendingApproval && (
                          <Badge
                            variant="outline"
                            className="text-[10px] text-warning border-warning/30"
                          >
                            Pending Approval
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground flex-wrap">
                        {profile?.country && (
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {profile.country}
                          </span>
                        )}
                        {profile?.joinedAt && (
                          <span className="flex items-center gap-1">
                            <UserCheck className="w-3 h-3" />
                            Joined {formatJoinDate(profile.joinedAt)}
                          </span>
                        )}
                        <span className="flex items-center gap-1">
                          <Users className="w-3 h-3" />
                          {Number(profile?.followersCount ?? 0)} followers
                        </span>
                      </div>
                      <div className="flex items-center gap-2 mt-2 flex-wrap">
                        {profile?.tradingMarket?.split(",").map((m) => (
                          <Badge
                            key={m}
                            variant="outline"
                            className="text-[10px] border-border text-muted-foreground"
                          >
                            {m.trim()}
                          </Badge>
                        ))}
                        {profile?.experienceLevel && (
                          <Badge
                            variant="outline"
                            className="text-[10px] border-primary/30 text-primary"
                          >
                            {profile.experienceLevel}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-1.5"
                    onClick={handleEditOpen}
                    data-ocid="profile.edit_button"
                  >
                    <Edit className="w-3.5 h-3.5" />
                    Edit Profile
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Stats Row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              {
                label: "Win Rate",
                value: `${avgWinRate.toFixed(1)}%`,
                icon: Trophy,
                color: "text-warning",
              },
              {
                label: "Sharpe Ratio",
                value: avgSharpe.toFixed(2),
                icon: TrendingUp,
                color: "text-profit",
              },
              {
                label: "Strategies",
                value: strategies.length.toString(),
                icon: BarChart3,
                color: "text-primary",
              },
              {
                label: "Backtests",
                value: backtestResults.length.toString(),
                icon: Activity,
                color: "text-muted-foreground",
              },
            ].map((stat) => (
              <Card
                key={stat.label}
                className="bg-card/80 border-border"
                data-ocid="profile.card"
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-mono">
                      {stat.label}
                    </span>
                    <stat.icon className={`w-3.5 h-3.5 ${stat.color}`} />
                  </div>
                  <div
                    className={`font-mono-data text-xl font-bold ${stat.color}`}
                  >
                    {stat.value}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* My Strategies */}
          <Card className="bg-card/80 border-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-display flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-primary" />
                My Strategies
              </CardTitle>
            </CardHeader>
            <CardContent>
              {strategiesLoading ? (
                <div className="space-y-2">
                  {[1, 2].map((i) => (
                    <Skeleton key={i} className="h-16 w-full" />
                  ))}
                </div>
              ) : strategies.length === 0 ? (
                <div
                  className="text-center py-8 text-muted-foreground text-sm"
                  data-ocid="profile.empty_state"
                >
                  No strategies yet.
                </div>
              ) : (
                <div className="space-y-2">
                  {strategies.map((s, idx) => (
                    <div
                      key={s.id.toString()}
                      className="flex items-center justify-between p-3 bg-background/60 border border-border rounded-lg"
                      data-ocid={`profile.item.${idx + 1}`}
                    >
                      <div>
                        <p className="text-sm font-medium">{s.name}</p>
                        <p className="text-xs text-muted-foreground font-mono-data">
                          SMA {Number(s.shortWindow)}/{Number(s.longWindow)} ·
                          SL {s.stopLossPercent}% · TP {s.targetPercent}%
                        </p>
                      </div>
                      <Badge
                        variant={s.enabled ? "default" : "secondary"}
                        className={
                          s.enabled
                            ? "bg-profit/20 text-profit border-profit/30 text-xs border"
                            : "text-xs"
                        }
                      >
                        {s.enabled ? "Active" : "Disabled"}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Backtest Results */}
          <Card className="bg-card/80 border-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-display flex items-center gap-2">
                <Activity className="w-4 h-4 text-primary" />
                Recent Backtest Results
              </CardTitle>
            </CardHeader>
            <CardContent>
              {resultsLoading ? (
                <div className="space-y-2">
                  {[1, 2].map((i) => (
                    <Skeleton key={i} className="h-12 w-full" />
                  ))}
                </div>
              ) : backtestResults.length === 0 ? (
                <div
                  className="text-center py-8 text-muted-foreground text-sm"
                  data-ocid="profile.empty_state"
                >
                  No backtest results yet.
                </div>
              ) : (
                <div className="space-y-2">
                  {backtestResults.slice(0, 5).map((r, idx) => (
                    <div
                      key={r.id.toString()}
                      className="flex items-center justify-between p-3 bg-background/60 border border-border rounded-lg"
                      data-ocid={`profile.item.${idx + 1}`}
                    >
                      <div>
                        <p className="text-sm font-medium">
                          {r.symbol} · {r.timeframe}
                        </p>
                        <p className="text-xs text-muted-foreground font-mono-data">
                          {Number(r.totalTrades)} trades · Win{" "}
                          {r.winRate.toFixed(1)}%
                        </p>
                      </div>
                      <div className="text-right">
                        <p
                          className={`font-mono-data text-sm font-bold ${r.totalPnl >= 0 ? "text-profit" : "text-loss"}`}
                        >
                          {r.totalPnl >= 0 ? "+" : ""}₹
                          {r.totalPnl.toLocaleString("en-IN", {
                            maximumFractionDigits: 0,
                          })}
                        </p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground justify-end">
                          <span className="flex items-center gap-0.5 text-warning">
                            <TrendingUp className="w-3 h-3" />
                            {r.sharpeRatio.toFixed(2)}
                          </span>
                          <span className="flex items-center gap-0.5 text-loss">
                            <TrendingDown className="w-3 h-3" />
                            {r.maxDrawdown.toFixed(1)}%
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </main>
      <Footer />

      {/* Edit Profile Dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent
          className="bg-card border-border max-w-md"
          data-ocid="profile.dialog"
        >
          <DialogHeader>
            <DialogTitle className="font-display">Edit Profile</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSave} className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label className="text-xs">Full Name</Label>
              <Input
                value={editForm.name}
                onChange={(e) =>
                  setEditForm((f) => ({ ...f, name: e.target.value }))
                }
                className="bg-input"
                data-ocid="profile.input"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Country</Label>
              <Select
                value={editForm.country}
                onValueChange={(v) =>
                  setEditForm((f) => ({ ...f, country: v }))
                }
              >
                <SelectTrigger className="bg-input" data-ocid="profile.select">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-popover border-border max-h-60">
                  {COUNTRIES.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Experience Level</Label>
              <Select
                value={editForm.experienceLevel}
                onValueChange={(v) =>
                  setEditForm((f) => ({ ...f, experienceLevel: v }))
                }
              >
                <SelectTrigger className="bg-input" data-ocid="profile.select">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-popover border-border">
                  {["Beginner", "Intermediate", "Professional"].map((l) => (
                    <SelectItem key={l} value={l}>
                      {l}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Primary Trading Market</Label>
              <Select
                value={editForm.tradingMarket}
                onValueChange={(v) =>
                  setEditForm((f) => ({ ...f, tradingMarket: v }))
                }
              >
                <SelectTrigger className="bg-input" data-ocid="profile.select">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-popover border-border">
                  {[
                    "NIFTY",
                    "BankNifty",
                    "Stocks",
                    "Crypto",
                    "NIFTY,BankNifty",
                    "NIFTY,Stocks",
                  ].map((m) => (
                    <SelectItem key={m} value={m}>
                      {m}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <DialogFooter className="gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setEditOpen(false)}
                data-ocid="profile.cancel_button"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSaving}
                data-ocid="profile.save_button"
              >
                {isSaving ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : null}
                Save Changes
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
