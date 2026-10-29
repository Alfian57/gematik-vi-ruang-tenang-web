"use client";

import { useState, useEffect, useCallback } from "react";
import { usePathname } from "next/navigation";
import { Download, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface BeforeInstallPromptEvent extends Event {
    prompt(): Promise<void>;
    userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

const DISMISS_STORAGE_KEY = "pwa-install-dismissed";
const DISMISS_COOLDOWN_MS = 60 * 60 * 1000; // 1 jam

function isDismissedRecently(): boolean {
    if (typeof window === "undefined") return false;
    try {
        const dismissed = localStorage.getItem(DISMISS_STORAGE_KEY);
        if (!dismissed) return false;
        const dismissedAt = parseInt(dismissed, 10);
        if (isNaN(dismissedAt)) return false;
        return Date.now() - dismissedAt < DISMISS_COOLDOWN_MS;
    } catch {
        return false;
    }
}

function isStandaloneMode(): boolean {
    if (typeof window === "undefined") return false;
    return (
        window.matchMedia("(display-mode: standalone)").matches ||
        Boolean((window.navigator as unknown as { standalone?: boolean }).standalone)
    );
}

export function PWAInstallPrompt() {
    const pathname = usePathname();
    const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
    const [showBanner, setShowBanner] = useState(false);
    const [isInstalled, setIsInstalled] = useState(false);

    // Pastikan banner disembunyikan jika user berpindah halaman dan masih dalam periode cooldown 1 jam
    useEffect(() => {
        if (isDismissedRecently() || isStandaloneMode()) {
            setShowBanner(false);
            setDeferredPrompt(null);
        }
    }, [pathname]);

    useEffect(() => {
        if (isStandaloneMode()) {
            setIsInstalled(true);
            return;
        }

        if (isDismissedRecently()) {
            return;
        }

        const handler = (e: Event) => {
            e.preventDefault();
            // Periksa kembali sebelum menampilkan, jangan sampai muncul jika sudah di-dismiss baru-baru ini
            if (isDismissedRecently() || isStandaloneMode()) {
                return;
            }
            setDeferredPrompt(e as BeforeInstallPromptEvent);
            setShowBanner(true);
        };

        const handleAppInstalled = () => {
            setIsInstalled(true);
            setShowBanner(false);
            setDeferredPrompt(null);
            try {
                localStorage.setItem(DISMISS_STORAGE_KEY, Date.now().toString());
            } catch {
                /* ignore storage error */
            }
        };

        window.addEventListener("beforeinstallprompt", handler);
        window.addEventListener("appinstalled", handleAppInstalled);

        return () => {
            window.removeEventListener("beforeinstallprompt", handler);
            window.removeEventListener("appinstalled", handleAppInstalled);
        };
    }, []);

    const handleInstall = async () => {
        if (!deferredPrompt) return;
        await deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        if (outcome === "accepted") {
            setIsInstalled(true);
        }
        setDeferredPrompt(null);
        setShowBanner(false);
    };

    const handleDismiss = useCallback(() => {
        setShowBanner(false);
        setDeferredPrompt(null);
        try {
            localStorage.setItem(DISMISS_STORAGE_KEY, Date.now().toString());
        } catch {
            /* ignore storage error */
        }
    }, []);

    if (isInstalled || !showBanner) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                className="fixed bottom-4 left-4 right-4 z-50 sm:left-auto sm:right-4 sm:max-w-sm"
            >
                <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-4 flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center shrink-0">
                        <Download className="w-5 h-5 text-red-500" />
                    </div>

                    <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-gray-900 text-sm">
                            Pasang Ruang Tenang
                        </h4>
                        <p className="text-xs text-gray-500 mt-0.5">
                            Akses lebih cepat langsung dari layar utama perangkatmu
                        </p>
                        <div className="flex gap-2 mt-3">
                            <button
                                onClick={handleInstall}
                                className="px-3 py-1.5 text-xs font-medium bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
                            >
                                Pasang
                            </button>
                            <button
                                onClick={handleDismiss}
                                className="px-3 py-1.5 text-xs font-medium text-gray-500 hover:text-gray-700 transition-colors"
                            >
                                Nanti Saja
                            </button>
                        </div>
                    </div>

                    <button
                        onClick={handleDismiss}
                        className="text-gray-400 hover:text-gray-600 transition-colors shrink-0"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>
            </motion.div>
        </AnimatePresence>
    );
}
