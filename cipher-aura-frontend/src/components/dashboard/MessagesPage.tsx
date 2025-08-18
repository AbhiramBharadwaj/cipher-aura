import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiGet, apiPost } from "@/lib/api";
import { MessageSquare, Lock, Unlock, Search, Send, Shield, User, Clock, Key } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

type ThreadDoc = {
  id: string;
  participant_ids: string[];
  last_message_preview?: string;
  last_message_at?: string; // ISO
  created_at?: string;      // ISO
};

type ApiMessage = {
  id: string;
  thread_id: string;
  sender_id: string;
  recipient_ids: string[];
  ciphertext?: string;          // plain in very early backend
  cipher?: {
    ciphertext_b64: string;     // new encrypted-at-rest shape (if you merged updates)
    pipeline?: string[];
  };
  status?: "sent" | "delivered" | "read";
  created_at: string;           // ISO
  read_at?: string[];
};

const KEYS_STORAGE = "cipher_keys";

export function MessagesPage() {
  const { toast } = useToast();
  const { user } = useAuth();
  const myId = (user as any)?._id || (user as any)?.id || "";

  // UI state
  const [searchQuery, setSearchQuery] = useState("");
  const [threads, setThreads] = useState<ThreadDoc[]>([]);
  const [selectedThreadId, setSelectedThreadId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ApiMessage[]>([]);
  const [selectedMessageId, setSelectedMessageId] = useState<string | null>(null);

  // compose state
  const [newMessage, setNewMessage] = useState("");
  const [recipientId, setRecipientId] = useState(""); // must be a Mongo ObjectId string

  // keys (prefilled from Encrypt page)
  const [caesarShift, setCaesarShift] = useState<number>(3);
  const [vigenereKey, setVigenereKey] = useState<string>("SECURE");
  const [aesKey, setAesKey] = useState<string>("MyStrongKey123");

  // decrypted text cache
  const [decrypted, setDecrypted] = useState<Record<string, string>>({});

  // ---------- helpers ----------
  const formatAgo = (iso?: string) => {
    if (!iso) return "";
    const d = new Date(iso);
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    const m = Math.floor(diff / (1000 * 60));
    const h = Math.floor(diff / (1000 * 60 * 60));
    const day = Math.floor(diff / (1000 * 60 * 60 * 24));
    if (m < 60) return `${m}m ago`;
    if (h < 24) return `${h}h ago`;
    return `${day}d ago`;
  };

  const otherParticipants = (t: ThreadDoc) =>
    (t.participant_ids || []).filter((p) => p !== myId);

  const displaySender = (msg: ApiMessage) =>
    msg.sender_id === myId ? "You" : msg.sender_id;

  const displayRecipientList = (msg: ApiMessage) =>
    msg.recipient_ids.map((r) => (r === myId ? "You" : r)).join(", ");

  const cipherTextFromMsg = (m: ApiMessage): string | null => {
    if (m?.cipher?.ciphertext_b64) return m.cipher.ciphertext_b64;
    if (m?.ciphertext) return m.ciphertext; // early version stored plaintext here
    return null;
  };

  // ---------- load saved keys once ----------
  useEffect(() => {
    try {
      const saved = localStorage.getItem(KEYS_STORAGE);
      if (saved) {
        const o = JSON.parse(saved);
        if (typeof o.caesarShift === "number") setCaesarShift(o.caesarShift);
        if (typeof o.vigenereKey === "string") setVigenereKey(o.vigenereKey);
        if (typeof o.aesKey === "string") setAesKey(o.aesKey);
      }
    } catch {}
  }, []);

  // ---------- fetch threads ----------
  const loadThreads = async () => {
    try {
      const data = await apiGet("/api/threads");
      setThreads(data as ThreadDoc[]);
    } catch (e) {
      toast({ title: "Failed to load threads", variant: "destructive" });
    }
  };

  useEffect(() => {
    loadThreads();
  }, []);

  // ---------- fetch messages for a thread ----------
  const loadMessages = async (threadId: string) => {
    try {
      const data = await apiGet(`/api/threads/${threadId}/messages`);
      setMessages(data as ApiMessage[]);
      // default to last message
      if ((data as ApiMessage[]).length) {
        setSelectedMessageId((data as ApiMessage[])[(data as ApiMessage[]).length - 1].id);
      } else {
        setSelectedMessageId(null);
      }
    } catch (e) {
      toast({ title: "Failed to load messages", variant: "destructive" });
    }
  };

  useEffect(() => {
    if (selectedThreadId) loadMessages(selectedThreadId);
  }, [selectedThreadId]);

  const selectedMessage = useMemo(
    () => messages.find((m) => m.id === selectedMessageId) || null,
    [messages, selectedMessageId]
  );

  // ---------- decrypt a message ----------
  const decryptMessage = async (m: ApiMessage) => {
    const cipher = cipherTextFromMsg(m);
    if (!cipher) {
      toast({ title: "No ciphertext on message", variant: "destructive" });
      return;
    }
    try {
      const res = await apiPost("/api/decrypt", {
        encrypted_message: cipher,
        caesar_shift: caesarShift,
        vigenere_key: vigenereKey,
        aes_key: aesKey,
      });
      const plain = res?.decrypted_message || "";
      if (!plain) throw new Error("Invalid decrypt response");
      setDecrypted((d) => ({ ...d, [m.id]: plain }));
      toast({ title: "Decrypted", description: "Plaintext shown below." });
    } catch (e) {
      toast({
        title: "Decryption failed",
        description: "Check the keys and try again.",
        variant: "destructive",
      });
    }
  };

  // ---------- send a message ----------
  const sendMessage = async () => {
    if (!recipientId || !newMessage.trim()) return;

    try {
      const body: any = {
        recipients: [recipientId], // must be MongoDB ObjectId string of the other user
        message: newMessage,
        caesar_shift: caesarShift,
        vigenere_key: vigenereKey,
        aes_key: aesKey,
      };

      const res = await apiPost("/api/messages/send", body);
      const threadId = res?.thread_id;
      setNewMessage("");
      if (threadId) {
        // pick/refresh that thread
        await loadThreads();
        setSelectedThreadId(threadId);
        await loadMessages(threadId);
        toast({ title: "Message sent", description: "Saved to database." });
      } else {
        toast({ title: "Sent", description: "Message sent." });
      }
    } catch (e) {
      toast({
        title: "Send failed",
        description: "Verify recipient user ID and try again.",
        variant: "destructive",
      });
    }
  };

  // ---------- filters ----------
  const filteredThreads = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return threads;
    return threads.filter((t) => {
      const others = otherParticipants(t).join(",").toLowerCase();
      const preview = (t.last_message_preview || "").toLowerCase();
      return others.includes(q) || preview.includes(q);
    });
  }, [threads, searchQuery]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Secure Messages</h1>
          <p className="text-muted-foreground">Manage your encrypted communications</p>
        </div>
        <div className="flex items-center space-x-2">
          <Shield className="w-6 h-6 text-primary" />
          <span className="text-sm text-muted-foreground">End-to-End Encryption</span>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Threads List */}
        <div className="lg:col-span-1 space-y-4">
          {/* Search */}
          <Card className="glass-card border-navy-light">
            <CardContent className="p-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search threads..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 glass-card border-navy-light focus:border-primary"
                />
              </div>
            </CardContent>
          </Card>

          {/* My ID */}
          <Card className="glass-card border-navy-light">
            <CardContent className="p-4 flex items-center justify-between text-sm">
              <div className="flex items-center space-x-2">
                <User className="w-4 h-4 text-muted-foreground" />
                <span className="text-muted-foreground">Your User ID:</span>
              </div>
              <code className="text-xs text-foreground">{myId || "—"}</code>
            </CardContent>
          </Card>

          {/* Thread items */}
          <div className="space-y-2 max-h-[600px] overflow-y-auto">
            {filteredThreads.map((t) => {
              const lastPreview = t.last_message_preview || "[No messages yet]";
              const time = formatAgo(t.last_message_at || t.created_at);
              const others = otherParticipants(t);
              const title = others.length ? others.join(", ") : "Just you";

              const isActive = selectedThreadId === t.id;
              return (
                <Card
                  key={t.id}
                  className={`glass-card border-navy-light cursor-pointer hover-lift transition-all ${
                    isActive ? "neon-glow border-primary" : ""
                  }`}
                  onClick={() => setSelectedThreadId(t.id)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <User className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm font-medium text-foreground">
                          {title}
                        </span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Clock className="w-3 h-3 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">{time}</span>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground truncate">{lastPreview}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Thread Details + Compose */}
        <div className="lg:col-span-2 space-y-6">
          {/* Selected message (latest by default) */}
          {selectedThreadId && selectedMessage ? (
            <Card className="glass-card border-navy-light">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <MessageSquare className="w-5 h-5 text-primary" />
                    <span>Message Details</span>
                  </div>
                  <Badge>
                    {cipherTextFromMsg(selectedMessage) ? "Encrypted" : "Plain Text"}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">From:</span>
                    <p className="text-foreground font-medium">
                      {displaySender(selectedMessage)}
                    </p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">To:</span>
                    <p className="text-foreground font-medium">
                      {displayRecipientList(selectedMessage)}
                    </p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Status:</span>
                    <p className="text-foreground font-medium capitalize">
                      {selectedMessage.status || "sent"}
                    </p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Time:</span>
                    <p className="text-foreground font-medium">
                      {new Date(selectedMessage.created_at).toLocaleString()}
                    </p>
                  </div>
                </div>

                <div className="border-t border-navy-light pt-4">
                  <span className="text-muted-foreground text-sm">Message Content:</span>
                  <div
                    className={`mt-2 p-4 rounded-lg ${
                      cipherTextFromMsg(selectedMessage)
                        ? "bg-navy-medium border border-primary/20 font-mono text-primary"
                        : "bg-navy-light border border-navy-light text-foreground"
                    }`}
                  >
                    {decrypted[selectedMessage.id] ||
                      cipherTextFromMsg(selectedMessage) ||
                      selectedMessage.ciphertext ||
                      ""}
                  </div>
                </div>

                {cipherTextFromMsg(selectedMessage) && (
                  <div className="bg-primary/10 border border-primary/20 rounded-lg p-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2 text-primary">
                        <Lock className="w-4 h-4" />
                        <span className="text-sm font-medium">Encrypted Content</span>
                      </div>
                      {/* quick keys inline */}
                      <div className="flex items-center space-x-2">
                        <Key className="w-4 h-4 text-primary" />
                        <Input
                          type="number"
                          className="h-8 w-16"
                          value={caesarShift}
                          onChange={(e) => setCaesarShift(parseInt(e.target.value || "0", 10))}
                          title="Caesar shift"
                        />
                        <Input
                          className="h-8 w-36"
                          value={vigenereKey}
                          onChange={(e) => setVigenereKey(e.target.value)}
                          placeholder="Vigenère"
                          title="Vigenère key"
                        />
                        <Input
                          className="h-8 w-44"
                          value={aesKey}
                          onChange={(e) => setAesKey(e.target.value)}
                          placeholder="AES key"
                          title="AES key"
                        />
                      </div>
                    </div>
                    <p className="text-xs text-primary/80 mt-2">
                      Use the same keys used during encryption to view plaintext.
                    </p>
                    <Button
                      size="sm"
                      variant="outline"
                      className="mt-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground"
                      onClick={() => decryptMessage(selectedMessage)}
                    >
                      Decrypt Message
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ) : (
            <Card className="glass-card border-navy-light">
              <CardContent className="p-12 text-center">
                <MessageSquare className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-2">
                  Select a Thread
                </h3>
                <p className="text-muted-foreground">
                  Choose a thread from the list to view its messages
                </p>
              </CardContent>
            </Card>
          )}

          {/* Compose New Message */}
          <Card className="glass-card border-navy-light">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Send className="w-5 h-5 text-primary" />
                <span>Compose Secure Message</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-xs text-muted-foreground">
                Enter the <span className="text-foreground font-medium">recipient’s User ID</span> (MongoDB ObjectId).
                Use the Settings page or “Your User ID” card to share IDs between test accounts.
              </div>

              <div className="grid sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium text-foreground">Recipient User ID</label>
                  <Input
                    placeholder="e.g. 662c1e3f8e5a0b1f2c3d4e5f"
                    value={recipientId}
                    onChange={(e) => setRecipientId(e.target.value.trim())}
                    className="mt-1 glass-card border-navy-light focus:border-primary font-mono text-xs"
                  />
                </div>

                {/* quick keys while composing */}
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    className="h-9 w-20"
                    value={caesarShift}
                    onChange={(e) => setCaesarShift(parseInt(e.target.value || "0", 10))}
                    placeholder="Shift"
                    title="Caesar shift"
                  />
                  <Input
                    className="h-9"
                    value={vigenereKey}
                    onChange={(e) => setVigenereKey(e.target.value)}
                    placeholder="Vigenère key"
                    title="Vigenère key"
                  />
                  <Input
                    className="h-9"
                    value={aesKey}
                    onChange={(e) => setAesKey(e.target.value)}
                    placeholder="AES key"
                    title="AES key"
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-foreground">Message</label>
                <textarea
                  placeholder="Type your message here..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  rows={4}
                  className="mt-1 w-full p-3 glass-card border border-navy-light rounded-lg focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary resize-none text-foreground placeholder-muted-foreground"
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <input type="checkbox" checked readOnly className="rounded border-navy-light text-primary" />
                  <span className="text-sm text-muted-foreground">Encrypt message</span>
                  <Lock className="w-4 h-4 text-primary" />
                </div>

                <Button
                  onClick={sendMessage}
                  disabled={!recipientId || !newMessage.trim()}
                  className="gradient-primary text-white hover-lift"
                >
                  <Send className="w-4 h-4 mr-2" />
                  Send Secure
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Conversation messages list (optional helper view) */}
          {selectedThreadId && messages.length > 0 && (
            <Card className="glass-card border-navy-light">
              <CardHeader>
                <CardTitle className="text-foreground">Conversation</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 max-h-[320px] overflow-y-auto">
                {messages.map((m) => {
                  const isEnc = !!cipherTextFromMsg(m);
                  const isSelected = m.id === selectedMessageId;
                  return (
                    <div
                      key={m.id}
                      className={`rounded-md p-3 border ${
                        isSelected ? "border-primary neon-glow" : "border-navy-light"
                      } cursor-pointer`}
                      onClick={() => setSelectedMessageId(m.id)}
                    >
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <div>
                          <span className="font-medium text-foreground">{displaySender(m)}</span>{" "}
                          → {displayRecipientList(m)}
                        </div>
                        <div className="flex items-center gap-1">
                          {isEnc ? <Lock className="w-3 h-3 text-primary" /> : <Unlock className="w-3 h-3" />}
                          <Clock className="w-3 h-3" />
                          <span>{formatAgo(m.created_at)}</span>
                        </div>
                      </div>
                      <div className="mt-2 text-sm">
                        {decrypted[m.id] ||
                          (isEnc ? "[Encrypted]" : m.ciphertext || "")}
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
