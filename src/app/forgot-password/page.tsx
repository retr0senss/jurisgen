"use client";

import { useState, useEffect } from "react";
import { useSignIn } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Eye, EyeOff, Check, X } from "lucide-react";
import { z } from "zod";

// Zod schema for email validation
const emailSchema = z.object({
  email: z.string().email("Geçerli bir email adresi girin"),
});

const passwordSchema = z.object({
  password: z
    .string()
    .min(8, "Şifre en az 8 karakter olmalıdır")
    .regex(/[A-Z]/, "Şifre en az 1 büyük harf içermelidir")
    .regex(/[0-9]/, "Şifre en az 1 rakam içermelidir")
    .regex(/[^A-Za-z0-9]/, "Şifre en az 1 özel karakter içermelidir"),
  code: z.string().min(6, "Doğrulama kodu 6 haneli olmalıdır"),
});

export default function ForgotPasswordPage() {
  const { signIn, isLoaded } = useSignIn();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState<"email" | "reset">("email");
  const [showPassword, setShowPassword] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
  const [codeFocused, setCodeFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);

  // Email validation state
  const [emailValid, setEmailValid] = useState(false);

  // Password requirements state
  const [passwordRequirements, setPasswordRequirements] = useState({
    length: false,
    uppercase: false,
    number: false,
    special: false,
  });

  useEffect(() => {
    // Validate email
    try {
      emailSchema.parse({ email });
      setEmailValid(true);
    } catch {
      setEmailValid(false);
    }
  }, [email]);

  useEffect(() => {
    // Update password requirements
    setPasswordRequirements({
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      number: /[0-9]/.test(password),
      special: /[^A-Za-z0-9]/.test(password),
    });
  }, [password]);

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isLoaded) return;

    // Validate email
    const result = emailSchema.safeParse({ email });
    if (!result.success) {
      setErrors({ email: result.error.errors[0].message });
      return;
    }

    setErrors({});
    setIsLoading(true);

    try {
      await signIn.create({
        strategy: "reset_password_email_code",
        identifier: email,
      });
      setStep("reset");
    } catch {
      setErrors({ general: "Bu email adresi ile kayıtlı hesap bulunamadı" });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isLoaded) return;

    // Validate password and code
    const result = passwordSchema.safeParse({ password, code });
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
      const result = await signIn.attemptFirstFactor({
        strategy: "reset_password_email_code",
        code,
        password,
      });

      if (result.status === "complete") {
        router.push("/chat");
      }
    } catch {
      setErrors({ general: "Doğrulama kodu hatalı veya şifre resetlenemedi" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-900 text-white font-bold text-lg">
              J
            </div>
            <span className="text-2xl font-bold text-gray-900">JurisGen</span>
          </Link>
        </div>

        {/* Forgot Password Form */}
        <Card className="bg-white border-gray-200 shadow-xl">
          <CardHeader className="text-center pb-6">
            <CardTitle className="text-2xl text-gray-900 font-bold">
              {step === "email" ? "Şifre Sıfırlama" : "Yeni Şifre Belirle"}
            </CardTitle>
            <CardDescription className="text-gray-600">
              {step === "email"
                ? "E-posta adresinizi girin, size şifre sıfırlama kodu gönderelim"
                : "E-posta adresinize gönderilen kod ile yeni şifrenizi belirleyin"
              }
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            {step === "email" ? (
              <form onSubmit={handleEmailSubmit} className="space-y-6">
                {/* General Error */}
                {errors.general && (
                  <div className="p-4 text-sm text-red-700 bg-red-50 rounded-lg border border-red-200">
                    {errors.general}
                  </div>
                )}

                {/* Email with Float Label */}
                <div className="relative">
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onFocus={() => setEmailFocused(true)}
                    onBlur={() => setEmailFocused(false)}
                    className={`peer h-12 pt-6 pb-2 px-4 bg-gray-50 border-2 rounded-lg transition-all duration-200 focus:bg-white ${errors.email ? 'border-red-500' : 'border-gray-200 focus:border-gray-900'
                      }`}
                    placeholder=" "
                  />
                  <label
                    htmlFor="email"
                    className={`absolute left-4 transition-all duration-200 cursor-text ${emailFocused || email
                      ? 'top-2 text-xs text-gray-600'
                      : 'top-3 text-base text-gray-400'
                      }`}
                  >
                    E-posta adresi
                  </label>
                  {email && (
                    <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                      {emailValid ? (
                        <Check className="h-5 w-5 text-green-600" />
                      ) : (
                        <X className="h-5 w-5 text-red-500" />
                      )}
                    </div>
                  )}
                  {errors.email && (
                    <p className="mt-2 text-sm text-red-600">{errors.email}</p>
                  )}
                </div>

                {/* Submit Button */}
                <Button
                  type="submit"
                  className="w-full h-12 bg-gray-900 hover:bg-gray-800 text-white font-medium rounded-lg transition-colors"
                  disabled={isLoading || !emailValid}
                >
                  {isLoading ? (
                    <div className="flex items-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Kod gönderiliyor...
                    </div>
                  ) : (
                    "Sıfırlama Kodu Gönder"
                  )}
                </Button>
              </form>
            ) : (
              <form onSubmit={handlePasswordReset} className="space-y-6">
                {/* General Error */}
                {errors.general && (
                  <div className="p-4 text-sm text-red-700 bg-red-50 rounded-lg border border-red-200">
                    {errors.general}
                  </div>
                )}

                {/* Verification Code with Float Label */}
                <div className="relative">
                  <Input
                    id="code"
                    type="text"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    onFocus={() => setCodeFocused(true)}
                    onBlur={() => setCodeFocused(false)}
                    className={`peer h-12 pt-6 pb-2 px-4 bg-gray-50 border-2 rounded-lg transition-all duration-200 focus:bg-white ${errors.code ? 'border-red-500' : 'border-gray-200 focus:border-gray-900'
                      }`}
                    placeholder=" "
                    maxLength={6}
                  />
                  <label
                    htmlFor="code"
                    className={`absolute left-4 transition-all duration-200 cursor-text ${codeFocused || code
                      ? 'top-2 text-xs text-gray-600'
                      : 'top-3 text-base text-gray-400'
                      }`}
                  >
                    Doğrulama Kodu
                  </label>
                  {errors.code && (
                    <p className="mt-2 text-sm text-red-600">{errors.code}</p>
                  )}
                </div>

                {/* New Password with Float Label */}
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onFocus={() => setPasswordFocused(true)}
                    onBlur={() => setPasswordFocused(false)}
                    className={`peer h-12 pt-6 pb-2 px-4 pr-12 bg-gray-50 border-2 rounded-lg transition-all duration-200 focus:bg-white ${errors.password ? 'border-red-500' : 'border-gray-200 focus:border-gray-900'
                      }`}
                    placeholder=" "
                  />
                  <label
                    htmlFor="password"
                    className={`absolute left-4 transition-all duration-200 cursor-text ${passwordFocused || password
                      ? 'top-2 text-xs text-gray-600'
                      : 'top-3 text-base text-gray-400'
                      }`}
                  >
                    Yeni Şifre
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                  {errors.password && (
                    <p className="mt-2 text-sm text-red-600">{errors.password}</p>
                  )}
                </div>

                {/* Password Requirements */}
                {(passwordFocused || password) && (
                  <div className="space-y-2 p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <p className="text-sm font-medium text-gray-700">Şifre gereksinimleri:</p>
                    <div className="space-y-1">
                      <div className={`flex items-center gap-2 text-sm ${passwordRequirements.length ? 'text-green-600' : 'text-gray-500'}`}>
                        {passwordRequirements.length ? <Check className="h-4 w-4" /> : <X className="h-4 w-4" />}
                        En az 8 karakter
                      </div>
                      <div className={`flex items-center gap-2 text-sm ${passwordRequirements.uppercase ? 'text-green-600' : 'text-gray-500'}`}>
                        {passwordRequirements.uppercase ? <Check className="h-4 w-4" /> : <X className="h-4 w-4" />}
                        En az 1 büyük harf
                      </div>
                      <div className={`flex items-center gap-2 text-sm ${passwordRequirements.number ? 'text-green-600' : 'text-gray-500'}`}>
                        {passwordRequirements.number ? <Check className="h-4 w-4" /> : <X className="h-4 w-4" />}
                        En az 1 rakam
                      </div>
                      <div className={`flex items-center gap-2 text-sm ${passwordRequirements.special ? 'text-green-600' : 'text-gray-500'}`}>
                        {passwordRequirements.special ? <Check className="h-4 w-4" /> : <X className="h-4 w-4" />}
                        En az 1 özel karakter
                      </div>
                    </div>
                  </div>
                )}

                {/* Reset Button */}
                <Button
                  type="submit"
                  className="w-full h-12 bg-gray-900 hover:bg-gray-800 text-white font-medium rounded-lg transition-colors"
                  disabled={
                    isLoading ||
                    !passwordRequirements.length ||
                    !passwordRequirements.uppercase ||
                    !passwordRequirements.number ||
                    !passwordRequirements.special ||
                    code.length < 6
                  }
                >
                  {isLoading ? (
                    <div className="flex items-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Şifre güncelleniyor...
                    </div>
                  ) : (
                    "Şifreyi Güncelle"
                  )}
                </Button>

                {/* Back Button */}
                <Button
                  type="button"
                  variant="outline"
                  className="w-full h-12 border-gray-300 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                  onClick={() => setStep("email")}
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Geri Dön
                </Button>
              </form>
            )}

            {/* Footer Links */}
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Şifrenizi hatırladınız mı?{" "}
                <Link
                  href="/login"
                  className="text-gray-900 hover:text-gray-700 transition-colors font-medium"
                >
                  Giriş Yap
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 