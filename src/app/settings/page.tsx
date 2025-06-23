"use client";

import React, { useState, useEffect } from 'react';
import { useUser, useAuth } from "@clerk/nextjs";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Bell,
  Shield,
  User,
  Lock,
  Eye,
  EyeOff,
  Trash2,
  Download,
  AlertTriangle,
  Save,
  CheckCircle
} from 'lucide-react';
import Link from 'next/link';
import { useUserStore } from '@/stores/user-store';
import { useRouter } from 'next/navigation';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

export default function SettingsPage() {
  const { user, isLoaded } = useUser();
  const { signOut } = useAuth();
  const router = useRouter();
  const { fetchSettings, updateSettings } = useUserStore();

  // Settings state
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [marketingEmails, setMarketingEmails] = useState(false);
  const [securityAlerts, setSecurityAlerts] = useState(true);
  const [dataSharing, setDataSharing] = useState(false);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [showPasswordSection, setShowPasswordSection] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [loading, setLoading] = useState(true);
  const [storageUsed, setStorageUsed] = useState(0);
  const [planType, setPlanType] = useState('FREE');

  // Account deletion state
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');
  const [showDeletePassword, setShowDeletePassword] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  // Load settings on component mount
  useEffect(() => {
    const loadSettings = async () => {
      if (!isLoaded || !user) return;

      try {
        setLoading(true);
        const settings = await fetchSettings();

        setEmailNotifications(settings.emailNotifications);
        setMarketingEmails(settings.marketingEmails);
        setSecurityAlerts(settings.securityAlerts);
        setDataSharing(settings.dataSharing);
        setTwoFactorEnabled(settings.twoFactorEnabled);
        setStorageUsed(Number(settings.storageUsed));
        setPlanType(settings.planType);
      } catch (error) {
        console.error('Failed to load settings:', error);
      } finally {
        setLoading(false);
      }
    };

    loadSettings();
  }, [isLoaded, user, fetchSettings]);

  useEffect(() => {
    if (saveSuccess) {
      const timer = setTimeout(() => setSaveSuccess(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [saveSuccess]);

  if (!isLoaded || loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Ayarlar yükleniyor...</p>
        </div>
      </div>
    );
  }

  const handleSaveSettings = async () => {
    setIsSaving(true);
    try {
      await updateSettings({
        emailNotifications,
        marketingEmails,
        securityAlerts,
        dataSharing,
        twoFactorEnabled,
      });

      setSaveSuccess(true);
    } catch (error) {
      console.error('Failed to save settings:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handlePasswordChange = async () => {
    if (newPassword !== confirmPassword) {
      alert('Şifreler eşleşmiyor');
      return;
    }
    if (newPassword.length < 8) {
      alert('Şifre en az 8 karakter olmalıdır');
      return;
    }

    setIsSaving(true);
    try {
      await user?.updatePassword({
        newPassword: newPassword,
      });

      setNewPassword('');
      setConfirmPassword('');
      setShowPasswordSection(false);
      alert('Şifre başarıyla güncellendi!');
    } catch (error) {
      console.error('Failed to update password:', error);
      alert('Şifre güncellenirken bir hata oluştu.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleExportData = () => {
    // Simulate data export
    const data = {
      profile: user,
      settings: { emailNotifications, marketingEmails, securityAlerts },
      exportDate: new Date().toISOString()
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'jurisgen-data-export.json';
    a.click();
  };

  const handleDeleteAccount = () => {
    setShowDeleteDialog(true);
    setDeletePassword('');
    setDeleteError('');
  };

  const confirmDeleteAccount = async () => {
    if (!deletePassword.trim()) {
      setDeleteError('Lütfen şifrenizi girin.');
      return;
    }

    setIsDeleting(true);
    setDeleteError('');

    try {
      const response = await fetch('/api/user/delete-account', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          password: deletePassword,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Hesap silinirken bir hata oluştu.');
      }

      // Account deleted successfully
      // Production: Logging disabled

      // Sign out and redirect to home page
      await signOut();
      router.push('/');

    } catch (error) {
      console.error('Account deletion error:', error);
      setDeleteError(error instanceof Error ? error.message : 'Hesap silinirken bir hata oluştu.');
    } finally {
      setIsDeleting(false);
    }
  };

  // Calculate storage info
  const storageLimit = planType === 'FREE' ? 5 * 1024 * 1024 * 1024 : 50 * 1024 * 1024 * 1024; // 5GB for free, 50GB for premium
  const storageUsedGB = (storageUsed / (1024 * 1024 * 1024)).toFixed(2);
  const storageLimitGB = (storageLimit / (1024 * 1024 * 1024)).toFixed(0);

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Ayarlar</h1>
          <p className="text-muted-foreground">
            Hesap tercihlerinizi ve güvenlik ayarlarınızı yönetin
          </p>
        </div>

        {/* Success Alert */}
        {saveSuccess && (
          <Alert className="mb-6 border-green-200 bg-green-50">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              Ayarlar başarıyla kaydedildi!
            </AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Settings */}
          <div className="lg:col-span-2 space-y-6">
            {/* Account Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Hesap Ayarları
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex flex-col gap-4">
                  <div className="space-y-2">
                    <Label>E-posta Adresi</Label>
                    <div className="flex items-center gap-2">
                      <Input
                        value={user?.primaryEmailAddress?.emailAddress || ''}
                        disabled
                        className="flex-1 min-w-0"
                      />
                      <Badge variant="outline" className="text-green-600 border-green-300 whitespace-nowrap">
                        Doğrulandı
                      </Badge>
                    </div>
                  </div>
                  <div className="space-y-2 w-fit">
                    <Label>Hesap Türü</Label>
                    <Input value={planType} disabled />
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <h4 className="text-sm font-medium">Veri ve Depolama</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Kullanılan Depolama</span>
                      <span className="text-sm font-medium">
                        {storageUsedGB} GB / {storageLimitGB} GB
                      </span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div
                        className="bg-primary h-2 rounded-full"
                        style={{ width: `${Math.min(100, (storageUsed / storageLimit) * 100)}%` }}
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Notification Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5" />
                  Bildirimler
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>E-posta Bildirimleri</Label>
                      <p className="text-sm text-muted-foreground">
                        Hesap etkinlikleriniz hakkında bildirim alın
                      </p>
                    </div>
                    <Switch
                      checked={emailNotifications}
                      onCheckedChange={setEmailNotifications}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Güvenlik Uyarıları</Label>
                      <p className="text-sm text-muted-foreground">
                        Güvenlikle ilgili önemli bildirimler
                      </p>
                    </div>
                    <Switch
                      checked={securityAlerts}
                      onCheckedChange={setSecurityAlerts}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Pazarlama E-postaları</Label>
                      <p className="text-sm text-muted-foreground">
                        Yeni özellikler ve promosyonlar hakkında güncellemeler
                      </p>
                    </div>
                    <Switch
                      checked={marketingEmails}
                      onCheckedChange={setMarketingEmails}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Security Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Güvenlik
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>İki Faktörlü Doğrulama</Label>
                    <p className="text-sm text-muted-foreground">
                      Hesabınıza ekstra güvenlik katmanı ekleyin
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm">
                      {twoFactorEnabled ? 'Devre Dışı Bırak' : 'Etkinleştir'}
                    </Button>
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-medium">Şifre Değiştir</h4>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowPasswordSection(!showPasswordSection)}
                    >
                      <Lock className="h-4 w-4 mr-2" />
                      {showPasswordSection ? 'İptal' : 'Şifre Değiştir'}
                    </Button>
                  </div>

                  {showPasswordSection && (
                    <div className="space-y-4 p-4 border rounded-lg bg-muted/50">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="newPassword">Yeni Şifre</Label>
                          <div className="relative">
                            <Input
                              id="newPassword"
                              type={showPassword ? "text" : "password"}
                              value={newPassword}
                              onChange={(e) => setNewPassword(e.target.value)}
                              placeholder="Yeni şifrenizi girin"
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                              onClick={() => setShowPassword(!showPassword)}
                            >
                              {showPassword ? (
                                <EyeOff className="h-4 w-4" />
                              ) : (
                                <Eye className="h-4 w-4" />
                              )}
                            </Button>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="confirmPassword">Şifreyi Onayla</Label>
                          <Input
                            id="confirmPassword"
                            type={showPassword ? "text" : "password"}
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="Yeni şifrenizi tekrar girin"
                          />
                        </div>
                      </div>
                      <Button
                        onClick={handlePasswordChange}
                        disabled={!newPassword || !confirmPassword || isSaving}
                        size="sm"
                      >
                        <Lock className="h-4 w-4 mr-2" />
                        {isSaving ? 'Güncelleniyor...' : 'Şifreyi Güncelle'}
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Privacy Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="h-5 w-5" />
                  Gizlilik
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between gap-4">
                  <div className="space-y-0.5">
                    <Label>Veri Paylaşımı</Label>
                    <p className="text-sm text-muted-foreground">
                      Hizmetlerimizi geliştirmek için anonim kullanım verilerinin işlenmesine izin ver
                    </p>
                  </div>
                  <Switch
                    checked={dataSharing}
                    onCheckedChange={setDataSharing}
                  />
                </div>

                <Separator />

                <div className="space-y-4">
                  <h4 className="text-sm font-medium">Veri Yönetimi</h4>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <Button
                      variant="outline"
                      onClick={handleExportData}
                      className="flex items-center gap-2"
                    >
                      <Download className="h-4 w-4" />
                      Verileri İndir
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Danger Zone */}
            <Card className="border-red-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-red-600">
                  <AlertTriangle className="h-5 w-5" />
                  Tehlike Bölgesi
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-medium text-red-600 mb-2">Hesabı Sil</h4>
                    <p className="text-sm text-muted-foreground mb-4">
                      Hesabınızı kalıcı olarak silmek istiyorsanız, bu işlem geri alınamaz.
                      Tüm verileriniz, sohbetleriniz ve belgeleriniz kalıcı olarak silinecektir.
                    </p>
                    <Button
                      variant="destructive"
                      onClick={handleDeleteAccount}
                      className="flex items-center gap-2"
                    >
                      <Trash2 className="h-4 w-4" />
                      Hesabı Sil
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Summary & Actions */}
          <div className="space-y-6">
            {/* Account Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">Hesap Özeti</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Plan</span>
                    <Badge variant="secondary">{planType}</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">E-posta Doğrulandı</span>
                    <Badge variant="outline" className="text-green-600 border-green-300">
                      Evet
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">2FA</span>
                    <Badge variant={twoFactorEnabled ? 'default' : 'secondary'}>
                      {twoFactorEnabled ? 'Etkin' : 'Devre Dışı'}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">Hızlı İşlemler</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" size="sm" className="w-full justify-start" asChild>
                  <Link href="/profile">
                    <User className="h-4 w-4 mr-2" />
                    Profili Düzenle
                  </Link>
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start" asChild>
                  <Link href="/dashboard">
                    <User className="h-4 w-4 mr-2" />
                    Dashboard&apos;a Dön
                  </Link>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-start"
                  onClick={handleSaveSettings}
                  disabled={isSaving}
                >
                  <Save className="h-4 w-4 mr-2" />
                  {isSaving ? 'Kaydediliyor...' : 'Kaydet'}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Account Deletion Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="h-5 w-5" />
              Hesabı Sil
            </DialogTitle>
            <DialogDescription>
              Hesabınızı silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.
              Tüm verileriniz, sohbetleriniz ve belgeleriniz kalıcı olarak silinecektir.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="deletePassword">Şifrenizi Girin</Label>
              <div className="relative">
                <Input
                  id="deletePassword"
                  value={deletePassword}
                  onChange={(e) => setDeletePassword(e.target.value)}
                  type={showDeletePassword ? "text" : "password"}
                  placeholder="Mevcut şifrenizi girin"
                  className="pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowDeletePassword(!showDeletePassword)}
                >
                  {showDeletePassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            {deleteError && (
              <Alert className="border-red-200 bg-red-50">
                <AlertTriangle className="h-4 w-4 text-red-600" />
                <AlertDescription className="text-red-800">
                  {deleteError}
                </AlertDescription>
              </Alert>
            )}

            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <h4 className="text-sm font-medium text-red-800 mb-2">Bu işlem şunları silecektir:</h4>
              <ul className="text-sm text-red-700 space-y-1">
                <li>• Tüm sohbet geçmişiniz</li>
                <li>• Yüklediğiniz belgeler</li>
                <li>• Hesap ayarlarınız</li>
                <li>• Abonelik bilgileriniz</li>
              </ul>
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setShowDeleteDialog(false)}
              disabled={isDeleting}
            >
              İptal
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDeleteAccount}
              disabled={isDeleting || !deletePassword.trim()}
              className="flex items-center gap-2"
            >
              {isDeleting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
                  Siliniyor...
                </>
              ) : (
                <>
                  <Trash2 className="h-4 w-4" />
                  Hesabı Sil
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
