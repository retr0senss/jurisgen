"use client";

import { useState } from "react";
import { useUser } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
  Send,
  FileText,
  MessageSquare,
  Gavel,
  Scale,
  BookOpen,
  PlusCircle,
  History,
  AlertCircle,
  CheckCircle,
  Loader2
} from "lucide-react";
import { useUserStore } from '@/stores/user-store';

interface Message {
  id: string;
  type: "user" | "assistant";
  content: string;
  timestamp: Date;
  mevzuatInfo?: {
    foundDocuments: number;
    totalResults: number;
    searchKeywords: string[];
    // Phase 1 AI Intent Detection Results
    aiIntent?: {
      legalDomain: string;
      mainLegislation: string;
      confidence: number;
      searchType: string;
    };
    // 🆕 Phase 2: Detailed Analysis Support
    hasDetailedAnalysisAvailable?: boolean;
    detailedAnalysisUsed?: boolean;
  };
  // 🆕 Token usage info
  tokenUsage?: {
    totalTokens: number;
    estimatedCost: string;
  };
  analysisMode?: 'free_enhanced' | 'premium_enhanced';
  // User limits info
  userLimits?: {
    isPremium: boolean;
    tier?: 'free' | 'basic' | 'pro' | 'enterprise';
    featuresUsed?: string[];
  };
}

interface ChatSession {
  id: string;
  title: string;
  lastMessage: string;
  timestamp: Date;
  messageCount: number;
}

const quickActions = [
  {
    title: "Ceza Hukuku",
    description: "Ceza kanunu ve suçlar hakkında",
    icon: Gavel,
    prompt: "Türk Ceza Kanunu hakkında bilgi almak istiyorum."
  },
  {
    title: "Medeni Hukuk",
    description: "Evlilik, miras, aile hukuku",
    icon: Scale,
    prompt: "Medeni kanun kapsamında evlilik ve boşanma süreçleri hakkında bilgi istiyorum."
  },
  {
    title: "İş Hukuku",
    description: "İş kanunu ve çalışan hakları",
    icon: FileText,
    prompt: "İş kanunu kapsamındaki çalışan hakları hakkında bilgi almak istiyorum."
  },
  {
    title: "Mevzuat Araştırması",
    description: "Genel hukuki araştırma",
    icon: BookOpen,
    prompt: "Belirli bir hukuki konuda mevzuat araştırması yapmak istiyorum."
  }
];

export default function ChatPage() {
  const { user, isLoaded, isSignedIn } = useUser();
  const {
    user: userData,
    canSendMessage,
    updateUsage,
    remainingMessages
  } = useUserStore();

  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isPremium = userData?.isPremium;
  // Chat sessions state
  const [chatSessions] = useState<ChatSession[]>([
    {
      id: "1",
      title: "Ceza Hukuku Danışmanlığı",
      lastMessage: "TCK madde 141'e göre hırsızlık suçu...",
      timestamp: new Date(2024, 0, 15),
      messageCount: 8
    },
    {
      id: "2",
      title: "İş Hukuku Analizi",
      lastMessage: "İş Kanunu kapsamında işten çıkarma...",
      timestamp: new Date(2024, 0, 14),
      messageCount: 12
    }
  ]);

  const handleSendMessage = async () => {
    if (!message.trim() || isLoading) return;

    // Check if user can send message
    if (!canSendMessage()) {
      setError("Aylık mesaj limitiniz dolmuş. Premium'a geçerek sınırsız mesaj gönderebilirsiniz.");
      return;
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      type: "user",
      content: message,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    const currentMessage = message;
    setMessage("");
    setIsLoading(true);
    setError(null);

    try {
      // Optimistically update usage in store
      await updateUsage('message', true);

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: currentMessage,
          history: messages.map(msg => ({
            role: msg.type === 'user' ? 'user' : 'assistant',
            content: msg.content
          }))
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'API request failed');
      }

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: "assistant",
        content: data.response,
        timestamp: new Date(),
        mevzuatInfo: data.mevzuatInfo,
        tokenUsage: data.tokenUsage,
        analysisMode: data.analysisMode,
        userLimits: data.userLimits
      };

      setMessages(prev => [...prev, assistantMessage]);

    } catch (err) {
      console.error('Chat error:', err);
      setError(err instanceof Error ? err.message : 'Bir hata oluştu');

      // Hata mesajı ekle
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: "assistant",
        content: "Üzgünüm, şu anda bir teknik sorun yaşıyorum. Lütfen daha sonra tekrar deneyin.",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickAction = (prompt: string) => {
    setMessage(prompt);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Yükleniyor...</p>
        </div>
      </div>
    );
  }

  if (!isSignedIn) {
    window.location.href = '/login';
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground">Giriş sayfasına yönlendiriliyorsunuz...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-card-foreground flex items-center gap-2">
                  <History className="h-5 w-5" />
                  Sohbet Geçmişi
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button className="w-full justify-start" variant="outline">
                  <PlusCircle className="h-4 w-4 mr-2" />
                  Yeni Sohbet
                </Button>
                <Separator />

                {/* 🆕 User Limits Display */}
                {userData && (
                  <div className="p-3 rounded-lg bg-background border">
                    <h4 className="font-medium text-sm text-foreground mb-2">
                      {isPremium ? '✨ Premium Üye' : '🆓 Ücretsiz Plan'}
                    </h4>
                    {!isPremium && (
                      <div className="space-y-2">
                        <div className="text-xs text-muted-foreground">
                          Kalan Mesaj: {remainingMessages()}
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-primary h-2 rounded-full"
                            style={{ width: `${100 - ((remainingMessages() / (userData?.monthlyMessageCount + remainingMessages())) * 100) || 0}%` }}
                          ></div>
                        </div>
                        {remainingMessages() <= 1 && (
                          <Button size="sm" className="w-full text-xs">
                            🚀 Premium&apos;a Geç
                          </Button>
                        )}
                      </div>
                    )}
                  </div>
                )}

                <Separator />

                {chatSessions.map((session) => (
                  <div
                    key={session.id}
                    className="p-3 rounded-lg bg-background hover:bg-muted cursor-pointer transition-colors"
                  >
                    <h4 className="font-medium text-sm text-foreground truncate">
                      {session.title}
                    </h4>
                    <p className="text-xs text-muted-foreground mt-1 truncate">
                      {session.lastMessage}
                    </p>
                    <div className="flex justify-between items-center mt-2">
                      <span className="text-xs text-muted-foreground">
                        {session.messageCount} mesaj
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {session.timestamp.toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Main Chat Area */}
          <div className="lg:col-span-3">
            <Card className="bg-card border-border h-[calc(100vh-200px)]">
              <CardHeader>
                <CardTitle className="text-card-foreground flex items-center gap-2 flex-wrap">
                  <MessageSquare className="h-5 w-5" />
                  JurisGen AI - Türk Hukuku Asistanı
                  {/* 🆕 Premium status badge */}
                  {userData && (
                    <Badge
                      variant={isPremium ? "default" : "outline"}
                      className="ml-1"
                    >
                      {isPremium ? '✨ Premium' : '🆓 Free'}
                    </Badge>
                  )}
                </CardTitle>
                {error && (
                  <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 p-2 rounded">
                    <AlertCircle className="h-4 w-4" />
                    {error}
                  </div>
                )}
              </CardHeader>
              <CardContent className="flex flex-col h-full">
                {/* Welcome / Quick Actions */}
                {messages.length === 0 && (
                  <div className="flex-1 flex flex-col justify-center items-center text-center space-y-6">
                    <div>
                      <h2 className="text-xl font-semibold text-foreground mb-2">
                        Merhaba {user?.firstName}! 👋
                      </h2>
                      <p className="text-muted-foreground">
                        Türk hukuku hakkında sorularınızı sorabilirsiniz.
                        AI asistanınız gerçek mevzuat verilerine erişerek size yardımcı olacak.
                      </p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-2xl">
                      {quickActions.map((action) => (
                        <Button
                          key={action.title}
                          variant="outline"
                          className="h-auto p-4 text-left"
                          onClick={() => handleQuickAction(action.prompt)}
                        >
                          <div className="flex items-start gap-3">
                            <action.icon className="h-5 w-5 mt-0.5 text-primary" />
                            <div>
                              <h3 className="font-medium text-foreground">
                                {action.title}
                              </h3>
                              <p className="text-sm text-muted-foreground mt-1">
                                {action.description}
                              </p>
                            </div>
                          </div>
                        </Button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Messages */}
                {messages.length > 0 && (
                  <div className="flex-1 overflow-y-auto space-y-4 pr-2">
                    {messages.map((msg) => (
                      <div key={msg.id} className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[80%] rounded-lg p-3 ${msg.type === 'user'
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted text-foreground'
                          }`}>
                          <div className="whitespace-pre-wrap text-sm">
                            {msg.content}
                          </div>
                          {msg.mevzuatInfo && (
                            <div className="mt-2 space-y-2">
                              <div className="flex flex-wrap gap-1">
                                <Badge variant="secondary" className="text-xs">
                                  <CheckCircle className="h-3 w-3 mr-1" />
                                  {msg.mevzuatInfo.foundDocuments} mevzuat bulundu
                                </Badge>
                                {/* Phase 1: AI Intent Detection Results */}
                                {msg.mevzuatInfo.aiIntent && (
                                  <>
                                    <Badge
                                      variant={msg.mevzuatInfo.aiIntent.confidence >= 0.7 ? "default" : "outline"}
                                      className="text-xs"
                                    >
                                      🤖 {msg.mevzuatInfo.aiIntent.legalDomain}
                                    </Badge>
                                    <Badge variant="outline" className="text-xs">
                                      📊 %{(msg.mevzuatInfo.aiIntent.confidence * 100).toFixed(0)} güven
                                    </Badge>
                                    {msg.mevzuatInfo.aiIntent.mainLegislation && (
                                      <Badge variant="outline" className="text-xs">
                                        📋 {msg.mevzuatInfo.aiIntent.mainLegislation}
                                      </Badge>
                                    )}
                                  </>
                                )}
                                {msg.mevzuatInfo.searchKeywords.length > 0 && (
                                  <Badge variant="outline" className="text-xs">
                                    Anahtar: {msg.mevzuatInfo.searchKeywords.slice(0, 2).join(', ')}
                                  </Badge>
                                )}
                                {/* Analysis Mode Badge */}
                                {msg.analysisMode && (
                                  <Badge
                                    variant={msg.analysisMode === 'premium_enhanced' ? "default" : "outline"}
                                    className="text-xs"
                                  >
                                    {msg.analysisMode === 'premium_enhanced' ? '💎 Premium Enhanced' : '🚀 Enhanced Search'}
                                  </Badge>
                                )}
                              </div>



                              {/* Token Usage Info */}
                              {msg.tokenUsage && (
                                <div className="text-xs text-muted-foreground flex items-center gap-2">
                                  <span>📊 {msg.tokenUsage.totalTokens} token</span>
                                  <span>💰 ~${msg.tokenUsage.estimatedCost}</span>
                                </div>
                              )}
                            </div>
                          )}
                          <div className="text-xs opacity-70 mt-2">
                            {msg.timestamp.toLocaleTimeString()}
                          </div>
                        </div>
                      </div>
                    ))}
                    {isLoading && (
                      <div className="flex justify-start">
                        <div className="bg-muted text-foreground rounded-lg p-3 flex items-center gap-2">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          <span className="text-sm">AI düşünüyor...</span>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Input Area */}
                <div className="border-t pt-4 mt-4">
                  <div className="flex gap-2 items-center">
                    <Input
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Hukuki sorunuzu yazın... (örn: 'sigorta hırsızlık hasar tazminatı nedir?')"
                      disabled={isLoading}
                      className="flex-1 h-10"
                    />

                    <Button
                      onClick={() => handleSendMessage()}
                      disabled={isLoading || !message.trim()}
                      className="h-10 px-3"
                    >
                      {isLoading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Send className="h-4 w-4" />
                      )}
                    </Button>
                  </div>

                                      <div className="flex items-center justify-between mt-2">
                      <p className="text-xs text-muted-foreground">
                        {isPremium
                          ? "💎 Premium: Enhanced Search + Semantic Content Analysis"
                          : "🚀 Enhanced Search: Query Expansion + Intent Classification + Result Ranking"
                        }
                      </p>

                      <div className="flex items-center gap-3">
                        {/* Premium Status */}
                        {userData && (
                          <span className={`text-xs font-medium ${isPremium ? 'text-primary' : 'text-muted-foreground'}`}>
                            {isPremium ? '✨ Premium Active' : `💬 ${remainingMessages()} messages left`}
                          </span>
                        )}
                      </div>
                    </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
} 