# NIFTY50 Algo Trader

## Current State
New project. No existing code.

## Requested Changes (Diff)

### Add
- User registration and login with role-based access (admin / user)
- User dashboard: broker API key entry (Upstox), enable/disable trading algorithm, live trades view, trade history, performance analytics
- Admin panel (/admin): user list, strategy management, active trade monitoring, P&L stats, backtest results, system settings
- Statistical engine (frontend): SMA, EMA, RSI, MACD, Bollinger Bands, volatility, volume analysis calculated from OHLCV data
- Trading strategy engine: Moving Average Crossover strategy with configurable short/long window, stop-loss, target, position sizing
- Backtesting engine: run strategy over historical OHLCV data, output P&L, win rate, max drawdown, Sharpe ratio, equity curve, trade log
- Simulated NIFTY 50 OHLCV data (1m, 5m, 15m, daily timeframes) stored in backend
- Paper trading mode and live trading mode toggle
- Trade log storage in backend
- HTTP outcalls support for Upstox API (place order, fetch order status, fetch positions)
- Secure storage of user broker API keys (encrypted in backend)
- Risk management rules: max position size, stop-loss enforcement

### Modify
- None (new project)

### Remove
- None (new project)

## Implementation Plan
1. Select `authorization`, `http-outcalls` Caffeine components
2. Generate Motoko backend:
   - User management with roles (admin/user)
   - Broker API key storage per user
   - Strategy config storage (parameters, enabled/disabled)
   - Trade log CRUD
   - Simulated OHLCV data storage and query (symbol, timeframe, date range)
   - Backtest result storage
   - Admin endpoints: list users, toggle strategies, system stats
3. Frontend pages:
   - /register -- registration form
   - /login -- login form
   - /dashboard -- user home: broker connect, algorithm toggle, live trades, trade history, performance charts
   - /dashboard/backtest -- backtest runner: select strategy, date range, timeframe; show results
   - /admin -- admin panel: user table, strategy controls, trade monitor, P&L, settings
4. Frontend modules:
   - indicators.ts: SMA, EMA, RSI, MACD, Bollinger Bands calculations
   - strategies.ts: MA Crossover engine
   - backtester.ts: simulate trades over historical data, compute metrics
   - charts: equity curve (Recharts), OHLCV candlestick-style price chart
5. Paper/live mode toggle stored in backend per user
6. All interactive elements use deterministic data-ocid markers
