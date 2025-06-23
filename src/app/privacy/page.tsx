import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Shield, Eye, Database, Lock, Users, FileText, AlertTriangle, Mail, Check } from 'lucide-react';

export default function PrivacyPage() {
  const lastUpdated = "1 Haziran 2025";

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-muted/50 to-muted border-b">
        <div className="max-w-4xl mx-auto px-4 py-16">
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Shield className="h-8 w-8 text-foreground" />
              <h1 className="text-4xl font-bold text-foreground">
                Gizlilik Politikası
              </h1>
            </div>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Kişisel verilerinizin korunması bizim önceliğimizdir. KVKK ve GDPR uyumlu veri işleme politikamızı detaylarıyla öğrenin.
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
          {/* Overview */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-2xl text-card-foreground">
                <Eye className="h-6 w-6" />
                Genel Bakış
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground leading-relaxed">
                JurisGen olarak, kişisel verilerinizin korunması konusunda azami dikkat göstermekteyiz.
                Bu gizlilik politikası, JurisGen platformunu kullanırken toplanan, işlenen ve korunan
                kişisel verileriniz hakkında sizi bilgilendirmek amacıyla hazırlanmıştır.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                Platformumuz, 6698 sayılı Kişisel Verilerin Korunması Kanunu (KVKK) ve
                Avrupa Birliği Genel Veri Koruma Tüzüğü (GDPR) hükümlerine tam uyum sağlamaktadır.
              </p>
            </CardContent>
          </Card>

          {/* Data Collection */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-2xl text-card-foreground">
                <Database className="h-6 w-6" />
                Toplanan Veriler
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h3 className="font-semibold text-foreground text-lg">Kişisel Bilgiler</h3>
                <ul className="space-y-2 text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <span className="w-2 h-2 bg-muted-foreground rounded-full mt-2"></span>
                    <span>Ad, soyad ve e-posta adresi (hesap oluşturma için)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-2 h-2 bg-muted-foreground rounded-full mt-2"></span>
                    <span>Profil fotoğrafı (isteğe bağlı)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-2 h-2 bg-muted-foreground rounded-full mt-2"></span>
                    <span>İletişim tercihleri</span>
                  </li>
                </ul>
              </div>

              <div className="space-y-4">
                <h3 className="font-semibold text-foreground text-lg">Hukuki Veriler</h3>
                <ul className="space-y-2 text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <span className="w-2 h-2 bg-muted-foreground rounded-full mt-2"></span>
                    <span>Hukuki sorularınız ve AI ile yaptığınız konuşmalar</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-2 h-2 bg-muted-foreground rounded-full mt-2"></span>
                    <span>Hukuki danışmanlık geçmişi ve soru kategorileri</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-2 h-2 bg-muted-foreground rounded-full mt-2"></span>
                    <span>Platform kullanım tercihleri</span>
                  </li>
                </ul>
              </div>

              <div className="space-y-4">
                <h3 className="font-semibold text-foreground text-lg">Teknik Veriler</h3>
                <ul className="space-y-2 text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <span className="w-2 h-2 bg-muted-foreground rounded-full mt-2"></span>
                    <span>IP adresi (güvenlik ve konum belirleme için)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-2 h-2 bg-muted-foreground rounded-full mt-2"></span>
                    <span>Tarayıcı türü ve cihaz bilgileri</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-2 h-2 bg-muted-foreground rounded-full mt-2"></span>
                    <span>Platform kullanım istatistikleri (anonim)</span>
                  </li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Data Usage */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-2xl text-card-foreground">
                <FileText className="h-6 w-6" />
                Veri Kullanım Amaçları
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
                  <h4 className="font-semibold text-foreground mb-2">Hizmet Sunumu</h4>
                  <p className="text-sm text-muted-foreground">
                    AI destekli hukuki danışmanlık hizmetlerinin sağlanması
                  </p>
                </div>
                <div className="p-4 bg-green-50 dark:bg-green-950 rounded-lg">
                  <h4 className="font-semibold text-foreground mb-2">Hesap Yönetimi</h4>
                  <p className="text-sm text-muted-foreground">
                    Kullanıcı hesabınızın oluşturulması ve yönetimi
                  </p>
                </div>
                <div className="p-4 bg-purple-50 dark:bg-purple-950 rounded-lg">
                  <h4 className="font-semibold text-foreground mb-2">Güvenlik</h4>
                  <p className="text-sm text-muted-foreground">
                    Platform güvenliğinin sağlanması ve kötüye kullanımın önlenmesi
                  </p>
                </div>
                <div className="p-4 bg-orange-50 dark:bg-orange-950 rounded-lg">
                  <h4 className="font-semibold text-foreground mb-2">İletişim</h4>
                  <p className="text-sm text-muted-foreground">
                    Müşteri desteği ve önemli platform bilgilendirmeleri
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Data Protection */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-2xl text-card-foreground">
                <Lock className="h-6 w-6" />
                Veri Güvenliği
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground leading-relaxed">
                Verilerinizin güvenliği için endüstri standardında güvenlik önlemleri almaktayız:
              </p>
              <ul className="space-y-3 text-muted-foreground">
                <li className="flex items-start gap-3">
                  <Lock className="h-5 w-5 text-green-600 mt-1 flex-shrink-0" />
                  <div>
                    <strong className="text-foreground">HTTPS Şifreleme:</strong> Tüm veri iletimi SSL/TLS şifreleme ile korunur
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <Shield className="h-5 w-5 text-green-600 mt-1 flex-shrink-0" />
                  <div>
                    <strong className="text-foreground">Güvenli Veritabanı:</strong> Veriler şifrelenmiş veritabanlarında saklanır
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <Eye className="h-5 w-5 text-green-600 mt-1 flex-shrink-0" />
                  <div>
                    <strong className="text-foreground">Erişim Kontrolü:</strong> Sıkı kimlik doğrulama ve yetkilendirme sistemleri
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <Database className="h-5 w-5 text-green-600 mt-1 flex-shrink-0" />
                  <div>
                    <strong className="text-foreground">Düzenli Yedekleme:</strong> Veri kaybını önlemek için otomatik yedekleme
                  </div>
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* User Rights */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-2xl text-card-foreground">
                <Users className="h-6 w-6" />
                Veri Sahibi Hakları
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground leading-relaxed">
                KVKK ve GDPR kapsamında aşağıdaki haklara sahipsiniz:
              </p>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-green-600 mt-1" />
                    <span className="text-muted-foreground">Kişisel verilerinizin işlenip işlenmediğini öğrenme</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-green-600 mt-1" />
                    <span className="text-muted-foreground">İşlenen veriler hakkında bilgi talep etme</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-green-600 mt-1" />
                    <span className="text-muted-foreground">Verilerin düzeltilmesini isteme</span>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-green-600 mt-1" />
                    <span className="text-muted-foreground">Verilerin silinmesini talep etme</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-green-600 mt-1" />
                    <span className="text-muted-foreground">Veri taşınabilirliği hakkı</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-green-600 mt-1" />
                    <span className="text-muted-foreground">İşlemeye itiraz etme hakkı</span>
                  </div>
                </div>
              </div>
              <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
                <p className="text-sm text-muted-foreground">
                  <strong className="text-foreground">Not:</strong> Veri sahibi haklarınızı kullanmak için
                  hesap ayarlarınızdan veya iletişim sayfamızdan bizimle iletişime geçebilirsiniz.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Data Sharing */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-2xl text-card-foreground">
                <AlertTriangle className="h-6 w-6" />
                Veri Paylaşımı
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg">
                <h4 className="font-semibold text-red-900 dark:text-red-300 mb-2">Önemli Bilgilendirme</h4>
                <p className="text-red-800 dark:text-red-400 text-sm">
                  Kişisel verileriniz ve hukuki bilgileriniz hiçbir koşulda üçüncü taraflarla paylaşılmaz,
                  satılmaz veya kiraya verilmez.
                </p>
              </div>
              <div className="space-y-3 text-muted-foreground">
                <h4 className="font-semibold text-foreground">İstisnai Durumlar:</h4>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2">
                    <span className="w-2 h-2 bg-muted-foreground rounded-full mt-2"></span>
                    <span>Yasal zorunluluklar (mahkeme kararı, resmi makam talebi)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-2 h-2 bg-muted-foreground rounded-full mt-2"></span>
                    <span>Platform güvenliğini sağlamak için gerekli acil durumlar</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-2 h-2 bg-muted-foreground rounded-full mt-2"></span>
                    <span>Açık ve özel rızanızın bulunduğu durumlar</span>
                  </li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Data Retention */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-2xl text-card-foreground">
                <Database className="h-6 w-6" />
                Veri Saklama Süreleri
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="p-4 bg-muted/50 rounded-lg">
                  <h4 className="font-semibold text-foreground mb-2">Hesap Verileri</h4>
                  <p className="text-sm text-muted-foreground">
                    Hesabınız aktif olduğu sürece + hesap silindikten sonra 30 gün
                  </p>
                </div>
                <div className="p-4 bg-muted/50 rounded-lg">
                  <h4 className="font-semibold text-foreground mb-2">Sohbet Geçmişi</h4>
                  <p className="text-sm text-muted-foreground">
                    Son kullanımdan itibaren 2 yıl (kullanıcı tarafından silinebilir)
                  </p>
                </div>
                <div className="p-4 bg-muted/50 rounded-lg">
                  <h4 className="font-semibold text-foreground mb-2">Log Kayıtları</h4>
                  <p className="text-sm text-muted-foreground">
                    Güvenlik amacıyla 1 yıl (anonim istatistikler)
                  </p>
                </div>
                <div className="p-4 bg-muted/50 rounded-lg">
                  <h4 className="font-semibold text-foreground mb-2">Ödeme Bilgileri</h4>
                  <p className="text-sm text-muted-foreground">
                    Yasal zorunluluk gereği 10 yıl (şifrelenmiş)
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Contact */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-2xl text-card-foreground">
                <Mail className="h-6 w-6" />
                İletişim
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground leading-relaxed">
                Gizlilik politikamız hakkında sorularınız veya veri sahibi haklarınızı kullanmak için
                bizimle iletişime geçebilirsiniz:
              </p>
              <div className="p-4 bg-muted/50 rounded-lg">
                <h4 className="font-semibold text-foreground mb-2">Veri Koruma ve Gizlilik</h4>
                <p className="text-sm text-muted-foreground mb-2">
                  İletişim sayfamızdan bizimle iletişime geçebilir veya hesap ayarlarınızdan
                  veri sahibi haklarınızı kullanabilirsiniz.
                </p>
                <p className="text-sm text-muted-foreground">
                  Talepleriniz en geç 30 gün içerisinde yanıtlanacaktır.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Updates */}
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl text-card-foreground">
                Politika Güncellemeleri
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground leading-relaxed">
                Bu gizlilik politikası, yasal gerekliliklerdeki değişiklikler veya hizmetlerimizdeki
                güncellemeler nedeniyle zaman zaman revize edilebilir. Önemli değişiklikler
                platform üzerinden bildirilecek ve güncel versiyona her zaman bu sayfadan erişebilirsiniz.
                Politikayı düzenli olarak gözden geçirmenizi öneririz.
              </p>
              <div className="mt-4 p-4 bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                <p className="text-sm text-yellow-800 dark:text-yellow-300">
                  <strong>Son güncelleme:</strong> {lastUpdated} tarihinde güncellenmiştir.
                  {lastUpdated !== "1 Haziran 2025" && "Bir önceki versiyon 1 Ocak 2024 tarihindendi."}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
} 