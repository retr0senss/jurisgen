"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useUser } from "@clerk/nextjs";
import { Card, CardContent, CardHeader, CardTitle, PremiumCard } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  User,
  Calendar,
  Crown,
  Camera,
  Save,
  X,
  Edit3,
  Shield,
  Clock,
  Globe
} from 'lucide-react';
import Link from 'next/link';
import { useUserStore, PLAN_LIMITS } from '@/stores/user-store';

export default function ProfilePage() {
  const { user, isLoaded } = useUser();
  const {
    user: userData,
    loading,
    fetchUser,
    updatePreferences,
    getUsagePercentage
  } = useUserStore();

  const [isEditing, setIsEditing] = useState(false);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [preferredLanguage, setPreferredLanguage] = useState('tr');
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  // File input ref for image upload
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isLoaded && user && !userData) {
      fetchUser();
    }
  }, [isLoaded, user, userData, fetchUser]);

  useEffect(() => {
    if (userData) {
      setFirstName(userData.firstName || '');
      setLastName(userData.lastName || '');
      setPreferredLanguage(userData.preferredLanguage || 'tr');
    }
  }, [userData]);

  // Handle image upload
  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Lütfen geçerli bir resim dosyası seçin.');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('Dosya boyutu 5MB\'dan küçük olmalıdır.');
      return;
    }

    setIsUploadingImage(true);
    try {
      // Upload image to Clerk
      await user.setProfileImage({ file });

      // Wait for Clerk to process the image
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Reload user data from Clerk to get updated image URL
      await user.reload();

      // Manually sync the updated image URL to our database
      try {
        const response = await fetch('/api/user/sync-profile', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            clerkId: user.id,
            imageUrl: user.imageUrl, // This should now be the updated URL
          }),
        });

        if (!response.ok) {
          console.error('Failed to sync profile to database');
        } else {
          // Production: Logging disabled
        }
      } catch (syncError) {
        console.error('Profile sync error:', syncError);
      }

      // Refresh user data in our store
      await fetchUser();
    } catch (error) {
      console.error('Failed to upload image:', error);
      alert('Resim yüklenirken bir hata oluştu. Lütfen tekrar deneyin.');
    } finally {
      setIsUploadingImage(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  // Trigger file input click
  const handleCameraClick = () => {
    fileInputRef.current?.click();
  };

  if (!isLoaded || loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Profil yükleniyor...</p>
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

  const handleSave = async () => {
    if (!user) return;

    setIsSaving(true);
    try {
      // Update Clerk profile first
      await user.update({
        firstName: firstName,
        lastName: lastName,
      });

      // Wait a moment for Clerk to process
      await new Promise(resolve => setTimeout(resolve, 500));

      // Reload user data from Clerk to get latest info
      await user.reload();

      // Sync all current Clerk data to database
      try {
        const syncResponse = await fetch('/api/user/sync-profile', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            clerkId: user.id,
            firstName: user.firstName,
            lastName: user.lastName,
            imageUrl: user.imageUrl,
            email: user.primaryEmailAddress?.emailAddress,
          }),
        });

        if (!syncResponse.ok) {
          console.error('Failed to sync profile to database');
        }
      } catch (syncError) {
        console.error('Profile sync error:', syncError);
      }

      // Update database preferences using store
      await updatePreferences({ preferredLanguage });

      // Refresh user data in our store
      await fetchUser();

      setIsEditing(false);
    } catch (error) {
      console.error('Failed to update profile:', error);
      alert('Profil güncellenirken bir hata oluştu. Lütfen tekrar deneyin.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setFirstName(userData?.firstName || '');
    setLastName(userData?.lastName || '');
    setPreferredLanguage(userData?.preferredLanguage || 'tr');
    setIsEditing(false);
  };

  const getInitials = (firstName?: string, lastName?: string) => {
    return `${firstName?.charAt(0) || ''}${lastName?.charAt(0) || ''}`.toUpperCase();
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const limits = PLAN_LIMITS[userData.planType];

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Profil</h1>
          <p className="text-muted-foreground">
            Hesap bilgilerinizi ve tercihlerinizi yönetin
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile Card */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Kişisel Bilgiler
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Hidden file input for image upload */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />

                {/* Profile Photo Section */}
                <div className="flex items-center gap-6">
                  <div className="relative">
                    <Avatar className="h-24 w-24">
                      <AvatarImage src={user?.imageUrl} alt={user?.fullName || ''} />
                      <AvatarFallback className="text-lg font-semibold">
                        {getInitials(userData.firstName, userData.lastName)}
                      </AvatarFallback>
                    </Avatar>
                    <Button
                      size="sm"
                      variant="secondary"
                      className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full p-0"
                      onClick={handleCameraClick}
                      disabled={isUploadingImage}
                    >
                      {isUploadingImage ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
                      ) : (
                        <Camera className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">{user?.fullName || 'İsimsiz Kullanıcı'}</h3>
                    <p className="text-sm text-muted-foreground">{userData.email}</p>
                    <Badge variant={userData.planType === 'FREE' ? 'secondary' : 'default'} className="mt-2">
                      <Crown className="h-3 w-3 mr-1" />
                      {userData.planType} Plan
                    </Badge>
                    {isUploadingImage && (
                      <p className="text-xs text-muted-foreground mt-1">Resim yükleniyor...</p>
                    )}
                  </div>
                </div>

                <Separator />

                {/* Editable Fields */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-medium">Temel Bilgiler</h4>
                    {!isEditing ? (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setIsEditing(true)}
                      >
                        <Edit3 className="h-4 w-4 mr-2" />
                        Düzenle
                      </Button>
                    ) : (
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleCancel}
                          disabled={isSaving}
                        >
                          <X className="h-4 w-4 mr-2" />
                          İptal
                        </Button>
                        <Button
                          size="sm"
                          onClick={handleSave}
                          disabled={isSaving}
                        >
                          <Save className="h-4 w-4 mr-2" />
                          {isSaving ? 'Kaydediliyor...' : 'Kaydet'}
                        </Button>
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">Ad</Label>
                      {isEditing ? (
                        <Input
                          id="firstName"
                          value={firstName}
                          onChange={(e) => setFirstName(e.target.value)}
                          placeholder="Adınızı girin"
                        />
                      ) : (
                        <p className="text-sm py-2 px-3 bg-muted rounded-md">
                          {userData.firstName || 'Girilmemiş'}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="lastName">Soyad</Label>
                      {isEditing ? (
                        <Input
                          id="lastName"
                          value={lastName}
                          onChange={(e) => setLastName(e.target.value)}
                          placeholder="Soyadınızı girin"
                        />
                      ) : (
                        <p className="text-sm py-2 px-3 bg-muted rounded-md">
                          {userData.lastName || 'Girilmemiş'}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">E-posta Adresi</Label>
                    <div className="flex items-center gap-2">
                      <Input
                        id="email"
                        value={userData.email}
                        disabled
                        className="bg-muted"
                      />
                      <Badge variant="outline" className="text-green-600 border-green-300">
                        Doğrulandı
                      </Badge>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="language">Tercih Edilen Dil</Label>
                    {isEditing ? (
                      <Select value={preferredLanguage} onValueChange={setPreferredLanguage}>
                        <SelectTrigger className="bg-background">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="tr">Türkçe</SelectItem>
                          <SelectItem value="en">English</SelectItem>
                        </SelectContent>
                      </Select>
                    ) : (
                      <p className="text-sm py-2 px-3 bg-muted rounded-md">
                        {userData.preferredLanguage === 'tr' ? 'Türkçe' : 'English'}
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Stats & Info */}
          <div className="space-y-6">
            {/* Usage Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">Kullanım İstatistikleri</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Aylık Mesajlar</span>
                    <span>{userData.monthlyMessageCount} / {limits.messages === -1 ? '∞' : limits.messages}</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div
                      className="bg-primary h-2 rounded-full"
                      style={{ width: `${getUsagePercentage('message')}%` }}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Aylık Belgeler</span>
                    <span>{userData.monthlyDocumentCount} / {limits.documents === -1 ? '∞' : limits.documents}</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div
                      className="bg-primary h-2 rounded-full"
                      style={{ width: `${getUsagePercentage('document')}%` }}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Account Info */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">Hesap Bilgileri</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Üyelik:</span>
                  <span className='ml-auto'>{formatDate(userData.createdAt)}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Globe className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Dil:</span>
                  <span className='ml-auto'>{userData.preferredLanguage === 'tr' ? 'Türkçe' : 'English'}</span>
                </div>
                <div className="flex items-center gap-2 text-sm fle">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Son Güncelleme:</span>
                  <span className='ml-auto'>{formatDate(userData.updatedAt)}</span>
                </div>
              </CardContent>
            </Card>

            {/* Upgrade Card for Free Users */}
            {userData.planType === 'FREE' && (
              <PremiumCard>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-white">
                    <Crown className="h-5 w-5" />
                    Premium&apos;a Geçin
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-white/90">
                    Daha fazla özellik ve sınırsız kullanım için premium plana geçin.
                  </p>
                  <Button className="w-full bg-white text-black hover:bg-white/90" asChild>
                    <Link href="/pricing">
                      Planları Görüntüle
                    </Link>
                  </Button>
                </CardContent>
              </PremiumCard>
            )}

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">Hızlı İşlemler</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" className="w-full justify-start" asChild>
                  <Link href="/settings">
                    <Shield className="h-4 w-4 mr-2" />
                    Güvenlik Ayarları
                  </Link>
                </Button>
                <Button variant="outline" className="w-full justify-start" asChild>
                  <Link href="/dashboard">
                    <User className="h-4 w-4 mr-2" />
                    Dashboard&apos;a Dön
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