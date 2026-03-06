import { Store, History, LogOut } from 'lucide-react';

interface PageHeaderProps {
    onNavigateOrders: () => void;
    onLogout: () => void;
}

export function PageHeader({ onNavigateOrders, onLogout }: PageHeaderProps) {
    return (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 sm:gap-6 mb-6">
            <div className="flex items-center gap-2 sm:gap-3">
                <Store className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600" />
                <h1 className="text-xl sm:text-2xl font-bold text-gray-800">
                    Stok Talep Formu
                </h1>
            </div>
            <div className="flex items-center gap-2">
                <button
                    onClick={onNavigateOrders}
                    className="flex items-center justify-center gap-2 px-4 py-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors duration-200"
                >
                    <History className="w-5 h-5" />
                    <span className="font-medium">Sipariş Geçmişi</span>
                </button>
                <button
                    onClick={onLogout}
                    className="flex items-center justify-center gap-2 px-4 py-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors duration-200"
                >
                    <LogOut className="w-5 h-5" />
                    <span className="font-medium">Çıkış Yap</span>
                </button>
            </div>
        </div>
    );
}
