import { Outlet } from "@tanstack/react-router";
import { AnimatedBackground } from "../components/trading/AnimatedBackground";

export function RootLayout() {
  return (
    <div className="relative min-h-screen bg-background text-foreground">
      <AnimatedBackground />
      <div className="relative" style={{ zIndex: 1 }}>
        <Outlet />
      </div>
    </div>
  );
}
