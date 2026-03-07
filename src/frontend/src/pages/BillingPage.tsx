import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useNavigate } from "@tanstack/react-router";
import { Check, CreditCard, Loader2, Sparkles, Zap } from "lucide-react";
import { motion } from "motion/react";
import { Footer } from "../components/trading/Footer";
import { Header } from "../components/trading/Header";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { useStrategies } from "../hooks/useQueries";

function useAuthGuard() {
  const { identity, isInitializing } = useInternetIdentity();
  const navigate = useNavigate();
  const isLoggedIn = !!identity && !identity.getPrincipal().isAnonymous();
  if (!isInitializing && !isLoggedIn) {
    void navigate({ to: "/login" });
  }
  return { isLoggedIn, isInitializing };
}

interface Plan {
  name: string;
  price: string;
  period: string;
  badge?: string;
  badgeColor?: string;
  features: string[];
  cta: string;
  highlighted?: boolean;
  disabled?: boolean;
}

const PLANS: Plan[] = [
  {
    name: "Free",
    price: "₹0",
    period: "forever",
    features: [
      "Up to 10 strategies",
      "5 backtests per day",
      "Paper trading only",
      "Basic analytics",
      "Community support",
    ],
    cta: "Current Plan",
    disabled: true,
  },
  {
    name: "Pro",
    price: "₹999",
    period: "per month",
    badge: "Popular",
    badgeColor: "bg-primary/20 text-primary border-primary/30",
    features: [
      "Unlimited strategies",
      "100 backtests per day",
      "Paper + Live trading",
      "Advanced analytics",
      "Priority support",
      "API access",
      "Upstox + Zerodha integration",
    ],
    cta: "Upgrade to Pro",
    highlighted: true,
    disabled: true,
  },
  {
    name: "Enterprise",
    price: "₹2,999",
    period: "per month",
    badge: "Best Value",
    badgeColor: "bg-profit/20 text-profit border-profit/30",
    features: [
      "Everything in Pro",
      "All broker integrations",
      "Custom strategies",
      "Dedicated support",
      "Algorithm marketplace access",
      "White-label options",
      "99.9% SLA",
    ],
    cta: "Upgrade to Enterprise",
    disabled: true,
  },
];

export function BillingPage() {
  const { isLoggedIn, isInitializing } = useAuthGuard();
  const { data: strategies = [] } = useStrategies();

  const strategyCount = strategies.length;
  const strategyLimit = 10;
  const backtestsUsed = 2;
  const backtestLimit = 5;

  if (isInitializing) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2
          className="w-8 h-8 animate-spin text-primary"
          data-ocid="billing.loading_state"
        />
      </div>
    );
  }

  if (!isLoggedIn) return null;

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 max-w-6xl mx-auto w-full px-4 md:px-6 py-6">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <h1 className="font-display text-2xl font-bold flex items-center gap-2">
            <CreditCard className="w-6 h-6 text-primary" />
            Billing & Plans
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Manage your subscription and usage
          </p>
        </motion.div>

        {/* Current Plan */}
        <Card className="bg-card/80 border-border mb-8">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div>
                <CardTitle className="text-base font-display">
                  Current Plan
                </CardTitle>
                <CardDescription className="text-xs">
                  You are on the Free tier
                </CardDescription>
              </div>
              <Badge
                variant="outline"
                className="text-primary border-primary/30 bg-primary/10 text-sm px-3 py-1"
              >
                Free
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <div>
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="text-muted-foreground">
                      Strategies Used
                    </span>
                    <span className="font-mono-data">
                      {strategyCount} / {strategyLimit}
                    </span>
                  </div>
                  <Progress
                    value={(strategyCount / strategyLimit) * 100}
                    className="h-2"
                    data-ocid="billing.panel"
                  />
                </div>
                <div>
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="text-muted-foreground">
                      Backtests Today
                    </span>
                    <span className="font-mono-data">
                      {backtestsUsed} / {backtestLimit}
                    </span>
                  </div>
                  <Progress
                    value={(backtestsUsed / backtestLimit) * 100}
                    className="h-2"
                    data-ocid="billing.panel"
                  />
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-primary/5 border border-primary/15 rounded-lg">
                <Zap className="w-5 h-5 text-primary flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium">
                    Upgrade for unlimited access
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Get unlimited strategies, backtests, and live trading
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Plans */}
        <div className="mb-8">
          <h2 className="font-display text-lg font-semibold mb-4">
            Available Plans
          </h2>
          <TooltipProvider>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {PLANS.map((plan, i) => (
                <motion.div
                  key={plan.name}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  data-ocid={`billing.item.${i + 1}`}
                >
                  <Card
                    className={`h-full bg-card/80 border-border transition-all ${
                      plan.highlighted ? "border-primary/40 shadow-glow" : ""
                    }`}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between mb-2">
                        <CardTitle className="text-base font-display">
                          {plan.name}
                        </CardTitle>
                        {plan.badge && (
                          <Badge
                            variant="outline"
                            className={`text-[10px] border ${plan.badgeColor}`}
                          >
                            {plan.badge}
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-baseline gap-1">
                        <span className="font-display text-2xl font-bold">
                          {plan.price}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          /{plan.period}
                        </span>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <ul className="space-y-2">
                        {plan.features.map((feature) => (
                          <li
                            key={feature}
                            className="flex items-start gap-2 text-xs"
                          >
                            <Check className="w-3.5 h-3.5 text-profit mt-0.5 flex-shrink-0" />
                            <span className="text-muted-foreground">
                              {feature}
                            </span>
                          </li>
                        ))}
                      </ul>

                      {plan.disabled && plan.name !== "Free" ? (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <span className="block w-full">
                              <Button
                                variant={
                                  plan.highlighted ? "default" : "outline"
                                }
                                className="w-full gap-2 opacity-60 cursor-not-allowed"
                                disabled
                                data-ocid={`billing.button.${i + 1}`}
                              >
                                <Sparkles className="w-4 h-4" />
                                {plan.cta}
                              </Button>
                            </span>
                          </TooltipTrigger>
                          <TooltipContent
                            className="bg-popover border-border text-xs"
                            data-ocid="billing.tooltip"
                          >
                            Coming soon — Payments integration in progress
                          </TooltipContent>
                        </Tooltip>
                      ) : (
                        <Button
                          variant={plan.highlighted ? "default" : "outline"}
                          className="w-full gap-2"
                          disabled
                          data-ocid={`billing.button.${i + 1}`}
                        >
                          {plan.name === "Free" ? (
                            <Check className="w-4 h-4" />
                          ) : (
                            <Sparkles className="w-4 h-4" />
                          )}
                          {plan.cta}
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </TooltipProvider>
        </div>

        {/* Billing History */}
        <div>
          <h2 className="font-display text-lg font-semibold mb-4">
            Billing History
          </h2>
          <Card className="bg-card/80 border-border">
            <CardContent className="p-0">
              <ScrollArea className="w-full">
                <Table data-ocid="billing.table">
                  <TableHeader>
                    <TableRow className="border-border hover:bg-transparent">
                      {["Date", "Plan", "Amount", "Status"].map((h) => (
                        <TableHead
                          key={h}
                          className="text-xs text-muted-foreground font-mono uppercase tracking-wider"
                        >
                          {h}
                        </TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-12">
                        <div
                          className="flex flex-col items-center gap-2 text-muted-foreground"
                          data-ocid="billing.empty_state"
                        >
                          <CreditCard className="w-10 h-10 opacity-20" />
                          <p className="text-sm">No billing history yet.</p>
                          <p className="text-xs">
                            Upgrade to a paid plan to see invoices here.
                          </p>
                        </div>
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
}
