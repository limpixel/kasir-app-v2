import React, { useState, useEffect, useRef, useCallback } from 'react'
import { Menu, Transition } from '@headlessui/react'
import { IconBell, IconDots, IconCheck, IconX, IconRefresh, IconTrash, IconEye } from '@tabler/icons-react'
import NotificationItem from '@/Components/Dashboard/NotificationItem'
import { router } from '@inertiajs/react'

export default function Notification({ newTransactionsCount = 0, recentTransactions = [] }) {
    // State untuk notifikasi
    const [notifications, setNotifications] = useState([]);
    const [totalCount, setTotalCount] = useState(newTransactionsCount || 0);
    const [isLoading, setIsLoading] = useState(false);
    
    // define state isMobile
    const [isMobile, setIsMobile] = useState(false);
    // define state isOpen
    const [isOpen, setIsOpen] = useState(false);
    // define ref notification
    const notificationRef = useRef(null);
    // define state active tab
    const [activeTab, setActiveTab] = useState('all'); // 'all', 'unread', 'pending'

    // Fetch notifications from API
    const fetchNotifications = useCallback(async () => {
        try {
            const response = await fetch(route('api.notifications'), {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                },
                credentials: 'same-origin',
            });
            
            if (response.ok) {
                const data = await response.json();
                setNotifications(data.notifications || []);
                setTotalCount(data.unread_count || data.notifications?.length || 0);
            }
        } catch (error) {
            console.error('Error fetching notifications:', error);
        }
    }, []);

    // Mark all as read
    const handleMarkAllRead = async () => {
        try {
            const response = await fetch(route('api.notifications.mark-read'), {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                    'X-Requested-With': 'XMLHttpRequest',
                },
                credentials: 'same-origin',
            });
            
            if (response.ok) {
                setTotalCount(0);
                await fetchNotifications();
            }
        } catch (error) {
            console.error('Error marking notifications as read:', error);
        }
    };

    // Clear all notifications
    const handleClearAll = () => {
        // TODO: Implement clear functionality
        console.log('Clear all notifications');
    };

    // Refresh notifications manually
    const handleRefresh = async () => {
        setIsLoading(true);
        await fetchNotifications();
        setIsLoading(false);
    };

    // define method handleClickOutside
    const handleClickOutside = (event) => {
        if (notificationRef.current && !notificationRef.current.contains(event.target)) {
            setIsOpen(false);
        }
    };

    // Initial fetch and polling
    useEffect(() => {
        // Fetch immediately
        fetchNotifications();

        // Poll every 30 seconds
        const pollInterval = setInterval(fetchNotifications, 30000);

        return () => clearInterval(pollInterval);
    }, [fetchNotifications]);

    // define useEffect for resize
    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth <= 768);
        };

        window.addEventListener('resize', handleResize);
        window.addEventListener("mousedown", handleClickOutside);

        handleResize();

        return () => {
            window.removeEventListener('resize', handleResize);
            window.removeEventListener('mousedown', handleClickOutside);
        };
    }, [])

    // Filter notifications based on active tab
    const filteredNotifications = notifications.filter(notification => {
        if (activeTab === 'unread') return !notification.is_read;
        if (activeTab === 'pending') return notification.order_status === 'pending';
        return true; // 'all'
    });

    return (
        <>
            {isMobile === false ?
                <Menu className='relative z-50' as="div">
                    <Menu.Button className='flex items-center rounded-md group p-2 relative'>
                        <div className='absolute text-[8px] font-semibold border border-rose-500/40 bg-rose-500/10 text-rose-500 hover:bg-rose-500/20 top-0 -right-2 rounded-md px-1.5 py-0.5 group-hover:scale-125 duration-300 ease-in'>
                            {totalCount > 99 ? '99+' : totalCount}
                        </div>
                        <IconBell strokeWidth={1.5} size={18} className='text-gray-700 dark:text-gray-400' />
                    </Menu.Button>
                    <Transition
                        enter="transition duration-100 ease-out"
                        enterFrom="transform scale-95 opacity-0"
                        enterTo="transform scale-100 opacity-100"
                        leave="transition duration-75 ease-out"
                        leaveFrom="transform scale-100 opacity-100"
                        leaveTo="transform scale-95 opacity-0"
                    >
                        <Menu.Items className='absolute rounded-lg w-[450px] border md:right-0 z-[100] bg-white dark:bg-gray-950 dark:border-gray-900 shadow-xl max-h-[600px] flex flex-col'>
                            {/* Header */}
                            <div className='flex justify-between items-center gap-2 p-4 border-b dark:border-gray-900'>
                                <div className='flex items-center gap-2'>
                                    <div className='text-lg font-bold text-gray-700 dark:text-gray-200'>Notifikasi</div>
                                    {totalCount > 0 && (
                                        <span className='px-2 py-0.5 bg-blue-500 text-white text-xs rounded-full'>
                                            {totalCount}
                                        </span>
                                    )}
                                </div>
                                <div className='flex items-center gap-1'>
                                    <button
                                        onClick={handleRefresh}
                                        className={`p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-900 text-gray-500 dark:text-gray-400 ${isLoading ? 'animate-spin' : ''}`}
                                        title='Refresh'
                                    >
                                        <IconRefresh size={16} />
                                    </button>
                                    <button
                                        onClick={handleMarkAllRead}
                                        className='p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-900 text-gray-500 dark:text-gray-400'
                                        title='Tandai semua dibaca'
                                    >
                                        <IconCheck size={16} />
                                    </button>
                                    <button
                                        onClick={handleClearAll}
                                        className='p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-900 text-gray-500 dark:text-gray-400'
                                        title='Hapus semua'
                                    >
                                        <IconTrash size={16} />
                                    </button>
                                    <IconDots className='text-gray-500 dark:text-gray-200 cursor-pointer' size={20} />
                                </div>
                            </div>

                            {/* Tabs */}
                            <div className='flex border-b dark:border-gray-900'>
                                <button
                                    onClick={() => setActiveTab('all')}
                                    className={`flex-1 px-4 py-2 text-sm font-medium transition-colors ${
                                        activeTab === 'all'
                                            ? 'text-blue-600 border-b-2 border-blue-600 dark:text-blue-400'
                                            : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                                    }`}
                                >
                                    Semua
                                </button>
                                <button
                                    onClick={() => setActiveTab('pending')}
                                    className={`flex-1 px-4 py-2 text-sm font-medium transition-colors ${
                                        activeTab === 'pending'
                                            ? 'text-blue-600 border-b-2 border-blue-600 dark:text-blue-400'
                                            : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                                    }`}
                                >
                                    Pending
                                </button>
                                <button
                                    onClick={() => setActiveTab('unread')}
                                    className={`flex-1 px-4 py-2 text-sm font-medium transition-colors ${
                                        activeTab === 'unread'
                                            ? 'text-blue-600 border-b-2 border-blue-600 dark:text-blue-400'
                                            : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                                    }`}
                                >
                                    Belum Dibaca
                                </button>
                            </div>

                            {/* Notification List */}
                            <div className='flex-1 overflow-y-auto max-h-[450px]'>
                                {isLoading && notifications.length === 0 ? (
                                    <div className='flex flex-col items-center justify-center py-12'>
                                        <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500'></div>
                                    </div>
                                ) : filteredNotifications.length === 0 ? (
                                    <div className='flex flex-col items-center justify-center py-12 text-gray-500 dark:text-gray-400'>
                                        <IconBell size={48} strokeWidth={1} className='mb-3 opacity-50' />
                                        <p className='text-sm'>Tidak ada notifikasi</p>
                                    </div>
                                ) : (
                                    <div className='flex flex-col'>
                                        {filteredNotifications.map((notification, i) => (
                                            <NotificationItem
                                                key={notification.id}
                                                transaction={notification}
                                                onClick={() => setIsOpen(false)}
                                            />
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Footer with View All */}
                            <div className='p-3 border-t dark:border-gray-900'>
                                <a
                                    href={route('transactions.index')}
                                    className='flex items-center justify-center gap-2 w-full px-4 py-2 text-sm text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors font-medium'
                                >
                                    <IconEye size={16} />
                                    Lihat Semua Transaksi
                                </a>
                            </div>
                        </Menu.Items>
                    </Transition>
                </Menu>
                :
                <div ref={notificationRef}>
                    <button className='flex items-center rounded-md group p-2 relative' onClick={() => setIsOpen(!isOpen)}>
                        <div className='absolute text-[8px] font-semibold border border-rose-500/40 bg-rose-500/10 text-rose-500 hover:bg-rose-500/20 top-0 -right-2 rounded-md px-1.5 py-0.5 group-hover:scale-125 duration-300 ease-in'>
                            {totalCount > 99 ? '99+' : totalCount}
                        </div>
                        <IconBell strokeWidth={1.5} size={18} className='text-gray-500 dark:text-gray-400' />
                    </button>
                    <div className={`${isOpen ? 'translate-x-0 opacity-100' : 'translate-x-full'} fixed top-0 right-0 z-50 w-[350px] h-full transition-all duration-300 transform border-l bg-white dark:bg-gray-950 dark:border-gray-900 shadow-2xl`}>
                        <div className='flex flex-col h-full'>
                            {/* Header */}
                            <div className='flex justify-between items-center gap-2 p-4 border-b dark:border-gray-900'>
                                <div className='flex items-center gap-2'>
                                    <div className='text-base font-bold text-gray-700 dark:text-gray-200'>Notifikasi</div>
                                    {totalCount > 0 && (
                                        <span className='px-2 py-0.5 bg-blue-500 text-white text-xs rounded-full'>
                                            {totalCount}
                                        </span>
                                    )}
                                </div>
                                <div className='flex items-center gap-1'>
                                    <button
                                        onClick={handleRefresh}
                                        className={`p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-900 text-gray-500 dark:text-gray-400 ${isLoading ? 'animate-spin' : ''}`}
                                    >
                                        <IconRefresh size={16} />
                                    </button>
                                    <button
                                        onClick={handleMarkAllRead}
                                        className='p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-900 text-gray-500 dark:text-gray-400'
                                    >
                                        <IconCheck size={16} />
                                    </button>
                                    <button
                                        onClick={() => setIsOpen(false)}
                                        className='p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-900 text-gray-500 dark:text-gray-400'
                                    >
                                        <IconX size={18} />
                                    </button>
                                </div>
                            </div>

                            {/* Tabs */}
                            <div className='flex border-b dark:border-gray-900'>
                                <button
                                    onClick={() => setActiveTab('all')}
                                    className={`flex-1 px-3 py-2 text-xs font-medium transition-colors ${
                                        activeTab === 'all'
                                            ? 'text-blue-600 border-b-2 border-blue-600 dark:text-blue-400'
                                            : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                                    }`}
                                >
                                    Semua
                                </button>
                                <button
                                    onClick={() => setActiveTab('pending')}
                                    className={`flex-1 px-3 py-2 text-xs font-medium transition-colors ${
                                        activeTab === 'pending'
                                            ? 'text-blue-600 border-b-2 border-blue-600 dark:text-blue-400'
                                            : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                                    }`}
                                >
                                    Pending
                                </button>
                                <button
                                    onClick={() => setActiveTab('unread')}
                                    className={`flex-1 px-3 py-2 text-xs font-medium transition-colors ${
                                        activeTab === 'unread'
                                            ? 'text-blue-600 border-b-2 border-blue-600 dark:text-blue-400'
                                            : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                                    }`}
                                >
                                    Belum Dibaca
                                </button>
                            </div>

                            {/* Notification List */}
                            <div className='flex-1 overflow-y-auto'>
                                {isLoading && notifications.length === 0 ? (
                                    <div className='flex flex-col items-center justify-center py-12'>
                                        <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500'></div>
                                    </div>
                                ) : filteredNotifications.length === 0 ? (
                                    <div className='flex flex-col items-center justify-center py-12 text-gray-500 dark:text-gray-400'>
                                        <IconBell size={48} strokeWidth={1} className='mb-3 opacity-50' />
                                        <p className='text-sm'>Tidak ada notifikasi</p>
                                    </div>
                                ) : (
                                    <div className='flex flex-col'>
                                        {filteredNotifications.map((notification, i) => (
                                            <NotificationItem
                                                key={notification.id}
                                                transaction={notification}
                                                onClick={() => setIsOpen(false)}
                                            />
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Footer with View All */}
                            <div className='p-3 border-t dark:border-gray-900'>
                                <a
                                    href={route('transactions.index')}
                                    className='flex items-center justify-center gap-2 w-full px-4 py-2 text-sm text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors font-medium'
                                >
                                    <IconEye size={16} />
                                    Lihat Semua Transaksi
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            }
        </>
    )
}
