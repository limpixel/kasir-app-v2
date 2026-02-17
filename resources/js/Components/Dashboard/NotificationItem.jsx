import { Link } from '@inertiajs/react';
import { IconShoppingCart, IconPackage, IconTruck, IconCheck, IconX, IconClock } from '@tabler/icons-react';

export default function NotificationItem({ transaction, onClick }) {
    const getStatusIcon = (orderStatus) => {
        switch (orderStatus) {
            case 'pending':
                return { icon: IconClock, color: 'text-yellow-500', bg: 'bg-yellow-100' };
            case 'processing':
                return { icon: IconPackage, color: 'text-blue-500', bg: 'bg-blue-100' };
            case 'shipping':
                return { icon: IconTruck, color: 'text-indigo-500', bg: 'bg-indigo-100' };
            case 'delivered':
                return { icon: IconCheck, color: 'text-green-500', bg: 'bg-green-100' };
            case 'cancelled':
                return { icon: IconX, color: 'text-red-500', bg: 'bg-red-100' };
            default:
                return { icon: IconShoppingCart, color: 'text-gray-500', bg: 'bg-gray-100' };
        }
    };

    const getStatusLabel = (orderStatus) => {
        const labels = {
            'pending': 'Menunggu Konfirmasi',
            'processing': 'Diproses',
            'shipping': 'Dikirim',
            'delivered': 'Selesai',
            'cancelled': 'Dibatalkan',
        };
        return labels[orderStatus] || orderStatus;
    };

    const getTimeAgo = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffInSeconds = Math.floor((now - date) / 1000);

        if (diffInSeconds < 60) return 'Baru saja';
        if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} menit yang lalu`;
        if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} jam yang lalu`;
        return `${Math.floor(diffInSeconds / 86400)} hari yang lalu`;
    };

    const statusInfo = getStatusIcon(transaction.order_status);
    const StatusIcon = statusInfo.icon;

    return (
        <Link
            href={route('transactions.show', transaction.id)}
            onClick={onClick}
            className="block w-full p-4 hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors border-b border-gray-100 dark:border-gray-800 last:border-b-0"
        >
            <div className="flex items-start gap-3">
                {/* Avatar/Icon */}
                <div className={`flex-shrink-0 w-10 h-10 rounded-full ${statusInfo.bg} flex items-center justify-center`}>
                    <StatusIcon size={20} className={statusInfo.color} strokeWidth={1.5} />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                    {/* Header */}
                    <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">
                                {transaction.customer_name || 'Pelanggan Umum'}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                                {transaction.invoice}
                            </p>
                        </div>
                        <span className="text-xs text-gray-400 dark:text-gray-500 whitespace-nowrap">
                            {getTimeAgo(transaction.created_at)}
                        </span>
                    </div>

                    {/* Message */}
                    <p className="text-sm text-gray-600 dark:text-gray-300 mt-1 line-clamp-2">
                        Order baru - {transaction.details?.length || 0} produk | Total: Rp {Number(transaction.grand_total).toLocaleString('id-ID')}
                    </p>

                    {/* Footer with status */}
                    <div className="flex items-center gap-2 mt-2">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                            transaction.order_status === 'delivered' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                            transaction.order_status === 'processing' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' :
                            transaction.order_status === 'shipping' ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400' :
                            transaction.order_status === 'cancelled' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                            'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                        }`}>
                            {getStatusLabel(transaction.order_status)}
                        </span>
                        {transaction.payment_method && (
                            <span className="text-xs text-gray-400 dark:text-gray-500">
                                • {transaction.payment_method}
                            </span>
                        )}
                    </div>
                </div>
            </div>
        </Link>
    );
}
