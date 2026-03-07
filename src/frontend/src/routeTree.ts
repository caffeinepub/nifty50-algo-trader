import { createRootRoute, createRoute } from "@tanstack/react-router";
import { RootLayout } from "./layouts/RootLayout";
import { AdminPage } from "./pages/AdminPage";
import { AlgoCreatorProfilePage } from "./pages/AlgoCreatorProfilePage";
import { ApiKeysPage } from "./pages/ApiKeysPage";
import { BacktestPage } from "./pages/BacktestPage";
import { BillingPage } from "./pages/BillingPage";
import { DashboardPage } from "./pages/DashboardPage";
import { LandingPage } from "./pages/LandingPage";
import { LoginPage } from "./pages/LoginPage";
import { MarketplacePage } from "./pages/MarketplacePage";
import { MyStrategiesPage } from "./pages/MyStrategiesPage";
import { RegisterPage } from "./pages/RegisterPage";

const rootRoute = createRootRoute({
  component: RootLayout,
});

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: LandingPage,
});

const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/login",
  component: LoginPage,
});

const registerRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/register",
  component: RegisterPage,
});

const dashboardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/dashboard",
  component: DashboardPage,
});

const backtestRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/dashboard/backtest",
  component: BacktestPage,
});

const strategiesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/dashboard/strategies",
  component: MyStrategiesPage,
});

const apiKeysRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/dashboard/api-keys",
  component: ApiKeysPage,
});

const marketplaceRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/dashboard/marketplace",
  component: MarketplacePage,
});

const billingRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/dashboard/billing",
  component: BillingPage,
});

const profileRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/dashboard/profile",
  component: AlgoCreatorProfilePage,
});

const adminRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/admin",
  component: AdminPage,
});

// Stub routes for live/paper trading (redirect to dashboard for now)
const liveRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/dashboard/live",
  component: DashboardPage,
});

const paperRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/dashboard/paper",
  component: DashboardPage,
});

export const routeTree = rootRoute.addChildren([
  indexRoute,
  loginRoute,
  registerRoute,
  dashboardRoute,
  backtestRoute,
  strategiesRoute,
  apiKeysRoute,
  marketplaceRoute,
  billingRoute,
  profileRoute,
  adminRoute,
  liveRoute,
  paperRoute,
]);
