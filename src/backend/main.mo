// Import core libraries
import Map "mo:core/Map";
import Array "mo:core/Array";
import List "mo:core/List";
import Time "mo:core/Time";
import Float "mo:core/Float";
import Nat "mo:core/Nat";
import Text "mo:core/Text";
import Int "mo:core/Int";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";

// Import prefabricated authorization component
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";

actor {
  // Type definitions
  type Candle = {
    symbol : Text;
    timeframe : Text;
    timestamp : Int;
    open : Float;
    high : Float;
    low : Float;
    close : Float;
    volume : Nat;
  };

  type Strategy = {
    id : Nat;
    name : Text;
    shortWindow : Nat;
    longWindow : Nat;
    stopLossPercent : Float;
    targetPercent : Float;
    positionSize : Nat;
    enabled : Bool;
  };

  type Trade = {
    id : Nat;
    userId : Text;
    symbol : Text;
    strategyName : Text;
    side : Text;
    quantity : Nat;
    price : Float;
    timestamp : Int;
    mode : Text;
    status : Text;
    pnl : Float;
  };

  type BacktestResult = {
    id : Nat;
    userId : Text;
    strategyId : Nat;
    symbol : Text;
    timeframe : Text;
    totalPnl : Float;
    winRate : Float;
    maxDrawdown : Float;
    sharpeRatio : Float;
    totalTrades : Nat;
    createdAt : Int;
  };

  type BrokerConfig = {
    apiKey : Text;
    secret : Text;
    tradingMode : Text; // "paper" or "live"
    algorithmEnabled : Bool;
  };

  type UserProfile = {
    name : Text;
    email : Text;
  };

  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  var candleId = 0;
  var tradeId = 0;
  var backtestId = 0;
  var strategyId = 1;

  var targetPnlAdd = 0.0;

  var initialPrice = 22000.0;
  let candleArray = List.empty<Candle>();

  let strategies = Map.empty<Nat, Strategy>();
  let trades = Map.empty<Nat, Trade>();
  let backtestResults = Map.empty<Nat, BacktestResult>();
  let userConfigs = Map.empty<Principal, BrokerConfig>();
  let userProfiles = Map.empty<Principal, UserProfile>();

  // User profile functions (required by frontend)
  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  // User broker config functions
  public shared ({ caller }) func saveBrokerConfig(apiKey : Text, secret : Text, tradingMode : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save broker config");
    };

    let config : BrokerConfig = {
      apiKey;
      secret;
      tradingMode;
      algorithmEnabled = false;
    };
    userConfigs.add(caller, config);
  };

  public query ({ caller }) func getBrokerConfig() : async BrokerConfig {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view broker config");
    };

    switch (userConfigs.get(caller)) {
      case (null) { Runtime.trap("No config found") };
      case (?config) { config };
    };
  };

  public shared ({ caller }) func toggleAlgorithm() : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can toggle algorithm");
    };

    let config = switch (userConfigs.get(caller)) {
      case (null) { Runtime.trap("No config found") };
      case (?config) { config };
    };

    let updatedConfig = {
      config with
      algorithmEnabled = not config.algorithmEnabled;
    };

    userConfigs.add(caller, updatedConfig);
  };

  public shared ({ caller }) func setTradingMode(mode : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can set trading mode");
    };

    let config = switch (userConfigs.get(caller)) {
      case (null) { Runtime.trap("No config found") };
      case (?config) { config };
    };

    let updatedConfig = {
      config with
      tradingMode = mode;
    };

    userConfigs.add(caller, updatedConfig);
  };

  // OHLCV Data - public data, accessible to all including guests
  public query func getCandles(symbol : Text, timeframe : Text, limit : Nat) : async [Candle] {
    var filtered = List.empty<Candle>();
    for (candle in candleArray.values()) {
      if (candle.symbol == symbol and candle.timeframe == timeframe) {
        filtered.add(candle);
      };
    };
    let arr = filtered.toArray();
    let size = arr.size();
    let takeLimit = Nat.min(limit, size);
    Array.tabulate<Candle>(takeLimit, func(i) { arr[i] });
  };

  public shared ({ caller }) func forceAddDailyCandle(
    open : Float,
    high : Float,
    low : Float,
    close : Float,
    volume : Nat,
    symbol : Text,
    timeframe : Text,
    timestamp : Int,
  ) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };

    let candle : Candle = {
      symbol;
      timeframe;
      timestamp;
      open;
      high;
      low;
      close;
      volume;
    };

    initialPrice := close;
    candleArray.add(candle);
  };

  // Strategy config
  public shared ({ caller }) func addStrategy(name : Text, shortWindow : Nat, longWindow : Nat, stopLossPercent : Float, targetPercent : Float, positionSize : Nat) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };

    let strategy : Strategy = {
      id = strategyId;
      name;
      shortWindow;
      longWindow;
      stopLossPercent;
      targetPercent;
      positionSize;
      enabled = true;
    };

    strategies.add(strategyId, strategy);
    strategyId += 1;
    strategyId - 1;
  };

  public shared ({ caller }) func toggleStrategy(id : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };

    let strategy = switch (strategies.get(id)) {
      case (null) { Runtime.trap("Strategy not found") };
      case (?s) { s };
    };
    let updated = { strategy with enabled = not strategy.enabled };
    strategies.add(id, updated);
  };

  public query ({ caller }) func getStrategies() : async [Strategy] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view strategies");
    };
    strategies.values().toArray();
  };

  // Trade log
  public shared ({ caller }) func addTrade(symbol : Text, strategyName : Text, side : Text, quantity : Nat, price : Float, mode : Text) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can add trades");
    };

    let trade : Trade = {
      id = tradeId;
      userId = caller.toText();
      symbol;
      strategyName;
      side;
      quantity;
      price;
      timestamp = Time.now();
      mode;
      status = "open";
      pnl = 0.0;
    };

    trades.add(tradeId, trade);
    tradeId += 1;
    tradeId - 1;
  };

  public shared ({ caller }) func updateTrade(id : Nat, status : Text, pnl : Float) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can update trades");
    };

    let trade = switch (trades.get(id)) {
      case (null) { Runtime.trap("Trade not found") };
      case (?t) { t };
    };

    // Verify ownership
    if (trade.userId != caller.toText() and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only update your own trades");
    };

    let updated = {
      trade with
      status = status;
      pnl = pnl;
    };
    trades.add(id, updated);
  };

  public query ({ caller }) func getMyTrades() : async [Trade] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view trades");
    };

    trades.values().toArray().filter(
      func(trade) {
        trade.userId == caller.toText();
      }
    );
  };

  public query ({ caller }) func getAllTrades() : async [Trade] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };
    trades.values().toArray();
  };

  // Backtest results
  public shared ({ caller }) func saveBacktestResult(strategyId : Nat, symbol : Text, timeframe : Text, totalPnl : Float, winRate : Float, maxDrawdown : Float, sharpeRatio : Float, totalTrades : Nat) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save backtest results");
    };

    let result : BacktestResult = {
      id = backtestId;
      userId = caller.toText();
      strategyId;
      symbol;
      timeframe;
      totalPnl;
      winRate;
      maxDrawdown;
      sharpeRatio;
      totalTrades;
      createdAt = Time.now();
    };

    backtestResults.add(backtestId, result);
    backtestId += 1;
    backtestId - 1;
  };

  public query ({ caller }) func getMyBacktestResults() : async [BacktestResult] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view backtest results");
    };

    var filtered = List.empty<BacktestResult>();
    for (result in backtestResults.values()) {
      if (result.userId == caller.toText()) {
        filtered.add(result);
      };
    };
    filtered.toArray();
  };

  // Admin stats
  public query ({ caller }) func getAdminStats() : async {
    totalUsers : Nat;
    totalTrades : Nat;
    totalPnl : Float;
    openTrades : Nat;
  } {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };

    var totalPnl = 0.0;
    var openTrades = 0;

    for (trade in trades.values()) {
      totalPnl += trade.pnl;
      if (trade.status == "open") {
        openTrades += 1;
      };
    };

    {
      totalUsers = userConfigs.size();
      totalTrades = trades.size();
      totalPnl;
      openTrades;
    };
  };
};
