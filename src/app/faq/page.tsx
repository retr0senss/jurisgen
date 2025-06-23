"use client";
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Search,
  ChevronDown,
  ChevronRight,
  HelpCircle,
  MessageCircle,
  Mail
} from 'lucide-react';

interface FAQItem {
  id: number;
  question: string;
  answer: string;
  category: string;
  tags: string[];
}

const faqData: FAQItem[] = [
  {
    id: 1,
    question: "JurisGen nasıl çalışır?",
    answer: "JurisGen, gelişmiş yapay zeka teknolojilerini kullanarak hukuki sorularınızı analiz eder. Sorunuzu doğal dilde yazın, AI sistemi Türk hukuk sistemine göre analiz yaparak size detaylı cevaplar ve çözüm önerileri sunar. Güncel mevzuat veritabanımızdan en uygun bilgileri getirir.",
    category: "Genel",
    tags: ["ai", "çalışma", "sistem"]
  },
  {
    id: 2,
    question: "Hangi hukuk alanlarında destek alabilirim?",
    answer: "JurisGen şu hukuk alanlarında destek sağlar: İş Hukuku, Aile Hukuku, Miras Hukuku, Borçlar Hukuku, Ceza Hukuku, İdare Hukuku, Ticaret Hukuku, Gayrimenkul Hukuku. Sistem sürekli geliştirilmekte ve yeni alanlar eklenmekte.",
    category: "Hukuk Alanları",
    tags: ["hukuk", "alanlar", "kapsam"]
  },
  {
    id: 3,
    question: "Verilerim güvende mi?",
    answer: "Evet, verilerinizin güvenliği bizim önceliğimizdir. Tüm veriler end-to-end şifreleme ile korunur, KVKK ve GDPR uyumlu sistemler kullanılır. Kişisel bilgileriniz ve hukuki sorularınız üçüncü taraflarla paylaşılmaz. Veriler güvenli sunucularda saklanır.",
    category: "Güvenlik",
    tags: ["güvenlik", "veri", "gizlilik", "kvkk"]
  },
  {
    id: 4,
    question: "JurisGen ücretsiz mi?",
    answer: "JurisGen'de temel özellikler ücretsizdir. Günde 3 soru sorabilir, temel hukuki bilgilere erişebilirsiniz. Profesyonel planımızda sınırsız soru, öncelikli destek ve gelişmiş özellikler bulunur. Fiyatlarımız uygun ve şeffaftır.",
    category: "Fiyatlar",
    tags: ["ücretsiz", "fiyat", "profesyonel", "plan"]
  },
  {
    id: 5,
    question: "AI tavsiyeleri ne kadar güvenilir?",
    answer: "JurisGen, Türk hukuk sistemine özel eğitilmiş gelişmiş AI modeli kullanır. Ancak AI tavsiyelerinin bilgilendirme amaçlı olduğunu, kesin hukuki görüş olmadığını hatırlatırız. Karmaşık davalarda mutlaka uzman avukatla görüşmenizi öneriyoruz. AI size doğru yönlendirme ve ön bilgi sağlar.",
    category: "AI ve Güvenilirlik",
    tags: ["ai", "güvenilirlik", "tavsiye", "bilgilendirme"]
  },
  {
    id: 6,
    question: "Avukat yerine geçer mi?",
    answer: "Hayır, JurisGen avukat yerine geçmez. Hukuki bilgilendirme, yönlendirme ve ön araştırma amaçlıdır. Dava açma, mahkeme süreçleri, resmi işlemler için mutlaka lisanslı avukatla çalışmalısınız. JurisGen size zaman kazandırır ve doğru avukat seçimi için bilgi sağlar.",
    category: "Yasal Uyarı",
    tags: ["avukat", "yasal", "sınırlar", "bilgilendirme"]
  },
  {
    id: 7,
    question: "Kayıt olmadan kullanabilir miyim?",
    answer: "Temel özellikleri deneyimlemek için kayıt olmadan da kullanabilirsiniz. Ancak soru geçmişi, kişiselleştirilmiş cevaplar ve tüm özellikler için ücretsiz kayıt olmanız gerekir. Kayıt işlemi hızlı ve kolaydır.",
    category: "Hesap",
    tags: ["kayıt", "hesap", "ücretsiz", "giriş"]
  }
];

export default function FAQPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedItems, setExpandedItems] = useState<number[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("Tümü");

  const categories = ["Tümü", ...Array.from(new Set(faqData.map(item => item.category)))];

  const filteredFAQs = faqData.filter(item => {
    const matchesSearch = item.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.answer.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = selectedCategory === "Tümü" || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const toggleExpanded = (id: number) => {
    setExpandedItems(prev =>
      prev.includes(id)
        ? prev.filter(itemId => itemId !== id)
        : [...prev, id]
    );
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-muted/50 to-muted border-b">
        <div className="max-w-4xl mx-auto px-4 py-16">
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-4">
              <HelpCircle className="h-8 w-8 text-foreground" />
              <h1 className="text-4xl font-bold text-foreground">
                Sıkça Sorulan Sorular
              </h1>
            </div>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              JurisGen hakkında merak ettiklerinizi buradan öğrenebilirsiniz
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Search and Filter Section */}
        <div className="mb-8 space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4 z-10" />
            <Input
              type="text"
              placeholder="Soru ara... (örn: güvenlik, fiyat, AI)"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-12 h-12 text-base"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            {categories.map(category => (
              <Badge
                key={category}
                variant="outline"
                className={`cursor-pointer ${selectedCategory === category
                  ? "bg-foreground text-background border-foreground"
                  : "bg-background text-foreground border-border"
                  }`}
                onClick={() => setSelectedCategory(category)}
              >
                {category}
              </Badge>
            ))}
          </div>
        </div>

        {/* FAQ Results Count */}
        <div className="mb-6">
          <p className="text-muted-foreground">
            {filteredFAQs.length} soru bulundu
            {searchTerm && (
              <span className="ml-1">
                &quot;<strong>{searchTerm}</strong>&quot; için
              </span>
            )}
          </p>
        </div>

        {/* FAQ Items */}
        <div className="space-y-4 mb-12">
          {filteredFAQs.length > 0 ? (
            filteredFAQs.map((item) => (
              <Card key={item.id} className="border-border hover:shadow-md transition-shadow">
                <CardHeader
                  className="cursor-pointer hover:bg-muted/50 transition-colors"
                  onClick={() => toggleExpanded(item.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg text-card-foreground font-medium">
                        {item.question}
                      </CardTitle>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant="outline" className="text-xs">
                          {item.category}
                        </Badge>
                      </div>
                    </div>
                    <div className="ml-4">
                      {expandedItems.includes(item.id) ? (
                        <ChevronDown className="h-5 w-5 text-muted-foreground" />
                      ) : (
                        <ChevronRight className="h-5 w-5 text-muted-foreground" />
                      )}
                    </div>
                  </div>
                </CardHeader>

                {expandedItems.includes(item.id) && (
                  <CardContent className="pt-0">
                    <div className="border-t pt-4">
                      <p className="text-muted-foreground leading-relaxed">
                        {item.answer}
                      </p>
                      <div className="flex flex-wrap gap-1 mt-3">
                        {item.tags.map(tag => (
                          <Badge key={tag} variant="secondary" className="text-xs">
                            #{tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                )}
              </Card>
            ))
          ) : (
            <Card>
              <CardContent className="py-12 text-center">
                <HelpCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-2">
                  Soru bulunamadı
                </h3>
                <p className="text-muted-foreground mb-4">
                  Aradığınız soruyu bulamadık. Farklı kelimeler deneyin veya destek ekibimizle iletişime geçin.
                </p>
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearchTerm("");
                    setSelectedCategory("Tümü");
                  }}
                >
                  Aramayı Temizle
                </Button>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Support Contact Section */}
        <Card className="bg-gradient-to-r from-muted/50 to-muted border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-2xl text-card-foreground">
              <MessageCircle className="h-6 w-6" />
              Hala yardıma mı ihtiyacınız var?
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <p className="text-muted-foreground leading-relaxed">
              Aradığınız cevabı bulamadıysanız, destek ekibimiz size yardımcı olmaktan mutluluk duyar.
              E-posta yoluyla bizimle iletişime geçebilirsiniz.
            </p>

            <div className="max-w-md">
              <div className="flex items-start gap-3 p-4 bg-card rounded-lg border border-border">
                <Mail className="h-5 w-5 text-muted-foreground mt-1" />
                <div>
                  <h4 className="font-semibold text-card-foreground">E-posta Desteği</h4>
                  <p className="text-sm text-muted-foreground mb-2">Sorularınızı bize iletin</p>
                  <p className="text-xs text-muted-foreground">En kısa sürede yanıtlarız</p>
                </div>
              </div>
            </div>

            <div>
              <Button className="bg-black text-white hover:bg-white hover:text-black dark:bg-white dark:text-black dark:hover:bg-black dark:hover:text-white" asChild>
                <a href="/contact">
                  İletişime Geç
                </a>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 