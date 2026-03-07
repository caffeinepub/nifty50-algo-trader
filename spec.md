# NIFTY50 Algo Trader

## Current State

A full-stack trading platform with:
- Motoko backend: candle storage, strategy CRUD, trade log, broker config, risk settings, backtest results, admin stats
- Frontend pages: Landing, Login, Register, Dashboard, Backtest, Admin Panel (7 tabs: Overview, Trade Monitor, Strategies, Backtest, Paper/Live Mode, Broker API, Risk Management)
- Admin panel password-protected with Santhosh1@
- Existing strategies: Moving Average Crossover with shortWindow/longWindow params

## Requested Changes (Diff)

### Add

1. **9:20 Candle Strategy** -- New named strategy module that implements:
   - Timeframe: 5-minute candles
   - Reference level: closing price of the 9:20 AM candle becomes a horizontal line
   - Signal logic:
     - If the NEXT candle (9:25) closes ABOVE the line → CALL (BUY) signal
     - If the NEXT candle (9:25) closes BELOW the line → PUT (SELL) signal
   - Stop loss rules (both apply simultaneously):
     - Rule 1 (Reversal SL): After entering CALL, exit if any subsequent candle closes BELOW the horizontal line. After entering PUT, exit if any subsequent candle closes ABOVE the line.
     - Rule 2 (Fixed SL): Set a hard stop loss 7 points BELOW the horizontal line for CALL trades (line - 7), and 7 points ABOVE the horizontal line for PUT trades (line + 7)
   - The horizontal line value persists throughout the trading day

2. **9:20 Strategy Visualizer** -- New dedicated page/section in the admin panel (new tab "9:20 Strategy") that shows:
   - A 5-minute candlestick chart for NIFTY50
   - A horizontal line marking the 9:20 candle's close price
   - Visual annotations for CALL/PUT signal arrows on the 9:25 candle
   - Stop loss levels drawn as dashed horizontal lines (line-7 and the reversal line)
   - Current signal status: CALL / PUT / WAITING
   - Real-time P&L for the current trade
   - Entry price, Stop Loss price, Current price display
   - A "Simulate" button to run the strategy on today's simulated candle data

3. **Backend: strategy config for 9:20** -- Save the 9:20 strategy as a named Strategy entry with a special `strategyType` field of "nine_twenty". Add backend support to store `ninetwentyLine` (the horizontal line value) and `ninetwentySignal` (CALL/PUT/NONE) per user.

### Modify

- **Strategies Tab in Admin Panel**: Pre-populate the 9:20 Candle strategy in the strategies list with a special badge/label "9:20 Strategy" and show its unique parameters (Reference Line, SL Offset = 7 pts)
- **Backend Strategy type**: Add `strategyType` field to the Strategy record to distinguish "nine_twenty" from "ma_crossover" etc.
- **Backtest Panel**: Add "9:20 Candle" as a selectable strategy in the backtest dropdown with relevant backtest simulation logic

### Remove

- Nothing removed

## Implementation Plan

1. Update Motoko backend:
   - Add `strategyType` field (Text) to `Strategy` type
   - Add `ninetwentyLine` and `ninetwentySignal` storage per principal
   - Add `setNinetwentyLine(value: Float)` and `getNinetwentyLine()` query
   - Add `setNinetwentySignal(signal: Text)` and `getNinetwentySignal()` query
   - Update `addStrategy` to accept optional `strategyType` param

2. Frontend: New "9:20 Strategy" tab in the Admin Panel:
   - Simulate 5-minute NIFTY50 candle data from 9:00 to 15:30 with realistic OHLCV values
   - Draw candlestick chart using SVG/Canvas
   - Overlay horizontal line at 9:20 close
   - Draw stop loss lines (line-7 dashed, line itself solid)
   - Signal detection logic running client-side on simulated candle array
   - Show entry, SL, current price, P&L in stat cards
   - "Simulate Day" button regenerates candle data and recalculates signal
   - Wire to backend to persist the line value and signal

3. Frontend: Update StrategiesTab to show 9:20 strategy with special badge
4. Frontend: Update BacktestTab to include "9:20 Candle" option with simulation
