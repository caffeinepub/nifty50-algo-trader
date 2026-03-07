import Map "mo:core/Map";
import List "mo:core/List";
import Nat "mo:core/Nat";
import Principal "mo:core/Principal";

module {
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

  type OldStrategy = {
    id : Nat;
    name : Text;
    shortWindow : Nat;
    longWindow : Nat;
    stopLossPercent : Float;
    targetPercent : Float;
    positionSize : Nat;
    enabled : Bool;
  };

  type NewStrategy = {
    id : Nat;
    name : Text;
    shortWindow : Nat;
    longWindow : Nat;
    stopLossPercent : Float;
    targetPercent : Float;
    positionSize : Nat;
    riskPercent : Float;
    algorithmFile : Text;
    enabled : Bool;
  };

  type OldTrade = {
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

  type NewTrade = {
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
    stopLoss : Float;
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

  type OldBrokerConfig = {
    apiKey : Text;
    secret : Text;
    tradingMode : Text;
    algorithmEnabled : Bool;
  };

  type NewBrokerConfig = {
    apiKey : Text;
    secret : Text;
    accessToken : Text;
    redirectUrl : Text;
    webhook : Text;
    paperMode : Bool;
    liveMode : Bool;
    tradingMode : Text;
    algorithmEnabled : Bool;
  };

  type UserProfile = {
    name : Text;
    email : Text;
  };

  type RiskSettings = {
    maxDailyLoss : Float;
    maxTradesPerDay : Nat;
    maxCapitalPerTrade : Float;
    autoShutdown : Bool;
  };

  type OldActor = {
    strategies : Map.Map<Nat, OldStrategy>;
    trades : Map.Map<Nat, OldTrade>;
    backtestResults : Map.Map<Nat, BacktestResult>;
    userConfigs : Map.Map<Principal.Principal, OldBrokerConfig>;
    userProfiles : Map.Map<Principal.Principal, UserProfile>;
    candleArray : List.List<Candle>;
    candleId : Nat;
    tradeId : Nat;
    backtestId : Nat;
    strategyId : Nat;
  };

  type NewActor = {
    strategies : Map.Map<Nat, NewStrategy>;
    trades : Map.Map<Nat, NewTrade>;
    backtestResults : Map.Map<Nat, BacktestResult>;
    userConfigs : Map.Map<Principal.Principal, NewBrokerConfig>;
    userProfiles : Map.Map<Principal.Principal, UserProfile>;
    riskSettings : Map.Map<Principal.Principal, RiskSettings>;
    candleArray : List.List<Candle>;
    candleId : Nat;
    tradeId : Nat;
    backtestId : Nat;
    strategyId : Nat;
    squareOffMode : Bool;
  };

  func convertStrategy(old : OldStrategy) : NewStrategy {
    {
      old with
      riskPercent = 1.0;
      algorithmFile = "";
    };
  };

  func convertTrade(old : OldTrade) : NewTrade {
    {
      old with stopLoss = 0.0;
    };
  };

  func convertBrokerConfig(old : OldBrokerConfig) : NewBrokerConfig {
    {
      old with
      accessToken = "";
      redirectUrl = "";
      webhook = "";
      paperMode = false;
      liveMode = false;
    };
  };

  public func run(old : OldActor) : NewActor {
    let newStrategies = old.strategies.map<Nat, OldStrategy, NewStrategy>(
      func(_k, v) { convertStrategy(v) }
    );
    let newTrades = old.trades.map<Nat, OldTrade, NewTrade>(
      func(_k, v) { convertTrade(v) }
    );
    let newUserConfigs = old.userConfigs.map<Principal.Principal, OldBrokerConfig, NewBrokerConfig>(
      func(_k, v) { convertBrokerConfig(v) }
    );

    let emptyRiskSettings = Map.empty<Principal.Principal, RiskSettings>();
    {
      old with
      strategies = newStrategies;
      trades = newTrades;
      userConfigs = newUserConfigs;
      riskSettings = emptyRiskSettings;
      squareOffMode = false;
    };
  };
};
