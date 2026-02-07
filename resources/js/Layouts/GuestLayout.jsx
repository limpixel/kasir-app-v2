import { Link } from '@inertiajs/react';
import { IconArrowLeft } from '@tabler/icons-react';

export default function Guest({ children }) {
    return (
        <div className="min-h-screen flex flex-col sm:justify-center items-center pt-6 sm:pt-0 bg-gradient-to-br from-gray-900 via-gray-800 to-black">
            <div className="w-full max-w-md px-6 mb-6">
                <Link
                    href="/"
                    className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-sm font-medium"
                >
                    <IconArrowLeft size={18} strokeWidth={2} />
                    Kembali ke Home
                </Link>
            </div>

            <div className="mb-8">
                <h1 className="text-4xl font-bold text-white tracking-wider">sniffy</h1>
            </div>

            <div className="w-full sm:max-w-md mt-6 px-6 py-8 bg-gray-800/50 border border-gray-700 shadow-2xl overflow-hidden sm:rounded-xl backdrop-blur-sm">
                {children}
            </div>
        </div>
    );
}
