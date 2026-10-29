"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2, Phone, ShieldCheck } from "lucide-react";
import { ROUTES } from "@/lib/routes";
import { getSafeRedirect } from "@/lib/safe-redirect";
import { authService } from "@/services/api/auth";
import { useAuthStore } from "@/store/authStore";
import type { PhoneVerificationChallenge } from "@/services/api/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AuthIllustration, AuthMascotMini } from "@/components/shared/auth/AuthIllustration";

export default function VerifyPhonePage() {
  const router = useRouter();
  const verifyPhone = useAuthStore((state) => state.verifyPhone);
  const [challenge, setChallenge] = useState<PhoneVerificationChallenge | null>(null);
  const [number, setNumber] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    const saved = sessionStorage.getItem("phone-verification");
    if (!saved) {
      router.replace(ROUTES.LOGIN);
      return;
    }
    try {
      const parsed = JSON.parse(saved) as PhoneVerificationChallenge;
      if (!parsed.verification_token) throw new Error("missing token");
      setChallenge(parsed);
      setIsInitializing(false);
    } catch {
      router.replace(ROUTES.LOGIN);
    }
  }, [router]);

  async function sendCode(event: React.FormEvent) {
    event.preventDefault();
    if (!challenge) return;
    if (!/^(?:\+62|62|0)8\d{8,13}$/.test(number)) {
      setError("Nomor WhatsApp Indonesia tidak valid");
      return;
    }
    setBusy(true);
    setError("");
    try {
      await authService.setVerificationPhone(challenge.verification_token, number);
      const next = { ...challenge, phone_required: false };
      sessionStorage.setItem("phone-verification", JSON.stringify(next));
      setChallenge(next);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Gagal mengirim kode");
    } finally {
      setBusy(false);
    }
  }

  async function submitCode(event: React.FormEvent) {
    event.preventDefault();
    if (!challenge) return;
    if (!/^\d{6}$/.test(code)) {
      setError("Masukkan 6 digit kode OTP");
      return;
    }
    setBusy(true);
    setError("");
    try {
      await verifyPhone(challenge.verification_token, code);
      sessionStorage.removeItem("phone-verification");
      const destination = getSafeRedirect(
        sessionStorage.getItem("phone-verification-redirect"),
        ROUTES.DASHBOARD
      );
      sessionStorage.removeItem("phone-verification-redirect");
      router.replace(destination);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Kode OTP tidak valid");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="auth-page flex">
      {/* Left Side - Form Panel */}
      <div className="auth-form-panel w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="auth-form-content w-full max-w-md">
          {/* Logo & Header */}
          <div className="text-center mb-8">
            <Link href={ROUTES.HOME} className="inline-block mb-6">
              <Image
                src="/logo-full.webp"
                alt="Ruang Tenang"
                width={180}
                height={60}
                className="object-contain"
                style={{ width: "auto", height: "auto" }}
                priority
              />
            </Link>
            <AuthMascotMini pose="secure" />
            <h1 className="mb-2 text-3xl font-bold">
              {challenge?.phone_required ? "Nomor WhatsApp" : "Verifikasi WhatsApp"}
            </h1>
            <p className="text-gray-500">
              {challenge?.phone_required
                ? "Akunmu belum memiliki nomor WhatsApp. Tambahkan nomor untuk menerima kode verifikasi."
                : "Masukkan 6 digit kode OTP yang dikirim ke nomor WhatsApp akunmu. Kode berlaku 10 menit."}
            </p>
          </div>

          {isInitializing ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : challenge?.phone_required ? (
            <form onSubmit={sendCode} className="space-y-6">
              {error && (
                <div role="alert" className="p-4 rounded-xl bg-red-50 border border-red-100 text-red-600 text-sm">
                  {error}
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="phone" className="text-gray-700 font-medium">Nomor WhatsApp</Label>
                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 z-10 pointer-events-none" />
                  <Input
                    id="phone"
                    type="tel"
                    autoComplete="tel"
                    placeholder="081234567890"
                    value={number}
                    onChange={(event) => setNumber(event.target.value)}
                    className="pl-12 h-12 rounded-xl border-gray-200 focus:border-primary focus:ring-primary"
                    required
                  />
                </div>
                <p className="text-xs text-gray-500">
                  Masukkan nomor WhatsApp aktif dengan awalan 08 atau 62.
                </p>
              </div>

              <Button
                type="submit"
                className="w-full h-12 bg-primary hover:bg-primary/90 text-white rounded-xl text-base font-semibold"
                disabled={busy}
              >
                {busy ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin mr-2" />
                    Memproses...
                  </>
                ) : (
                  "Kirim Kode Verifikasi"
                )}
              </Button>

              <div className="text-center">
                <Link
                  href={ROUTES.LOGIN}
                  className="inline-flex items-center justify-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Kembali ke Login
                </Link>
              </div>
            </form>
          ) : (
            <form onSubmit={submitCode} className="space-y-6">
              {error && (
                <div role="alert" className="p-4 rounded-xl bg-red-50 border border-red-100 text-red-600 text-sm">
                  {error}
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="code" className="text-gray-700 font-medium">Kode OTP</Label>
                <div className="relative">
                  <ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 z-10 pointer-events-none" />
                  <Input
                    id="code"
                    type="text"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    maxLength={6}
                    placeholder="Masukkan 6 digit kode OTP"
                    value={code}
                    onChange={(event) => setCode(event.target.value)}
                    className="pl-12 h-12 rounded-xl border-gray-200 focus:border-primary focus:ring-primary"
                    required
                  />
                </div>
                <p className="text-xs text-gray-500">
                  Kode berupa 6 angka yang dikirim melalui WhatsApp.
                </p>
              </div>

              <Button
                type="submit"
                className="w-full h-12 bg-primary hover:bg-primary/90 text-white rounded-xl text-base font-semibold"
                disabled={busy}
              >
                {busy ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin mr-2" />
                    Memproses...
                  </>
                ) : (
                  "Verifikasi dan Masuk"
                )}
              </Button>

              <div className="text-center">
                <Link
                  href={ROUTES.LOGIN}
                  className="inline-flex items-center justify-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Kembali ke login untuk meminta kode baru
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>

      {/* Right Side - Illustration */}
      <AuthIllustration
        title="Verifikasi Akunmu"
        description="Langkah terakhir untuk memastikan keamanan akunmu. Masukkan kode OTP WhatsApp untuk melanjutkan."
        pose="secure"
      />
    </div>
  );
}
