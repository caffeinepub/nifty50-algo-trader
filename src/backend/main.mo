import Map "mo:core/Map";
import Nat "mo:core/Nat";
import Int "mo:core/Int";
import Float "mo:core/Float";
import Runtime "mo:core/Runtime";
import Array "mo:core/Array";
import Iter "mo:core/Iter";
import Principal "mo:core/Principal";
import Time "mo:core/Time";

import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";
import List "mo:core/List";


// With migration

actor {
  /* --- Types --- */

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

  type ExtendedRiskSettings = {
    maxDailyLoss : Float;
    maxTradeRisk : Float;
    maxOpenTrades : Nat;
    capitalAllocation : Float;
    autoStopTrading : Bool;
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
    tradingMode : Text; // "paper" or "live"
    algorithmEnabled : Bool;
  };

  type BrokerConnection = {
    broker : Text;
    apiKey : Text;
    secret : Text;
    accessToken : Text;
    connected : Bool;
    paperMode : Bool;
  };

  type UserProfile = {
    name : Text;
    email : Text;
    country : Text;
    experienceLevel : Text;
    tradingMarket : Text;
    role : Text; // "admin", "algo_creator", "trader", "viewer"
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

  type MarketplaceListing = {
    id : Nat;
    strategyName : Text;
    creatorId : Text;
    creatorName : Text;
    description : Text;
    assetType : Text;
    winRate : Float;
    sharpeRatio : Float;
    maxDrawdown : Float;
    monthlyPrice : Float;
    lifetimePrice : Float;
    isFree : Bool;
    subscribers : Nat;
    createdAt : Int;
    enabled : Bool;
  };

  type Notification = {
    id : Nat;
    userId : Text;
    notificationType : Text;
    message : Text;
    read : Bool;
    timestamp : Int;
    emailEnabled : Bool;
  };

  type SubscriptionRecord = {
    userId : Text;
    listingId : Nat;
    plan : Text;
    subscribedAt : Int;
    active : Bool;
  };

  type ApiKey = {
    id : Nat;
    userId : Text;
    name : Text;
    keyHash : Text;
    createdAt : Int;
    active : Bool;
  };

  // Counters
  var candleId = 0;
  var tradeId = 0;
  var backtestId = 0;
  var strategyId = 1;
  var listingId = 1;
  var notificationId = 1;
  var apiKeyId = 1 : Nat;

  /* --- State --- */

  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  var targetPnlAdd = 0.0;
  var squareOffMode = false : Bool;
  var initialPrice = 22000.0;

  let strategies = Map.empty<Nat, Strategy>();
  let trades = Map.empty<Nat, Trade>();
  let backtestResults = Map.empty<Nat, BacktestResult>();
  let userConfigs = Map.empty<Principal, BrokerConfig>();
  let userProfiles = Map.empty<Principal, UserProfile>();
  let riskSettings = Map.empty<Principal, RiskSettings>();
  let ninetwentyStates = Map.empty<Principal, NinetwentyState>();
  let marketplaceListings = Map.empty<Nat, MarketplaceListing>();
  let notifications = Map.empty<Text, List.List<Notification>>(); // Map userId to notifications
  let subscriptions = Map.empty<Text, List.List<SubscriptionRecord>>(); // Map userId to user subscriptions
  let extendedRiskSettings = Map.empty<Text, ExtendedRiskSettings>();
  let brokerConnections = Map.empty<Text, List.List<BrokerConnection>>(); // Map userId to broker connections
  let userApiKeys = Map.empty<Principal, List.List<ApiKey>>(); // Map for user's API keys

  let candleArray = List.empty<Candle>();

  /* --- Extended User Management and API Keys --- */

  public shared ({ caller }) func generateApiKey(name : Text) : async ApiKey {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can generate API keys");
    };

    let keyHash = name.concat("_").concat(Time.now().toText());
    let apiKey : ApiKey = {
      id = apiKeyId;
      userId = caller.toText();
      name;
      keyHash;
      createdAt = Time.now();
      active = true;
    };

    // Add to user's API keys
    let existingKeys = switch (userApiKeys.get(caller)) {
      case (null) { List.empty<ApiKey>() };
      case (?keys) { keys };
    };
    existingKeys.add(apiKey);
    userApiKeys.add(caller, existingKeys);

    apiKeyId += 1;
    apiKey;
  };

  // No changes here - stays as reference, but ApiKeys are not part of the main actor.
  public shared ({ caller }) func revokeApiKey(keyId : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can revoke API keys");
    };

    let apiKeys = switch (userApiKeys.get(caller)) {
      case (null) { Runtime.trap("No API keys found for this user") };
      case (?keys) { keys };
    };

    var keyFound = false;
    let updatedKeys = apiKeys.map<ApiKey, ApiKey>(
      func(key) {
        if (key.id == keyId) {
          // Verify ownership: key must belong to caller
          if (key.userId != caller.toText()) {
            Runtime.trap("Unauthorized: Can only revoke your own API keys");
          };
          keyFound := true;
          { key with active = false };
        } else {
          key;
        };
      }
    );

    if (not keyFound) {
      Runtime.trap("API key with id " # keyId.toText() # " not found");
    };

    userApiKeys.add(caller, updatedKeys);
  };

  public query ({ caller }) func getMyApiKeys() : async [ApiKey] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can get their api keys");
    };

    switch (userApiKeys.get(caller)) {
      case (null) { [] };
      case (?keys) { keys.toArray() };
    };
  };

  /* --- Marketplace Listings --- */

  // Returns all marketplace listings, including enabled/disabled
  public query ({ caller }) func getMarketplaceListings() : async [MarketplaceListing] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can get all listings");
    };
    marketplaceListings.values().toArray();
  };

  // Shows only enabled listings
  public query ({ caller }) func getActiveMarketplaceListings() : async [MarketplaceListing] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can get active listings");
    };

    let activeListings = Map.empty<Nat, MarketplaceListing>();
    for (listing in marketplaceListings.values()) {
      if (listing.enabled) {
        activeListings.add(listing.id, listing);
      };
    };
    activeListings.values().toArray();
  };

  public shared ({ caller }) func saveMarketplaceListing(
    strategyName : Text,
    creatorName : Text,
    description : Text,
    assetType : Text,
    winRate : Float,
    sharpeRatio : Float,
    maxDrawdown : Float,
    monthlyPrice : Float,
    lifetimePrice : Float,
    isFree : Bool,
  ) : async Nat {
    // Check if caller is admin or algo_creator
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Must be a registered user to upload strategy");
    };

    // Admin can always create listings
    let isAdminUser = AccessControl.isAdmin(accessControlState, caller);
    
    if (not isAdminUser) {
      // Non-admin users must have algo_creator role in their profile
      let profile = switch (userProfiles.get(caller)) {
        case (null) { Runtime.trap("User profile not found. Please create a profile first.") };
        case (?p) { p };
      };
      
      if (profile.role != "algo_creator") {
        Runtime.trap("Unauthorized: Only algo_creator or admin can create strategy listings");
      };
    };

    let listing : MarketplaceListing = {
      id = listingId;
      strategyName;
      creatorId = caller.toText();
      creatorName;
      description;
      assetType;
      winRate;
      sharpeRatio;
      maxDrawdown;
      monthlyPrice;
      lifetimePrice;
      isFree;
      subscribers = 0;
      createdAt = Time.now();
      enabled = true;
    };

    marketplaceListings.add(listingId, listing);
    listingId += 1;
    listingId - 1;
  };

  public shared ({ caller }) func updateStrategyPricing(listingId : Nat, monthlyPrice : Float, lifetimePrice : Float, isFree : Bool) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };

    let listing = switch (marketplaceListings.get(listingId)) {
      case (null) { Runtime.trap("Strategy not found") };
      case (?s) { s };
    };

    let updated = {
      listing with
      monthlyPrice;
      lifetimePrice;
      isFree;
    };
    marketplaceListings.add(listingId, updated);
  };

  /* --- Subscriptions --- */
  public shared ({ caller }) func subscribeToStrategy(listingId : Nat, plan : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can subscribe to strategies");
    };

    let listing = switch (marketplaceListings.get(listingId)) {
      case (null) { Runtime.trap("Marketplace listing not found") };
      case (?l) { l };
    };

    let subscription : SubscriptionRecord = {
      userId = caller.toText();
      listingId;
      plan;
      subscribedAt = Time.now();
      active = true;
    };

    // Add subscription to user's list
    let existingSubs = switch (subscriptions.get(caller.toText())) {
      case (null) { List.empty<SubscriptionRecord>() };
      case (?subs) { subs };
    };
    existingSubs.add(subscription);
    subscriptions.add(caller.toText(), existingSubs);

    // Update subscribers count in listing
    let updatedListing = { listing with subscribers = listing.subscribers + 1 };
    marketplaceListings.add(listingId, updatedListing);
  };

  public query ({ caller }) func getUserSubscriptions() : async [SubscriptionRecord] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can get their subscriptions");
    };

    switch (subscriptions.get(caller.toText())) {
      case (null) { [] };
      case (?subs) { subs.toArray() };
    };
  };

  /* --- Risk Settings --- */
  public shared ({ caller }) func saveExtendedRiskSettings(
    maxDailyLoss : Float,
    maxTradeRisk : Float,
    maxOpenTrades : Nat,
    capitalAllocation : Float,
    autoStopTrading : Bool,
  ) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save risk settings");
    };

    let settings : ExtendedRiskSettings = {
      maxDailyLoss;
      maxTradeRisk;
      maxOpenTrades;
      capitalAllocation;
      autoStopTrading;
    };
    extendedRiskSettings.add(caller.toText(), settings);
  };

  public query ({ caller }) func getExtendedRiskSettings() : async ExtendedRiskSettings {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view risk settings");
    };

    switch (extendedRiskSettings.get(caller.toText())) {
      case (null) {
        {
          maxDailyLoss = 5000.0;
          maxTradeRisk = 0.5;
          maxOpenTrades = 10;
          capitalAllocation = 6000.0;
          autoStopTrading = false;
        };
      };
      case (?settings) { settings };
    };
  };

  /* --- Notifications --- */
  // Adds notification for user, returns created notification
  public shared ({ caller }) func addNotification(userId : Text, notificationType : Text, message : Text) : async Notification {
    // Only admin can add notifications (system notifications)
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };

    let notification : Notification = {
      id = notificationId;
      userId;
      notificationType;
      message;
      read = false;
      timestamp = Time.now();
      emailEnabled = false;
    };

    // Add to user's notification list
    let existingNotifications = switch (notifications.get(userId)) {
      case (null) { List.empty<Notification>() };
      case (?notifs) { notifs };
    };
    existingNotifications.add(notification);
    notifications.add(userId, existingNotifications);

    notificationId += 1;
    notification;
  };

  public query ({ caller }) func getMyNotifications() : async [Notification] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can get their notifications");
    };

    switch (notifications.get(caller.toText())) {
      case (null) { [] };
      case (?notifs) { notifs.toArray() };
    };
  };

  public shared ({ caller }) func markNotificationsRead() : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can update notifications");
    };

    switch (notifications.get(caller.toText())) {
      case (null) { Runtime.trap("No notifications found for caller") };
      case (?notifs) {
        let updatedNotifs = notifs.map<Notification, Notification>(
          func(notif) { { notif with read = true } }
        );
        notifications.add(caller.toText(), updatedNotifs);
      };
    };
  };

  public shared ({ caller }) func updateNotificationEmailPref(notificationType : Text, emailEnabled : Bool) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can update notification preferences");
    };

    let userId = caller.toText();
    let existingNotifications = switch (notifications.get(userId)) {
      case (null) { List.empty<Notification>() };
      case (?notifs) { notifs };
    };
    let updatedNotifications = existingNotifications.map<Notification, Notification>(
      func(notification) {
        if (notification.notificationType == notificationType) {
          { notification with emailEnabled };
        } else {
          notification;
        };
      }
    );
    notifications.add(userId, updatedNotifications);
  };

  public query ({ caller }) func getNotificationUnreadCount() : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can get unread notifications");
    };

    switch (notifications.get(caller.toText())) {
      case (null) { 0 };
      case (?notifs) {
        let unreadNotifs = notifs.toArray().filter(
          func(notif) { notif.read == false }
        );
        unreadNotifs.size();
      };
    };
  };

  /* --- Broker Connections --- */
  public shared ({ caller }) func saveBrokerConnection(broker : Text, apiKey : Text, secret : Text, accessToken : Text, paperMode : Bool) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save broker connections");
    };

    let connection : BrokerConnection = {
      broker;
      apiKey;
      secret;
      accessToken;
      connected = true;
      paperMode;
    };

    // Add connection to user's list
    let existingConnections = switch (brokerConnections.get(caller.toText())) {
      case (null) { List.empty<BrokerConnection>() };
      case (?connections) { connections };
    };
    existingConnections.add(connection);
    brokerConnections.add(caller.toText(), existingConnections);
  };

  public query ({ caller }) func getBrokerConnections() : async [BrokerConnection] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can get their connections");
    };

    switch (brokerConnections.get(caller.toText())) {
      case (null) { [] };
      case (?connections) { connections.toArray() };
    };
  };

  public shared ({ caller }) func disconnectBroker(broker : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can disconnect broker");
    };

    let connections = switch (brokerConnections.get(caller.toText())) {
      case (null) { Runtime.trap("No broker connections found for user") };
      case (?existingConnections) { existingConnections };
    };

    let updatedConnections = connections.map<BrokerConnection, BrokerConnection>(
      func(connection) {
        if (connection.broker == broker) {
          { connection with connected = false; apiKey = ""; secret = ""; accessToken = "" };
        } else {
          connection;
        };
      }
    );
    brokerConnections.add(caller.toText(), updatedConnections);
  };

  /* --- Extended User Management --- */
  public shared ({ caller }) func approveCreator(user : Principal) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can approve creators");
    };

    let userProfile = switch (userProfiles.get(user)) {
      case (null) { Runtime.trap("User not found") };
      case (?profile) { profile };
    };

    let updatedProfile = {
      userProfile with
      role = "algo_creator";
      pendingApproval = false;
    };

    userProfiles.add(user, updatedProfile);
  };

  public shared ({ caller }) func rejectCreator(user : Principal) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can reject creators");
    };

    let userProfile = switch (userProfiles.get(user)) {
      case (null) { Runtime.trap("User not found") };
      case (?profile) { profile };
    };

    // Only reject pending creators, not approved ones
    if (userProfile.pendingApproval) {
      userProfiles.remove(user);
    } else {
      Runtime.trap("Cannot reject approved creators");
    };
  };

  public query ({ caller }) func getPendingCreators() : async [(Principal, UserProfile)] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can get pending creators");
    };

    userProfiles.toArray().filter(func((_, profile)) { profile.pendingApproval });
  };

  public query ({ caller }) func getAllUsers() : async [(Principal, UserProfile)] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can get all users");
    };
    userProfiles.toArray();
  };

  public shared ({ caller }) func followUser(target : Principal) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can follow other users");
    };

    let userProfile = switch (userProfiles.get(target)) {
      case (null) { Runtime.trap("User not found") };
      case (?profile) { profile };
    };

    let updatedProfile = {
      userProfile with followersCount = userProfile.followersCount + 1;
    };

    userProfiles.add(target, updatedProfile);
  };

  /* --- Keep existing functions --- */
  // 9:20 Candle Strategy state management
  public shared ({ caller }) func setNinetwentyLine(line : Float) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can set ninetwenty line");
    };

    let state = switch (ninetwentyStates.get(caller)) {
      case (null) { { line; signal = "NONE"; entry = 0.0; stopLoss = 0.0 } };
      case (?existing) { { existing with line } };
    };
    ninetwentyStates.add(caller, state);
  };

  public query ({ caller }) func getNinetwentyLine() : async Float {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can get ninetwenty line");
    };

    switch (ninetwentyStates.get(caller)) {
      case (null) { 0.0 };
      case (?state) { state.line };
    };
  };

  public shared ({ caller }) func setNinetwentySignal(signal : Text, entry : Float, stopLoss : Float) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can set ninetwenty signal");
    };

    let existingState = switch (ninetwentyStates.get(caller)) {
      case (null) { { line = 0.0; signal; entry; stopLoss } };
      case (?existing) { { existing with signal; entry; stopLoss } };
    };
    ninetwentyStates.add(caller, existingState);
  };

  public query ({ caller }) func getNinetwentyState() : async NinetwentyState {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can get ninetwenty state");
    };

    switch (ninetwentyStates.get(caller)) {
      case (null) { { line = 0.0; signal = "NONE"; entry = 0.0; stopLoss = 0.0 } };
      case (?state) { state };
    };
  };

  public shared ({ caller }) func clearNinetwentyState() : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can clear ninetwenty state");
    };

    let existingState = switch (ninetwentyStates.get(caller)) {
      case (null) { { line = 0.0; signal = "NONE"; entry = 0.0; stopLoss = 0.0 } };
      case (?existing) {
        { existing with signal = "NONE"; entry = 0.0; stopLoss = 0.0 };
      };
    };
    ninetwentyStates.add(caller, existingState);
  };

  // Risk & square off features
  public shared ({ caller }) func toggleSquareOffMode() : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };
    squareOffMode := not squareOffMode;
  };

  public query ({ caller }) func getSquareOffMode() : async Bool {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view square-off mode");
    };
    squareOffMode;
  };

  public query ({ caller }) func getRiskSettings() : async RiskSettings {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view risk settings");
    };

    switch (riskSettings.get(caller)) {
      case (null) {
        {
          maxDailyLoss = 5000.0;
          maxTradesPerDay = 5;
          maxCapitalPerTrade = 2000.0;
          autoShutdown = false;
        };
      };
      case (?settings) { settings };
    };
  };

  public shared ({ caller }) func saveRiskSettings(
    maxDailyLoss : Float,
    maxTradesPerDay : Nat,
    maxCapitalPerTrade : Float,
    autoShutdown : Bool,
  ) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save risk settings");
    };

    let settings : RiskSettings = { maxDailyLoss; maxTradesPerDay; maxCapitalPerTrade; autoShutdown };
    riskSettings.add(caller, settings);
  };

  // User profile functions (required by frontend)
  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view profiles");
    };
    userProfiles.get(caller);
  };

  // Public user profile - accessible to all logged-in users
  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only logged-in users can view profiles");
    };
    userProfiles.get(user);
  };

  // Alias for getUserProfile to match spec requirement for getPublicUserProfile
  public query ({ caller }) func getPublicUserProfile(user : Principal) : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only logged-in users can view profiles");
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
  public shared ({ caller }) func saveBrokerConfig(
    apiKey : Text,
    secret : Text,
    accessToken : Text,
    redirectUrl : Text,
    webhook : Text,
    paperMode : Bool,
    liveMode : Bool,
    tradingMode : Text,
  ) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save broker config");
    };

    let config : BrokerConfig = {
      apiKey;
      secret;
      accessToken;
      redirectUrl;
      webhook;
      paperMode;
      liveMode;
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
  public shared ({ caller }) func addStrategy(
    name : Text,
    shortWindow : Nat,
    longWindow : Nat,
    stopLossPercent : Float,
    targetPercent : Float,
    positionSize : Nat,
    riskPercent : Float,
    algorithmFile : Text,
    strategyType : Text,
  ) : async Nat {
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
      riskPercent;
      algorithmFile;
      enabled = true;
      strategyType;
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
  public shared ({ caller }) func addTrade(
    symbol : Text,
    strategyName : Text,
    side : Text,
    quantity : Nat,
    price : Float,
    mode : Text,
  ) : async Nat {
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
      stopLoss = 0.0;
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

  // Trade admin features
  public shared ({ caller }) func closeTrade(id : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };

    let trade = switch (trades.get(id)) {
      case (null) { Runtime.trap("Trade not found") };
      case (?t) { t };
    };

    let updated = {
      trade with status = "closed";
    };

    trades.add(id, updated);
  };

  public shared ({ caller }) func exitAllTrades() : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };

    let tradeEntries = trades.toArray();
    for ((id, trade) in tradeEntries.values()) {
      if (trade.status == "open") {
        let updated = {
          trade with status = "closed";
        };
        trades.add(id, updated);
      };
    };
  };

  public shared ({ caller }) func modifyStopLoss(tradeId : Nat, newStopLoss : Float) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };

    let trade = switch (trades.get(tradeId)) {
      case (null) { Runtime.trap("Trade not found") };
      case (?t) { t };
    };

    let updated = {
      trade with stopLoss = newStopLoss;
    };

    trades.add(tradeId, updated);
  };

  // Backtest results
  public shared ({ caller }) func saveBacktestResult(
    strategyId : Nat,
    symbol : Text,
    timeframe : Text,
    totalPnl : Float,
    winRate : Float,
    maxDrawdown : Float,
    sharpeRatio : Float,
    totalTrades : Nat,
  ) : async Nat {
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

  public query ({ caller }) func getAdminDashboardStats() : async {
    accountBalance : Float;
    todayPnl : Float;
    activeTrades : Nat;
    winRate : Float;
    squareOffMode : Bool;
    totalStrategies : Nat;
    activeStrategies : Nat;
  } {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };

    {
      accountBalance = 65000.0;
      todayPnl = 8600.0;
      activeTrades = 23;
      winRate = 63.8;
      squareOffMode;
      totalStrategies = 15;
      activeStrategies = 8;
    };
  };
};
