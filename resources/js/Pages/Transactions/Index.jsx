import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';
import { IconSearch, IconFilter, IconDownload, IconEye, IconPencil, IconTrash, IconX } from '@tabler/icons-react';

export default function Index({ auth, transactions, statistics }) {
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [paymentStatusFilter, setPaymentStatusFilter] = useState('all');
    const [dateFrom, setDateFrom] = useState('');
    const [dateTo, setDateTo] = useState('');
    const [showFilters, setShowFilters] = useState(false);

    const handleSearch = (e) => {
        e.preventDefault();
        filterTransactions();
    };

    const filterTransactions = () => {
        // Implementasi filter akan dilakukan di backend
        router.get(route('transactions.index'), {
            search: searchTerm,
            status: statusFilter,
            payment_status: paymentStatusFilter,
            date_from: dateFrom,
            date_to: dateTo,
        }, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const resetFilters = () => {
        setSearchTerm('');
        setStatusFilter('all');
        setPaymentStatusFilter('all');
        setDateFrom('');
        setDateTo('');
        router.get(route('transactions.index'));
    };

    const getStatusBadgeClass = (status) => {
        const classes = {
            'paid': 'bg-green-100 text-green-800',
            'unpaid': 'bg-red-100 text-red-800',
            'sending': 'bg-blue-100 text-blue-800',
            'accepted': 'bg-purple-100 text-purple-800',
        };
        return classes[status] || 'bg-gray-100 text-gray-800';
    };

    const getOrderStatusBadgeClass = (orderStatus) => {
        const classes = {
            'pending': 'bg-yellow-100 text-yellow-800',
            'processing': 'bg-blue-100 text-blue-800',
            'shipping': 'bg-indigo-100 text-indigo-800',
            'delivered': 'bg-green-100 text-green-800',
            'cancelled': 'bg-red-100 text-red-800',
        };
        return classes[orderStatus] || 'bg-gray-100 text-gray-800';
    };

    const exportToCSV = () => {
        router.post(route('transactions.export'));
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Manajemen Transaksi</h2>}
        >
            <Head title="Manajemen Transaksi" />

            <div className="py-12">
                <div className="max-w-full mx-auto sm:px-6 lg:px-8">
                    {/* Statistics Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                        <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                            <div className="p-6">
                                <div className="text-sm font-medium text-gray-500">Total Transaksi</div>
                                <div className="mt-2 text-3xl font-bold text-gray-900">{statistics?.total_transactions || 0}</div>
                            </div>
                        </div>
                        <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                            <div className="p-6">
                                <div className="text-sm font-medium text-gray-500">Transaksi Hari Ini</div>
                                <div className="mt-2 text-3xl font-bold text-green-600">{statistics?.today_transactions || 0}</div>
                            </div>
                        </div>
                        <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                            <div className="p-6">
                                <div className="text-sm font-medium text-gray-500">Total Pendapatan</div>
                                <div className="mt-2 text-3xl font-bold text-blue-600">
                                    Rp {(statistics?.total_revenue || 0).toLocaleString('id-ID')}
                                </div>
                            </div>
                        </div>
                        <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                            <div className="p-6">
                                <div className="text-sm font-medium text-gray-500">Pending</div>
                                <div className="mt-2 text-3xl font-bold text-yellow-600">{statistics?.pending_orders || 0}</div>
                            </div>
                        </div>
                    </div>

                    {/* Filters */}
                    <div className="bg-white shadow-sm sm:rounded-lg mb-6">
                        <div className="p-6">
                            <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4">
                                <div className="flex-1">
                                    <div className="relative">
                                        <input
                                            type="text"
                                            placeholder="Cari invoice, nama pelanggan, atau produk..."
                                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                        />
                                        <IconSearch className="absolute left-3 top-2.5 text-gray-400" size={20} />
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setShowFilters(!showFilters)}
                                    className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                                >
                                    <IconFilter size={20} />
                                    Filter
                                </button>
                                <button
                                    type="submit"
                                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                                >
                                    <IconSearch size={20} />
                                    Cari
                                </button>
                                <button
                                    type="button"
                                    onClick={exportToCSV}
                                    className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                                >
                                    <IconDownload size={20} />
                                    Export
                                </button>
                            </form>

                            {/* Advanced Filters */}
                            {showFilters && (
                                <div className="mt-4 pt-4 border-t grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Status Pembayaran</label>
                                        <select
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                            value={paymentStatusFilter}
                                            onChange={(e) => setPaymentStatusFilter(e.target.value)}
                                        >
                                            <option value="all">Semua</option>
                                            <option value="paid">Lunas</option>
                                            <option value="unpaid">Belum Lunas</option>
                                            <option value="cancelled">Dibatalkan</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Status Order</label>
                                        <select
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                            value={statusFilter}
                                            onChange={(e) => setStatusFilter(e.target.value)}
                                        >
                                            <option value="all">Semua</option>
                                            <option value="pending">Pending</option>
                                            <option value="processing">Diproses</option>
                                            <option value="shipping">Dikirim</option>
                                            <option value="delivered">Selesai</option>
                                            <option value="cancelled">Dibatalkan</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Tanggal</label>
                                        <div className="flex gap-2">
                                            <input
                                                type="date"
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                                value={dateFrom}
                                                onChange={(e) => setDateFrom(e.target.value)}
                                            />
                                            <span className="self-center">-</span>
                                            <input
                                                type="date"
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                                value={dateTo}
                                                onChange={(e) => setDateTo(e.target.value)}
                                            />
                                        </div>
                                    </div>
                                    <div className="md:col-span-3">
                                        <button
                                            type="button"
                                            onClick={resetFilters}
                                            className="flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:text-red-800"
                                        >
                                            <IconX size={16} />
                                            Reset Filter
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Transactions Table */}
                    <div className="bg-white shadow-sm sm:rounded-lg overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Invoice</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tanggal</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pelanggan</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pembayaran</th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {transactions.data.length > 0 ? (
                                        transactions.data.map((transaction) => (
                                            <tr key={transaction.id} className="hover:bg-gray-50">
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className="font-medium text-blue-600">{transaction.invoice}</span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {new Date(transaction.created_at).toLocaleDateString('id-ID', {
                                                        year: 'numeric',
                                                        month: 'short',
                                                        day: 'numeric',
                                                        hour: '2-digit',
                                                        minute: '2-digit'
                                                    })}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm font-medium text-gray-900">{transaction.customer_name || 'Umum'}</div>
                                                    <div className="text-sm text-gray-500">{transaction.customer_phone}</div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getOrderStatusBadgeClass(transaction.order_status)}`}>
                                                        {transaction.order_status}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadgeClass(transaction.status)}`}>
                                                        {transaction.status}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium text-gray-900">
                                                    Rp {Number(transaction.grand_total).toLocaleString('id-ID')}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                                                    <div className="flex justify-center gap-2">
                                                        <Link
                                                            href={route('transactions.show', transaction.id)}
                                                            className="text-blue-600 hover:text-blue-900"
                                                            title="Lihat Detail"
                                                        >
                                                            <IconEye size={18} />
                                                        </Link>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="7" className="px-6 py-8 text-center text-gray-500">
                                                Tidak ada transaksi ditemukan
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        {transactions.links && (
                            <div className="px-6 py-4 border-t border-gray-200">
                                <div className="flex items-center justify-between">
                                    <div className="text-sm text-gray-500">
                                        Menampilkan {transactions.from || 0} - {transactions.to || 0} dari {transactions.total || 0} transaksi
                                    </div>
                                    <div className="flex gap-2">
                                        {transactions.links.map((link, index) => (
                                            <button
                                                key={index}
                                                onClick={() => link.url && router.get(link.url)}
                                                disabled={!link.url}
                                                className={`px-3 py-1 rounded ${
                                                    link.active
                                                        ? 'bg-blue-600 text-white'
                                                        : link.url
                                                        ? 'bg-gray-200 hover:bg-gray-300'
                                                        : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                                }`}
                                                dangerouslySetInnerHTML={{ __html: link.label }}
                                            />
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
