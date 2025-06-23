import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FileText, Scale, AlertTriangle, Shield, Users, CreditCard, Gavel, Info } from 'lucide-react';

export default function TermsPage() {
  const lastUpdated = "1 Haziran 2025";

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-muted/50 to-muted border-b">
        <div className="max-w-4xl mx-auto px-4 py-16">
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Scale className="h-8 w-8 text-foreground" />
              <h1 className="text-4xl font-bold text-foreground">
                Kullanım Koşulları
              </h1>
            </div>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              JurisGen platformunu kullanarak kabul ettiğiniz şartlar, hak ve yükümlülükleriniz hakkında bilgi edinin.
            </p>
            <div className="mt-4">
              <Badge variant="secondary" className="bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-300">
                Son Güncelleme: {lastUpdated}
              </Badge>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="space-y-8">
          {/* Acceptance */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-2xl text-card-foreground">
                <FileText className="h-6 w-6" />
                Sözleşmenin Kabulü
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground leading-relaxed">
                JurisGen platformuna erişim sağlayarak veya platformumuzu kullanarak,
                bu kullanım koşullarını okuduğunuzu, anladığınızı ve tüm hükümleri kabul
                ettiğinizi beyan etmiş sayılırsınız.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                Bu koşulları kabul etmiyorsanız, lütfen platformumuzu kullanmayınız.
                18 yaşından küçükseniz, platformumuzu yalnızca ebeveyn veya vasi izniyle kullanabilirsiniz.
              </p>
            </CardContent>
          </Card>

          {/* Service Description */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-2xl text-card-foreground">
                <Info className="h-6 w-6" />
                Hizmet Tanımı
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground leading-relaxed">
                JurisGen, yapay zeka teknolojisi kullanarak hukuki bilgi ve rehberlik sağlayan bir platformdur.
                Hizmetlerimiz şunları içerir:
              </p>
              <ul className="space-y-2 text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="w-2 h-2 bg-muted-foreground rounded-full mt-2"></span>
                  <span>AI destekli hukuki soru-cevap hizmeti</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-2 h-2 bg-muted-foreground rounded-full mt-2"></span>
                  <span>Güncel mevzuat ve içtihat bilgilerine erişim</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-2 h-2 bg-muted-foreground rounded-full mt-2"></span>
                  <span>Hukuki süreçler hakkında genel bilgilendirme</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-2 h-2 bg-muted-foreground rounded-full mt-2"></span>
                  <span>Sohbet geçmişi ve kişisel hesap yönetimi</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* Important Disclaimer */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-2xl text-card-foreground">
                <AlertTriangle className="h-6 w-6" />
                Önemli Sorumluluk Reddi
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg">
                <h4 className="font-semibold text-red-900 dark:text-red-300 mb-2">DİKKAT: Hukuki Danışmanlık Değildir</h4>
                <div className="space-y-2 text-red-800 dark:text-red-400 text-sm">
                  <p>
                    JurisGen platformu tarafından sağlanan bilgiler <strong>genel bilgilendirme amaçlıdır</strong>
                    ve <strong>hukuki danışmanlık hizmeti değildir</strong>.
                  </p>
                  <p>
                    Platform bir avukat-müvekkil ilişkisi kurmaz. Özel durumunuz için mutlaka
                    lisanslı bir avukatla görüşün.
                  </p>
                </div>
              </div>
              <ul className="space-y-3 text-muted-foreground">
                <li className="flex items-start gap-3">
                  <AlertTriangle className="h-5 w-5 text-red-500 mt-1 flex-shrink-0" />
                  <span>AI yanıtları hatalı veya eksik olabilir</span>
                </li>
                <li className="flex items-start gap-3">
                  <AlertTriangle className="h-5 w-5 text-red-500 mt-1 flex-shrink-0" />
                  <span>Mevzuat değişiklikleri güncel olmayabilir</span>
                </li>
                <li className="flex items-start gap-3">
                  <AlertTriangle className="h-5 w-5 text-red-500 mt-1 flex-shrink-0" />
                  <span>Karmaşık hukuki konularda profesyonel destek alın</span>
                </li>
                <li className="flex items-start gap-3">
                  <AlertTriangle className="h-5 w-5 text-red-500 mt-1 flex-shrink-0" />
                  <span>Süreli işlemler için avukatlık bürosuna başvurun</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* User Responsibilities */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-2xl text-card-foreground">
                <Users className="h-6 w-6" />
                Kullanıcı Yükümlülükleri
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground leading-relaxed">
                Platformumuzu kullanırken aşağıdaki kurallara uymayı kabul edersiniz:
              </p>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div className="p-3 bg-green-50 dark:bg-green-950 rounded-lg">
                    <h4 className="font-semibold text-foreground mb-2">İzin Verilen Kullanım</h4>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>✓ Yasal amaçlarla kullanım</li>
                      <li>✓ Doğru bilgi sağlama</li>
                      <li>✓ Gizlilik kurallarına uyum</li>
                      <li>✓ Diğer kullanıcılara saygı</li>
                    </ul>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="p-3 bg-red-50 dark:bg-red-950 rounded-lg">
                    <h4 className="font-semibold text-foreground mb-2">Yasak Faaliyetler</h4>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>✗ Sistem güvenliğini tehdit etme</li>
                      <li>✗ Sahte bilgi paylaşma</li>
                      <li>✗ Ticari amaçla kötüye kullanım</li>
                      <li>✗ Spam veya zararlı içerik</li>
                    </ul>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Pricing and Payment */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-2xl text-card-foreground">
                <CreditCard className="h-6 w-6" />
                Ücretlendirme ve Ödeme
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
                  <h4 className="font-semibold text-foreground mb-2">Ücretsiz Plan</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Günde 3 soru hakkı</li>
                    <li>• Temel AI yanıtları</li>
                    <li>• Sohbet geçmişi erişimi</li>
                    <li>• E-posta desteği</li>
                  </ul>
                </div>
                <div className="p-4 bg-purple-50 dark:bg-purple-950 rounded-lg">
                  <h4 className="font-semibold text-foreground mb-2">Professional Plan - $7/ay</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Sınırsız soru hakkı</li>
                    <li>• Gelişmiş AI analizi</li>
                    <li>• Detaylı raporlar</li>
                    <li>• Öncelikli destek</li>
                  </ul>
                </div>
              </div>
              <div className="space-y-3 text-muted-foreground">
                <h4 className="font-semibold text-foreground">Ödeme Koşulları:</h4>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2">
                    <span className="w-2 h-2 bg-muted-foreground rounded-full mt-2"></span>
                    <span>Ödemeler aylık olarak peşin alınır</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-2 h-2 bg-muted-foreground rounded-full mt-2"></span>
                    <span>Abonelik istediğiniz zaman iptal edilebilir</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-2 h-2 bg-muted-foreground rounded-full mt-2"></span>
                    <span>Ücret değişiklikleri 30 gün önceden bildirilir</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-2 h-2 bg-muted-foreground rounded-full mt-2"></span>
                    <span>Ödeme güvenliği için güvenli ödeme sistemleri kullanılır</span>
                  </li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Intellectual Property */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-2xl text-card-foreground">
                <Shield className="h-6 w-6" />
                Fikri Mülkiyet Hakları
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground leading-relaxed">
                JurisGen platformu, yazılımı, tasarımı, içeriği ve ticari markaları JurisGen&apos;in
                fikri mülkiyetidir ve telif hakları ile korunmaktadır.
              </p>
              <div className="space-y-3 text-muted-foreground">
                <h4 className="font-semibold text-foreground">Kullanıcı İçeriği:</h4>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2">
                    <span className="w-2 h-2 bg-muted-foreground rounded-full mt-2"></span>
                    <span>Sorularınız ve sohbet geçmişiniz size aittir</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-2 h-2 bg-muted-foreground rounded-full mt-2"></span>
                    <span>Verileriniz gizlilik politikamız kapsamında korunur</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-2 h-2 bg-muted-foreground rounded-full mt-2"></span>
                    <span>Hizmet iyileştirmesi için anonim istatistikler kullanılabilir</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-2 h-2 bg-muted-foreground rounded-full mt-2"></span>
                    <span>Hesap silme durumunda verileriniz silinir</span>
                  </li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Limitation of Liability */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-2xl text-card-foreground">
                <Gavel className="h-6 w-6" />
                Sorumluluk Sınırlaması
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                <h4 className="font-semibold text-yellow-900 dark:text-yellow-300 mb-2">Önemli Uyarı</h4>
                <p className="text-yellow-800 dark:text-yellow-400 text-sm">
                  JurisGen, platformdan sağlanan bilgilerin doğruluğu, güncelliği veya eksiksizliği
                  konusunda garanti vermez. Kullanıcılar bilgileri kendi riskleri altında kullanır.
                </p>
              </div>
              <div className="space-y-3 text-muted-foreground">
                <h4 className="font-semibold text-foreground">Sorumluluk Kapsamı Dışındakiler:</h4>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2">
                    <span className="w-2 h-2 bg-muted-foreground rounded-full mt-2"></span>
                    <span>AI yanıtlarından kaynaklanan hatalı kararlar</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-2 h-2 bg-muted-foreground rounded-full mt-2"></span>
                    <span>Kaçırılan yasal süreler ve sonuçları</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-2 h-2 bg-muted-foreground rounded-full mt-2"></span>
                    <span>Yanlış hukuki strateji belirleme</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-2 h-2 bg-muted-foreground rounded-full mt-2"></span>
                    <span>Sistem kesintilerinden kaynaklanan sorunlar</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-2 h-2 bg-muted-foreground rounded-full mt-2"></span>
                    <span>Üçüncü taraf hizmetlerden kaynaklanan sorunlar</span>
                  </li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Service Availability */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-2xl text-card-foreground">
                <Shield className="h-6 w-6" />
                Hizmet Erişilebilirliği
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground leading-relaxed">
                JurisGen platformunu 7/24 erişilebilir kılmaya çalışırız, ancak aşağıdaki durumlarda
                hizmet kesintileri yaşanabilir:
              </p>
              <ul className="space-y-2 text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="w-2 h-2 bg-muted-foreground rounded-full mt-2"></span>
                  <span>Planlı sistem bakımları (önceden duyurulur)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-2 h-2 bg-muted-foreground rounded-full mt-2"></span>
                  <span>Acil güvenlik güncellemeleri</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-2 h-2 bg-muted-foreground rounded-full mt-2"></span>
                  <span>Teknik arızalar ve altyapı sorunları</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-2 h-2 bg-muted-foreground rounded-full mt-2"></span>
                  <span>Mücbir sebep durumları</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* Termination */}
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl text-card-foreground">
                Hesap Sonlandırma
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground leading-relaxed">
                Hesabınızı istediğiniz zaman silebilirsiniz. Ayrıca aşağıdaki durumlarda
                hesabınızı askıya alabilir veya sonlandırabiliriz:
              </p>
              <ul className="space-y-2 text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="w-2 h-2 bg-muted-foreground rounded-full mt-2"></span>
                  <span>Kullanım koşullarının ciddi ihlali</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-2 h-2 bg-muted-foreground rounded-full mt-2"></span>
                  <span>Sistem güvenliğini tehdit etme</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-2 h-2 bg-muted-foreground rounded-full mt-2"></span>
                  <span>Uzun süre (1 yıl+) pasif kalma</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-2 h-2 bg-muted-foreground rounded-full mt-2"></span>
                  <span>Ödeme yükümlülüklerinin yerine getirilmemesi</span>
                </li>
              </ul>
              <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
                <p className="text-sm text-muted-foreground">
                  <strong className="text-foreground">Not:</strong> Hesap sonlandırma durumunda,
                  kişisel verileriniz gizlilik politikamız kapsamında silinir.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Governing Law */}
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl text-card-foreground">
                Uygulanacak Hukuk ve Yargı
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground leading-relaxed">
                Bu sözleşme Türkiye Cumhuriyeti hukuku kapsamında yorumlanır ve uygulanır.
                Bu sözleşmeden doğacak uyuşmazlıklarda Türkiye mahkemeleri ve icra müdürlükleri yetkilidir.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                Öncelikle dostane çözüm yolları denenecek, gerektiğinde alternatif uyuşmazlık
                çözüm yöntemlerine başvurulacaktır.
              </p>
            </CardContent>
          </Card>

          {/* Contact and Changes */}
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl text-card-foreground">
                İletişim ve Değişiklikler
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground leading-relaxed">
                Bu kullanım koşulları hakkında sorularınız için iletişim sayfamızdan
                bizimle iletişime geçebilirsiniz.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                Kullanım koşullarında yapılacak değişiklikler platform üzerinden duyurulacaktır.
                Önemli değişiklikler için 30 gün önceden haber verilir ve mevcut kullanıcılar bilgilendirilir.
              </p>
              <div className="p-4 bg-muted/50 rounded-lg">
                <p className="text-sm text-muted-foreground">
                  <strong className="text-foreground">Son güncelleme:</strong> {lastUpdated} tarihinde güncellenmiştir.
                  Bu koşullar o tarih itibariyle yürürlüktedir.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
} 