import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Link, useNavigate } from "@tanstack/react-router";
import {
  AlertCircle,
  Check,
  Eye,
  EyeOff,
  KeyRound,
  Loader2,
  TrendingUp,
  UserPlus,
  X,
} from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Footer } from "../components/trading/Footer";
import { createActorWithConfig } from "../config";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { getSecretParameter } from "../utils/urlParams";

// ── Countries list ─────────────────────────────────────────────────────────────

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
  "Thailand",
  "Hong Kong",
  "New Zealand",
  "Ireland",
  "Italy",
  "Spain",
  "Portugal",
  "Poland",
  "Turkey",
  "Saudi Arabia",
  "Israel",
  "Mexico",
  "Argentina",
  "Chile",
];

// ── Password strength ──────────────────────────────────────────────────────────

function getPasswordStrength(password: string): {
  score: number;
  label: string;
  color: string;
  barColor: string;
} {
  if (!password) return { score: 0, label: "", color: "", barColor: "" };
  let score = 0;
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[a-z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  if (score <= 2)
    return {
      score,
      label: "Weak",
      color: "text-loss",
      barColor: "bg-loss",
    };
  if (score <= 3)
    return {
      score,
      label: "Fair",
      color: "text-warning",
      barColor: "bg-warning",
    };
  if (score <= 4)
    return {
      score,
      label: "Good",
      color: "text-primary",
      barColor: "bg-primary",
    };
  return {
    score,
    label: "Strong",
    color: "text-profit",
    barColor: "bg-profit",
  };
}

interface PasswordRequirement {
  label: string;
  met: boolean;
}

function getPasswordRequirements(password: string): PasswordRequirement[] {
  return [
    { label: "At least 8 characters", met: password.length >= 8 },
    { label: "Uppercase letter (A-Z)", met: /[A-Z]/.test(password) },
    { label: "Lowercase letter (a-z)", met: /[a-z]/.test(password) },
    { label: "Number (0-9)", met: /[0-9]/.test(password) },
    {
      label: "Special character (!@#$...)",
      met: /[^A-Za-z0-9]/.test(password),
    },
  ];
}

// ── Register Page ──────────────────────────────────────────────────────────────

export function RegisterPage() {
  const {
    login,
    identity,
    isLoggingIn,
    isLoginError,
    loginError,
    isInitializing,
  } = useInternetIdentity();
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [country, setCountry] = useState("");
  const [experienceLevel, setExperienceLevel] = useState("");
  const [tradingMarkets, setTradingMarkets] = useState<string[]>([]);
  const [role, setRole] = useState("Trader");
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [profileSaved, setProfileSaved] = useState(false);

  // Keep a ref to the latest form values so the async save always reads current data
  const formRef = useRef({
    name,
    email,
    country,
    experienceLevel,
    tradingMarkets,
    role,
  });
  useEffect(() => {
    formRef.current = {
      name,
      email,
      country,
      experienceLevel,
      tradingMarkets,
      role,
    };
  }, [name, email, country, experienceLevel, tradingMarkets, role]);

  // Validation errors
  const [errors, setErrors] = useState<Record<string, string>>({});

  const passwordStrength = getPasswordStrength(password);
  const passwordReqs = getPasswordRequirements(password);

  const MARKETS = ["NIFTY", "BankNifty", "Stocks", "Crypto"];

  const toggleMarket = (market: string) => {
    setTradingMarkets((prev) =>
      prev.includes(market)
        ? prev.filter((m) => m !== market)
        : [...prev, market],
    );
  };

  // After login, build a fresh authenticated actor directly and save the profile.
  // This avoids all React Query cache timing issues — we own the actor lifecycle here.
  useEffect(() => {
    if (
      identity &&
      !identity.getPrincipal().isAnonymous() &&
      !profileSaved &&
      !isSaving &&
      formRef.current.name &&
      formRef.current.email
    ) {
      let cancelled = false;
      setIsSaving(true);

      const save = async () => {
        const MAX_ATTEMPTS = 30; // 15 seconds total
        const DELAY_MS = 500;

        for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
          if (cancelled) return;
          try {
            // Create a fresh actor with the authenticated identity each attempt
            const actor = await createActorWithConfig({
              agentOptions: { identity },
            });
            const adminToken = getSecretParameter("caffeineAdminToken") || "";
            await actor._initializeAccessControlWithSecret(adminToken);

            if (cancelled) return;

            const {
              name: n,
              email: e,
              country: c,
              experienceLevel: exp,
              tradingMarkets: tm,
              role: r,
            } = formRef.current;
            await actor.saveCallerUserProfile({
              name: n.trim(),
              email: e.trim(),
              country: c || "India",
              experienceLevel: exp || "Beginner",
              tradingMarket: tm.join(",") || "NIFTY",
              role: r,
              pendingApproval: r === "AlgoCreator",
              followersCount: BigInt(0),
              joinedAt: BigInt(Date.now()),
            });

            if (!cancelled) {
              setProfileSaved(true);
              setIsSaving(false);
              toast.success("Account created! Welcome to NIFTY50Algo.");
              void navigate({ to: "/dashboard" });
            }
            return;
          } catch (err) {
            const msg = err instanceof Error ? err.message : String(err);
            const isTransient =
              msg.includes("Not authenticated") ||
              msg.includes("Anonymous") ||
              msg.includes("not initialized") ||
              msg.includes("Failed to fetch") ||
              msg.includes("network") ||
              msg.toLowerCase().includes("timeout");

            if (isTransient && attempt < MAX_ATTEMPTS - 1) {
              await new Promise((r) => setTimeout(r, DELAY_MS));
              continue;
            }

            // Non-transient error or exhausted retries
            if (!cancelled) {
              setIsSaving(false);
              toast.error(
                "Profile save failed. Please update your profile in Settings.",
              );
              void navigate({ to: "/dashboard" });
            }
            return;
          }
        }

        // Should not reach here, but guard anyway
        if (!cancelled) {
          setIsSaving(false);
          toast.error(
            "Profile save timed out. Please update your profile in Settings.",
          );
          void navigate({ to: "/dashboard" });
        }
      };

      void save();
      return () => {
        cancelled = true;
      };
    }
    if (identity && !identity.getPrincipal().isAnonymous() && profileSaved) {
      void navigate({ to: "/dashboard" });
    }
  }, [identity, profileSaved, isSaving, navigate]);

  // Pure validation -- does NOT call setErrors so it can run synchronously
  // inside the click handler before calling login() (which needs to be called
  // as a direct result of the user gesture to avoid browser popup blocking).
  const buildErrors = (): Record<string, string> => {
    const newErrors: Record<string, string> = {};

    if (!name.trim()) newErrors.name = "Full name is required";
    if (!email.trim()) newErrors.email = "Email address is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      newErrors.email = "Enter a valid email address";

    if (!password) newErrors.password = "Password is required";
    else if (password.length < 8)
      newErrors.password = "Password must be at least 8 characters";
    else if (passwordStrength.score < 3)
      newErrors.password = "Password is too weak";

    if (!confirmPassword)
      newErrors.confirmPassword = "Please confirm your password";
    else if (password !== confirmPassword)
      newErrors.confirmPassword = "Passwords do not match";

    if (!country) newErrors.country = "Please select your country";
    if (!experienceLevel)
      newErrors.experienceLevel = "Please select your experience level";
    if (tradingMarkets.length === 0)
      newErrors.tradingMarkets = "Please select at least one trading market";
    if (!acceptTerms)
      newErrors.acceptTerms = "You must accept the terms and privacy policy";

    return newErrors;
  };

  // If the user already has a valid authenticated identity (e.g. existing II session),
  // trigger the profile save directly without opening the II popup. The save useEffect
  // watches `identity` so updating a local flag is enough.
  const [triggerSaveDirectly, setTriggerSaveDirectly] = useState(false);

  // When we detect an already-authenticated identity before the user even clicks,
  // just proceed straight to the save flow once form is submitted.
  const isAlreadyAuthenticated =
    identity !== undefined && !identity.getPrincipal().isAnonymous();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors = buildErrors();
    if (Object.keys(newErrors).length > 0) {
      // Show errors and stop -- do NOT call login() so no popup is triggered
      setErrors(newErrors);
      return;
    }
    setErrors({});

    if (isAlreadyAuthenticated) {
      // Identity already valid -- skip II popup and go straight to profile save
      setTriggerSaveDirectly(true);
    } else {
      // Call login() synchronously inside the user-gesture handler so the
      // Internet Identity popup is not blocked by the browser.
      login();
    }
  };

  // When triggerSaveDirectly is set, kick off the profile save immediately.
  useEffect(() => {
    if (
      triggerSaveDirectly &&
      isAlreadyAuthenticated &&
      identity &&
      !profileSaved &&
      !isSaving &&
      formRef.current.name &&
      formRef.current.email
    ) {
      // Reset flag and let the main save effect handle it by re-asserting identity state.
      setTriggerSaveDirectly(false);
      // Force the main save effect to fire by nudging isSaving.
      // We accomplish this by directly running the save inline here.
      let cancelled = false;
      setIsSaving(true);

      const save = async () => {
        const MAX_ATTEMPTS = 30;
        const DELAY_MS = 500;

        for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
          if (cancelled) return;
          try {
            const actor = await createActorWithConfig({
              agentOptions: { identity },
            });
            const adminToken = getSecretParameter("caffeineAdminToken") || "";
            await actor._initializeAccessControlWithSecret(adminToken);

            if (cancelled) return;

            const {
              name: n,
              email: e,
              country: c,
              experienceLevel: exp,
              tradingMarkets: tm,
              role: r,
            } = formRef.current;
            await actor.saveCallerUserProfile({
              name: n.trim(),
              email: e.trim(),
              country: c || "India",
              experienceLevel: exp || "Beginner",
              tradingMarket: tm.join(",") || "NIFTY",
              role: r,
              pendingApproval: r === "AlgoCreator",
              followersCount: BigInt(0),
              joinedAt: BigInt(Date.now()),
            });

            if (!cancelled) {
              setProfileSaved(true);
              setIsSaving(false);
              toast.success("Account created! Welcome to NIFTY50Algo.");
              void navigate({ to: "/dashboard" });
            }
            return;
          } catch (err) {
            const msg = err instanceof Error ? err.message : String(err);
            const isTransient =
              msg.includes("Not authenticated") ||
              msg.includes("Anonymous") ||
              msg.includes("not initialized") ||
              msg.includes("Failed to fetch") ||
              msg.includes("network") ||
              msg.toLowerCase().includes("timeout");

            if (isTransient && attempt < MAX_ATTEMPTS - 1) {
              await new Promise((r) => setTimeout(r, DELAY_MS));
              continue;
            }

            if (!cancelled) {
              setIsSaving(false);
              toast.error(
                "Profile save failed. Please update your profile in Settings.",
              );
              void navigate({ to: "/dashboard" });
            }
            return;
          }
        }

        if (!cancelled) {
          setIsSaving(false);
          toast.error(
            "Profile save timed out. Please update your profile in Settings.",
          );
          void navigate({ to: "/dashboard" });
        }
      };

      void save();
      return () => {
        cancelled = true;
      };
    }
  }, [
    triggerSaveDirectly,
    isAlreadyAuthenticated,
    identity,
    profileSaved,
    isSaving,
    navigate,
  ]);

  return (
    <div className="min-h-screen flex flex-col bg-background grid-bg">
      <div className="absolute inset-0 bg-gradient-to-br from-profit/5 via-transparent to-primary/3 pointer-events-none" />

      <header className="p-4 md:p-6">
        <Link
          to="/"
          className="flex items-center gap-2 w-fit"
          data-ocid="nav.link"
        >
          <div className="w-8 h-8 rounded-md bg-primary/10 border border-primary/30 flex items-center justify-center">
            <TrendingUp className="w-4 h-4 text-primary" />
          </div>
          <span className="font-display font-bold text-lg tracking-tight">
            NIFTY50<span className="text-primary">Algo</span>
          </span>
        </Link>
      </header>

      <main className="flex-1 flex items-center justify-center px-4 py-8">
        <motion.div
          className="w-full max-w-xl"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <Card className="bg-card/80 border-border backdrop-blur-sm">
            <CardHeader className="text-center pb-4">
              <div className="w-14 h-14 rounded-xl bg-profit/10 border border-profit/20 flex items-center justify-center mx-auto mb-4">
                <UserPlus className="w-6 h-6 text-profit" />
              </div>
              <CardTitle className="font-display text-2xl">
                Create Account
              </CardTitle>
              <CardDescription>
                Start algorithmic trading on NIFTY 50
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-5">
              {isLoginError && (
                <Alert variant="destructive" data-ocid="register.error_state">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    {loginError?.message ??
                      "Registration failed. Please try again."}
                  </AlertDescription>
                </Alert>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Full Name */}
                <div className="space-y-1.5">
                  <Label htmlFor="name" className="text-sm">
                    Full Name
                  </Label>
                  <Input
                    id="name"
                    type="text"
                    placeholder="Arjun Sharma"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className={`bg-input ${errors.name ? "border-loss" : ""}`}
                    data-ocid="register.input"
                    autoComplete="name"
                  />
                  {errors.name && (
                    <p
                      className="text-xs text-loss"
                      data-ocid="register.error_state"
                    >
                      {errors.name}
                    </p>
                  )}
                </div>

                {/* Email */}
                <div className="space-y-1.5">
                  <Label htmlFor="email" className="text-sm">
                    Email Address
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="trader@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={`bg-input ${errors.email ? "border-loss" : ""}`}
                    data-ocid="register.input"
                    autoComplete="email"
                  />
                  {errors.email && (
                    <p
                      className="text-xs text-loss"
                      data-ocid="register.error_state"
                    >
                      {errors.email}
                    </p>
                  )}
                </div>

                {/* Password */}
                <div className="space-y-1.5">
                  <Label htmlFor="password" className="text-sm">
                    Password
                  </Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className={`bg-input pr-10 ${errors.password ? "border-loss" : ""}`}
                      data-ocid="register.input"
                      autoComplete="new-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {showPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>

                  {/* Password strength bar */}
                  {password && (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-1.5 bg-border rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-300 ${passwordStrength.barColor}`}
                            style={{
                              width: `${(passwordStrength.score / 6) * 100}%`,
                            }}
                          />
                        </div>
                        <span
                          className={`text-xs font-mono ${passwordStrength.color}`}
                        >
                          {passwordStrength.label}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-1">
                        {passwordReqs.map((req) => (
                          <div
                            key={req.label}
                            className="flex items-center gap-1.5"
                          >
                            {req.met ? (
                              <Check className="w-3 h-3 text-profit flex-shrink-0" />
                            ) : (
                              <X className="w-3 h-3 text-muted-foreground flex-shrink-0" />
                            )}
                            <span
                              className={`text-[10px] ${req.met ? "text-profit" : "text-muted-foreground"}`}
                            >
                              {req.label}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  {errors.password && (
                    <p
                      className="text-xs text-loss"
                      data-ocid="register.error_state"
                    >
                      {errors.password}
                    </p>
                  )}
                </div>

                {/* Confirm Password */}
                <div className="space-y-1.5">
                  <Label htmlFor="confirmPassword" className="text-sm">
                    Confirm Password
                  </Label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      type={showConfirm ? "text" : "password"}
                      placeholder="••••••••"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className={`bg-input pr-10 ${errors.confirmPassword ? "border-loss" : confirmPassword && password === confirmPassword ? "border-profit" : ""}`}
                      data-ocid="register.input"
                      autoComplete="new-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirm(!showConfirm)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {showConfirm ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                  {errors.confirmPassword && (
                    <p
                      className="text-xs text-loss"
                      data-ocid="register.error_state"
                    >
                      {errors.confirmPassword}
                    </p>
                  )}
                  {confirmPassword &&
                    password === confirmPassword &&
                    !errors.confirmPassword && (
                      <p className="text-xs text-profit flex items-center gap-1">
                        <Check className="w-3 h-3" />
                        Passwords match
                      </p>
                    )}
                </div>

                {/* Country */}
                <div className="space-y-1.5">
                  <Label className="text-sm">Country</Label>
                  <Select value={country} onValueChange={setCountry}>
                    <SelectTrigger
                      className={`bg-input ${errors.country ? "border-loss" : ""}`}
                      data-ocid="register.select"
                    >
                      <SelectValue placeholder="Select your country" />
                    </SelectTrigger>
                    <SelectContent className="bg-popover border-border max-h-60">
                      {COUNTRIES.map((c) => (
                        <SelectItem key={c} value={c}>
                          {c}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.country && (
                    <p
                      className="text-xs text-loss"
                      data-ocid="register.error_state"
                    >
                      {errors.country}
                    </p>
                  )}
                </div>

                {/* Experience Level */}
                <div className="space-y-1.5">
                  <Label className="text-sm">Experience Level</Label>
                  <div className="flex gap-2">
                    {["Beginner", "Intermediate", "Professional"].map(
                      (level) => (
                        <button
                          key={level}
                          type="button"
                          onClick={() => setExperienceLevel(level)}
                          className={`flex-1 py-2 px-3 rounded-md border text-xs font-medium transition-all ${
                            experienceLevel === level
                              ? "bg-primary/20 border-primary/50 text-primary"
                              : "bg-input border-border text-muted-foreground hover:border-primary/30"
                          }`}
                          data-ocid="register.toggle"
                        >
                          {level}
                        </button>
                      ),
                    )}
                  </div>
                  {errors.experienceLevel && (
                    <p
                      className="text-xs text-loss"
                      data-ocid="register.error_state"
                    >
                      {errors.experienceLevel}
                    </p>
                  )}
                </div>

                {/* Trading Markets */}
                <div className="space-y-1.5">
                  <Label className="text-sm">Trading Market</Label>
                  <div className="flex flex-wrap gap-2">
                    {MARKETS.map((market) => (
                      <button
                        key={market}
                        type="button"
                        onClick={() => toggleMarket(market)}
                        className={`py-1.5 px-3 rounded-md border text-xs font-medium transition-all flex items-center gap-1.5 ${
                          tradingMarkets.includes(market)
                            ? "bg-profit/15 border-profit/40 text-profit"
                            : "bg-input border-border text-muted-foreground hover:border-profit/20"
                        }`}
                        data-ocid="register.toggle"
                      >
                        {tradingMarkets.includes(market) && (
                          <Check className="w-3 h-3" />
                        )}
                        {market}
                      </button>
                    ))}
                  </div>
                  {errors.tradingMarkets && (
                    <p
                      className="text-xs text-loss"
                      data-ocid="register.error_state"
                    >
                      {errors.tradingMarkets}
                    </p>
                  )}
                </div>

                {/* Role */}
                <div className="space-y-1.5">
                  <Label className="text-sm">Account Role</Label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      {
                        value: "Trader",
                        label: "Trader",
                        desc: "Trade strategies",
                        color: "text-primary border-primary/40 bg-primary/10",
                      },
                      {
                        value: "AlgoCreator",
                        label: "Algo Creator",
                        desc: "Create & publish",
                        color:
                          "text-[oklch(0.65_0.2_290)] border-[oklch(0.65_0.2_290)/40] bg-[oklch(0.65_0.2_290)/10]",
                      },
                      {
                        value: "Viewer",
                        label: "Viewer",
                        desc: "View results only",
                        color:
                          "text-muted-foreground border-border bg-muted/20",
                      },
                    ].map((r) => (
                      <button
                        key={r.value}
                        type="button"
                        onClick={() => setRole(r.value)}
                        className={`py-2 px-3 rounded-md border text-xs font-medium transition-all text-left ${
                          role === r.value
                            ? r.color
                            : "bg-input border-border text-muted-foreground hover:border-border"
                        }`}
                        data-ocid="register.toggle"
                      >
                        <div className="font-semibold">{r.label}</div>
                        <div className="text-[10px] opacity-70 mt-0.5">
                          {r.desc}
                        </div>
                      </button>
                    ))}
                  </div>
                  {role === "AlgoCreator" && (
                    <div className="flex items-start gap-2 p-2.5 bg-warning/10 border border-warning/20 rounded-md mt-1">
                      <AlertCircle className="w-3.5 h-3.5 text-warning mt-0.5 flex-shrink-0" />
                      <p className="text-xs text-warning/90">
                        Your account will be reviewed by admin before you can
                        publish algorithms.
                      </p>
                    </div>
                  )}
                </div>

                {/* Terms */}
                <div className="space-y-1.5">
                  <div className="flex items-start gap-3">
                    <Checkbox
                      id="terms"
                      checked={acceptTerms}
                      onCheckedChange={(checked) =>
                        setAcceptTerms(checked === true)
                      }
                      className="mt-0.5"
                      data-ocid="register.checkbox"
                    />
                    <Label
                      htmlFor="terms"
                      className="text-xs text-muted-foreground leading-relaxed cursor-pointer"
                    >
                      I accept the{" "}
                      <button
                        type="button"
                        className="text-primary hover:underline font-normal"
                      >
                        Terms of Service
                      </button>{" "}
                      and{" "}
                      <button
                        type="button"
                        className="text-primary hover:underline font-normal"
                      >
                        Privacy Policy
                      </button>
                      . I understand that strong security practices protect my
                      account.
                    </Label>
                  </div>
                  {errors.acceptTerms && (
                    <p
                      className="text-xs text-loss"
                      data-ocid="register.error_state"
                    >
                      {errors.acceptTerms}
                    </p>
                  )}
                </div>

                {/* Auth notice */}
                <div className="flex items-start gap-3 p-3 rounded-lg bg-primary/5 border border-primary/15">
                  <KeyRound className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Authentication uses{" "}
                    <strong className="text-foreground">
                      Internet Identity
                    </strong>{" "}
                    — cryptographic login with no passwords stored on-chain.
                    Your trading data is fully secured.
                  </p>
                </div>

                <Button
                  type="submit"
                  className="w-full gap-2"
                  disabled={isLoggingIn || isInitializing || isSaving}
                  data-ocid="register.submit_button"
                >
                  {isLoggingIn || isSaving ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      {isSaving ? "Saving profile..." : "Authenticating..."}
                    </>
                  ) : (
                    <>
                      <UserPlus className="w-4 h-4" />
                      Create Account
                    </>
                  )}
                </Button>
              </form>

              {/* Role badges */}
              <div className="flex items-center justify-center gap-2 pt-1">
                <span className="text-xs text-muted-foreground">Roles:</span>
                <Badge
                  variant="outline"
                  className="text-[10px] text-primary border-primary/30"
                >
                  Admin
                </Badge>
                <Badge variant="outline" className="text-[10px] border-border">
                  Algo Creator
                </Badge>
                <Badge
                  variant="outline"
                  className="text-[10px] text-profit border-profit/30"
                >
                  Trader
                </Badge>
                <Badge variant="outline" className="text-[10px]">
                  Viewer
                </Badge>
              </div>

              <div className="text-center text-sm text-muted-foreground">
                Already have an account?{" "}
                <Link
                  to="/login"
                  className="text-primary hover:underline font-medium"
                  data-ocid="register.link"
                >
                  Sign in
                </Link>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </main>

      <Footer />
    </div>
  );
}
