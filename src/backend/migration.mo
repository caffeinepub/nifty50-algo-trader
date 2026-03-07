import Map "mo:core/Map";
import List "mo:core/List";
import Nat "mo:core/Nat";
import Float "mo:core/Float";
import Text "mo:core/Text";
import Int "mo:core/Int";
import Principal "mo:core/Principal";
import Time "mo:core/Time";

module {
  /* OLD TYPES */
  type OldUserProfile = {
    name : Text;
    email : Text;
  };

  type OldActor = {
    candleId : Nat;
    tradeId : Nat;
    backtestId : Nat;
    strategyId : Nat;
    targetPnlAdd : Float;
    squareOffMode : Bool;
    initialPrice : Float;
    candleArray : List.List<{ symbol : Text; timeframe : Text; timestamp : Int; open : Float; high : Float; low : Float; close : Float; volume : Nat }>;
    strategies : Map.Map<Nat, { id : Nat; name : Text; shortWindow : Nat; longWindow : Nat; stopLossPercent : Float; targetPercent : Float; positionSize : Nat; riskPercent : Float; algorithmFile : Text; enabled : Bool; strategyType : Text }>;
    trades : Map.Map<Nat, { id : Nat; userId : Text; symbol : Text; strategyName : Text; side : Text; quantity : Nat; price : Float; timestamp : Int; mode : Text; status : Text; pnl : Float; stopLoss : Float }>;
    backtestResults : Map.Map<Nat, { id : Nat; userId : Text; strategyId : Nat; symbol : Text; timeframe : Text; totalPnl : Float; winRate : Float; maxDrawdown : Float; sharpeRatio : Float; totalTrades : Nat; createdAt : Int }>;
    userConfigs : Map.Map<Principal, { apiKey : Text; secret : Text; accessToken : Text; redirectUrl : Text; webhook : Text; paperMode : Bool; liveMode : Bool; tradingMode : Text; algorithmEnabled : Bool }>;
    userProfiles : Map.Map<Principal, OldUserProfile>;
    riskSettings : Map.Map<Principal, { maxDailyLoss : Float; maxTradesPerDay : Nat; maxCapitalPerTrade : Float; autoShutdown : Bool }>;
    ninetwentyStates : Map.Map<Principal, { line : Float; signal : Text; entry : Float; stopLoss : Float }>;
  };

  /* NEW TYPES */
  type NewUserProfile = {
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

  type NewActor = {
    candleId : Nat;
    tradeId : Nat;
    backtestId : Nat;
    strategyId : Nat;
    apiKeyId : Nat;
    targetPnlAdd : Float;
    squareOffMode : Bool;
    initialPrice : Float;
    candleArray : List.List<{ symbol : Text; timeframe : Text; timestamp : Int; open : Float; high : Float; low : Float; close : Float; volume : Nat }>;
    strategies : Map.Map<Nat, { id : Nat; name : Text; shortWindow : Nat; longWindow : Nat; stopLossPercent : Float; targetPercent : Float; positionSize : Nat; riskPercent : Float; algorithmFile : Text; enabled : Bool; strategyType : Text }>;
    trades : Map.Map<Nat, { id : Nat; userId : Text; symbol : Text; strategyName : Text; side : Text; quantity : Nat; price : Float; timestamp : Int; mode : Text; status : Text; pnl : Float; stopLoss : Float }>;
    backtestResults : Map.Map<Nat, { id : Nat; userId : Text; strategyId : Nat; symbol : Text; timeframe : Text; totalPnl : Float; winRate : Float; maxDrawdown : Float; sharpeRatio : Float; totalTrades : Nat; createdAt : Int }>;
    userConfigs : Map.Map<Principal, { apiKey : Text; secret : Text; accessToken : Text; redirectUrl : Text; webhook : Text; paperMode : Bool; liveMode : Bool; tradingMode : Text; algorithmEnabled : Bool }>;
    userProfiles : Map.Map<Principal, NewUserProfile>;
    riskSettings : Map.Map<Principal, { maxDailyLoss : Float; maxTradesPerDay : Nat; maxCapitalPerTrade : Float; autoShutdown : Bool }>;
    ninetwentyStates : Map.Map<Principal, { line : Float; signal : Text; entry : Float; stopLoss : Float }>;
    userApiKeys : Map.Map<Principal, List.List<{ id : Nat; userId : Text; name : Text; keyHash : Text; createdAt : Int; active : Bool }>>;
  };

  public func run(old : OldActor) : NewActor {
    {
      old with
      apiKeyId = 1;
      userProfiles = old.userProfiles.map<Principal, OldUserProfile, NewUserProfile>(
        func(_principal, oldProfile) {
          {
            oldProfile with
            country = "";
            experienceLevel = "";
            tradingMarket = "";
            role = "user";
            pendingApproval = false;
            followersCount = 0;
            joinedAt = Time.now();
          };
        }
      );
      userApiKeys = Map.empty<Principal, List.List<{ id : Nat; userId : Text; name : Text; keyHash : Text; createdAt : Int; active : Bool }>>();
    };
  };
};
