import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Link, useNavigate } from "@tanstack/react-router";
import {
  AlertCircle,
  Github,
  KeyRound,
  Loader2,
  LogIn,
  ShieldCheck,
  Smartphone,
  TrendingUp,
} from "lucide-react";
import { motion } from "motion/react";
import { useEffect } from "react";
import { SiGoogle } from "react-icons/si";
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

  useEffect(() => {
    if (isLoginSuccess) {
      void navigate({ to: "/dashboard" });
    }
  }, [isLoginSuccess, navigate]);

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
                {/* Internet Identity Login */}
                <div className="flex items-start gap-3 p-3 rounded-lg bg-primary/5 border border-primary/15">
                  <KeyRound className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    This platform uses{" "}
                    <strong className="text-foreground">
                      Internet Identity
                    </strong>{" "}
                    — a secure, decentralized authentication system. Click "Sign
                    In" to authenticate.
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
                      Sign In with Internet Identity
                    </>
                  )}
                </Button>

                <div className="text-right">
                  <button
                    type="button"
                    className="text-xs text-muted-foreground hover:text-primary transition-colors"
                    data-ocid="login.link"
                  >
                    Forgot Password?
                  </button>
                </div>
              </form>

              {/* Divider */}
              <div className="flex items-center gap-3">
                <Separator className="flex-1 bg-border" />
                <span className="text-xs text-muted-foreground px-1">
                  or continue with
                </span>
                <Separator className="flex-1 bg-border" />
              </div>

              {/* Social logins */}
              <TooltipProvider>
                <div className="grid grid-cols-2 gap-3">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span>
                        <Button
                          variant="outline"
                          className="w-full gap-2 opacity-50 cursor-not-allowed"
                          disabled
                          data-ocid="login.secondary_button"
                        >
                          <SiGoogle className="w-4 h-4" />
                          Google
                        </Button>
                      </span>
                    </TooltipTrigger>
                    <TooltipContent
                      className="bg-popover border-border text-xs"
                      data-ocid="login.tooltip"
                    >
                      Coming soon — Google OAuth integration
                    </TooltipContent>
                  </Tooltip>

                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span>
                        <Button
                          variant="outline"
                          className="w-full gap-2 opacity-50 cursor-not-allowed"
                          disabled
                          data-ocid="login.secondary_button"
                        >
                          <Github className="w-4 h-4" />
                          GitHub
                        </Button>
                      </span>
                    </TooltipTrigger>
                    <TooltipContent
                      className="bg-popover border-border text-xs"
                      data-ocid="login.tooltip"
                    >
                      Coming soon — GitHub OAuth integration
                    </TooltipContent>
                  </Tooltip>
                </div>
              </TooltipProvider>

              {/* MFA Info Card */}
              <div className="p-3 rounded-lg bg-muted/30 border border-border">
                <div className="flex items-center gap-2 mb-2">
                  <ShieldCheck className="w-4 h-4 text-profit" />
                  <span className="text-xs font-semibold text-foreground">
                    Multi-Factor Authentication
                  </span>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  MFA is available after login in{" "}
                  <strong className="text-foreground">Security Settings</strong>
                  :
                </p>
                <div className="flex flex-wrap gap-2 mt-2">
                  <div className="flex items-center gap-1 text-[10px] text-muted-foreground bg-background/60 border border-border rounded px-2 py-1">
                    <Smartphone className="w-3 h-3" />
                    Google Authenticator
                  </div>
                  <div className="flex items-center gap-1 text-[10px] text-muted-foreground bg-background/60 border border-border rounded px-2 py-1">
                    <KeyRound className="w-3 h-3" />
                    Email OTP
                  </div>
                  <div className="flex items-center gap-1 text-[10px] text-muted-foreground bg-background/60 border border-border rounded px-2 py-1">
                    <Smartphone className="w-3 h-3" />
                    SMS Verification
                  </div>
                </div>
              </div>

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
