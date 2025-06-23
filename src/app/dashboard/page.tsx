"use client";

import React, { useEffect } from 'react';
import { useUser } from "@clerk/nextjs";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  MessageSquare,
  FileText,
  BookOpen,
  Crown,
  Clock,
  HelpCircle,
  Mail,
  Zap,
  Upload,
  Search
} from 'lucide-react';
import Link from 'next/link';
import { useUserStore, PLAN_LIMITS } from '@/stores/user-store';

export default function DashboardPage() {
  const { user, isLoaded, isSignedIn } = useUser();
  const { 
    user: userData, 
    recentActivity, 
    loading, 
    fetchUser,
    canSendMessage,
    canUploadDocument,
    getUsagePercentage,
    remainingMessages,
    remainingDocuments
  } = useUserStore();

  useEffect(() => {
    if (isLoaded && isSignedIn && user && !userData) {
      fetchUser();
    }
  }, [isLoaded, isSignedIn, user, userData, fetchUser]);

  if (!isLoaded || loading) {
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

  if (!userData) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground">Kullanıcı verileri yüklenemedi.</p>
          <Button onClick={fetchUser} className="mt-4">Tekrar Dene</Button>
        </div>
      </div>
    );
  }

  const limits = PLAN_LIMITS[userData.planType];
  const isPremium = userData.planType === 'PREMIUM';

  const quickActions = [
    {
      title: 'AI Chat',
      description: 'Hukuki sorularınızı sorun',
      icon: MessageSquare,
      href: '/chat',
      color: 'bg-blue-500',
      available: canSendMessage()
    },
    {
      title: 'Belge Yükle',
      description: 'Dökümanlarınızı analiz edin',
      icon: Upload,
      href: '/upload',
      color: 'bg-green-500',
      available: canUploadDocument()
    },
    {
      title: 'Mevzuat Ara',
      description: 'Güncel yasaları inceleyin',
      icon: Search,
      href: '/legal-search',
      color: 'bg-purple-500',
      available: isPremium
    },
    {
      title: 'Raporlar',
      description: 'Detaylı analiz raporları',
      icon: FileText,
      href: '/reports',
      color: 'bg-orange-500',
      available: isPremium
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Hoşgeldiniz, {user?.firstName || 'Kullanıcı'}! 👋
          </h1>
          <p className="text-muted-foreground">
            JurisGen dashboard&apos;unuza geri dönüş yaptınız. Bugün size nasıl yardımcı olabiliriz?
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Plan & Usage Status */}
            <Card className="relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-primary/10 to-transparent rounded-full -translate-y-16 translate-x-16"></div>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Crown className="h-5 w-5 text-primary" />
                  Plan Durumu
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <h3 className="font-bold text-xl flex items-center gap-2">
                      {userData.planType === 'FREE' ? (
                        <>
                          <span className="text-2xl">🆓</span>
                          Ücretsiz Plan
                        </>
                      ) : (
                        <>
                          <span className="text-2xl">✨</span>
                          {userData.planType} Plan
                        </>
                      )}
                    </h3>
                    <p className="text-sm text-muted-foreground font-medium">
                      {userData.planType === 'FREE'
                        ? '🚀 Temel özelliklerle başlayın!'
                        : '🎉 Tüm premium özellikler aktif!'
                      }
                    </p>
                  </div>
                  <Badge 
                    variant={userData.planType === 'FREE' ? 'secondary' : 'default'}
                    className="px-3 py-1 font-semibold"
                  >
                    {userData.planType}
                  </Badge>
                </div>

                {/* Usage Statistics */}
                <div className="space-y-5">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-semibold flex items-center gap-2">
                        💬 Aylık Soru Hakkı
                      </span>
                      <span className="text-sm font-bold text-primary">
                        {userData.monthlyMessageCount}/{limits.messages === -1 ? '∞' : limits.messages}
                      </span>
                    </div>
                    <div className="space-y-1">
                      <Progress
                        value={getUsagePercentage('message')}
                        className="h-3 bg-gray-100"
                      />
                      <p className="text-xs text-muted-foreground text-right">
                        {remainingMessages() === Infinity ? 'Sınırsız' : `${remainingMessages()} kaldı`}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-semibold flex items-center gap-2">
                        📄 Belge Analizi
                      </span>
                      <span className="text-sm font-bold text-primary">
                        {userData.monthlyDocumentCount}/{limits.documents === -1 ? '∞' : limits.documents}
                      </span>
                    </div>
                    <div className="space-y-1">
                      <Progress
                        value={getUsagePercentage('document')}
                        className="h-3 bg-gray-100"
                      />
                      <p className="text-xs text-muted-foreground text-right">
                        {remainingDocuments() === Infinity ? 'Sınırsız' : `${remainingDocuments()} kaldı`}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5 text-amber-500" />
                  Hızlı İşlemler
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  {quickActions.map((action, index) => (
                    <div key={index} className="relative group">
                      {action.available ? (
                        <Link href={action.href}>
                          <Card className="cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-105 border-2 hover:border-primary/20">
                            <CardContent className="p-4">
                              <div className="flex items-center gap-3">
                                <div className={`p-3 rounded-xl ${action.color} text-white shadow-lg`}>
                                  <action.icon className="h-5 w-5" />
                                </div>
                                <div>
                                  <h4 className="font-semibold text-sm">{action.title}</h4>
                                  <p className="text-xs text-muted-foreground">{action.description}</p>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        </Link>
                      ) : (
                        <div className="relative">
                          <Card className="cursor-not-allowed border-2 border-dashed border-gray-200 bg-gray-50/50">
                            <CardContent className="p-4">
                              <div className="flex items-center gap-3 opacity-40">
                                <div className={`p-3 rounded-xl ${action.color} text-white`}>
                                  <action.icon className="h-5 w-5" />
                                </div>
                                <div>
                                  <h4 className="font-semibold text-sm">{action.title}</h4>
                                  <p className="text-xs text-muted-foreground">{action.description}</p>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="bg-white/95 backdrop-blur-sm border border-orange-200 rounded-lg px-3 py-2 shadow-lg">
                              <div className="flex items-center gap-2">
                                <Crown className="h-4 w-4 text-orange-500" />
                                <span className="text-xs font-semibold text-orange-700">Premium Gerekli</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Son Aktiviteler
                </CardTitle>
              </CardHeader>
              <CardContent>
                {recentActivity.length > 0 ? (
                  <div className="space-y-3">
                    {recentActivity.map((activity) => (
                      <div key={activity.id} className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                        <div className="p-2 rounded-lg bg-primary/10">
                          {activity.type === 'message' ? (
                            <MessageSquare className="h-4 w-4 text-primary" />
                          ) : (
                            <FileText className="h-4 w-4 text-primary" />
                          )}
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium">{activity.title}</p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(activity.timestamp).toLocaleDateString('tr-TR')}
                          </p>
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {activity.status === 'completed' ? 'Tamamlandı' : 'İşleniyor'}
                        </Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">Henüz aktivite bulunmuyor</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      İlk sohbetinizi başlatın veya belge yükleyin
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-6">
            {/* Upgrade Card */}
            {userData.planType === 'FREE' && (
              <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-purple-500 via-blue-500 to-indigo-600 text-white shadow-2xl">
                <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -translate-y-20 translate-x-20"></div>
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/5 rounded-full translate-y-16 -translate-x-16"></div>
                
                <CardHeader className="relative z-10">
                  <CardTitle className="flex items-center gap-3 text-white text-xl">
                    <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                      <Crown className="h-6 w-6" />
                    </div>
                    Premium&apos;a Geçin
                  </CardTitle>
                  <p className="text-white/90 text-sm">
                    🚀 Sınırsız güç, sınırsız imkânlar!
                  </p>
                </CardHeader>

                <CardContent className="relative z-10 space-y-6">
                  <div className="space-y-4">
                    <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
                      <h4 className="font-bold text-white mb-3 flex items-center gap-2">
                        ✨ Premium Avantajları
                      </h4>
                      <ul className="space-y-2">
                        <li className="flex items-center gap-3 text-sm text-white/90">
                          <div className="w-2 h-2 rounded-full bg-green-400 shadow-lg shadow-green-400/50"></div>
                          <span className="font-medium">Sınırsız AI sohbet</span>
                        </li>
                        <li className="flex items-center gap-3 text-sm text-white/90">
                          <div className="w-2 h-2 rounded-full bg-blue-400 shadow-lg shadow-blue-400/50"></div>
                          <span className="font-medium">Gelişmiş belge analizi</span>
                        </li>
                        <li className="flex items-center gap-3 text-sm text-white/90">
                          <div className="w-2 h-2 rounded-full bg-purple-400 shadow-lg shadow-purple-400/50"></div>
                          <span className="font-medium">Öncelikli destek</span>
                        </li>
                        <li className="flex items-center gap-3 text-sm text-white/90">
                          <div className="w-2 h-2 rounded-full bg-yellow-400 shadow-lg shadow-yellow-400/50"></div>
                          <span className="font-medium">Özel raporlar</span>
                        </li>
                      </ul>
                    </div>

                    <div className="text-center">
                      <p className="text-white/80 text-xs mb-3">
                        💎 Sadece <span className="font-bold text-yellow-300">₺29/ay</span> ile başlayın
                      </p>
                      <Button 
                        className="w-full bg-white text-purple-600 hover:bg-white/90 font-bold py-3 shadow-xl hover:shadow-2xl transition-all duration-200 hover:scale-105" 
                        asChild
                      >
                        <Link href="/pricing" className="flex items-center justify-center gap-2">
                          <Crown className="h-4 w-4" />
                          Hemen Premium Ol
                          <span className="text-lg">🚀</span>
                        </Link>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Help & Support */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <HelpCircle className="h-5 w-5" />
                  Yardım & Destek
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" className="w-full justify-start" asChild>
                  <Link href="/help">
                    <BookOpen className="h-4 w-4 mr-2" />
                    Kullanım Kılavuzu
                  </Link>
                </Button>
                <Button variant="outline" className="w-full justify-start" asChild>
                  <Link href="/contact">
                    <Mail className="h-4 w-4 mr-2" />
                    İletişim
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
} 