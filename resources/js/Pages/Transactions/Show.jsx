import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';
import { IconArrowLeft, IconPrinter, IconDownload, IconCheck, IconX, IconTruck, IconPackage, IconPhoto } from '@tabler/icons-react';

export default function Show({ auth, transaction }) {
    const [updatingStatus, setUpdatingStatus] = useState(false);
    const [showUpdateModal, setShowUpdateModal] = useState(false);
    const [newOrderStatus, setNewOrderStatus] = useState(transaction.order_status);
    const [notes, setNotes] = useState(transaction.notes || '');

    const handleUpdateStatus = () => {
        setUpdatingStatus(true);
        
        router.put(route('transactions.update-status', transaction.id), {
            order_status: newOrderStatus,
            notes: notes,
        }, {
            onSuccess: () => {
                setShowUpdateModal(false);
                setUpdatingStatus(false);
            },
            onError: () => {
                setUpdatingStatus(false);
            },
        });
    };

    const handlePrint = () => {
        window.open(route('transactions.print', transaction.invoice), '_blank');
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

    const getOrderStatusIcon = (orderStatus) => {
        switch (orderStatus) {
            case 'pending':
                return <IconPackage size={20} />;
            case 'processing':
                return <IconPackage size={20} />;
            case 'shipping':
                return <IconTruck size={20} />;
            case 'delivered':
                return <IconCheck size={20} />;
            case 'cancelled':
                return <IconX size={20} />;
            default:
                return <IconPackage size={20} />;
        }
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Detail Transaksi</h2>}
        >
            <Head title={`Detail Transaksi - ${transaction.invoice}`} />

            <div className="py-12">
                <div className="max-w-5xl mx-auto sm:px-6 lg:px-8">
                    {/* Header Actions */}
                    <div className="mb-6 flex justify-between items-center">
                        <Link
                            href={route('transactions.index')}
                            className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
                        >
                            <IconArrowLeft size={20} />
                            Kembali
                        </Link>
                        <div className="flex gap-2">
                            <button
                                onClick={handlePrint}
                                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                            >
                                <IconPrinter size={18} />
                                Cetak
                            </button>
                            <button
                                onClick={() => setShowUpdateModal(true)}
                                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                            >
                                <IconCheck size={18} />
                                Update Status
                            </button>
                        </div>
                    </div>

                    {/* Transaction Info Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                        <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                            <div className="p-6">
                                <div className="text-sm font-medium text-gray-500">Invoice</div>
                                <div className="mt-1 text-2xl font-bold text-gray-900">{transaction.invoice}</div>
                                <div className="mt-2 text-sm text-gray-600">
                                    {new Date(transaction.created_at).toLocaleDateString('id-ID', {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric',
                                        hour: '2-digit',
                                        minute: '2-digit'
                                    })}
                                </div>
                            </div>
                        </div>
                        <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                            <div className="p-6">
                                <div className="text-sm font-medium text-gray-500">Status Order</div>
                                <div className="mt-2 flex items-center gap-2">
                                    <span className={`px-3 py-1 text-sm font-semibold rounded-full ${getOrderStatusBadgeClass(transaction.order_status)}`}>
                                        {getOrderStatusIcon(transaction.order_status)}
                                        <span className="ml-1">{transaction.order_status}</span>
                                    </span>
                                </div>
                                <div className="mt-2 text-sm text-gray-600">
                                    Status Pembayaran: <span className={`font-semibold ${getStatusBadgeClass(transaction.status)}`}>{transaction.status}</span>
                                </div>
                            </div>
                        </div>
                        <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                            <div className="p-6">
                                <div className="text-sm font-medium text-gray-500">Total Pembayaran</div>
                                <div className="mt-1 text-2xl font-bold text-gray-900">
                                    Rp {Number(transaction.grand_total).toLocaleString('id-ID')}
                                </div>
                                {transaction.payment_method && (
                                    <div className="mt-2 text-sm text-gray-600">
                                        Via: {transaction.payment_method}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Customer Information */}
                    <div className="bg-white shadow-sm sm:rounded-lg mb-6">
                        <div className="p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Informasi Pelanggan</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-500">Nama</label>
                                    <p className="mt-1 text-gray-900">{transaction.customer_name || '-'}</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-500">Telepon</label>
                                    <p className="mt-1 text-gray-900">{transaction.customer_phone || '-'}</p>
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-500">Alamat</label>
                                    <p className="mt-1 text-gray-900">{transaction.customer_address || '-'}</p>
                                </div>
                                {transaction.city && (
                                    <>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-500">Kota</label>
                                            <p className="mt-1 text-gray-900">{transaction.city}</p>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-500">Provinsi</label>
                                            <p className="mt-1 text-gray-900">{transaction.province}</p>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Order Items */}
                    <div className="bg-white shadow-sm sm:rounded-lg mb-6">
                        <div className="p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Detail Pesanan</h3>
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Produk</th>
                                            <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Qty</th>
                                            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Harga</th>
                                            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Subtotal</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {transaction.details.map((detail, index) => (
                                            <tr key={index}>
                                                <td className="px-4 py-3 text-sm text-gray-900">
                                                    {detail.product?.name || 'Produk tidak tersedia'}
                                                </td>
                                                <td className="px-4 py-3 text-sm text-gray-900 text-center">
                                                    {detail.qty}
                                                </td>
                                                <td className="px-4 py-3 text-sm text-gray-900 text-right">
                                                    Rp {Number(detail.price / detail.qty).toLocaleString('id-ID')}
                                                </td>
                                                <td className="px-4 py-3 text-sm font-medium text-gray-900 text-right">
                                                    Rp {Number(detail.price).toLocaleString('id-ID')}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                    <tfoot className="bg-gray-50">
                                        <tr>
                                            <td colSpan="3" className="px-4 py-3 text-right text-sm font-medium text-gray-900">Subtotal:</td>
                                            <td className="px-4 py-3 text-right text-sm font-medium text-gray-900">
                                                Rp {(Number(transaction.grand_total) - Number(transaction.shipping_cost || 0)).toLocaleString('id-ID')}
                                            </td>
                                        </tr>
                                        {transaction.shipping_cost > 0 && (
                                            <tr>
                                                <td colSpan="3" className="px-4 py-3 text-right text-sm font-medium text-gray-900">Ongkos Kirim:</td>
                                                <td className="px-4 py-3 text-right text-sm font-medium text-gray-900">
                                                    Rp {Number(transaction.shipping_cost).toLocaleString('id-ID')}
                                                </td>
                                            </tr>
                                        )}
                                        <tr>
                                            <td colSpan="3" className="px-4 py-3 text-right text-sm font-bold text-gray-900">Total:</td>
                                            <td className="px-4 py-3 text-right text-lg font-bold text-gray-900">
                                                Rp {Number(transaction.grand_total).toLocaleString('id-ID')}
                                            </td>
                                        </tr>
                                    </tfoot>
                                </table>
                            </div>
                        </div>
                    </div>

                    {/* Timeline Status */}
                    <div className="bg-white shadow-sm sm:rounded-lg mb-6">
                        <div className="p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Timeline Order</h3>
                            <div className="space-y-4">
                                <div className="flex items-start gap-4">
                                    <div className={`w-3 h-3 rounded-full mt-1 ${transaction.order_date ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                                    <div>
                                        <div className="font-medium text-gray-900">Order Diterima</div>
                                        <div className="text-sm text-gray-500">
                                            {transaction.order_date ? new Date(transaction.order_date).toLocaleDateString('id-ID', {
                                                year: 'numeric',
                                                month: 'long',
                                                day: 'numeric',
                                                hour: '2-digit',
                                                minute: '2-digit'
                                            }) : 'Belum diproses'}
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-start gap-4">
                                    <div className={`w-3 h-3 rounded-full mt-1 ${transaction.shipping_date ? 'bg-blue-500' : 'bg-gray-300'}`}></div>
                                    <div>
                                        <div className="font-medium text-gray-900">Dikirim</div>
                                        <div className="text-sm text-gray-500">
                                            {transaction.shipping_date ? new Date(transaction.shipping_date).toLocaleDateString('id-ID', {
                                                year: 'numeric',
                                                month: 'long',
                                                day: 'numeric',
                                                hour: '2-digit',
                                                minute: '2-digit'
                                            }) : 'Belum dikirim'}
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-start gap-4">
                                    <div className={`w-3 h-3 rounded-full mt-1 ${transaction.delivered_date ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                                    <div>
                                        <div className="font-medium text-gray-900">Diterima</div>
                                        <div className="text-sm text-gray-500">
                                            {transaction.delivered_date ? new Date(transaction.delivered_date).toLocaleDateString('id-ID', {
                                                year: 'numeric',
                                                month: 'long',
                                                day: 'numeric',
                                                hour: '2-digit',
                                                minute: '2-digit'
                                            }) : 'Belum diterima'}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Payment Proof */}
                    {transaction.payment_proof && (
                        <div className="bg-white shadow-sm sm:rounded-lg mb-6">
                            <div className="p-6">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                    <IconPhoto size={20} className="text-blue-600" />
                                    Bukti Pembayaran
                                </h3>
                                <div className="space-y-4">
                                    <div className="flex items-center gap-2 text-sm text-gray-600">
                                        <span className="font-medium">Diupload pada:</span>
                                        {transaction.payment_proof_uploaded_at ? (
                                            <span>{new Date(transaction.payment_proof_uploaded_at).toLocaleDateString('id-ID', {
                                                year: 'numeric',
                                                month: 'long',
                                                day: 'numeric',
                                                hour: '2-digit',
                                                minute: '2-digit'
                                            })}</span>
                                        ) : (
                                            <span className="text-gray-400">-</span>
                                        )}
                                    </div>
                                    <div className="mt-4">
                                        <img
                                            src={`/storage/${transaction.payment_proof}`}
                                            alt="Bukti Pembayaran"
                                            className="max-w-full h-auto max-h-96 rounded-lg border border-gray-200 shadow-sm"
                                            onError={(e) => {
                                                e.target.src = 'https://via.placeholder.com/400x300?text=Image+Not+Found';
                                            }}
                                        />
                                    </div>
                                    <div className="mt-4">
                                        <a
                                            href={`/storage/${transaction.payment_proof}`}
                                            download
                                            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium"
                                        >
                                            <IconDownload size={16} />
                                            Download Bukti Pembayaran
                                        </a>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Notes */}
                    {(transaction.notes || transaction.customer_notes) && (
                        <div className="bg-white shadow-sm sm:rounded-lg">
                            <div className="p-6">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">Catatan</h3>
                                {transaction.customer_notes && (
                                    <div className="mb-4">
                                        <label className="block text-sm font-medium text-gray-500">Catatan Pelanggan</label>
                                        <p className="mt-1 text-gray-900">{transaction.customer_notes}</p>
                                    </div>
                                )}
                                {transaction.notes && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-500">Catatan Internal</label>
                                        <p className="mt-1 text-gray-900">{transaction.notes}</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Update Status Modal */}
            {showUpdateModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto overflow-x-hidden bg-black bg-opacity-50">
                    <div className="relative bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
                        <div className="p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Update Status Order</h3>
                            
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Status Order</label>
                                    <select
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                        value={newOrderStatus}
                                        onChange={(e) => setNewOrderStatus(e.target.value)}
                                    >
                                        <option value="pending">Pending</option>
                                        <option value="processing">Diproses</option>
                                        <option value="shipping">Dikirim</option>
                                        <option value="delivered">Selesai</option>
                                        <option value="cancelled">Dibatalkan</option>
                                    </select>
                                </div>
                                
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Catatan Internal</label>
                                    <textarea
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                        rows="3"
                                        value={notes}
                                        onChange={(e) => setNotes(e.target.value)}
                                        placeholder="Tambahkan catatan..."
                                    />
                                </div>
                            </div>

                            <div className="flex gap-3 mt-6">
                                <button
                                    onClick={() => setShowUpdateModal(false)}
                                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                                >
                                    Batal
                                </button>
                                <button
                                    onClick={handleUpdateStatus}
                                    disabled={updatingStatus}
                                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-400"
                                >
                                    {updatingStatus ? 'Menyimpan...' : 'Simpan'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </AuthenticatedLayout>
    );
}
