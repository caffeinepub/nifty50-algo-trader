import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "@tanstack/react-router";
import {
  Activity,
  ArrowRight,
  BarChart3,
  CheckCircle2,
  Cpu,
  LineChart,
  Shield,
  TrendingUp,
  Zap,
} from "lucide-react";
import { motion } from "motion/react";
import { Footer } from "../components/trading/Footer";
import { Header } from "../components/trading/Header";

const features = [
  {
    icon: Activity,
    title: "Real-Time Market Data",
    description:
      "Connect to live NIFTY 50 data feeds with OHLCV candles across 1m, 5m, 15m, and daily timeframes.",
    color: "text-primary",
    bg: "bg-primary/10",
  },
  {
    icon: BarChart3,
    title: "Technical Indicators",
    description:
      "Full suite: SMA, EMA, RSI, MACD, Bollinger Bands, volatility calculations — all computed in real-time.",
    color: "text-profit",
    bg: "bg-profit/10",
  },
  {
    icon: Cpu,
    title: "Algorithm Engine",
    description:
      "MA Crossover, momentum strategies, and custom algorithm logic with configurable parameters.",
    color: "text-warning",
    bg: "bg-warning/10",
  },
  {
    icon: LineChart,
    title: "Advanced Backtesting",
    description:
      "Test strategies on historical data. Get P&L, win rate, max drawdown, Sharpe ratio, and equity curves.",
    color: "text-primary",
    bg: "bg-primary/10",
  },
  {
    icon: Zap,
    title: "Upstox Integration",
    description:
      "Secure broker API connection for automated order placement, position tracking, and execution.",
    color: "text-profit",
    bg: "bg-profit/10",
  },
  {
    icon: Shield,
    title: "Risk Management",
    description:
      "Built-in stop-loss, target profit, position sizing, and paper trading mode for safe testing.",
    color: "text-loss",
    bg: "bg-loss/10",
  },
];

const stats = [
  { label: "NIFTY 50 Stocks", value: "50" },
  { label: "Timeframes", value: "4" },
  { label: "Strategy Types", value: "10+" },
  { label: "Indicators", value: "6+" },
];

const benefits = [
  "MA Crossover with configurable windows",
  "Automated stop-loss & target execution",
  "Paper trading mode for risk-free testing",
  "Full backtest with equity curve",
  "Upstox API integration",
  "Admin panel for strategy management",
];

export function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />

      <main className="flex-1">
        {/* Hero */}
        <section className="relative overflow-hidden grid-bg">
          <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-background pointer-events-none" />
          <div className="absolute top-20 right-10 w-72 h-72 rounded-full bg-primary/5 blur-3xl pointer-events-none" />
          <div className="absolute bottom-10 left-10 w-56 h-56 rounded-full bg-profit/5 blur-3xl pointer-events-none" />

          <div className="relative max-w-7xl mx-auto px-4 md:px-6 pt-24 pb-20 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Badge
                variant="outline"
                className="mb-6 border-primary/40 text-primary bg-primary/10 px-4 py-1 font-mono text-xs tracking-widest"
              >
                ALGORITHMIC TRADING PLATFORM
              </Badge>
            </motion.div>

            <motion.h1
              className="font-display text-4xl md:text-6xl lg:text-7xl font-bold leading-tight tracking-tight mb-6"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              Trade <span className="text-primary">NIFTY 50</span>
              <br />
              with Algorithms
            </motion.h1>

            <motion.p
              className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              Automate your NIFTY 50 trading strategies with a
              professional-grade platform. Backtest, optimize, and execute with
              precision using our algorithmic engine.
            </motion.p>

            <motion.div
              className="flex flex-col sm:flex-row gap-3 justify-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <Button
                asChild
                size="lg"
                className="gap-2 glow-primary"
                data-ocid="hero.primary_button"
              >
                <Link to="/register">
                  Start Trading
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="gap-2"
                data-ocid="hero.secondary_button"
              >
                <Link to="/login">Sign In to Dashboard</Link>
              </Button>
            </motion.div>

            {/* Stats Row */}
            <motion.div
              className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-20 max-w-3xl mx-auto"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.5 }}
            >
              {stats.map((s) => (
                <div key={s.label} className="text-center">
                  <div className="font-display font-bold text-3xl md:text-4xl text-primary font-mono-data">
                    {s.value}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1 tracking-wider uppercase">
                    {s.label}
                  </div>
                </div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* Features Grid */}
        <section className="max-w-7xl mx-auto px-4 md:px-6 py-20">
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="font-display text-3xl md:text-4xl font-bold mb-3">
              Everything You Need to Trade
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              A complete algorithmic trading stack built for the Indian equity
              market.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.07 }}
              >
                <Card className="h-full bg-card/60 border-border hover:border-primary/30 transition-colors group">
                  <CardContent className="p-5">
                    <div
                      className={`w-10 h-10 rounded-lg ${f.bg} border border-current/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}
                    >
                      <f.icon className={`w-5 h-5 ${f.color}`} />
                    </div>
                    <h3 className="font-display font-semibold text-base mb-2">
                      {f.title}
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {f.description}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Benefits CTA */}
        <section className="bg-card/40 border-y border-border py-20">
          <div className="max-w-5xl mx-auto px-4 md:px-6">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
              >
                <h2 className="font-display text-3xl font-bold mb-4">
                  Built for Serious{" "}
                  <span className="text-primary">Algo Traders</span>
                </h2>
                <p className="text-muted-foreground mb-6 leading-relaxed">
                  Whether you're testing your first strategy or running a live
                  algorithm, our platform provides the infrastructure you need.
                </p>
                <div className="space-y-3">
                  {benefits.map((b) => (
                    <div key={b} className="flex items-center gap-3">
                      <CheckCircle2 className="w-4 h-4 text-profit shrink-0" />
                      <span className="text-sm">{b}</span>
                    </div>
                  ))}
                </div>
              </motion.div>

              <motion.div
                className="relative"
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.15 }}
              >
                {/* Mock terminal card */}
                <div className="bg-background border border-border rounded-xl p-5 scanline">
                  <div className="flex items-center gap-2 mb-4 pb-3 border-b border-border">
                    <div className="w-3 h-3 rounded-full bg-loss/70" />
                    <div className="w-3 h-3 rounded-full bg-warning/70" />
                    <div className="w-3 h-3 rounded-full bg-profit/70" />
                    <span className="ml-2 text-xs font-mono text-muted-foreground">
                      backtest_results.log
                    </span>
                  </div>
                  <div className="space-y-2 font-mono text-xs">
                    {[
                      {
                        k: "Strategy",
                        v: "MA Crossover (9/21)",
                        c: "text-primary",
                      },
                      { k: "Symbol", v: "NIFTY50", c: "text-foreground" },
                      {
                        k: "Period",
                        v: "Jan 2024 — Dec 2024",
                        c: "text-foreground",
                      },
                      { k: "Total P&L", v: "+₹84,320", c: "text-profit" },
                      { k: "Win Rate", v: "63.2%", c: "text-profit" },
                      { k: "Max Drawdown", v: "-8.4%", c: "text-loss" },
                      { k: "Sharpe Ratio", v: "1.87", c: "text-warning" },
                      { k: "Total Trades", v: "147", c: "text-foreground" },
                    ].map((row) => (
                      <div key={row.k} className="flex justify-between gap-4">
                        <span className="text-muted-foreground">{row.k}</span>
                        <span className={`${row.c} font-semibold`}>
                          {row.v}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="absolute -bottom-3 -right-3 w-full h-full rounded-xl border border-primary/20 bg-primary/5 -z-10" />
              </motion.div>
            </div>
          </div>
        </section>

        {/* CTA Banner */}
        <section className="max-w-7xl mx-auto px-4 md:px-6 py-20 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-profit/10 border border-primary/20 rounded-2xl p-12">
              <TrendingUp className="w-12 h-12 text-primary mx-auto mb-4" />
              <h2 className="font-display text-3xl md:text-4xl font-bold mb-3">
                Ready to Automate Your Trading?
              </h2>
              <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
                Join the platform and start backtesting your NIFTY 50 strategies
                today. No coding required.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button
                  asChild
                  size="lg"
                  className="gap-2"
                  data-ocid="cta.primary_button"
                >
                  <Link to="/register">
                    Create Free Account
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </Button>
                <Button
                  asChild
                  size="lg"
                  variant="outline"
                  data-ocid="cta.secondary_button"
                >
                  <Link to="/login">Sign In</Link>
                </Button>
              </div>
            </div>
          </motion.div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
