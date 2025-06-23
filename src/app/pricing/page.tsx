import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, PremiumCard } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, X, Star, Users, Zap, Shield, Clock } from 'lucide-react';
import Link from 'next/link';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Fiyatlar - JurisGen | AI Destekli Hukuk Danışmanı',
  description: 'JurisGen fiyatlandırma planları. Ücretsiz plan ile başlayın, profesyonel planla gelişmiş özellikler keşfedin. Türkiye\'nin AI destekli hukuk platformu.',
  keywords: ['hukuk fiyatları', 'hukuki danışmanlık ücreti', 'ai hukuk fiyat', 'avukat ücreti', 'hukuki destek planları', 'jurisgen fiyat'],
  openGraph: {
    title: 'JurisGen Fiyatlandırma - AI Hukuk Danışmanı',
    description: 'İhtiyacınıza uygun plan seçin. Ücretsiz başlayın, profesyonel özellikler keşfedin.',
    url: 'https://jurisgen.com/pricing',
    siteName: 'JurisGen',
    locale: 'tr_TR',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'JurisGen Fiyatlandırma - AI Hukuk Danışmanı',
    description: 'İhtiyacınıza uygun plan seçin. Ücretsiz başlayın, profesyonel özellikler keşfedin.',
  },
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: 'https://jurisgen.com/pricing',
  },
};

export default function PricingPage() {
  const plans = [
    {
      name: 'Ücretsiz',
      price: '$0',
      period: '/ay',
      description: 'Bireysel kullanım için temel özellikler',
      icon: <Star className="h-5 w-5" />,
      popular: false,
      features: [
        { name: 'Günde 3 soru hakkı', included: true },
        { name: 'Temel hukuki danışmanlık', included: true },
        { name: 'Türkçe destek', included: true },
        { name: 'Email destek', included: true },
        { name: 'Sınırsız soru', included: false },
        { name: 'Öncelikli destek', included: false },
        { name: 'Detaylı analiz raporları', included: false },
        { name: 'Gelişmiş mevzuat arama', included: false },
      ]
    },
    {
      name: 'Profesyonel',
      price: '$7',
      period: '/ay',
      description: 'Avukatlar ve hukuk profesyonelleri için',
      icon: <Users className="h-5 w-5" />,
      popular: true,
      features: [
        { name: 'Günde 3 soru hakkı', included: true },
        { name: 'Temel hukuki danışmanlık', included: true },
        { name: 'Türkçe destek', included: true },
        { name: 'Email destek', included: true },
        { name: 'Sınırsız soru', included: true },
        { name: 'Öncelikli destek', included: true },
        { name: 'Detaylı analiz raporları', included: true },
        { name: 'Gelişmiş mevzuat arama', included: true },
      ]
    }
  ];

  const benefits = [
    {
      icon: <Zap className="h-6 w-6" />,
      title: 'Hızlı Yanıt',
      description: 'Saniyeler içinde kapsamlı hukuki analiz'
    },
    {
      icon: <Shield className="h-6 w-6" />,
      title: 'Güvenli Platform',
      description: 'AES-256 şifreleme ile tam veri güvenliği'
    },
    {
      icon: <Clock className="h-6 w-6" />,
      title: '7/24 Erişim',
      description: 'Günün her saati hukuki desteğe erişim'
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-background to-muted border-b">
        <div className="max-w-6xl mx-auto px-4 py-16">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-foreground mb-4">
              <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">Fiyatlandırma</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              İhtiyacınıza uygun planı seçin ve yapay zeka destekli hukuki danışmanlığın gücünü keşfedin
            </p>
          </div>
        </div>
      </div>

      {/* Pricing Plans */}
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="grid lg:grid-cols-2 gap-8 mb-16 max-w-4xl mx-auto">
          {plans.map((plan, index) => {
            const CardComponent = plan.popular ? PremiumCard : Card;

            return (
              <CardComponent key={index} className={`relative ${plan.popular ? '' : 'hover:shadow-lg transition-shadow'}`}>
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-white text-black px-4 py-1 shadow-md">
                      En Popüler
                    </Badge>
                  </div>
                )}

                <CardHeader className="text-center pb-4">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    {plan.icon}
                    <CardTitle className={`text-2xl ${plan.popular ? 'text-white' : 'text-foreground'}`}>
                      {plan.name}
                    </CardTitle>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-baseline justify-center gap-1">
                      <span className={`text-4xl font-bold ${plan.popular ? 'text-white' : 'text-foreground'}`}>
                        {plan.price}
                      </span>
                      <span className={`${plan.popular ? 'text-white/80' : 'text-muted-foreground'}`}>
                        {plan.period}
                      </span>
                    </div>
                    <p className={`text-sm ${plan.popular ? 'text-white/90' : 'text-muted-foreground'}`}>
                      {plan.description}
                    </p>
                  </div>
                </CardHeader>

                <CardContent className="space-y-6">
                  <div className="space-y-3">
                    {plan.features.map((feature, featureIndex) => (
                      <div key={featureIndex} className="flex items-center gap-3">
                        <div className={`flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center ${feature.included
                          ? plan.popular
                            ? 'bg-white/20 text-white'
                            : 'bg-green-100 text-green-600'
                          : plan.popular
                            ? 'bg-white/10 text-white/60'
                            : 'bg-red-100 text-red-600'
                          }`}>
                          {feature.included ? (
                            <Check className="h-3 w-3" />
                          ) : (
                            <X className="h-3 w-3" />
                          )}
                        </div>
                        <span className={`text-sm ${feature.included
                          ? plan.popular ? 'text-white' : 'text-foreground'
                          : plan.popular ? 'text-white/60' : 'text-muted-foreground'
                          }`}>
                          {feature.name}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="pt-4">
                    <Button
                      className={`w-full ${plan.popular
                        ? 'bg-white text-black hover:bg-white/90'
                        : 'bg-black text-white hover:bg-white hover:text-black dark:bg-white dark:text-black dark:hover:bg-black dark:hover:text-white'
                        }`}
                      asChild
                    >
                      <Link href="/register">
                        {plan.name === 'Ücretsiz' ? 'Ücretsiz Başla' : 'Planı Seç'}
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </CardComponent>
            );
          })}
        </div>



        {/* Benefits Section */}
        <Card className="mb-12">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl text-card-foreground mb-4">
              Neden JurisGen?
            </CardTitle>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Yapay zeka destekli hukuki danışmanlık platformumuzun sunduğu avantajları keşfedin
            </p>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {benefits.map((benefit, index) => (
                <div key={index} className="text-center space-y-3">
                  <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center mx-auto text-foreground">
                    {benefit.icon}
                  </div>
                  <h3 className="font-semibold text-foreground">{benefit.title}</h3>
                  <p className="text-sm text-muted-foreground">{benefit.description}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* FAQ Section */}
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl text-card-foreground text-center mb-4">
              Sık Sorulan Sorular
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-foreground mb-2">Ücretsiz plan sınırları nelerdir?</h3>
                  <p className="text-sm text-muted-foreground">
                    Ücretsiz planda günde 3 soru sorabilir, temel hukuki danışmanlık alabilirsiniz.
                    Gelişmiş özellikler sadece profesyonel planda mevcuttur.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-2">Planımı istediğim zaman değiştirebilir miyim?</h3>
                  <p className="text-sm text-muted-foreground">
                    Evet, planınızı istediğiniz zaman yükseltebilir veya düşürebilirsiniz.
                    Değişiklikler bir sonraki fatura döneminde geçerli olur.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-2">Ödeme güvenliği nasıl sağlanıyor?</h3>
                  <p className="text-sm text-muted-foreground">
                    Tüm ödemeler 256-bit SSL şifreleme ile güvence altına alınacaktır.
                    Kredi kartı bilgileriniz hiçbir zaman sunucularımızda saklanmayacaktır.
                  </p>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-foreground mb-2">İade politikanız nedir?</h3>
                  <p className="text-sm text-muted-foreground">
                    İlk 14 gün içerisinde memnun kalmazsanız, koşulsuz iade garantisi sunacağız.
                    İade talebinizi destek ekibimize iletebilirsiniz.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-2">Profesyonel planda neler var?</h3>
                  <p className="text-sm text-muted-foreground">
                    Profesyonel planda sınırsız soru, öncelikli destek, detaylı analiz raporları
                    ve gelişmiş mevzuat arama bulunmaktadır.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-2">Destek nasıl alabilirim?</h3>
                  <p className="text-sm text-muted-foreground">
                    Tüm planlar email desteği içerir. Profesyonel planda öncelikli
                    destek sağlanır. Daha fazla bilgi için <Link href="/contact" className="text-foreground underline">iletişim</Link> sayfasını ziyaret edin.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* CTA Section */}
        <div className="text-center mt-16">
          <div className="max-w-2xl mx-auto space-y-4">
            <h2 className="text-3xl font-bold text-foreground">
              Hemen Başlayın
            </h2>
            <p className="text-muted-foreground">
              Yapay zeka destekli hukuki danışmanlığın gücünü keşfedin.
              Ücretsiz planla başlayın, istediğiniz zaman yükseltin.
            </p>
            <div className="flex gap-4 justify-center mt-6">
              <Button size="lg" className="bg-black text-white hover:bg-white hover:text-black dark:bg-white dark:text-black dark:hover:bg-black dark:hover:text-white" asChild>
                <Link href="/register">Ücretsiz Başla</Link>
              </Button>
              <Button size="lg" variant="outline" className="border-foreground text-foreground hover:bg-foreground hover:text-background" asChild>
                <Link href="/contact">İletişime Geç</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 