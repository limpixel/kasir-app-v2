import { useEffect } from 'react';
import GuestLayout from '@/Layouts/GuestLayout';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import { Head, Link, useForm } from '@inertiajs/react';
import { IconUserPlus } from '@tabler/icons-react';

export default function Register() {
    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
    });

    useEffect(() => {
        return () => {
            reset('password', 'password_confirmation');
        };
    }, []);

    const submit = (e) => {
        e.preventDefault();
        post(route('register'));
    };

    return (
        <GuestLayout>
            <Head title="Register" />

            <div className="mb-6 text-center">
                <div className="flex justify-center mb-4">
                    <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg">
                        <IconUserPlus size={32} className="text-white" strokeWidth={1.5} />
                    </div>
                </div>
                <h2 className="text-2xl font-bold text-white mb-1">Register</h2>
                <p className="text-gray-400 text-sm">Buat akun baru untuk memulai</p>
            </div>

            <form onSubmit={submit}>
                <div className="mb-4">
                    <InputLabel htmlFor="name" value="Nama Lengkap" className="text-gray-200" />

                    <TextInput
                        id="name"
                        name="name"
                        value={data.name}
                        className="mt-2 block w-full bg-gray-700 border border-gray-600 text-white placeholder-gray-500 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-500/50 px-4 py-2"
                        placeholder="John Doe"
                        autoComplete="name"
                        isFocused={true}
                        onChange={(e) => setData('name', e.target.value)}
                        required
                    />

                    <InputError message={errors.name} className="mt-2 text-red-400 text-sm" />
                </div>

                <div className="mb-4">
                    <InputLabel htmlFor="email" value="Email" className="text-gray-200" />

                    <TextInput
                        id="email"
                        type="email"
                        name="email"
                        value={data.email}
                        className="mt-2 block w-full bg-gray-700 border border-gray-600 text-white placeholder-gray-500 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-500/50 px-4 py-2"
                        placeholder="you@example.com"
                        autoComplete="email"
                        onChange={(e) => setData('email', e.target.value)}
                        required
                    />

                    <InputError message={errors.email} className="mt-2 text-red-400 text-sm" />
                </div>

                <div className="mb-4">
                    <InputLabel htmlFor="password" value="Password" className="text-gray-200" />

                    <TextInput
                        id="password"
                        type="password"
                        name="password"
                        value={data.password}
                        className="mt-2 block w-full bg-gray-700 border border-gray-600 text-white placeholder-gray-500 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-500/50 px-4 py-2"
                        placeholder="••••••••"
                        autoComplete="new-password"
                        onChange={(e) => setData('password', e.target.value)}
                        required
                    />

                    <InputError message={errors.password} className="mt-2 text-red-400 text-sm" />
                </div>

                <div className="mb-6">
                    <InputLabel htmlFor="password_confirmation" value="Konfirmasi Password" className="text-gray-200" />

                    <TextInput
                        id="password_confirmation"
                        type="password"
                        name="password_confirmation"
                        value={data.password_confirmation}
                        className="mt-2 block w-full bg-gray-700 border border-gray-600 text-white placeholder-gray-500 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-500/50 px-4 py-2"
                        placeholder="••••••••"
                        autoComplete="new-password"
                        onChange={(e) => setData('password_confirmation', e.target.value)}
                        required
                    />

                    <InputError message={errors.password_confirmation} className="mt-2 text-red-400 text-sm" />
                </div>

                <button
                    type="submit"
                    disabled={processing}
                    className="w-full py-2 px-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-gray-800"
                >
                    {processing ? 'Mendaftar...' : 'Daftar'}
                </button>
            </form>

            <div className="mt-6 text-center">
                <p className="text-gray-400 text-sm">
                    Sudah punya akun?{' '}
                    <Link
                        href={route('login')}
                        className="text-purple-400 hover:text-purple-300 font-semibold transition-colors"
                    >
                        Login di sini
                    </Link>
                </p>
            </div>
        </GuestLayout>
    );
}
