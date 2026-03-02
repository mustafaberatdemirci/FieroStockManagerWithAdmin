import { useState, useEffect } from 'react';
import { Download, X, Smartphone } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
    prompt(): Promise<void>;
    userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export function PWAInstallPrompt() {
    const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
    const [showBanner, setShowBanner] = useState(false);
    const [isIOS, setIsIOS] = useState(false);

    useEffect(() => {
        // Check if already dismissed
        const dismissed = localStorage.getItem('pwa-install-dismissed');
        if (dismissed) return;

        // Check if already installed (standalone mode)
        if (window.matchMedia('(display-mode: standalone)').matches) return;

        // Detect iOS
        const ua = navigator.userAgent;
        const isiOS = /iPad|iPhone|iPod/.test(ua) && !(window as any).MSStream;
        setIsIOS(isiOS);

        // On iOS, show custom banner since beforeinstallprompt doesn't fire
        if (isiOS) {
            setTimeout(() => setShowBanner(true), 2000);
            return;
        }

        // Chrome/Edge/Samsung — capture native install prompt
        const handler = (e: Event) => {
            e.preventDefault();
            setDeferredPrompt(e as BeforeInstallPromptEvent);
            setTimeout(() => setShowBanner(true), 2000);
        };

        window.addEventListener('beforeinstallprompt', handler);
        return () => window.removeEventListener('beforeinstallprompt', handler);
    }, []);

    const handleInstall = async () => {
        if (deferredPrompt) {
            await deferredPrompt.prompt();
            const { outcome } = await deferredPrompt.userChoice;
            if (outcome === 'accepted') {
                setShowBanner(false);
            }
            setDeferredPrompt(null);
        }
    };

    const handleDismiss = () => {
        setShowBanner(false);
        localStorage.setItem('pwa-install-dismissed', 'true');
    };

    if (!showBanner) return null;

    return (
        <div className="fixed bottom-0 inset-x-0 z-[9999] p-4 animate-slide-up">
            <div className="max-w-md mx-auto bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden">
                {/* Header bar */}
                <div className="bg-gradient-to-r from-purple-600 to-purple-700 px-4 py-2 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-white">
                        <Smartphone className="w-4 h-4" />
                        <span className="text-sm font-medium">Uygulamayı Yükle</span>
                    </div>
                    <button
                        onClick={handleDismiss}
                        className="p-1 text-white/70 hover:text-white rounded-full hover:bg-white/10 transition-colors"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-4">
                    <div className="flex items-start gap-4">
                        <img src="/logo.png" alt="Fiero" className="w-14 h-14 rounded-xl shadow-sm" />
                        <div className="flex-1 min-w-0">
                            <h3 className="font-bold text-gray-900 text-base">Fiero Coffee & Food</h3>
                            <p className="text-sm text-gray-500 mt-0.5">
                                {isIOS
                                    ? 'Paylaş butonuna basın, ardından "Ana Ekrana Ekle" seçin.'
                                    : 'Hızlı erişim için ana ekranınıza ekleyin.'}
                            </p>
                        </div>
                    </div>

                    {!isIOS && (
                        <button
                            onClick={handleInstall}
                            className="mt-4 w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-purple-600 text-white rounded-xl font-medium hover:bg-purple-700 transition-colors active:scale-[0.98]"
                        >
                            <Download className="w-4 h-4" />
                            Yükle
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
