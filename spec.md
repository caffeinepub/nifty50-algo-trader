# NIFTY50 Algo Trader

## Current State
- Full trading platform with dashboard, backtest, strategies, API keys, billing, marketplace (basic), profile, admin panel
- Backend: Motoko with authorization, strategies, trades, risk settings, broker config, user profiles, backtests, 9:20 candle state
- Frontend: React + TanStack Router, dark neon theme (#0B0F1A / #00E5FF / #00FFA3), animated landing background
- Existing routes: /, /login, /register, /dashboard, /dashboard/backtest, /dashboard/strategies, /dashboard/api-keys, /dashboard/marketplace, /dashboard/billing, /dashboard/profile, /admin
- Marketplace page exists but is basic (no equity charts, no max drawdown, no subscription tiers, no creator profile links)
- No /dashboard/risk page
- No /dashboard/brokers page (broker config exists in admin, not as user-facing page)
- No /profile/:userId route
- No notification system

## Requested Changes (Diff)

### Add
1. **Strategy Marketplace** (/dashboard/marketplace) - enhanced with: per-card backtest equity sparkline chart, max drawdown metric, creator profile link, Buy/Sell flow, subscription tier cards (Free / Monthly ₹x / Lifetime ₹x), pricing editable by admin
2. **Risk Management Panel** (/dashboard/risk) - user-facing page with: Max Daily Loss, Max Trade Risk, Max Open Trades, Capital Allocation %, Auto Stop Trading toggle; saves to backend
3. **Notifications System** - bell icon in header with dropdown; notification types: Trade Executed, Stop Loss Hit, Target Hit, Strategy Started, Strategy Stopped; Email notification toggle per type
4. **Broker Integration Page** (/dashboard/brokers) - user-facing page with tab cards for: Upstox, Zerodha, Angel One, Fyers, Paper Trading; each has API Key / Secret / Access Token / Status fields + Connect/Test/Disconnect buttons
5. **Professional User Profile** (/profile/:userId) - public profile with: Name, Algo Creator Badge, strategy list, followers count, total profit, Sharpe Ratio, follow button
6. **Strategy Subscription System** - on each marketplace card: Free tier, Monthly price (₹), Lifetime price (₹); admin can update pricing via admin panel subscription settings tab

### Modify
- `routeTree.ts`: add /dashboard/risk, /dashboard/brokers, /profile/:userId routes
- `MarketplacePage.tsx`: add equity sparkline charts, max drawdown metric, subscription tier modal, creator profile links
- `AdminPage.tsx`: add Subscriptions tab for updating strategy pricing
- `Header`: add notifications bell icon with dropdown
- Backend `main.mo`: add marketplace strategy listing with pricing, risk management fields (maxTradeRisk, maxOpenTrades, capitalAllocation), notifications storage, broker configs per broker type, user subscription records

### Remove
- Nothing removed

## Implementation Plan
1. Update backend (main.mo) with new types and functions:
   - MarketplaceStrategyListing type with winRate, sharpeRatio, maxDrawdown, monthlyPrice, lifetimePrice, creatorId
   - Extended RiskSettings: add maxTradeRisk (Float), maxOpenTrades (Nat), capitalAllocation (Float)
   - Notification type and storage per user
   - BrokerConnection type for multi-broker (upstox/zerodha/angelone/fyers/paper) per user
   - SubscriptionRecord type per user per strategy
   - Backend functions: getMarketplaceListings, saveMarketplaceListing, updateStrategyPricing (admin), subscribeToStrategy, getUserSubscriptions, saveExtendedRiskSettings, addNotification, getNotifications, markNotificationsRead, saveBrokerConnection, getBrokerConnections, getPublicUserProfile

2. Frontend pages to create/modify:
   - New: RiskManagementPage (/dashboard/risk)
   - New: BrokersPage (/dashboard/brokers)  
   - Enhanced: MarketplacePage (equity charts, drawdown, subscription modal, creator links)
   - New: PublicProfilePage (/profile/:userId)
   - Modified: routeTree.ts (add new routes)
   - Modified: Header (notifications bell)
   - Modified: AdminPage (subscriptions pricing tab)
   - Modified: DashboardPage sidebar (add Risk, Brokers links)
