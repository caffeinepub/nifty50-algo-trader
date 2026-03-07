# NIFTY50 Algo Trader

## Current State
- Admin panel exists with 4 tabs: Overview (basic stats), Users (mock data), Strategies (add/toggle), Trades (all trades table)
- Backend supports: strategies (add/toggle/get), trades (add/update/get), backtest results, broker config (apiKey + secret + tradingMode), admin stats (totalUsers, totalTrades, totalPnl, openTrades)
- Password gate on /admin with hardcoded password "Santhosh1@"
- No: trade monitor with close/modify SL/exit-all, backtest panel in admin, paper/live trading toggle in admin, broker API settings panel, risk management panel, square-off mode, win rate display, account balance display, today's P&L

## Requested Changes (Diff)

### Add
1. **Core Modules (Overview tab overhaul)**: Account Balance card, Today P&L card, Active Trades count, Win Rate %, Strategy Status summary, Square Off Mode toggle button
2. **Strategy Management tab**: Edit parameters for existing strategies (inline edit), Upload Algorithm (file upload UI, no actual server processing - stores filename), keep enable/disable
3. **Trade Monitor tab**: Live trade table (Time, Symbol, Type, Price, Qty, Status) with: Close Trade Manually button per row, Modify Stop Loss dialog per row, Exit All Trades button at top
4. **Backtest Panel tab**: Input form (Strategy dropdown, Date Range start/end, Capital amount, Risk %), Output section (Total Profit, Drawdown %, Trade History table) - runs simulated backtest in frontend
5. **Paper Trading Mode tab**: Paper Trading ON/OFF toggle, Live Trading ON/OFF toggle, clear notice that paper mode orders don't go to NSE
6. **Broker API Settings tab**: Fields for API Key, Access Token, Redirect URL, Webhook URL; Buttons: Connect API, Test Connection, Refresh Token
7. **Risk Management tab**: Max Daily Loss (₹), Max Trades Per Day, Max Capital Per Trade (₹), Auto Shutdown toggle; Save Settings button

### Modify
- Backend: extend `BrokerConfig` to include `accessToken`, `redirectUrl`, `webhook`, `paperMode` (bool), `liveMode` (bool)
- Backend: extend `Strategy` to include `riskPercent`, `algorithmFile` (Text)
- Backend: add `RiskSettings` type per user/admin: `maxDailyLoss`, `maxTradesPerDay`, `maxCapitalPerTrade`, `autoShutdown`
- Backend: add `closeTrade`, `exitAllTrades`, `modifyStopLoss` functions
- Backend: add `saveRiskSettings` / `getRiskSettings` functions
- Backend: add `getAdminStats` to return `accountBalance`, `todayPnl`, `winRate`, `squareOffMode`
- Admin page: replace 4 tabs with 7 tabs: Overview, Trade Monitor, Strategies, Backtest, Paper/Live Mode, Broker API, Risk Management

### Remove
- Nothing removed; existing features preserved

## Implementation Plan
1. Update `main.mo` with extended types and new functions (RiskSettings, extended BrokerConfig, extended Strategy, closeTrade/exitAllTrades/modifyStopLoss, saveRiskSettings/getRiskSettings, squareOffMode toggle, updated getAdminStats)
2. Regenerate `backend.d.ts` via generate_motoko_code
3. Rebuild `AdminPage.tsx` with 7-tab layout:
   - Tab 1 Overview: Account Balance, Today P&L, Active Trades, Win Rate, Strategy Status, Square Off Mode toggle
   - Tab 2 Trade Monitor: live trade table with Close/ModifySL per row + Exit All button
   - Tab 3 Strategies: existing add/toggle + inline edit + upload algorithm
   - Tab 4 Backtest: input form + simulated output
   - Tab 5 Paper/Live Mode: two big toggles with NSE warning
   - Tab 6 Broker API: 4 fields + 3 action buttons
   - Tab 7 Risk Management: 4 settings + Auto Shutdown toggle + Save
