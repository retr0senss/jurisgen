import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Target, Lightbulb, Shield, Scale } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-muted/50 to-muted border-b">
        <div className="max-w-4xl mx-auto px-4 py-16">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-foreground mb-4">
              Hakkında <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">JurisGen</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Türkiye&apos;nin önde gelen yapay zeka destekli hukuki asistan platformu
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="space-y-12">
          {/* Introduction */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-2xl text-card-foreground">
                <Scale className="h-6 w-6" />
                JurisGen Nedir?
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground leading-relaxed">
                JurisGen, yapay zeka teknolojilerini hukuk alanında kullanarak, avukatların ve hukuk
                profesyonellerinin günlük işlerini kolaylaştırmayı amaçlayan yenilikçi bir platformdur.
                Modern teknoloji ile hukuki uzmanlığı birleştirerek, hızlı ve güvenilir hukuki destek sağlıyoruz.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                Gelişmiş doğal dil işleme algoritmaları ve Türk hukuk sistemine özel olarak eğitilmiş
                yapay zeka modelleri ile, karmaşık hukuki sorunlara hızlı ve doğru çözümler sunuyoruz.
              </p>
            </CardContent>
          </Card>

          {/* Mission & Vision */}
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl text-card-foreground">
                  <Target className="h-5 w-5" />
                  Misyonumuz
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed">
                  Hukuk sektöründe yapay zeka teknolojilerinin gücünden faydalanarak,
                  adalete erişimi demokratikleştirmek ve hukuki hizmetlerin kalitesini
                  artırırken maliyetlerini düşürmek.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl text-card-foreground">
                  <Lightbulb className="h-5 w-5" />
                  Vizyonumuz
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed">
                  Türkiye&apos;de her bireyin ve kurumun kaliteli hukuki desteğe kolayca
                  erişebileceği, teknoloji destekli bir hukuk ekosistemi oluşturmak.
                </p>
              </CardContent>
            </Card>
          </div>

          {/* How It Works */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-2xl text-card-foreground">
                <Shield className="h-6 w-6" />
                Nasıl Çalışır?
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-3 gap-6">
                <div className="text-center space-y-3">
                  <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center mx-auto">
                    <span className="text-xl font-bold text-foreground">1</span>
                  </div>
                  <h3 className="font-semibold text-foreground">Soru Sorun</h3>
                  <p className="text-sm text-muted-foreground">
                    Hukuki sorunuzu doğal dilde anlatın
                  </p>
                </div>
                <div className="text-center space-y-3">
                  <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center mx-auto">
                    <span className="text-xl font-bold text-foreground">2</span>
                  </div>
                  <h3 className="font-semibold text-foreground">Analiz</h3>
                  <p className="text-sm text-muted-foreground">
                    Yapay zeka sorunuzu analiz eder ve değerlendirir
                  </p>
                </div>
                <div className="text-center space-y-3">
                  <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center mx-auto">
                    <span className="text-xl font-bold text-foreground">3</span>
                  </div>
                  <h3 className="font-semibold text-foreground">Çözüm</h3>
                  <p className="text-sm text-muted-foreground">
                    Detaylı ve uygulanabilir çözüm önerileri alın
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Key Features */}
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl text-card-foreground">Özelliklerimiz</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="flex items-start gap-3">
                  <Badge variant="secondary" className="mt-1">✓</Badge>
                  <div>
                    <h4 className="font-semibold text-foreground">7/24 Erişim</h4>
                    <p className="text-sm text-muted-foreground">Günün her saati hukuki destek alın</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Badge variant="secondary" className="mt-1">✓</Badge>
                  <div>
                    <h4 className="font-semibold text-foreground">Türkçe Destek</h4>
                    <p className="text-sm text-muted-foreground">Türk hukuk sistemine özel çözümler</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Badge variant="secondary" className="mt-1">✓</Badge>
                  <div>
                    <h4 className="font-semibold text-foreground">Güvenli Platform</h4>
                    <p className="text-sm text-muted-foreground">Verileriniz tamamen güvende</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Badge variant="secondary" className="mt-1">✓</Badge>
                  <div>
                    <h4 className="font-semibold text-foreground">Hızlı Yanıt</h4>
                    <p className="text-sm text-muted-foreground">Saniyeler içinde detaylı analiz</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Team & Contact - Commented out for MVP */}
          {/*
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-2xl text-card-foreground">
                <Users className="h-6 w-6" />
                Takım ve İletişim
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <p className="text-muted-foreground leading-relaxed">
                  JurisGen ekibi, deneyimli hukuk profesyonelleri ve teknoloji uzmanlarından oluşmaktadır.
                  Amacımız, hukuk ve teknoloji arasındaki köprüyü güçlendirerek kullanıcılarımıza
                  en iyi deneyimi sunmaktır.
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-6 pt-6 border-t">
                <div className="space-y-3">
                  <h3 className="font-semibold text-foreground">İletişim Bilgileri</h3>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Mail className="h-4 w-4" />
                      <span>info@jurisgen.com</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <MapPin className="h-4 w-4" />
                      <span>İstanbul, Türkiye</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <h3 className="font-semibold text-foreground">Destek</h3>
                  <p className="text-sm text-muted-foreground">
                    Sorularınız için <strong>destek@jurisgen.com</strong> adresinden
                    bizimle iletişime geçebilirsiniz.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          */}
        </div>
      </div>
    </div>
  );
} 