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
  LogIn,
  TrendingUp,
} from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { Footer } from "../components/trading/Footer";
import { useInternetIdentity } from "../hooks/useInternetIdentity";

export function LoginPage() {
  const {
    login,
    isLoggingIn,
    isLoginError,
    loginError,
    isLoginSuccess,
    isInitializing,
  } = useInternetIdentity();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Redirect on success
  if (isLoginSuccess) {
    void navigate({ to: "/dashboard" });
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    login();
  };

  return (
    <div className="min-h-screen flex flex-col bg-background grid-bg">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-profit/3 pointer-events-none" />

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
              <div className="w-14 h-14 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto mb-4">
                <LogIn className="w-6 h-6 text-primary" />
              </div>
              <CardTitle className="font-display text-2xl">
                Welcome back
              </CardTitle>
              <CardDescription>Sign in to your trading account</CardDescription>
            </CardHeader>

            <CardContent className="space-y-5">
              {isLoginError && (
                <Alert variant="destructive" data-ocid="login.error_state">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    {loginError?.message ??
                      "Authentication failed. Please try again."}
                  </AlertDescription>
                </Alert>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="email" className="text-sm">
                    Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="trader@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="bg-input"
                    data-ocid="login.input"
                    autoComplete="email"
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
                    data-ocid="login.input"
                    autoComplete="current-password"
                  />
                </div>

                <div className="pt-1">
                  <div className="flex items-start gap-3 p-3 rounded-lg bg-primary/5 border border-primary/15 mb-4">
                    <KeyRound className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      This platform uses{" "}
                      <strong className="text-foreground">
                        Internet Identity
                      </strong>{" "}
                      — a secure, decentralized authentication system. Click
                      "Sign In" to authenticate via your browser's cryptographic
                      key.
                    </p>
                  </div>

                  <Button
                    type="submit"
                    className="w-full gap-2"
                    disabled={isLoggingIn || isInitializing}
                    data-ocid="login.submit_button"
                  >
                    {isLoggingIn ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Authenticating...
                      </>
                    ) : (
                      <>
                        <LogIn className="w-4 h-4" />
                        Sign In
                      </>
                    )}
                  </Button>
                </div>
              </form>

              <div className="text-center text-sm text-muted-foreground">
                Don't have an account?{" "}
                <Link
                  to="/register"
                  className="text-primary hover:underline font-medium"
                  data-ocid="login.link"
                >
                  Create account
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
