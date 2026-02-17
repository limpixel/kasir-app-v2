import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';
import { useState, useRef } from 'react';
import { IconUpload, IconPhoto, IconCheck, IconX } from '@tabler/icons-react';

export default function UploadPaymentProof({ auth, transaction }) {
    const [selectedFile, setSelectedFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [isUploading, setIsUploading] = useState(false);
    const [dragActive, setDragActive] = useState(false);
    const fileInputRef = useRef(null);

    const handleFileChange = (file) => {
        if (file && file.type.startsWith('image/')) {
            setSelectedFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreviewUrl(reader.result);
            };
            reader.readAsDataURL(file);
        } else {
            alert('Mohon upload file gambar (JPG, PNG, atau GIF)');
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFileChange(e.dataTransfer.files[0]);
        }
    };

    const handleDrag = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!selectedFile) {
            alert('Mohon pilih bukti pembayaran terlebih dahulu');
            return;
        }

        setIsUploading(true);

        const formData = new FormData();
        formData.append('payment_proof', selectedFile);
        formData.append('invoice', transaction.invoice);

        try {
            const response = await fetch(route('transactions.store-proof', transaction.id), {
                method: 'POST',
                headers: {
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
                body: formData,
            });

            const result = await response.json();

            if (result.success) {
                alert('Bukti pembayaran berhasil diupload!');
                router.visit(route('transactions.show', transaction.id));
            } else {
                alert('Gagal mengupload bukti pembayaran: ' + result.message);
            }
        } catch (error) {
            console.error('Upload error:', error);
            alert('Terjadi kesalahan saat mengupload bukti pembayaran');
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Upload Bukti Pembayaran</h2>}
        >
            <Head title={`Upload Bukti - ${transaction.invoice}`} />

            <div className="py-12">
                <div className="max-w-2xl mx-auto sm:px-6 lg:px-8">
                    {/* Transaction Info */}
                    <div className="bg-white shadow-sm sm:rounded-lg mb-6">
                        <div className="p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Detail Transaksi</h3>
                            <div className="space-y-2">
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Invoice</span>
                                    <span className="font-semibold">{transaction.invoice}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Tanggal</span>
                                    <span>{new Date(transaction.created_at).toLocaleDateString('id-ID', {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric',
                                        hour: '2-digit',
                                        minute: '2-digit'
                                    })}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Pembayaran</span>
                                    <span className="font-medium">{transaction.payment_method}</span>
                                </div>
                                <div className="flex justify-between text-lg">
                                    <span className="text-gray-500">Total</span>
                                    <span className="font-bold text-blue-600">Rp {Number(transaction.grand_total).toLocaleString('id-ID')}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Upload Form */}
                    <div className="bg-white shadow-sm sm:rounded-lg">
                        <div className="p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Upload Bukti Pembayaran</h3>
                            
                            <form onSubmit={handleSubmit}>
                                {/* Drag & Drop Area */}
                                <div
                                    className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                                        dragActive
                                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                                            : 'border-gray-300 dark:border-gray-700'
                                    }`}
                                    onDragEnter={handleDrag}
                                    onDragLeave={handleDrag}
                                    onDragOver={handleDrag}
                                    onDrop={handleDrop}
                                >
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        className="hidden"
                                        accept="image/*"
                                        onChange={(e) => handleFileChange(e.target.files[0])}
                                    />
                                    
                                    {previewUrl ? (
                                        <div className="space-y-4">
                                            <div className="relative inline-block">
                                                <img
                                                    src={previewUrl}
                                                    alt="Preview"
                                                    className="max-h-64 rounded-lg shadow-md mx-auto"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setSelectedFile(null);
                                                        setPreviewUrl(null);
                                                        if (fileInputRef.current) fileInputRef.current.value = '';
                                                    }}
                                                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                                                >
                                                    <IconX size={16} />
                                                </button>
                                            </div>
                                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                                {selectedFile?.name}
                                            </p>
                                        </div>
                                    ) : (
                                        <div
                                            className="cursor-pointer"
                                            onClick={() => fileInputRef.current?.click()}
                                        >
                                            <div className="flex flex-col items-center gap-4">
                                                <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                                                    <IconUpload size={32} className="text-blue-600 dark:text-blue-400" />
                                                </div>
                                                <div>
                                                    <p className="text-lg font-medium text-gray-700 dark:text-gray-300">
                                                        Klik untuk upload atau drag & drop
                                                    </p>
                                                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                                        Format: JPG, PNG, GIF (Max 5MB)
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Payment Instructions */}
                                <div className="mt-6 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                                    <div className="flex items-start gap-3">
                                        <IconPhoto size={20} className="text-yellow-600 dark:text-yellow-400 mt-0.5" />
                                        <div className="text-sm text-yellow-800 dark:text-yellow-200">
                                            <p className="font-semibold mb-2">Instruksi Upload:</p>
                                            <ul className="list-disc list-inside space-y-1 text-yellow-700 dark:text-yellow-300">
                                                <li>Screenshot atau foto bukti pembayaran QRIS/E-Wallet</li>
                                                <li>Pastikan gambar jelas dan terbaca</li>
                                                <li>Ukuran file maksimal 5MB</li>
                                                <li>Format file: JPG, PNG, atau GIF</li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>

                                {/* Submit Button */}
                                <div className="mt-6 flex gap-3">
                                    <button
                                        type="button"
                                        onClick={() => router.back()}
                                        className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium"
                                        disabled={isUploading}
                                    >
                                        Batal
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={!selectedFile || isUploading}
                                        className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                    >
                                        {isUploading ? (
                                            <>
                                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                                Mengupload...
                                            </>
                                        ) : (
                                            <>
                                                <IconCheck size={18} />
                                                Upload Bukti
                                            </>
                                        )}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
