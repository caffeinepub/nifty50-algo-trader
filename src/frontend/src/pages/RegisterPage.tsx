import { Alert, AlertDescription } from "@/components/ui/alert";
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
import { Link, useNavigate } from "@tanstack/react-router";
import {
  AlertCircle,
  KeyRound,
  Loader2,
  TrendingUp,
  UserPlus,
} from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Footer } from "../components/trading/Footer";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { useSaveUserProfile } from "../hooks/useQueries";

export function RegisterPage() {
  const {
    login,
    identity,
    isLoggingIn,
    isLoginError,
    loginError,
    isInitializing,
  } = useInternetIdentity();
  const { mutateAsync: saveProfile, isPending: isSaving } =
    useSaveUserProfile();
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [profileSaved, setProfileSaved] = useState(false);

  // After login, save profile
  useEffect(() => {
    if (
      identity &&
      !identity.getPrincipal().isAnonymous() &&
      !profileSaved &&
      name &&
      email
    ) {
      const save = async () => {
        try {
          await saveProfile({ name: name.trim(), email: email.trim() });
          setProfileSaved(true);
          toast.success("Account created! Welcome to NIFTY50Algo.");
          void navigate({ to: "/dashboard" });
        } catch {
          toast.error("Profile save failed. Please try updating in dashboard.");
          void navigate({ to: "/dashboard" });
        }
      };
      void save();
    } else if (
      identity &&
      !identity.getPrincipal().isAnonymous() &&
      profileSaved
    ) {
      void navigate({ to: "/dashboard" });
    }
  }, [identity, profileSaved, name, email, saveProfile, navigate]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) {
      toast.error("Please fill in your name and email.");
      return;
    }
    login();
  };

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

      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <motion.div
          className="w-full max-w-md"
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
                    className="bg-input"
                    data-ocid="register.input"
                    autoComplete="name"
                    required
                  />
                </div>

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
                    className="bg-input"
                    data-ocid="register.input"
                    autoComplete="email"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="password" className="text-sm">
                    Password
                  </Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="bg-input"
                    data-ocid="register.input"
                    autoComplete="new-password"
                  />
                </div>

                <div className="pt-1">
                  <div className="flex items-start gap-3 p-3 rounded-lg bg-primary/5 border border-primary/15 mb-4">
                    <KeyRound className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      Authentication uses{" "}
                      <strong className="text-foreground">
                        Internet Identity
                      </strong>{" "}
                      — cryptographic login with no passwords stored. Your
                      trading data is secured on-chain.
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
                </div>
              </form>

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
