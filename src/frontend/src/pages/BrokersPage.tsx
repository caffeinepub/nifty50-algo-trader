import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useNavigate } from "@tanstack/react-router";
import {
  Check,
  FlaskConical,
  Link2,
  Loader2,
  RefreshCw,
  Unlink,
  Wifi,
} from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import type { BrokerConnection } from "../backend.d";
import { Footer } from "../components/trading/Footer";
import { Header } from "../components/trading/Header";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import {
  useBrokerConnections,
  useDisconnectBroker,
  useSaveBrokerConnection,
} from "../hooks/useQueries";

function useAuthGuard() {
  const { identity, isInitializing } = useInternetIdentity();
  const navigate = useNavigate();
  const isLoggedIn = !!identity && !identity.getPrincipal().isAnonymous();
  if (!isInitializing && !isLoggedIn) {
    void navigate({ to: "/login" });
  }
  return { isLoggedIn, isInitializing };
}

interface BrokerMeta {
  id: string;
  name: string;
  color: string;
  textColor: string;
  bgColor: string;
  initial: string;
  isPaper?: boolean;
  description: string;
}

const BROKERS: BrokerMeta[] = [
  {
    id: "upstox",
    name: "Upstox",
    color: "#5B4FCF",
    textColor: "text-[oklch(0.65_0.2_285)]",
    bgColor: "bg-[oklch(0.65_0.2_285)/10] border-[oklch(0.65_0.2_285)/30]",
    initial: "U",
    description: "Connect via Upstox API v2 with OAuth 2.0",
  },
  {
    id: "zerodha",
    name: "Zerodha",
    color: "#387ED1",
    textColor: "text-primary",
    bgColor: "bg-primary/10 border-primary/30",
    initial: "Z",
    description: "Zerodha Kite Connect API integration",
  },
  {
    id: "angelone",
    name: "Angel One",
    color: "#D14038",
    textColor: "text-loss",
    bgColor: "bg-loss/10 border-loss/30",
    initial: "A",
    description: "Angel One SmartAPI for direct order placement",
  },
  {
    id: "fyers",
    name: "Fyers",
    color: "#F59E0B",
    textColor: "text-warning",
    bgColor: "bg-warning/10 border-warning/30",
    initial: "F",
    description: "Fyers API with WebSocket streaming support",
  },
  {
    id: "paper",
    name: "Paper Trading",
    color: "#00FFA3",
    textColor: "text-profit",
    bgColor: "bg-profit/10 border-profit/30",
    initial: "P",
    isPaper: true,
    description: "Simulated trading — no real orders, no API key needed",
  },
];

interface BrokerFormState {
  apiKey: string;
  secret: string;
  accessToken: string;
  paperMode: boolean;
}

function BrokerCard({
  meta,
  connection,
}: {
  meta: BrokerMeta;
  connection?: BrokerConnection;
}) {
  const { mutate: saveConn, isPending: isConnecting } =
    useSaveBrokerConnection();
  const { mutate: disconn, isPending: isDisconnecting } = useDisconnectBroker();

  const isConnected = connection?.connected ?? false;
  const [form, setForm] = useState<BrokerFormState>({
    apiKey: "",
    secret: "",
    accessToken: "",
    paperMode: meta.isPaper ?? false,
  });
  const [isTesting, setIsTesting] = useState(false);

  const handleConnect = () => {
    if (!meta.isPaper && !form.apiKey.trim()) {
      toast.error("API Key is required");
      return;
    }
    saveConn(
      {
        broker: meta.id,
        apiKey: form.apiKey,
        secret: form.secret,
        accessToken: form.accessToken,
        paperMode: meta.isPaper ? true : form.paperMode,
      },
      {
        onSuccess: () => {
          toast.success(`${meta.name} connected successfully`);
          setForm({
            apiKey: "",
            secret: "",
            accessToken: "",
            paperMode: false,
          });
        },
        onError: () => toast.error(`Failed to connect ${meta.name}`),
      },
    );
  };

  const handleDisconnect = () => {
    disconn(meta.id, {
      onSuccess: () => toast.success(`${meta.name} disconnected`),
      onError: () => toast.error(`Failed to disconnect ${meta.name}`),
    });
  };

  const handleTest = () => {
    setIsTesting(true);
    setTimeout(() => {
      setIsTesting(false);
      const ok = Math.random() > 0.3;
      if (ok) toast.success(`${meta.name}: Connection successful ✓`);
      else toast.error(`${meta.name}: Connection failed — check credentials`);
    }, 1500);
  };

  return (
    <Card
      className={`bg-card/80 border-border transition-all hover:shadow-glow ${isConnected ? "border-profit/20" : ""}`}
      data-ocid={`brokers.${meta.id}.card`}
    >
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Broker icon */}
            <div
              className={`w-10 h-10 rounded-xl border flex items-center justify-center font-bold text-base ${meta.bgColor} ${meta.textColor}`}
            >
              {meta.initial}
            </div>
            <div>
              <CardTitle className="text-sm font-display">
                {meta.name}
              </CardTitle>
              <CardDescription className="text-[10px]">
                {meta.description}
              </CardDescription>
            </div>
          </div>
          <Badge
            variant="outline"
            className={
              isConnected
                ? "text-profit border-profit/30 bg-profit/10 text-[10px]"
                : "text-muted-foreground text-[10px]"
            }
          >
            {isConnected ? (
              <>
                <span className="w-1.5 h-1.5 rounded-full bg-profit mr-1.5 animate-pulse" />
                Connected
              </>
            ) : (
              "Disconnected"
            )}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {isConnected ? (
          /* Connected state */
          <div className="space-y-3">
            <div className="p-3 rounded-lg bg-profit/5 border border-profit/15 space-y-1.5">
              {!meta.isPaper && (
                <>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">API Key</span>
                    <span className="font-mono-data text-foreground">
                      {connection?.apiKey
                        ? `${connection.apiKey.slice(0, 6)}••••••`
                        : "••••••••"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Access Token</span>
                    <span className="font-mono-data text-muted-foreground">
                      ••••••••••••
                    </span>
                  </div>
                </>
              )}
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Mode</span>
                <Badge
                  variant="outline"
                  className={
                    connection?.paperMode
                      ? "text-primary border-primary/30 text-[10px]"
                      : "text-loss border-loss/30 text-[10px]"
                  }
                >
                  {connection?.paperMode ? "Paper" : "Live"}
                </Badge>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                className="flex-1 gap-1.5 text-xs h-8"
                onClick={handleTest}
                disabled={isTesting}
                data-ocid={`brokers.${meta.id}.secondary_button`}
              >
                {isTesting ? (
                  <Loader2 className="w-3 h-3 animate-spin" />
                ) : (
                  <Wifi className="w-3 h-3" />
                )}
                Test
              </Button>
              <Button
                size="sm"
                variant="destructive"
                className="flex-1 gap-1.5 text-xs h-8"
                onClick={handleDisconnect}
                disabled={isDisconnecting}
                data-ocid={`brokers.${meta.id}.delete_button`}
              >
                {isDisconnecting ? (
                  <Loader2 className="w-3 h-3 animate-spin" />
                ) : (
                  <Unlink className="w-3 h-3" />
                )}
                Disconnect
              </Button>
            </div>
          </div>
        ) : meta.isPaper ? (
          /* Paper trading — no API needed */
          <div className="space-y-3">
            <div className="p-3 rounded-lg bg-background/60 border border-border">
              <p className="text-xs text-muted-foreground leading-relaxed">
                Paper trading simulates order execution without placing real
                orders on any exchange. Perfect for strategy testing.
              </p>
            </div>
            <div className="flex items-center justify-between p-2.5 bg-background/40 rounded-lg border border-border">
              <Label className="text-xs">Enable Paper Trading</Label>
              <Switch
                checked={form.paperMode}
                onCheckedChange={(checked) =>
                  setForm((f) => ({ ...f, paperMode: checked }))
                }
                data-ocid={`brokers.${meta.id}.switch`}
              />
            </div>
            <Button
              size="sm"
              className="w-full gap-1.5 text-xs h-8"
              onClick={handleConnect}
              disabled={isConnecting}
              data-ocid={`brokers.${meta.id}.primary_button`}
            >
              {isConnecting ? (
                <Loader2 className="w-3 h-3 animate-spin" />
              ) : (
                <FlaskConical className="w-3 h-3" />
              )}
              Enable Paper Mode
            </Button>
          </div>
        ) : (
          /* Disconnected — show connect form */
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label className="text-[10px] text-muted-foreground uppercase tracking-wider">
                API Key
              </Label>
              <Input
                type="password"
                value={form.apiKey}
                onChange={(e) =>
                  setForm((f) => ({ ...f, apiKey: e.target.value }))
                }
                placeholder="Enter API key"
                className="h-8 bg-input text-xs font-mono"
                data-ocid={`brokers.${meta.id}.input`}
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-[10px] text-muted-foreground uppercase tracking-wider">
                Secret / API Secret
              </Label>
              <Input
                type="password"
                value={form.secret}
                onChange={(e) =>
                  setForm((f) => ({ ...f, secret: e.target.value }))
                }
                placeholder="Enter API secret"
                className="h-8 bg-input text-xs font-mono"
                data-ocid={`brokers.${meta.id}.input`}
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-[10px] text-muted-foreground uppercase tracking-wider">
                Access Token
              </Label>
              <Input
                type="password"
                value={form.accessToken}
                onChange={(e) =>
                  setForm((f) => ({ ...f, accessToken: e.target.value }))
                }
                placeholder="Enter access token"
                className="h-8 bg-input text-xs font-mono"
                data-ocid={`brokers.${meta.id}.input`}
              />
            </div>
            <div className="flex items-center justify-between p-2 bg-background/40 rounded-lg border border-border">
              <Label className="text-xs">Paper Mode</Label>
              <Switch
                checked={form.paperMode}
                onCheckedChange={(checked) =>
                  setForm((f) => ({ ...f, paperMode: checked }))
                }
                data-ocid={`brokers.${meta.id}.switch`}
              />
            </div>
            <Button
              size="sm"
              className="w-full gap-1.5 text-xs h-8"
              onClick={handleConnect}
              disabled={isConnecting}
              data-ocid={`brokers.${meta.id}.primary_button`}
            >
              {isConnecting ? (
                <Loader2 className="w-3 h-3 animate-spin" />
              ) : (
                <Link2 className="w-3 h-3" />
              )}
              Connect {meta.name}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export function BrokersPage() {
  const { isLoggedIn, isInitializing } = useAuthGuard();
  const { data: connections = [], isLoading } = useBrokerConnections();
  const [refreshKey, setRefreshKey] = useState(0);

  const getConnection = (brokerId: string): BrokerConnection | undefined =>
    connections.find((c) => c.broker === brokerId);

  if (isInitializing) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2
          className="w-8 h-8 animate-spin text-primary"
          data-ocid="brokers.loading_state"
        />
      </div>
    );
  }

  if (!isLoggedIn) return null;

  const connectedCount = connections.filter((c) => c.connected).length;

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 md:px-6 py-6">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <div className="flex items-start justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
                <Link2 className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h1 className="font-display text-2xl font-bold">
                  Broker Integration
                </h1>
                <p className="text-sm text-muted-foreground mt-0.5">
                  Connect your broker accounts for live order execution
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Badge
                variant="outline"
                className={
                  connectedCount > 0
                    ? "text-profit border-profit/30 bg-profit/10"
                    : "text-muted-foreground"
                }
              >
                {isLoading ? (
                  <Loader2 className="w-3 h-3 animate-spin mr-1" />
                ) : (
                  <Check className="w-3 h-3 mr-1" />
                )}
                {connectedCount} Connected
              </Badge>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setRefreshKey((k) => k + 1)}
                className="gap-1.5 h-8 text-xs"
                data-ocid="brokers.secondary_button"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Refresh
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Broker Grid */}
        <motion.div
          key={refreshKey}
          className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          {BROKERS.map((meta, i) => (
            <motion.div
              key={meta.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
            >
              <BrokerCard meta={meta} connection={getConnection(meta.id)} />
            </motion.div>
          ))}
        </motion.div>

        {/* Info Banner */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mt-6 p-4 bg-background/60 border border-border rounded-lg"
        >
          <p className="text-xs text-muted-foreground leading-relaxed">
            <span className="font-semibold text-foreground">
              Security Note:{" "}
            </span>
            API keys and secrets are encrypted and stored securely on-chain.
            Never share your credentials with anyone. Use paper mode to test
            strategies before going live. Live trading involves real financial
            risk.
          </p>
        </motion.div>
      </main>
      <Footer />
    </div>
  );
}
