import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface BacktestResult {
    id: bigint;
    totalTrades: bigint;
    timeframe: string;
    userId: string;
    createdAt: bigint;
    sharpeRatio: number;
    totalPnl: number;
    winRate: number;
    maxDrawdown: number;
    symbol: string;
    strategyId: bigint;
}
export interface RiskSettings {
    autoShutdown: boolean;
    maxDailyLoss: number;
    maxTradesPerDay: bigint;
    maxCapitalPerTrade: number;
}
export interface NinetwentyState {
    line: number;
    entry: number;
    stopLoss: number;
    signal: string;
}
export interface Candle {
    low: number;
    timeframe: string;
    high: number;
    close: number;
    open: number;
    volume: bigint;
    timestamp: bigint;
    symbol: string;
}
export interface Trade {
    id: bigint;
    pnl: number;
    status: string;
    userId: string;
    mode: string;
    side: string;
    stopLoss: number;
    timestamp: bigint;
    quantity: bigint;
    price: number;
    strategyName: string;
    symbol: string;
}
export interface Strategy {
    id: bigint;
    algorithmFile: string;
    riskPercent: number;
    name: string;
    shortWindow: bigint;
    longWindow: bigint;
    positionSize: bigint;
    enabled: boolean;
    stopLossPercent: number;
    targetPercent: number;
    strategyType: string;
}
export interface BrokerConfig {
    redirectUrl: string;
    paperMode: boolean;
    secret: string;
    webhook: string;
    algorithmEnabled: boolean;
    apiKey: string;
    accessToken: string;
    liveMode: boolean;
    tradingMode: string;
}
export interface UserProfile {
    experienceLevel: string;
    country: string;
    followersCount: bigint;
    name: string;
    joinedAt: bigint;
    role: string;
    pendingApproval: boolean;
    email: string;
    tradingMarket: string;
}
export interface ApiKey {
    id: bigint;
    active: boolean;
    userId: string;
    name: string;
    createdAt: bigint;
    keyHash: string;
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addStrategy(name: string, shortWindow: bigint, longWindow: bigint, stopLossPercent: number, targetPercent: number, positionSize: bigint, riskPercent: number, algorithmFile: string, strategyType: string): Promise<bigint>;
    addTrade(symbol: string, strategyName: string, side: string, quantity: bigint, price: number, mode: string): Promise<bigint>;
    approveCreator(user: Principal): Promise<void>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    clearNinetwentyState(): Promise<void>;
    closeTrade(id: bigint): Promise<void>;
    exitAllTrades(): Promise<void>;
    followUser(target: Principal): Promise<void>;
    forceAddDailyCandle(open: number, high: number, low: number, close: number, volume: bigint, symbol: string, timeframe: string, timestamp: bigint): Promise<void>;
    generateApiKey(name: string): Promise<ApiKey>;
    getAdminDashboardStats(): Promise<{
        activeStrategies: bigint;
        todayPnl: number;
        squareOffMode: boolean;
        accountBalance: number;
        activeTrades: bigint;
        totalStrategies: bigint;
        winRate: number;
    }>;
    getAdminStats(): Promise<{
        totalTrades: bigint;
        totalPnl: number;
        openTrades: bigint;
        totalUsers: bigint;
    }>;
    getAllTrades(): Promise<Array<Trade>>;
    getAllUsers(): Promise<Array<[Principal, UserProfile]>>;
    getBrokerConfig(): Promise<BrokerConfig>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getCandles(symbol: string, timeframe: string, limit: bigint): Promise<Array<Candle>>;
    getMyApiKeys(): Promise<Array<ApiKey>>;
    getMyBacktestResults(): Promise<Array<BacktestResult>>;
    getMyTrades(): Promise<Array<Trade>>;
    getNinetwentyLine(): Promise<number>;
    getNinetwentyState(): Promise<NinetwentyState>;
    getPendingCreators(): Promise<Array<[Principal, UserProfile]>>;
    getRiskSettings(): Promise<RiskSettings>;
    getSquareOffMode(): Promise<boolean>;
    getStrategies(): Promise<Array<Strategy>>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    modifyStopLoss(tradeId: bigint, newStopLoss: number): Promise<void>;
    rejectCreator(user: Principal): Promise<void>;
    revokeApiKey(keyId: bigint): Promise<void>;
    saveBacktestResult(strategyId: bigint, symbol: string, timeframe: string, totalPnl: number, winRate: number, maxDrawdown: number, sharpeRatio: number, totalTrades: bigint): Promise<bigint>;
    saveBrokerConfig(apiKey: string, secret: string, accessToken: string, redirectUrl: string, webhook: string, paperMode: boolean, liveMode: boolean, tradingMode: string): Promise<void>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    saveRiskSettings(maxDailyLoss: number, maxTradesPerDay: bigint, maxCapitalPerTrade: number, autoShutdown: boolean): Promise<void>;
    setNinetwentyLine(line: number): Promise<void>;
    setNinetwentySignal(signal: string, entry: number, stopLoss: number): Promise<void>;
    setTradingMode(mode: string): Promise<void>;
    toggleAlgorithm(): Promise<void>;
    toggleSquareOffMode(): Promise<void>;
    toggleStrategy(id: bigint): Promise<void>;
    updateTrade(id: bigint, status: string, pnl: number): Promise<void>;
}
