# NIFTY50 Algo Trader

## Current State

- Registration page: Full Name + Email + Password fields, Internet Identity auth, saves UserProfile (name, email) to backend
- Login page: Email + Password UI + Internet Identity auth, redirects to /dashboard
- Dashboard: Portfolio stats, BrokerConfig (Upstox), Active Strategies panel, EquityChart, TradesTable
- Admin page: Password-gated (/admin, password = Santhosh1@), 7 tabs: Overview, Trade Monitor, Strategies, Backtest, Paper/Live Mode, Broker API, Risk Management; plus 9:20 Candle Strategy tab
- Backtest page: Strategy selector, date range, capital, risk; outputs P&L, drawdown, trade history
- Backend (Motoko): UserProfile (name, email), BrokerConfig, Trade, Strategy, BacktestResult, RiskSettings, NinetwentyState; roles: admin/user/guest via authorization mixin
- Routes: /, /login, /register, /dashboard, /dashboard/backtest, /admin

## Requested Changes (Diff)

### Add

**Registration page enhancements:**
- Country dropdown (list of countries)
- Experience Level selector: Beginner / Intermediate / Professional
- Trading Market multi-select or selector: NIFTY / BankNifty / Stocks / Crypto
- Password strength indicator (visual bar + requirements checklist)
- Confirm Password field with match validation
- Accept Terms & Privacy Policy checkbox
- Store country, experienceLevel, tradingMarket, role in extended UserProfile
- Backend: extend UserProfile type to include country, experienceLevel, tradingMarket, role fields

**Login page enhancements:**
- "Login with Google" button (UI-only, disabled with tooltip: "Coming soon")
- "Login with GitHub" button (UI-only, disabled with tooltip: "Coming soon")
- MFA notice section: show info about OTP/Authenticator (UI informational)

**RBAC system:**
- Roles: Admin, AlgoCreator, Trader, Viewer (mapped onto existing admin/user/guest)
- Extended UserProfile stores role field
- Role badge shown on dashboard header
- Viewer role: read-only dashboard, no trade actions
- AlgoCreator role: access to My Strategies + Marketplace
- Trader role: full dashboard access
- Admin: full access

**New Dashboard sidebar navigation (tabs/sections):**
- Dashboard (existing stats + charts)
- My Strategies (list of user's strategies, add strategy CTA)
- Backtesting (link to /dashboard/backtest)
- Live Trading (redirect to live trades panel)
- Paper Trading (redirect to paper trades panel)
- Marketplace (algo marketplace UI - sell/buy algorithms)
- API Keys (generate + manage API keys)
- Billing (billing placeholder page)

**API Keys page (/dashboard/api-keys):**
- Generate API Key button
- List of API keys (name, key masked, created date, status)
- Connect Broker section: Upstox API, Zerodha API, Angel One API (each with API key + secret fields)
- Backend: store ApiKey records per user

**Algo Creator Profile page (/profile/:userId or /dashboard/profile):**
- Profile header (name, role badge, join date)
- Strategy List (user's strategies)
- Backtest Results summary table
- Sharpe Ratio stat
- Win Rate stat
- Followers count (mock)

**Admin Approval System:**
- New route /admin/approvals (inside admin panel as a new tab)
- List of users who registered with role = AlgoCreator
- Each row: name, email, registration date, Approve / Reject buttons
- On approve: backend promotes user to AlgoCreator (custom role stored)
- On reject: marks as rejected
- Backend: add pendingApproval field to UserProfile; add approveUser / rejectUser admin functions

**Backend additions:**
- Extend UserProfile: add country, experienceLevel, tradingMarket, role, pendingApproval, followersCount, apiKeys fields
- Add ApiKey type and per-user storage
- Add generateApiKey / revokeApiKey / getMyApiKeys functions
- Add approveCreator / rejectCreator admin functions

### Modify

- RegisterPage: replace minimal form with full 7-field form + password strength + terms checkbox
- LoginPage: add social login buttons (UI-only disabled) + MFA info section
- DashboardPage: add left sidebar navigation with all 8 sections, show role badge in header
- routeTree.ts: add /dashboard/api-keys, /dashboard/profile, /dashboard/marketplace, /dashboard/billing routes
- AdminPage: add new "User Approvals" tab
- UserProfile backend type: extend with new fields

### Remove

Nothing removed; all existing functionality preserved.

## Implementation Plan

1. Extend Motoko backend: UserProfile type (country, experienceLevel, tradingMarket, role, pendingApproval, followersCount), ApiKey type, generateApiKey/revokeApiKey/getMyApiKeys, approveCreator/rejectCreator admin functions
2. Regenerate backend.d.ts to reflect new types
3. Update RegisterPage: 7-field form, password strength bar, confirm password, country dropdown, experience selector, trading market selector, terms checkbox
4. Update LoginPage: social login buttons (disabled UI), MFA info panel
5. Refactor DashboardPage: add collapsible sidebar nav (Dashboard, My Strategies, Backtesting, Live Trading, Paper Trading, Marketplace, API Keys, Billing), role badge in header
6. Create new pages: ApiKeysPage, MarketplacePage, BillingPage, AlgoCreatorProfilePage
7. Update AdminPage: add User Approvals tab with approve/reject workflow
8. Update routeTree.ts: register new routes
9. Update hooks/useQueries: add hooks for new backend APIs
