"use client";

import { BotMessageSquare, FileText, ShieldCheck, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { useUser } from "@clerk/nextjs";
import { useEffect } from "react";
import Image from "next/image";

export default function Home() {
  const { isSignedIn, isLoaded } = useUser();

  useEffect(() => {
    // Login olmuş kullanıcıları dashboard'a yönlendir
    if (isLoaded && isSignedIn) {
      window.location.href = '/dashboard';
    }
  }, [isLoaded, isSignedIn]);

  // Loading state
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

  // Login olmuş kullanıcılar için yönlendirme mesajı
  if (isSignedIn) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground">Dashboard&apos;a yönlendiriliyorsunuz...</p>
        </div>
      </div>
    );
  }

  // Login olmamış kullanıcılar için landing page
  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-24 md:py-32 bg-background">
        <div className="container relative mx-auto max-w-7xl px-4">
          <div className="mx-auto max-w-4xl text-center">
            <div className="mb-8 inline-flex items-center gap-2 rounded-full bg-accent px-4 py-2 text-sm border">
              <span className="flex h-2 w-2 rounded-full bg-green-500"></span>
              <span className="text-accent-foreground">Türkiye&apos;nin ilk AI hukuk asistanı</span>
            </div>
            <h1 className="mb-8 text-4xl font-bold tracking-tight sm:text-6xl md:text-7xl text-foreground leading-tight">
              Hukuki Sorunlarınıza
              <br />
              <span className="text-primary">Anında Çözüm</span>
            </h1>
            <p className="mb-12 mx-auto max-w-2xl text-xl text-muted-foreground leading-relaxed">
              Yapay zeka destekli hukuk danışmanımız ile anında hukuki tavsiye alın,
              belgelerinizi analiz edin ve güncel mevzuata kolayca erişin.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="h-12 px-8 text-lg bg-black text-white hover:bg-white hover:text-black dark:bg-white dark:text-black dark:hover:bg-black dark:hover:text-white" asChild>
                <Link href="/register" className="flex items-center gap-2">
                  Ücretsiz Deneyin
                  <ArrowRight className="w-5 h-5" />
                </Link>
              </Button>
              <Button size="lg" className="h-12 px-8 text-lg bg-black text-white hover:bg-white hover:text-black dark:bg-white dark:text-black dark:hover:bg-black dark:hover:text-white" asChild>
                <Link href="#features">Nasıl Çalışır?</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 bg-muted/30">
        <div className="container mx-auto max-w-7xl px-4">
          <div className="mx-auto max-w-2xl text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4 text-foreground">
              Neden JurisGen?
            </h2>
            <p className="text-lg text-muted-foreground">
              Modern teknoloji ile hukuki danışmanlığı herkes için erişilebilir kılıyoruz
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="bg-card border-border shadow-lg hover:shadow-xl transition-all duration-300">
              <CardHeader className="pb-4">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <BotMessageSquare className="w-6 h-6 text-primary" />
                </div>
                <CardTitle className="text-xl text-card-foreground">AI Destekli Chat</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base leading-relaxed text-muted-foreground">
                  Güncel Türk hukuku bilgisi ile donatılmış AI asistanımız
                  size 7/24 anında cevap verir.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="bg-card border-border shadow-lg hover:shadow-xl transition-all duration-300">
              <CardHeader className="pb-4">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <FileText className="w-6 h-6 text-primary" />
                </div>
                <CardTitle className="text-xl text-card-foreground">Güncel Mevzuat</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base leading-relaxed text-muted-foreground">
                  Sürekli güncellenen veri tabanımız ile
                  her zaman en güncel yasal bilgilere erişin.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="bg-card border-border shadow-lg hover:shadow-xl transition-all duration-300">
              <CardHeader className="pb-4">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <ShieldCheck className="w-6 h-6 text-primary" />
                </div>
                <CardTitle className="text-xl text-card-foreground">Güvenli Platform</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base leading-relaxed text-muted-foreground">
                  Tüm verileriniz güvenli bir şekilde saklanır ve
                  gizlilik ilkelerimize uygun olarak işlenir.
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section id="pricing" className="py-24 bg-primary text-white">
        <div className="container mx-auto max-w-4xl px-4 text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4 text-white">
            Hukuki Danışmanınız Hazır
          </h2>
          <p className="text-xl mb-8 text-white/90">
            Ücretsiz deneme ile başlayın, premium özellikler için uygun fiyatlı planlarımızı inceleyin.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="h-12 px-8 text-lg bg-black text-white hover:bg-white hover:text-black dark:bg-white dark:text-black dark:hover:bg-black dark:hover:text-white" asChild>
              <Link href="/register">Ücretsiz Başla</Link>
            </Button>
            <Button size="lg" className="h-12 px-8 text-lg bg-black text-white hover:bg-white hover:text-black dark:bg-white dark:text-black dark:hover:bg-black dark:hover:text-white" asChild>
              <Link href="/pricing">Fiyatları İncele</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-background border-border">
        <div className="container mx-auto max-w-7xl px-4 py-12">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <Image src="/logo.png" alt="JurisGen" width={32} height={32} />
                <span className="text-xl font-bold text-foreground">JurisGen</span>
              </div>
              <p className="text-muted-foreground">
                Türkiye&apos;nin en gelişmiş AI destekli hukuk danışmanı
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-foreground">Ürün</h4>
              <ul className="space-y-2 text-muted-foreground">
                <li><Link href="/chat" className="hover:text-primary transition-colors">AI Chat</Link></li>
                <li><Link href="/pricing" className="hover:text-primary transition-colors">Fiyatlar</Link></li>
                <li><Link href="/dashboard" className="hover:text-primary transition-colors">Dashboard</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-foreground">Şirket</h4>
              <ul className="space-y-2 text-muted-foreground">
                <li><Link href="/about" className="hover:text-primary transition-colors">Hakkımızda</Link></li>
                <li><Link href="/faq" className="hover:text-primary transition-colors">SSS</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-foreground">Yasal</h4>
              <ul className="space-y-2 text-muted-foreground">
                <li><Link href="/privacy" className="hover:text-primary transition-colors">Gizlilik</Link></li>
                <li><Link href="/terms" className="hover:text-primary transition-colors">Kullanım Şartları</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-border mt-12 pt-8 text-center text-muted-foreground">
            <p>&copy; 2024 JurisGen. Tüm hakları saklıdır.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
