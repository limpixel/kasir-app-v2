import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import DeleteUserForm from './Partials/DeleteUserForm';
import UpdatePasswordForm from './Partials/UpdatePasswordForm';
import UpdateProfileInformationForm from './Partials/UpdateProfileInformationForm';
import HistoryTab from './Partials/HistoryTab';
import { Head } from '@inertiajs/react';
import { useState } from 'react';

export default function Edit({ auth, mustVerifyEmail, status }) {
    const [activeTab, setActiveTab] = useState('profile');
    
    // Cek apakah user adalah customer berdasarkan email
    const isCustomer = auth.user.email === 'customer@gmail.com';

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Profil</h2>}
        >
            <Head title="Profil" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    {/* Tab Navigation */}
                    <div className="mb-6 border-b border-gray-200">
                        <nav className="-mb-px flex space-x-8">
                            <button
                                onClick={() => setActiveTab('profile')}
                                className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                                    activeTab === 'profile'
                                        ? 'border-indigo-500 text-indigo-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`}
                            >
                                Informasi Profil
                            </button>
                            
                            {isCustomer && (
                                <button
                                    onClick={() => setActiveTab('history')}
                                    className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                                        activeTab === 'history'
                                            ? 'border-indigo-500 text-indigo-600'
                                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                    }`}
                                >
                                    Riwayat Transaksi
                                </button>
                            )}
                        </nav>
                    </div>

                    <div className="space-y-6">
                        {/* Profile Tab */}
                        {activeTab === 'profile' && (
                            <>
                                <div className="p-4 sm:p-8 bg-white shadow sm:rounded-lg">
                                    <div className="max-w-xl mb-6">
                                        <h3 className="text-lg font-medium text-gray-900">Detail Akun</h3>
                                        <div className="mt-4 space-y-2">
                                            <p><span className="font-medium">Nama:</span> {auth.user.name}</p>
                                            <p><span className="font-medium">Email:</span> {auth.user.email}</p>
                                            {auth.user.phone && <p><span className="font-medium">Telepon:</span> {auth.user.phone}</p>}
                                            {auth.user.address && <p><span className="font-medium">Alamat:</span> {auth.user.address}</p>}
                                        </div>
                                    </div>
                                    <UpdateProfileInformationForm
                                        mustVerifyEmail={mustVerifyEmail}
                                        status={status}
                                        className="max-w-xl"
                                    />
                                </div>

                                <div className="p-4 sm:p-8 bg-white shadow sm:rounded-lg">
                                    <UpdatePasswordForm className="max-w-xl" />
                                </div>

                                <div className="p-4 sm:p-8 bg-white shadow sm:rounded-lg">
                                    <DeleteUserForm className="max-w-xl" />
                                </div>
                            </>
                        )}

                        {/* History Tab for Customer */}
                        {isCustomer && activeTab === 'history' && (
                            <div className="p-4 sm:p-8 bg-white shadow sm:rounded-lg">
                                <div className="mb-4">
                                    <h2 className="text-lg font-medium text-gray-900">Riwayat Transaksi</h2>
                                    <p className="mt-1 text-sm text-gray-600">
                                        Lihat semua riwayat transaksi Anda.
                                    </p>
                                </div>
                                <HistoryTab />
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
