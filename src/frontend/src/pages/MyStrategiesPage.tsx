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
import { Skeleton } from "@/components/ui/skeleton";
import { useNavigate } from "@tanstack/react-router";
import {
  Activity,
  BarChart3,
  Loader2,
  Plus,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { Footer } from "../components/trading/Footer";
import { Header } from "../components/trading/Header";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import {
  useAddStrategy,
  useStrategies,
  useToggleStrategy,
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

export function MyStrategiesPage() {
  const { isLoggedIn, isInitializing } = useAuthGuard();
  const { data: strategies, isLoading } = useStrategies();
  const { data: profile } = useUserProfile();
  const { mutateAsync: toggleStrategy, isPending: isToggling } =
    useToggleStrategy();
  const { mutateAsync: addStrategy, isPending: isAdding } = useAddStrategy();

  const [addOpen, setAddOpen] = useState(false);
  const [form, setForm] = useState({
    name: "",
    shortWindow: "9",
    longWindow: "21",
    stopLossPercent: "2",
    targetPercent: "4",
    positionSize: "50",
    riskPercent: "1.5",
  });

  const userRole = profile?.role ?? "Trader";
  const canManage = userRole === "admin" || userRole === "AlgoCreator";

  const handleToggle = async (id: bigint, name: string, enabled: boolean) => {
    try {
      await toggleStrategy(id);
      toast.success(`Strategy "${name}" ${enabled ? "disabled" : "enabled"}.`);
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
        algorithmFile: "",
        strategyType: "ma_crossover",
      });
      toast.success("Strategy added.");
      setAddOpen(false);
      setForm({
        name: "",
        shortWindow: "9",
        longWindow: "21",
        stopLossPercent: "2",
        targetPercent: "4",
        positionSize: "50",
        riskPercent: "1.5",
      });
    } catch {
      toast.error("Failed to add strategy.");
    }
  };

  if (isInitializing) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2
          className="w-8 h-8 animate-spin text-primary"
          data-ocid="strategies.loading_state"
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
          className="mb-6 flex items-center justify-between"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div>
            <h1 className="font-display text-2xl font-bold">My Strategies</h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              Algorithmic trading strategies
            </p>
          </div>
          {canManage && (
            <Button
              onClick={() => setAddOpen(true)}
              className="gap-2"
              data-ocid="strategies.primary_button"
            >
              <Plus className="w-4 h-4" />
              Add Strategy
            </Button>
          )}
        </motion.div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="bg-card/80 border-border">
                <CardContent className="p-5 space-y-3">
                  <Skeleton className="h-5 w-32" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-24" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : !strategies || strategies.length === 0 ? (
          <Card className="bg-card/80 border-border">
            <CardContent
              className="py-16 text-center"
              data-ocid="strategies.empty_state"
            >
              <BarChart3 className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
              <p className="text-muted-foreground text-sm">
                No strategies available.{" "}
                {canManage
                  ? "Click 'Add Strategy' to create one."
                  : "Contact admin to configure strategies."}
              </p>
            </CardContent>
          </Card>
        ) : (
          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            {strategies.map((s, idx) => (
              <Card
                key={s.id.toString()}
                className="bg-card/80 border-border hover:border-primary/20 transition-colors"
                data-ocid={`strategies.item.${idx + 1}`}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-2">
                    <CardTitle className="text-base font-display">
                      {s.name}
                    </CardTitle>
                    <Badge
                      variant={s.enabled ? "default" : "secondary"}
                      className={
                        s.enabled
                          ? "bg-profit/20 text-profit border-profit/30 text-xs border flex-shrink-0"
                          : "text-xs flex-shrink-0"
                      }
                    >
                      {s.enabled ? "Active" : "Disabled"}
                    </Badge>
                  </div>
                  <CardDescription className="text-xs font-mono">
                    {s.strategyType.replace(/_/g, " ").toUpperCase()}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <div className="bg-background/60 border border-border rounded p-2 text-center">
                      <p className="text-muted-foreground mb-0.5">Short</p>
                      <p className="font-mono-data font-bold">
                        {Number(s.shortWindow)}
                      </p>
                    </div>
                    <div className="bg-background/60 border border-border rounded p-2 text-center">
                      <p className="text-muted-foreground mb-0.5">Long</p>
                      <p className="font-mono-data font-bold">
                        {Number(s.longWindow)}
                      </p>
                    </div>
                    <div className="bg-background/60 border border-border rounded p-2 text-center">
                      <p className="text-muted-foreground mb-0.5">Lot</p>
                      <p className="font-mono-data font-bold">
                        {Number(s.positionSize)}
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-2 text-xs">
                    <span className="flex items-center gap-1 text-loss">
                      <TrendingDown className="w-3 h-3" />
                      SL {s.stopLossPercent}%
                    </span>
                    <span className="flex items-center gap-1 text-profit">
                      <TrendingUp className="w-3 h-3" />
                      TP {s.targetPercent}%
                    </span>
                    <span className="flex items-center gap-1 text-warning">
                      <Activity className="w-3 h-3" />
                      Risk {s.riskPercent}%
                    </span>
                  </div>

                  <div className="flex gap-2">
                    {canManage ? (
                      <Button
                        variant={s.enabled ? "outline" : "default"}
                        size="sm"
                        className="flex-1 text-xs h-8 gap-1.5"
                        onClick={() => handleToggle(s.id, s.name, s.enabled)}
                        disabled={isToggling}
                        data-ocid={`strategies.toggle.${idx + 1}`}
                      >
                        {isToggling ? (
                          <Loader2 className="w-3 h-3 animate-spin" />
                        ) : null}
                        {s.enabled ? "Disable" : "Enable"}
                      </Button>
                    ) : userRole === "Viewer" ? null : (
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 text-xs h-8"
                        data-ocid={`strategies.secondary_button.${idx + 1}`}
                        onClick={() =>
                          toast.info("Subscription feature coming soon")
                        }
                      >
                        Subscribe
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </motion.div>
        )}
      </main>
      <Footer />

      {/* Add Strategy Dialog */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent
          className="bg-card border-border max-w-lg"
          data-ocid="strategies.dialog"
        >
          <DialogHeader>
            <DialogTitle className="font-display">Add New Strategy</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAdd} className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label className="text-xs">Strategy Name</Label>
              <Input
                value={form.name}
                onChange={(e) =>
                  setForm((f) => ({ ...f, name: e.target.value }))
                }
                placeholder="MA Crossover 9/21"
                className="bg-input"
                data-ocid="strategies.input"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs">Short Window</Label>
                <Input
                  type="number"
                  value={form.shortWindow}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, shortWindow: e.target.value }))
                  }
                  className="bg-input font-mono-data"
                  data-ocid="strategies.input"
                  min="2"
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
                  className="bg-input font-mono-data"
                  data-ocid="strategies.input"
                  min="3"
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
                  className="bg-input font-mono-data"
                  data-ocid="strategies.input"
                  step="0.1"
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
                  className="bg-input font-mono-data"
                  data-ocid="strategies.input"
                  step="0.1"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Position Size</Label>
                <Input
                  type="number"
                  value={form.positionSize}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, positionSize: e.target.value }))
                  }
                  className="bg-input font-mono-data"
                  data-ocid="strategies.input"
                  min="1"
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
                  className="bg-input font-mono-data"
                  data-ocid="strategies.input"
                  step="0.1"
                />
              </div>
            </div>
            <DialogFooter className="gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setAddOpen(false)}
                data-ocid="strategies.cancel_button"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isAdding}
                data-ocid="strategies.submit_button"
              >
                {isAdding ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : null}
                Add Strategy
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
