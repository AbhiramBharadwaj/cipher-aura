import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, Lock, Unlock, Search, Send, Shield, User, Clock } from "lucide-react";

interface Message {
  id: string;
  sender: string;
  recipient: string;
  content: string;
  isEncrypted: boolean;
  timestamp: Date;
  status: "sent" | "delivered" | "read";
}

export function MessagesPage() {
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [newMessage, setNewMessage] = useState("");
  const [recipient, setRecipient] = useState("");

  const [messages] = useState<Message[]>([
    {
      id: "1",
      sender: "john@example.com",
      recipient: "you@example.com",
      content: "Hey, can you send me the encrypted file we discussed?",
      isEncrypted: false,
      timestamp: new Date(Date.now() - 1000 * 60 * 30),
      status: "read"
    },
    {
      id: "2",
      sender: "you@example.com",
      recipient: "alice@company.com",
      content: "VGhpcyBpcyBhbiBlbmNyeXB0ZWQgbWVzc2FnZQ==",
      isEncrypted: true,
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2),
      status: "delivered"
    },
    {
      id: "3",
      sender: "security@company.com",
      recipient: "you@example.com",
      content: "Your encryption keys have been updated successfully.",
      isEncrypted: false,
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24),
      status: "read"
    },
    {
      id: "4",
      sender: "you@example.com",
      recipient: "team@company.com",
      content: "Q2lwaGVyQXVyYSBpcyB3b3JraW5nIGdyZWF0IQ==",
      isEncrypted: true,
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2),
      status: "sent"
    }
  ]);

  const filteredMessages = messages.filter(message =>
    message.sender.toLowerCase().includes(searchQuery.toLowerCase()) ||
    message.recipient.toLowerCase().includes(searchQuery.toLowerCase()) ||
    message.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  const sendMessage = () => {
    // Handle sending message
    console.log("Sending message:", { recipient, content: newMessage });
    setNewMessage("");
    setRecipient("");
  };

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
        {/* Messages List */}
        <div className="lg:col-span-1 space-y-4">
          {/* Search */}
          <Card className="glass-card border-navy-light">
            <CardContent className="p-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search messages..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 glass-card border-navy-light focus:border-primary"
                />
              </div>
            </CardContent>
          </Card>

          {/* Message List */}
          <div className="space-y-2 max-h-[600px] overflow-y-auto">
            {filteredMessages.map((message) => (
              <Card 
                key={message.id}
                className={`glass-card border-navy-light cursor-pointer hover-lift transition-all ${
                  selectedMessage?.id === message.id ? 'neon-glow border-primary' : ''
                }`}
                onClick={() => setSelectedMessage(message)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <User className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm font-medium text-foreground">
                        {message.sender === "you@example.com" ? "You" : message.sender}
                      </span>
                    </div>
                    <div className="flex items-center space-x-1">
                      {message.isEncrypted ? (
                        <Lock className="w-3 h-3 text-primary" />
                      ) : (
                        <Unlock className="w-3 h-3 text-muted-foreground" />
                      )}
                      <Badge variant={message.status === "read" ? "default" : "secondary"} className="text-xs">
                        {message.status}
                      </Badge>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2 truncate">
                    {message.isEncrypted ? "[Encrypted Message]" : message.content}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">
                      To: {message.recipient === "you@example.com" ? "You" : message.recipient}
                    </span>
                    <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                      <Clock className="w-3 h-3" />
                      <span>{formatTime(message.timestamp)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Message Detail & Compose */}
        <div className="lg:col-span-2 space-y-6">
          {/* Selected Message */}
          {selectedMessage ? (
            <Card className="glass-card border-navy-light">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <MessageSquare className="w-5 h-5 text-primary" />
                    <span>Message Details</span>
                  </div>
                  <Badge variant={selectedMessage.isEncrypted ? "default" : "secondary"}>
                    {selectedMessage.isEncrypted ? "Encrypted" : "Plain Text"}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">From:</span>
                    <p className="text-foreground font-medium">{selectedMessage.sender}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">To:</span>
                    <p className="text-foreground font-medium">{selectedMessage.recipient}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Status:</span>
                    <p className="text-foreground font-medium capitalize">{selectedMessage.status}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Time:</span>
                    <p className="text-foreground font-medium">{selectedMessage.timestamp.toLocaleString()}</p>
                  </div>
                </div>
                
                <div className="border-t border-navy-light pt-4">
                  <span className="text-muted-foreground text-sm">Message Content:</span>
                  <div className={`mt-2 p-4 rounded-lg ${
                    selectedMessage.isEncrypted 
                      ? 'bg-navy-medium border border-primary/20 font-mono text-primary' 
                      : 'bg-navy-light border border-navy-light text-foreground'
                  }`}>
                    {selectedMessage.content}
                  </div>
                </div>

                {selectedMessage.isEncrypted && (
                  <div className="bg-primary/10 border border-primary/20 rounded-lg p-3">
                    <div className="flex items-center space-x-2 text-primary mb-2">
                      <Lock className="w-4 h-4" />
                      <span className="text-sm font-medium">Encrypted Content</span>
                    </div>
                    <p className="text-xs text-primary/80">
                      This message is encrypted using your hybrid encryption system. 
                      Use the decrypt tool to view the original content.
                    </p>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="mt-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground"
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
                <h3 className="text-lg font-medium text-foreground mb-2">Select a Message</h3>
                <p className="text-muted-foreground">Choose a message from the list to view its details</p>
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
              <div>
                <label className="text-sm font-medium text-foreground">Recipient</label>
                <Input
                  placeholder="Enter recipient email..."
                  value={recipient}
                  onChange={(e) => setRecipient(e.target.value)}
                  className="mt-1 glass-card border-navy-light focus:border-primary"
                />
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
                  <input type="checkbox" defaultChecked className="rounded border-navy-light text-primary focus:ring-primary" />
                  <span className="text-sm text-muted-foreground">Encrypt message</span>
                  <Lock className="w-4 h-4 text-primary" />
                </div>
                
                <Button 
                  onClick={sendMessage}
                  disabled={!recipient || !newMessage}
                  className="gradient-primary text-white hover-lift"
                >
                  <Send className="w-4 h-4 mr-2" />
                  Send Secure
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}