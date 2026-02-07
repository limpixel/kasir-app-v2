import { useEffect } from 'react';
import { Head, useForm, Link } from '@inertiajs/react';
import { IconArrowLeft } from '@tabler/icons-react';


export default function Login({ status, canResetPassword }) {

    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
        remember: false,
    });

    useEffect(() => {
        return () => {
            reset('password');
        };
    }, []);

    const submit = (e) => {
        e.preventDefault();

        post(route('login'));
    };

    return (
        <>
            <Head title="Log in" />
            <div className="flex h-[850px] w-full bg-slate-900">
            <div className="w-full borrder-2 border-white hidden md:inline-block">
                <img className="h-full min-w-full bg-cover" src="https://raw.githubusercontent.com/prebuiltui/prebuiltui/main/assets/login/leftSideImage.png" alt="leftSideImage" />
            </div>
        
            <div className="w-full flex flex-col items-center justify-center bg-slate-950 relative">
        
                <Link
                    href="/"
                    className="absolute top-6 left-6 inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-sm font-medium"
                >
                    <IconArrowLeft size={18} strokeWidth={2} />
                    Kembali ke Home
                </Link>

                <form onSubmit={submit} className="md:w-96 w-80 flex flex-col items-center justify-center">
                    {status && <p className="text-green-500 text-sm mb-4">{status}</p>}
                    <div className='my-8 flex flex-col justify-center items-center'>
                        <h2 className="text-4xl text-white font-medium">Sign in</h2>
                        <p className="text-sm text-gray-400 mt-3">Welcome back! Please sign in to continue</p>
                    </div>
        
        
                    <div className="flex items-center w-full bg-slate-800 border border-slate-700 h-12 rounded-full overflow-hidden pl-6 gap-2 focus-within:border-indigo-500 transition-colors">
                        <svg width="16" height="11" viewBox="0 0 16 11" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path fillRule="evenodd" clipRule="evenodd" d="M0 .55.571 0H15.43l.57.55v9.9l-.571.55H.57L0 10.45zm1.143 1.138V9.9h13.714V1.69l-6.503 4.8h-.697zM13.749 1.1H2.25L8 5.356z" fill="#9CA3AF"/>
                        </svg>
                        <input id="email" type="email" name='email' value={data.email} onChange={(e) => setData('email', e.target.value)} placeholder="Email id" className="bg-transparent text-gray-200 placeholder-gray-500 outline-none text-sm w-full h-full" required />                 
                    </div>
                    {errors.email && <p className="text-red-500 text-sm mt-2">{errors.email}</p>}
        
                    <div className="flex items-center mt-6 w-full bg-slate-800 border border-slate-700 h-12 rounded-full overflow-hidden pl-6 gap-2 focus-within:border-indigo-500 transition-colors">
                        <svg width="13" height="17" viewBox="0 0 13 17" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M13 8.5c0-.938-.729-1.7-1.625-1.7h-.812V4.25C10.563 1.907 8.74 0 6.5 0S2.438 1.907 2.438 4.25V6.8h-.813C.729 6.8 0 7.562 0 8.5v6.8c0 .938.729 1.7 1.625 1.7h9.75c.896 0 1.625-.762 1.625-1.7zM4.063 4.25c0-1.406 1.093-2.55 2.437-2.55s2.438 1.144 2.438 2.55V6.8H4.061z" fill="#9CA3AF"/>
                        </svg>
                        <input id="password" type="password" name="password" value={data.password} onChange={(e) => setData('password', e.target.value)} placeholder="Password" className="bg-transparent text-gray-200 placeholder-gray-500 outline-none text-sm w-full h-full" required />
                    </div>
                    {errors.password && <p className="text-red-500 text-sm mt-2">{errors.password}</p>}
        
                    <div className="w-full flex items-center justify-between mt-8 text-gray-400">
                        <div className="flex items-center gap-2">
                            <input className="h-5 accent-indigo-500" type="checkbox" id="checkbox" checked={data.remember} onChange={(e) => setData('remember', e.target.checked)} />
                            <label className="text-sm" htmlFor="checkbox">Remember me</label>
                        </div>
                        {canResetPassword && (
                            <a className="text-sm underline hover:text-gray-300 transition-colors" href={route('password.request')}>Forgot password?</a>
                        )}
                    </div>
        
                    <button type="submit" className="mt-8 w-full h-11 rounded-full text-white bg-indigo-600 hover:bg-indigo-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed" disabled={processing}>
                        {processing ? 'Logging in...' : 'Login'}
                    </button>
                    <p className="text-gray-400 text-sm mt-4">Don't have an account? <a className="text-indigo-400 hover:text-indigo-300 transition-colors" href={route('register')}>Sign up</a></p>
                </form>
            </div>
        </div>
        </>
    );
};