import Map "mo:core/Map";
import List "mo:core/List";
import Nat "mo:core/Nat";
import Principal "mo:core/Principal";

module {
  // Type definitions from original actor
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
    riskPercent : Float;
    algorithmFile : Text;
    enabled : Bool;
    strategyType : Text;
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
    stopLoss : Float;
  };

  type RiskSettings = {
    maxDailyLoss : Float;
    maxTradesPerDay : Nat;
    maxCapitalPerTrade : Float;
    autoShutdown : Bool;
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
    country : Text;
    experienceLevel : Text;
    tradingMarket : Text;
    role : Text;
    pendingApproval : Bool;
    followersCount : Nat;
    joinedAt : Int;
  };

  type NinetwentyState = {
    line : Float;
    signal : Text;
    entry : Float;
    stopLoss : Float;
  };

  type ApiKey = {
    id : Nat;
    userId : Text;
    name : Text;
    keyHash : Text;
    createdAt : Int;
    active : Bool;
  };

  // Old Actor type (without BrokerConnection type and mapping)
  type OldActor = {
    strategies : Map.Map<Nat, Strategy>;
    trades : Map.Map<Nat, Trade>;
    backtestResults : Map.Map<Nat, BacktestResult>;
    userProfiles : Map.Map<Principal, UserProfile>;
    riskSettings : Map.Map<Principal, RiskSettings>;
    ninetwentyStates : Map.Map<Principal, NinetwentyState>;
    userApiKeys : Map.Map<Principal, List.List<ApiKey>>;
  };

  // New type with BrokerConnections
  type BrokerConnection = {
    broker : Text;
    apiKey : Text;
    secret : Text;
    accessToken : Text;
    connected : Bool;
    paperMode : Bool;
  };

  // New Actor type (includes old type)
  type NewActor = {
    strategies : Map.Map<Nat, Strategy>;
    trades : Map.Map<Nat, Trade>;
    backtestResults : Map.Map<Nat, BacktestResult>;
    userProfiles : Map.Map<Principal, UserProfile>;
    riskSettings : Map.Map<Principal, RiskSettings>;
    ninetwentyStates : Map.Map<Principal, NinetwentyState>;
    userApiKeys : Map.Map<Principal, List.List<ApiKey>>;
    brokerConnections : Map.Map<Text, List.List<BrokerConnection>>;
  };

  // Migration Function (called from main.mo)
  public func run(old : OldActor) : NewActor {
    let newBrokerConnections = Map.empty<Text, List.List<BrokerConnection>>();
    { old with brokerConnections = newBrokerConnections };
  };
};
