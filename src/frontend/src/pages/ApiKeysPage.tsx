import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useNavigate } from "@tanstack/react-router";
import {
  CheckCircle2,
  Copy,
  Key,
  Loader2,
  Plus,
  Trash2,
  Wifi,
  XCircle,
  Zap,
} from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { Footer } from "../components/trading/Footer";
import { Header } from "../components/trading/Header";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import {
  useBrokerConfig,
  useGenerateApiKey,
  useMyApiKeys,
  useRevokeApiKey,
  useSaveBrokerConfig,
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

function maskKey(keyHash: string): string {
  if (!keyHash) return "****";
  const visible = keyHash.slice(-6);
  return `••••••••${visible}`;
}

function formatDate(ts: bigint): string {
  const ms = Number(ts) > 1e12 ? Number(ts) / 1e6 : Number(ts);
  return new Date(ms).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

// ── Broker Card ───────────────────────────────────────────────────────────────

interface BrokerCardProps {
  name: string;
  description: string;
  icon: React.ReactNode;
  isConnected: boolean;
  apiKeyValue: string;
  secretValue: string;
  onApiKeyChange: (v: string) => void;
  onSecretChange: (v: string) => void;
  onConnect: () => void;
  isPending: boolean;
  ocidPrefix: string;
}

function BrokerCard({
  name,
  description,
  icon,
  isConnected,
  apiKeyValue,
  secretValue,
  onApiKeyChange,
  onSecretChange,
  onConnect,
  isPending,
  ocidPrefix,
}: BrokerCardProps) {
  return (
    <Card
      className={`bg-card/80 border-border transition-all ${isConnected ? "border-profit/30" : ""}`}
      data-ocid={`${ocidPrefix}.card`}
    >
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
              {icon}
            </div>
            <div>
              <CardTitle className="text-sm font-display">{name}</CardTitle>
              <CardDescription className="text-xs">
                {description}
              </CardDescription>
            </div>
          </div>
          <Badge
            variant="outline"
            className={
              isConnected
                ? "text-profit border-profit/30 bg-profit/10 text-[10px]"
                : "text-muted-foreground border-border text-[10px]"
            }
          >
            {isConnected ? (
              <CheckCircle2 className="w-3 h-3 mr-1" />
            ) : (
              <XCircle className="w-3 h-3 mr-1" />
            )}
            {isConnected ? "Connected" : "Not Connected"}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label className="text-xs">API Key</Label>
            <Input
              type="password"
              placeholder="Enter API key"
              value={apiKeyValue}
              onChange={(e) => onApiKeyChange(e.target.value)}
              className="bg-input text-xs font-mono h-8"
              data-ocid={`${ocidPrefix}.input`}
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">API Secret</Label>
            <Input
              type="password"
              placeholder="Enter API secret"
              value={secretValue}
              onChange={(e) => onSecretChange(e.target.value)}
              className="bg-input text-xs font-mono h-8"
              data-ocid={`${ocidPrefix}.input`}
            />
          </div>
        </div>
        <Button
          size="sm"
          variant={isConnected ? "outline" : "default"}
          className="gap-1.5 h-8 text-xs"
          onClick={onConnect}
          disabled={isPending}
          data-ocid={`${ocidPrefix}.primary_button`}
        >
          {isPending ? (
            <Loader2 className="w-3 h-3 animate-spin" />
          ) : (
            <Wifi className="w-3 h-3" />
          )}
          {isConnected ? "Update Connection" : "Connect"}
        </Button>
      </CardContent>
    </Card>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export function ApiKeysPage() {
  const { isLoggedIn, isInitializing } = useAuthGuard();
  const { data: apiKeys = [], isLoading } = useMyApiKeys();
  const { data: brokerConfig } = useBrokerConfig();
  const { mutateAsync: generateKey, isPending: isGenerating } =
    useGenerateApiKey();
  const { mutateAsync: revokeKey, isPending: isRevoking } = useRevokeApiKey();
  const { mutateAsync: saveBrokerConfig, isPending: isSavingBroker } =
    useSaveBrokerConfig();

  const [generateOpen, setGenerateOpen] = useState(false);
  const [newKeyName, setNewKeyName] = useState("");
  const [generatedKey, setGeneratedKey] = useState<string | null>(null);
  const [showKeyOpen, setShowKeyOpen] = useState(false);

  // Broker form state
  const [upstoxKey, setUpstoxKey] = useState(brokerConfig?.apiKey ?? "");
  const [upstoxSecret, setUpstoxSecret] = useState(brokerConfig?.secret ?? "");
  const [zerodhaKey, setZerodhaKey] = useState("");
  const [zerodhaSecret, setZerodhaSecret] = useState("");
  const [angelKey, setAngelKey] = useState("");
  const [angelSecret, setAngelSecret] = useState("");

  const handleGenerate = async () => {
    if (!newKeyName.trim()) {
      toast.error("Please enter a key name.");
      return;
    }
    try {
      const key = await generateKey(newKeyName.trim());
      setGeneratedKey(key.keyHash);
      setGenerateOpen(false);
      setNewKeyName("");
      setShowKeyOpen(true);
    } catch {
      toast.error("Failed to generate API key.");
    }
  };

  const handleRevoke = async (keyId: bigint, keyName: string) => {
    try {
      await revokeKey(keyId);
      toast.success(`API key "${keyName}" revoked.`);
    } catch {
      toast.error("Failed to revoke API key.");
    }
  };

  const handleConnectBroker = async (
    apiKey: string,
    secret: string,
    brokerName: string,
  ) => {
    try {
      await saveBrokerConfig({
        apiKey,
        secret,
        accessToken: brokerConfig?.accessToken ?? "",
        redirectUrl: brokerConfig?.redirectUrl ?? "",
        webhook: brokerConfig?.webhook ?? "",
        paperMode: brokerConfig?.paperMode ?? true,
        liveMode: brokerConfig?.liveMode ?? false,
        tradingMode: brokerConfig?.tradingMode ?? "paper",
      });
      toast.success(`${brokerName} connected successfully.`);
    } catch {
      toast.error(`Failed to connect ${brokerName}.`);
    }
  };

  if (isInitializing) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2
          className="w-8 h-8 animate-spin text-primary"
          data-ocid="apikeys.loading_state"
        />
      </div>
    );
  }

  if (!isLoggedIn) return null;

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 md:px-6 py-6">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <h1 className="font-display text-2xl font-bold">
            API Keys & Broker Connections
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Manage your platform API keys and broker integrations
          </p>
        </motion.div>

        <div className="space-y-8">
          {/* Platform API Keys */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="font-display text-lg font-semibold flex items-center gap-2">
                  <Key className="w-5 h-5 text-primary" />
                  Platform API Keys
                </h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Generate keys for programmatic access to your account
                </p>
              </div>
              <Button
                onClick={() => setGenerateOpen(true)}
                className="gap-2"
                data-ocid="apikeys.primary_button"
              >
                <Plus className="w-4 h-4" />
                Generate New Key
              </Button>
            </div>

            <Card className="bg-card/80 border-border">
              <CardContent className="p-0">
                <ScrollArea className="w-full">
                  <Table data-ocid="apikeys.table">
                    <TableHeader>
                      <TableRow className="border-border hover:bg-transparent">
                        {["Name", "Key", "Created", "Status", "Action"].map(
                          (h) => (
                            <TableHead
                              key={h}
                              className="text-xs text-muted-foreground font-mono uppercase tracking-wider"
                            >
                              {h}
                            </TableHead>
                          ),
                        )}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {isLoading ? (
                        [1, 2].map((sk) => (
                          <TableRow key={sk} className="border-border">
                            {[1, 2, 3, 4, 5].map((col) => (
                              <TableCell key={`${sk}-${col}`}>
                                <Skeleton className="h-4 w-full" />
                              </TableCell>
                            ))}
                          </TableRow>
                        ))
                      ) : apiKeys.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center py-12">
                            <div
                              className="flex flex-col items-center gap-2 text-muted-foreground"
                              data-ocid="apikeys.empty_state"
                            >
                              <Key className="w-10 h-10 opacity-20" />
                              <p className="text-sm">No API keys yet.</p>
                              <p className="text-xs">
                                Generate a key to get started.
                              </p>
                            </div>
                          </TableCell>
                        </TableRow>
                      ) : (
                        apiKeys.map((key, i) => (
                          <TableRow
                            key={key.id.toString()}
                            className="border-border hover:bg-accent/20 transition-colors"
                            data-ocid={`apikeys.row.${i + 1}`}
                          >
                            <TableCell className="font-medium text-sm">
                              {key.name}
                            </TableCell>
                            <TableCell className="font-mono text-xs text-muted-foreground">
                              {maskKey(key.keyHash)}
                            </TableCell>
                            <TableCell className="text-xs text-muted-foreground">
                              {formatDate(key.createdAt)}
                            </TableCell>
                            <TableCell>
                              <Badge
                                variant="outline"
                                className={
                                  key.active
                                    ? "text-profit border-profit/30 bg-profit/10 text-xs"
                                    : "text-muted-foreground border-border text-xs"
                                }
                              >
                                {key.active ? "Active" : "Revoked"}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Button
                                variant="destructive"
                                size="sm"
                                className="h-7 text-xs gap-1"
                                onClick={() => handleRevoke(key.id, key.name)}
                                disabled={isRevoking || !key.active}
                                data-ocid={`apikeys.delete_button.${i + 1}`}
                              >
                                <Trash2 className="w-3 h-3" />
                                Revoke
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </ScrollArea>
              </CardContent>
            </Card>
          </section>

          {/* Broker Connections */}
          <section>
            <div className="mb-4">
              <h2 className="font-display text-lg font-semibold flex items-center gap-2">
                <Zap className="w-5 h-5 text-warning" />
                Broker Connections
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Connect your trading broker to enable order execution
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <BrokerCard
                name="Upstox API"
                description="Connect Upstox for NSE trading"
                icon={<Zap className="w-5 h-5" />}
                isConnected={!!brokerConfig?.apiKey}
                apiKeyValue={upstoxKey}
                secretValue={upstoxSecret}
                onApiKeyChange={setUpstoxKey}
                onSecretChange={setUpstoxSecret}
                onConnect={() =>
                  handleConnectBroker(upstoxKey, upstoxSecret, "Upstox")
                }
                isPending={isSavingBroker}
                ocidPrefix="apikeys.upstox"
              />

              <BrokerCard
                name="Zerodha API"
                description="Connect Zerodha Kite API"
                icon={<Key className="w-5 h-5" />}
                isConnected={false}
                apiKeyValue={zerodhaKey}
                secretValue={zerodhaSecret}
                onApiKeyChange={setZerodhaKey}
                onSecretChange={setZerodhaSecret}
                onConnect={() => toast.info("Zerodha integration coming soon")}
                isPending={false}
                ocidPrefix="apikeys.zerodha"
              />

              <BrokerCard
                name="Angel One API"
                description="Connect Angel One SmartAPI"
                icon={<Key className="w-5 h-5" />}
                isConnected={false}
                apiKeyValue={angelKey}
                secretValue={angelSecret}
                onApiKeyChange={setAngelKey}
                onSecretChange={setAngelSecret}
                onConnect={() =>
                  toast.info("Angel One integration coming soon")
                }
                isPending={false}
                ocidPrefix="apikeys.angel"
              />
            </div>
          </section>
        </div>
      </main>
      <Footer />

      {/* Generate Key Dialog */}
      <Dialog open={generateOpen} onOpenChange={setGenerateOpen}>
        <DialogContent
          className="bg-card border-border max-w-sm"
          data-ocid="apikeys.dialog"
        >
          <DialogHeader>
            <DialogTitle className="font-display">Generate API Key</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div className="space-y-1.5">
              <Label className="text-xs">Key Name</Label>
              <Input
                placeholder="e.g. Trading Bot v1"
                value={newKeyName}
                onChange={(e) => setNewKeyName(e.target.value)}
                className="bg-input"
                data-ocid="apikeys.input"
              />
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setGenerateOpen(false)}
              data-ocid="apikeys.cancel_button"
            >
              Cancel
            </Button>
            <Button
              onClick={handleGenerate}
              disabled={isGenerating}
              data-ocid="apikeys.submit_button"
            >
              {isGenerating ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : null}
              Generate
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Show generated key dialog */}
      <Dialog open={showKeyOpen} onOpenChange={setShowKeyOpen}>
        <DialogContent
          className="bg-card border-border max-w-sm"
          data-ocid="apikeys.modal"
        >
          <DialogHeader>
            <DialogTitle className="font-display text-profit">
              API Key Generated!
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <p className="text-xs text-warning">
              ⚠️ Copy this key now. It will only be shown once.
            </p>
            <div className="bg-background/60 border border-border rounded-lg p-3 font-mono text-xs break-all">
              {generatedKey}
            </div>
            <Button
              variant="outline"
              className="w-full gap-2"
              onClick={() => {
                if (generatedKey) {
                  navigator.clipboard.writeText(generatedKey);
                  toast.success("Key copied to clipboard");
                }
              }}
              data-ocid="apikeys.secondary_button"
            >
              <Copy className="w-4 h-4" />
              Copy to Clipboard
            </Button>
          </div>
          <DialogFooter>
            <Button
              onClick={() => {
                setShowKeyOpen(false);
                setGeneratedKey(null);
              }}
              data-ocid="apikeys.close_button"
            >
              Done
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
