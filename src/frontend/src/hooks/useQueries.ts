import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { UserProfile } from "../backend.d";
import { useActor } from "./useActor";

// ── Strategies ──────────────────────────────────────────────────────────────

export function useStrategies() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["strategies"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getStrategies();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useToggleStrategy() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error("Not authenticated");
      return actor.toggleStrategy(id);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["strategies"] });
    },
  });
}

export function useAddStrategy() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (params: {
      name: string;
      shortWindow: bigint;
      longWindow: bigint;
      stopLossPercent: number;
      targetPercent: number;
      positionSize: bigint;
      riskPercent: number;
      algorithmFile: string;
      strategyType?: string;
    }) => {
      if (!actor) throw new Error("Not authenticated");
      return actor.addStrategy(
        params.name,
        params.shortWindow,
        params.longWindow,
        params.stopLossPercent,
        params.targetPercent,
        params.positionSize,
        params.riskPercent,
        params.algorithmFile,
        params.strategyType ?? "ma_crossover",
      );
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["strategies"] });
    },
  });
}

// ── Trades ───────────────────────────────────────────────────────────────────

export function useMyTrades() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["myTrades"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getMyTrades();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAllTrades() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["allTrades"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllTrades();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAddTrade() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (params: {
      symbol: string;
      strategyName: string;
      side: string;
      quantity: bigint;
      price: number;
      mode: string;
    }) => {
      if (!actor) throw new Error("Not authenticated");
      return actor.addTrade(
        params.symbol,
        params.strategyName,
        params.side,
        params.quantity,
        params.price,
        params.mode,
      );
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["myTrades"] });
      void queryClient.invalidateQueries({ queryKey: ["allTrades"] });
    },
  });
}

export function useCloseTrade() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error("Not authenticated");
      return actor.closeTrade(id);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["allTrades"] });
    },
  });
}

export function useExitAllTrades() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error("Not authenticated");
      return actor.exitAllTrades();
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["allTrades"] });
    },
  });
}

export function useModifyStopLoss() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (params: { tradeId: bigint; newStopLoss: number }) => {
      if (!actor) throw new Error("Not authenticated");
      return actor.modifyStopLoss(params.tradeId, params.newStopLoss);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["allTrades"] });
    },
  });
}

// ── Broker Config ─────────────────────────────────────────────────────────────

export function useBrokerConfig() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["brokerConfig"],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getBrokerConfig();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useSaveBrokerConfig() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (params: {
      apiKey: string;
      secret: string;
      accessToken: string;
      redirectUrl: string;
      webhook: string;
      paperMode: boolean;
      liveMode: boolean;
      tradingMode: string;
    }) => {
      if (!actor) throw new Error("Not authenticated");
      return actor.saveBrokerConfig(
        params.apiKey,
        params.secret,
        params.accessToken,
        params.redirectUrl,
        params.webhook,
        params.paperMode,
        params.liveMode,
        params.tradingMode,
      );
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["brokerConfig"] });
    },
  });
}

export function useToggleAlgorithm() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error("Not authenticated");
      return actor.toggleAlgorithm();
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["brokerConfig"] });
    },
  });
}

export function useSetTradingMode() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (mode: string) => {
      if (!actor) throw new Error("Not authenticated");
      return actor.setTradingMode(mode);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["brokerConfig"] });
    },
  });
}

// ── Risk Settings ─────────────────────────────────────────────────────────────

export function useRiskSettings() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["riskSettings"],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getRiskSettings();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useSaveRiskSettings() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (params: {
      maxDailyLoss: number;
      maxTradesPerDay: bigint;
      maxCapitalPerTrade: number;
      autoShutdown: boolean;
    }) => {
      if (!actor) throw new Error("Not authenticated");
      return actor.saveRiskSettings(
        params.maxDailyLoss,
        params.maxTradesPerDay,
        params.maxCapitalPerTrade,
        params.autoShutdown,
      );
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["riskSettings"] });
    },
  });
}

// ── Admin Dashboard Stats ─────────────────────────────────────────────────────

export function useAdminDashboardStats() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["adminDashboardStats"],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getAdminDashboardStats();
    },
    enabled: !!actor && !isFetching,
    refetchInterval: 10000,
  });
}

export function useToggleSquareOffMode() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error("Not authenticated");
      return actor.toggleSquareOffMode();
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["adminDashboardStats"] });
    },
  });
}

// ── User Profile ──────────────────────────────────────────────────────────────

export function useUserProfile() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["userProfile"],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getCallerUserProfile();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useSaveUserProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (profile: UserProfile) => {
      if (!actor) throw new Error("Not authenticated");
      return actor.saveCallerUserProfile(profile);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["userProfile"] });
    },
  });
}

export function useUserRole() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["userRole"],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getCallerUserRole();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useIsAdmin() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["isAdmin"],
    queryFn: async () => {
      if (!actor) return false;
      return actor.isCallerAdmin();
    },
    enabled: !!actor && !isFetching,
  });
}

// ── Candles ───────────────────────────────────────────────────────────────────

export function useCandles(
  symbol: string,
  timeframe: string,
  limit: bigint,
  enabled = true,
) {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["candles", symbol, timeframe, limit.toString()],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getCandles(symbol, timeframe, limit);
    },
    enabled: !!actor && !isFetching && enabled,
  });
}

// ── Backtest Results ──────────────────────────────────────────────────────────

export function useMyBacktestResults() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["myBacktestResults"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getMyBacktestResults();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useSaveBacktestResult() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (params: {
      strategyId: bigint;
      symbol: string;
      timeframe: string;
      totalPnl: number;
      winRate: number;
      maxDrawdown: number;
      sharpeRatio: number;
      totalTrades: bigint;
    }) => {
      if (!actor) throw new Error("Not authenticated");
      return actor.saveBacktestResult(
        params.strategyId,
        params.symbol,
        params.timeframe,
        params.totalPnl,
        params.winRate,
        params.maxDrawdown,
        params.sharpeRatio,
        params.totalTrades,
      );
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["myBacktestResults"] });
    },
  });
}

// ── API Keys ──────────────────────────────────────────────────────────────────

export function useMyApiKeys() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["myApiKeys"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getMyApiKeys();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGenerateApiKey() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (name: string) => {
      if (!actor) throw new Error("Not authenticated");
      return actor.generateApiKey(name);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["myApiKeys"] });
    },
  });
}

export function useRevokeApiKey() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (keyId: bigint) => {
      if (!actor) throw new Error("Not authenticated");
      return actor.revokeApiKey(keyId);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["myApiKeys"] });
    },
  });
}

// ── Admin Users ───────────────────────────────────────────────────────────────

export function useAllUsers() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["allUsers"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllUsers();
    },
    enabled: !!actor && !isFetching,
  });
}

export function usePendingCreators() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["pendingCreators"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getPendingCreators();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useApproveCreator() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (user: import("@icp-sdk/core/principal").Principal) => {
      if (!actor) throw new Error("Not authenticated");
      return actor.approveCreator(user);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["pendingCreators"] });
      void queryClient.invalidateQueries({ queryKey: ["allUsers"] });
    },
  });
}

export function useRejectCreator() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (user: import("@icp-sdk/core/principal").Principal) => {
      if (!actor) throw new Error("Not authenticated");
      return actor.rejectCreator(user);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["pendingCreators"] });
      void queryClient.invalidateQueries({ queryKey: ["allUsers"] });
    },
  });
}

export function useFollowUser() {
  const { actor } = useActor();
  return useMutation({
    mutationFn: async (target: import("@icp-sdk/core/principal").Principal) => {
      if (!actor) throw new Error("Not authenticated");
      return actor.followUser(target);
    },
  });
}

// ── Admin Stats (legacy) ──────────────────────────────────────────────────────

export function useAdminStats() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["adminStats"],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getAdminStats();
    },
    enabled: !!actor && !isFetching,
  });
}

// ── 9:20 Strategy ─────────────────────────────────────────────────────────────

export function useNinetwentyState() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["ninetwentyState"],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getNinetwentyState();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useSetNinetwentyLine() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (line: number) => {
      if (!actor) throw new Error("Not authenticated");
      return actor.setNinetwentyLine(line);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["ninetwentyState"] });
    },
  });
}

export function useSetNinetwentySignal() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (params: {
      signal: string;
      entry: number;
      stopLoss: number;
    }) => {
      if (!actor) throw new Error("Not authenticated");
      return actor.setNinetwentySignal(
        params.signal,
        params.entry,
        params.stopLoss,
      );
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["ninetwentyState"] });
    },
  });
}

export function useClearNinetwentyState() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error("Not authenticated");
      return actor.clearNinetwentyState();
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["ninetwentyState"] });
    },
  });
}

// ── Marketplace ───────────────────────────────────────────────────────────────

export function useActiveMarketplaceListings() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["activeMarketplaceListings"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getActiveMarketplaceListings();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAllMarketplaceListings() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["allMarketplaceListings"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getMarketplaceListings();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useSaveMarketplaceListing() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (params: {
      strategyName: string;
      creatorName: string;
      description: string;
      assetType: string;
      winRate: number;
      sharpeRatio: number;
      maxDrawdown: number;
      monthlyPrice: number;
      lifetimePrice: number;
      isFree: boolean;
    }) => {
      if (!actor) throw new Error("Not authenticated");
      return actor.saveMarketplaceListing(
        params.strategyName,
        params.creatorName,
        params.description,
        params.assetType,
        params.winRate,
        params.sharpeRatio,
        params.maxDrawdown,
        params.monthlyPrice,
        params.lifetimePrice,
        params.isFree,
      );
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: ["activeMarketplaceListings"],
      });
      void queryClient.invalidateQueries({
        queryKey: ["allMarketplaceListings"],
      });
    },
  });
}

export function useSubscribeToStrategy() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (params: { listingId: bigint; plan: string }) => {
      if (!actor) throw new Error("Not authenticated");
      return actor.subscribeToStrategy(params.listingId, params.plan);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["userSubscriptions"] });
    },
  });
}

export function useUserSubscriptions() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["userSubscriptions"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getUserSubscriptions();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useUpdateStrategyPricing() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (params: {
      listingId: bigint;
      monthlyPrice: number;
      lifetimePrice: number;
      isFree: boolean;
    }) => {
      if (!actor) throw new Error("Not authenticated");
      return actor.updateStrategyPricing(
        params.listingId,
        params.monthlyPrice,
        params.lifetimePrice,
        params.isFree,
      );
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: ["allMarketplaceListings"],
      });
      void queryClient.invalidateQueries({
        queryKey: ["activeMarketplaceListings"],
      });
    },
  });
}

// ── Extended Risk Settings ────────────────────────────────────────────────────

export function useExtendedRiskSettings() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["extendedRiskSettings"],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getExtendedRiskSettings();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useSaveExtendedRiskSettings() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (params: {
      maxDailyLoss: number;
      maxTradeRisk: number;
      maxOpenTrades: bigint;
      capitalAllocation: number;
      autoStopTrading: boolean;
    }) => {
      if (!actor) throw new Error("Not authenticated");
      return actor.saveExtendedRiskSettings(
        params.maxDailyLoss,
        params.maxTradeRisk,
        params.maxOpenTrades,
        params.capitalAllocation,
        params.autoStopTrading,
      );
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: ["extendedRiskSettings"],
      });
    },
  });
}

// ── Broker Connections ────────────────────────────────────────────────────────

export function useBrokerConnections() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["brokerConnections"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getBrokerConnections();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useSaveBrokerConnection() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (params: {
      broker: string;
      apiKey: string;
      secret: string;
      accessToken: string;
      paperMode: boolean;
    }) => {
      if (!actor) throw new Error("Not authenticated");
      return actor.saveBrokerConnection(
        params.broker,
        params.apiKey,
        params.secret,
        params.accessToken,
        params.paperMode,
      );
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["brokerConnections"] });
    },
  });
}

export function useDisconnectBroker() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (broker: string) => {
      if (!actor) throw new Error("Not authenticated");
      return actor.disconnectBroker(broker);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["brokerConnections"] });
    },
  });
}

// ── Notifications ─────────────────────────────────────────────────────────────

export function useMyNotifications() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["myNotifications"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getMyNotifications();
    },
    enabled: !!actor && !isFetching,
    refetchInterval: 30000,
  });
}

export function useNotificationUnreadCount() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["notificationUnreadCount"],
    queryFn: async () => {
      if (!actor) return BigInt(0);
      return actor.getNotificationUnreadCount();
    },
    enabled: !!actor && !isFetching,
    refetchInterval: 30000,
  });
}

export function useMarkNotificationsRead() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error("Not authenticated");
      return actor.markNotificationsRead();
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["myNotifications"] });
      void queryClient.invalidateQueries({
        queryKey: ["notificationUnreadCount"],
      });
    },
  });
}

export function useUpdateNotificationEmailPref() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (params: {
      notificationType: string;
      emailEnabled: boolean;
    }) => {
      if (!actor) throw new Error("Not authenticated");
      return actor.updateNotificationEmailPref(
        params.notificationType,
        params.emailEnabled,
      );
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["myNotifications"] });
    },
  });
}

// ── Public User Profile ───────────────────────────────────────────────────────

export function usePublicUserProfile(
  principal: import("@icp-sdk/core/principal").Principal | null,
) {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["publicUserProfile", principal?.toString()],
    queryFn: async () => {
      if (!actor || !principal) return null;
      return actor.getPublicUserProfile(principal);
    },
    enabled: !!actor && !isFetching && !!principal,
  });
}
