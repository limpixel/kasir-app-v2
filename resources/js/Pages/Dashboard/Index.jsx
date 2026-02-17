import Card from '@/Components/Dashboard/Card';
import Table from '@/Components/Dashboard/Table';
import Widget from '@/Components/Dashboard/Widget';
import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, Link } from '@inertiajs/react';
import { IconBox, IconCategory, IconMoneybag, IconUsers, IconShoppingCart, IconClock, IconCheck, IconX } from '@tabler/icons-react';

export default function Dashboard({ statistics, recentTransactions }) {
    return (
        <>
            <Head title='Dashboard' />
            
            {/* Statistics Widgets */}
            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6'>
                <Widget
                    title={'Kategori'}
                    subtitle={'Total Kategori'}
                    color={'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200'}
                    icon={<IconCategory size={'20'} strokeWidth={'1.5'} />}
                    total={statistics?.categories || 0}
                />
                <Widget
                    title={'Produk'}
                    subtitle={'Total Produk'}
                    color={'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-200'}
                    icon={<IconBox size={'20'} strokeWidth={'1.5'} />}
                    total={statistics?.products || 0}
                />
                <Widget
                    title={'Transaksi'}
                    subtitle={'Total Transaksi'}
                    color={'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-200'}
                    icon={<IconShoppingCart size={'20'} strokeWidth={'1.5'} />}
                    total={statistics?.total_transactions || 0}
                />
                <Widget
                    title={'Pendapatan'}
                    subtitle={'Total Pendapatan'}
                    color={'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-200'}
                    icon={<IconMoneybag size={'20'} strokeWidth={'1.5'} />}
                    total={`Rp ${(statistics?.total_revenue || 0).toLocaleString('id-ID')}`}
                />
            </div>

            {/* Today's Statistics */}
            <div className='grid grid-cols-1 md:grid-cols-3 gap-4 mb-6'>
                <Widget
                    title={'Transaksi Hari Ini'}
                    subtitle={'Transaksi baru hari ini'}
                    color={'bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-200'}
                    icon={<IconClock size={'20'} strokeWidth={'1.5'} />}
                    total={statistics?.today_transactions || 0}
                />
                <Widget
                    title={'Pesanan Pending'}
                    subtitle={'Perlu diproses'}
                    color={'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-200'}
                    icon={<IconClock size={'20'} strokeWidth={'1.5'} />}
                    total={statistics?.pending_orders || 0}
                />
                <Widget
                    title={'Selesai'}
                    subtitle={'Transaksi selesai'}
                    color={'bg-teal-100 text-teal-700 dark:bg-teal-900 dark:text-teal-200'}
                    icon={<IconCheck size={'20'} strokeWidth={'1.5'} />}
                    total={statistics?.completed_orders || 0}
                />
            </div>

            {/* Recent Transactions Table */}
            <div className='bg-white dark:bg-gray-950 rounded-lg shadow p-6'>
                <div className='flex justify-between items-center mb-4'>
                    <h3 className='text-lg font-semibold text-gray-900 dark:text-gray-200'>Transaksi Terbaru</h3>
                    <Link
                        href={route('transactions.index')}
                        className='text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300'
                    >
                        Lihat Semua →
                    </Link>
                </div>
                <div className='overflow-x-auto'>
                    <table className='min-w-full divide-y divide-gray-200 dark:divide-gray-800'>
                        <thead className='bg-gray-50 dark:bg-gray-900'>
                            <tr>
                                <th className='px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase'>Invoice</th>
                                <th className='px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase'>Tanggal</th>
                                <th className='px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase'>Pelanggan</th>
                                <th className='px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase'>Status</th>
                                <th className='px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase'>Total</th>
                            </tr>
                        </thead>
                        <tbody className='bg-white dark:bg-gray-950 divide-y divide-gray-200 dark:divide-gray-800'>
                            {recentTransactions && recentTransactions.length > 0 ? (
                                recentTransactions.map((transaction) => (
                                    <tr key={transaction.id} className='hover:bg-gray-50 dark:hover:bg-gray-900'>
                                        <td className='px-4 py-3 whitespace-nowrap font-medium text-blue-600 dark:text-blue-400'>
                                            {transaction.invoice}
                                        </td>
                                        <td className='px-4 py-3 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400'>
                                            {new Date(transaction.created_at).toLocaleDateString('id-ID', {
                                                day: 'numeric',
                                                month: 'short',
                                                hour: '2-digit',
                                                minute: '2-digit'
                                            })}
                                        </td>
                                        <td className='px-4 py-3 whitespace-nowrap text-sm text-gray-900 dark:text-gray-200'>
                                            {transaction.customer_name || 'Umum'}
                                        </td>
                                        <td className='px-4 py-3 whitespace-nowrap'>
                                            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                                                transaction.order_status === 'delivered' ? 'bg-green-100 text-green-800' :
                                                transaction.order_status === 'processing' ? 'bg-blue-100 text-blue-800' :
                                                transaction.order_status === 'shipping' ? 'bg-indigo-100 text-indigo-800' :
                                                transaction.order_status === 'cancelled' ? 'bg-red-100 text-red-800' :
                                                'bg-yellow-100 text-yellow-800'
                                            }`}>
                                                {transaction.order_status}
                                            </span>
                                        </td>
                                        <td className='px-4 py-3 whitespace-nowrap text-right text-sm font-medium text-gray-900 dark:text-gray-200'>
                                            Rp {Number(transaction.grand_total).toLocaleString('id-ID')}
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan='5' className='px-4 py-8 text-center text-gray-500'>
                                        Belum ada transaksi
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </>
    );
}

Dashboard.layout = page => <DashboardLayout children={page} />
