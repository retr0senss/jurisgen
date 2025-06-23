"use client";

import { useState } from "react";
import { useSignUp } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Eye, EyeOff, X, Check } from "lucide-react";
import Link from "next/link";
import { z } from "zod";

// Zod schema for form validation
const registerSchema = z.object({
  firstName: z.string().min(3, "Lütfen adınızı girin"),
  lastName: z.string().min(3, "Lütfen soyadınızı girin"),
  email: z.string().email("Lütfen geçerli bir e-posta adresi girin"),
  password: z.string()
    .min(8, "Şifre en az 8 karakter olmalıdır")
    .regex(/[A-Z]/, "Şifre en az bir büyük harf içermelidir")
    .regex(/[0-9]/, "Şifre en az bir rakam içermelidir")
    .regex(/[^A-Za-z0-9]/, "Şifre en az bir özel karakter içermelidir")
});

export default function RegisterPage() {
  const { signUp, isLoaded, setActive } = useSignUp();
  const router = useRouter();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [pendingVerification, setPendingVerification] = useState(false);
  const [code, setCode] = useState("");

  // Email validation
  const isValidEmail = email.length > 0 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  // Password validation functions
  const hasMinLength = password.length >= 8;
  const hasUppercase = /[A-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecialChar = /[^A-Za-z0-9]/.test(password);

  const passwordConditions = [
    { label: "En az 8 karakter", met: hasMinLength },
    { label: "Bir büyük harf (A-Z)", met: hasUppercase },
    { label: "Bir rakam (0-9)", met: hasNumber },
    { label: "Bir özel karakter (!@#$%^&*)", met: hasSpecialChar },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isLoaded) return;

    // Validate form data
    const result = registerSchema.safeParse({ firstName, lastName, email, password });
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.errors.forEach((error) => {
        if (error.path[0]) {
          fieldErrors[error.path[0] as string] = error.message;
        }
      });
      setErrors(fieldErrors);
      return;
    }

    setErrors({});
    setIsLoading(true);

    try {
      await signUp.create({
        emailAddress: email,
        password,
        firstName,
        lastName,
      });

      await signUp.prepareEmailAddressVerification({
        strategy: "email_code",
      });

      setPendingVerification(true);
    } catch {
      setErrors({ general: "Hesap oluşturulamadı. Lütfen tekrar deneyin." });
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyEmail = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isLoaded) return;

    setIsLoading(true);

    try {
      const completeSignUp = await signUp.attemptEmailAddressVerification({
        code,
      });

      if (completeSignUp.status === "complete") {
        await setActive({ session: completeSignUp.createdSessionId });
        router.push("/chat");
      }
    } catch {
      setErrors({ general: "Geçersiz doğrulama kodu. Lütfen tekrar deneyin." });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignUp = async () => {
    if (!isLoaded) return;

    try {
      await signUp.authenticateWithRedirect({
        strategy: "oauth_google",
        redirectUrl: "/sso-callback",
        redirectUrlComplete: "/chat",
      });
    } catch {
      setErrors({ general: "Google ile kayıt olunamadı" });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center justify-center gap-2 mb-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-black text-white font-bold">
              J
            </div>
            <span className="text-xl font-semibold">JurisGen</span>
          </Link>
        </div>

        {/* Register Card */}
        <Card className="shadow-lg border-0">
          <CardHeader className="text-center pb-4">
            <CardTitle className="text-2xl font-semibold text-gray-900">
              {pendingVerification ? "E-postanızı doğrulayın" : "Hesap oluşturun"}
            </CardTitle>
            <CardDescription className="text-gray-600">
              {pendingVerification
                ? "E-postanıza gönderilen doğrulama kodunu girin"
                : "Google hesabınızla kayıt olun veya yeni hesap oluşturun"
              }
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            {/* General Error */}
            {errors.general && (
              <div className="p-3 text-sm text-red-600 bg-red-50 rounded-md border border-red-200">
                {errors.general}
              </div>
            )}

            {!pendingVerification ? (
              <>
                {/* Google Sign Up Button */}
                <Button
                  variant="outline"
                  className="w-full h-12 bg-white border border-gray-300 hover:bg-gray-50"
                  onClick={handleGoogleSignUp}
                  disabled={isLoading}
                >
                  <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                  </svg>
                  Sign up with Google
                </Button>

                {/* Divider */}
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-gray-300" />
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="bg-gray-50 px-4 text-gray-500">Veya e-posta ile devam edin</span>
                  </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* First Name and Last Name Row */}
                  <div className="grid grid-cols-2 gap-4">
                    {/* First Name Input with Float Label */}
                    <div className="relative">
                      <Input
                        id="firstName"
                        type="text"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        className={`h-12 pt-6 pb-2 peer ${errors.firstName ? 'border-red-500' : ''}`}
                        placeholder=" "
                      />
                      <Label
                        htmlFor="firstName"
                        className="absolute left-3 top-3 text-gray-500 text-sm transition-all duration-200 peer-placeholder-shown:top-4 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-focus:top-2 peer-focus:text-sm peer-focus:text-gray-700 peer-[:not(:placeholder-shown)]:top-2 peer-[:not(:placeholder-shown)]:text-sm peer-[:not(:placeholder-shown)]:text-gray-700"
                      >
                        Ad
                      </Label>
                      {errors.firstName && (
                        <p className="text-sm text-red-600 mt-1">{errors.firstName}</p>
                      )}
                    </div>

                    {/* Last Name Input with Float Label */}
                    <div className="relative">
                      <Input
                        id="lastName"
                        type="text"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        className={`h-12 pt-6 pb-2 peer ${errors.lastName ? 'border-red-500' : ''}`}
                        placeholder=" "
                      />
                      <Label
                        htmlFor="lastName"
                        className="absolute left-3 top-3 text-gray-500 text-sm transition-all duration-200 peer-placeholder-shown:top-4 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-focus:top-2 peer-focus:text-sm peer-focus:text-gray-700 peer-[:not(:placeholder-shown)]:top-2 peer-[:not(:placeholder-shown)]:text-sm peer-[:not(:placeholder-shown)]:text-gray-700"
                      >
                        Soyad
                      </Label>
                      {errors.lastName && (
                        <p className="text-sm text-red-600 mt-1">{errors.lastName}</p>
                      )}
                    </div>
                  </div>

                  {/* Email Input with Float Label */}
                  <div className="relative">
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className={`h-12 pt-6 pb-2 pr-10 peer ${errors.email ? 'border-red-500' : ''}`}
                      placeholder=" "
                    />
                    <Label
                      htmlFor="email"
                      className="absolute left-3 top-3 text-gray-500 text-sm transition-all duration-200 peer-placeholder-shown:top-4 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-focus:top-2 peer-focus:text-sm peer-focus:text-gray-700 peer-[:not(:placeholder-shown)]:top-2 peer-[:not(:placeholder-shown)]:text-sm peer-[:not(:placeholder-shown)]:text-gray-700"
                    >
                      E-posta Adresi
                    </Label>
                    {/* Email validation icon */}
                    {email.length > 0 && (
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                        {isValidEmail ? (
                          <Check className="w-4 h-4 text-green-600" />
                        ) : (
                          <X className="w-4 h-4 text-red-500" />
                        )}
                      </div>
                    )}
                    {errors.email && (
                      <p className="text-sm text-red-600 mt-1">{errors.email}</p>
                    )}
                  </div>

                  {/* Password Input with Float Label */}
                  <div className="relative">
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        onFocus={() => setPasswordFocused(true)}
                        onBlur={() => setPasswordFocused(false)}
                        className={`h-12 pt-6 pb-2 pr-10 peer ${errors.password ? 'border-red-500' : ''}`}
                        placeholder=" "
                      />
                      <Label
                        htmlFor="password"
                        className="absolute left-3 top-3 text-gray-500 text-sm transition-all duration-200 peer-placeholder-shown:top-4 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-focus:top-2 peer-focus:text-sm peer-focus:text-gray-700 peer-[:not(:placeholder-shown)]:top-2 peer-[:not(:placeholder-shown)]:text-sm peer-[:not(:placeholder-shown)]:text-gray-700"
                      >
                        Şifre
                      </Label>
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    {errors.password && (
                      <p className="text-sm text-red-600 mt-1">{errors.password}</p>
                    )}

                    {/* Password Requirements - Show when focused or when typing */}
                    {(passwordFocused || password.length > 0) && (
                      <div className="mt-3 p-3 bg-gray-50 rounded-md border">
                        <p className="text-sm font-medium text-gray-700 mb-2">Şifre şunları içermelidir:</p>
                        <ul className="space-y-2">
                          {passwordConditions.map((condition, index) => (
                            <li key={index} className="flex items-center gap-2 text-sm">
                              {condition.met ? (
                                <Check className="w-4 h-4 text-green-600" />
                              ) : (
                                <X className="w-4 h-4 text-gray-400" />
                              )}
                              <span className={condition.met ? "text-green-600" : "text-gray-500"}>
                                {condition.label}
                              </span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>

                  {/* Create Account Button */}
                  <Button
                    type="submit"
                    className="w-full h-12 bg-black hover:bg-gray-800 text-white"
                    disabled={isLoading}
                  >
                    {isLoading ? "Hesap oluşturuluyor..." : "Hesap Oluştur"}
                  </Button>
                </form>

                {/* Login Link */}
                <div className="text-center text-sm text-gray-600">
                  Zaten hesabınız var mı?{" "}
                  <Link href="/login" className="text-gray-900 hover:text-black font-medium">
                    Giriş yap
                  </Link>
                </div>
              </>
            ) : (
              <form onSubmit={handleVerifyEmail} className="space-y-4">
                {/* Verification Code Input with Float Label */}
                <div className="relative">
                  <Input
                    id="code"
                    type="text"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    className="h-12 pt-6 pb-2 peer text-center text-lg tracking-widest"
                    placeholder=" "
                  />
                  <Label
                    htmlFor="code"
                    className="absolute left-3 top-3 text-gray-500 text-sm transition-all duration-200 peer-placeholder-shown:top-4 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-focus:top-2 peer-focus:text-sm peer-focus:text-gray-700 peer-[:not(:placeholder-shown)]:top-2 peer-[:not(:placeholder-shown)]:text-sm peer-[:not(:placeholder-shown)]:text-gray-700"
                  >
                    Doğrulama Kodu
                  </Label>
                </div>

                {/* Verify Button */}
                <Button
                  type="submit"
                  className="w-full h-12 bg-black hover:bg-gray-800 text-white"
                  disabled={isLoading}
                >
                  {isLoading ? "Doğrulanıyor..." : "E-postayı Doğrula"}
                </Button>
              </form>
            )}
          </CardContent>
        </Card>

        {/* Terms and Privacy */}
        <div className="mt-8 text-center text-xs text-gray-500">
          Hesap oluşturarak{" "}
          <Link href="/terms" className="text-gray-600 hover:text-gray-800 underline">
            Hizmet Şartlarımızı
          </Link>{" "}
          ve{" "}
          <Link href="/privacy" className="text-gray-600 hover:text-gray-800 underline">
            Gizlilik Politikamızı
          </Link>{" "}
          kabul etmiş olursunuz
        </div>
      </div>
    </div>
  );
} 