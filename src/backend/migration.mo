import Map "mo:core/Map";
import List "mo:core/List";
import Nat "mo:core/Nat";
import Principal "mo:core/Principal";

module {
  // Migration types
  type OldStrategy = {
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
    strategyType : Text;
  };

  // Old state type
  type OldActor = {
    strategies : Map.Map<Nat, OldStrategy>;
  };

  // New state type
  type NewActor = {
    strategies : Map.Map<Nat, NewStrategy>;
  };

  public func run(old : OldActor) : NewActor {
    let newStrategies = switch (old.strategies) {
      case (strategies) {
        strategies.map<Nat, OldStrategy, NewStrategy>(
          func(_id, strategy) {
            { strategy with strategyType = "ma_crossover" };
          }
        );
      };
      case (_) { Map.empty<Nat, NewStrategy>() };
    };
    { strategies = newStrategies };
  };
};
