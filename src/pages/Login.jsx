import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../config/firebase';
import { Wallet, Eye, EyeOff, Mail, Lock, X, ArrowRight } from 'lucide-react';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [showResetModal, setShowResetModal] = useState(false);
    const [resetEmail, setResetEmail] = useState('');
    const [resetLoading, setResetLoading] = useState(false);
    const { login, loginWithGoogle } = useAuth();
    const toast = useToast();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            await login(email, password);
            navigate('/dashboard');
        } catch {
            setError('Credenciales incorrectas. Intenta nuevamente.');
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleLogin = async () => {
        setError('');
        setLoading(true);
        try {
            const { profile } = await loginWithGoogle();
            navigate(profile?.onboardingCompleted ? '/dashboard' : '/onboarding');
        } catch {
            setError('Error al iniciar sesión con Google.');
        } finally {
            setLoading(false);
        }
    };

    const handlePasswordReset = async (e) => {
        e.preventDefault();
        if (!resetEmail) return;
        setResetLoading(true);
        try {
            await sendPasswordResetEmail(auth, resetEmail);
            toast.success('Email enviado', 'Revisa tu bandeja de entrada para restablecer tu contraseña.');
            setShowResetModal(false);
            setResetEmail('');
        } catch {
            toast.error('Error', 'No se pudo enviar el email. Verifica la dirección.');
        } finally {
            setResetLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-background-light dark:bg-background-dark flex flex-col">
            {/* Header */}
            <div className="w-full">
                <div className="w-full gradient-primary flex flex-col justify-end overflow-hidden min-h-[35vh] relative">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.1),transparent_60%)]" />
                    <div className="absolute inset-0 bg-gradient-to-t from-background-light dark:from-background-dark to-transparent" />
                    <div className="relative z-10 px-6 pb-8">
                        <div className="flex items-center gap-2.5 mb-2">
                            <div className="bg-white p-2 rounded-xl shadow-lg">
                                <Wallet className="text-primary" size={28} />
                            </div>
                            <span className="text-3xl font-bold text-white tracking-tight">Finanzo</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Login Form */}
            <div className="flex-1 px-6 -mt-6 relative z-20 animate-fade-in-up">
                <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl p-6 mb-8 border border-slate-200 dark:border-slate-800">
                    <h1 className="text-slate-900 dark:text-white tracking-tight text-2xl font-bold leading-tight pb-1">
                        Bienvenido
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 text-sm pb-6">
                        Ingresa tus credenciales para continuar.
                    </p>

                    {error && (
                        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-3.5 rounded-xl flex items-center gap-3 mb-4 animate-fade-in">
                            <p className="text-sm text-red-600 dark:text-red-400 font-medium">{error}</p>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Correo electrónico</label>
                            <div className="relative">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                                    className="input-field pl-11" placeholder="ejemplo@correo.com" required />
                            </div>
                        </div>

                        <div>
                            <div className="flex justify-between items-center mb-2">
                                <label className="text-xs font-bold text-slate-500 uppercase">Contraseña</label>
                                <button type="button" onClick={() => { setResetEmail(email); setShowResetModal(true); }}
                                    className="text-primary text-xs font-semibold hover:underline">
                                    ¿Olvidaste tu contraseña?
                                </button>
                            </div>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                <input type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)}
                                    className="input-field pl-11 pr-12" placeholder="Tu contraseña" required />
                                <button type="button" onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors">
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>

                        <button type="submit" disabled={loading}
                            className="btn-primary mt-4 disabled:opacity-50 flex items-center justify-center gap-2">
                            {loading ? 'Iniciando sesión...' : <><span>Iniciar sesión</span> <ArrowRight size={18} /></>}
                        </button>
                    </form>

                    <div className="flex items-center my-7">
                        <div className="flex-1 h-px bg-slate-200 dark:bg-slate-800" />
                        <span className="px-4 text-xs text-slate-400 uppercase tracking-widest font-medium">O</span>
                        <div className="flex-1 h-px bg-slate-200 dark:bg-slate-800" />
                    </div>

                    <button onClick={handleGoogleLogin} disabled={loading}
                        className="w-full bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 font-semibold py-3.5 rounded-2xl flex items-center justify-center gap-3 transition-all hover:bg-slate-50 dark:hover:bg-slate-700 active:scale-[0.97]">
                        <svg className="w-5 h-5" viewBox="0 0 24 24">
                            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
                            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                        </svg>
                        <span className="text-sm text-slate-700 dark:text-slate-200">Continuar con Google</span>
                    </button>
                </div>

                <div className="text-center pb-10">
                    <p className="text-slate-500 dark:text-slate-400 text-sm">
                        ¿No tienes una cuenta?{' '}
                        <Link to="/register" className="text-primary font-bold hover:underline ml-1">Regístrate</Link>
                    </p>
                </div>
            </div>

            {/* Password Reset Modal */}
            {showResetModal && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-end justify-center animate-backdrop-in">
                    <div className="bg-white dark:bg-background-dark w-full max-w-md rounded-t-3xl p-6 shadow-2xl animate-slide-up">
                        <div className="flex justify-center mb-4"><div className="w-10 h-1 bg-slate-300 dark:bg-slate-700 rounded-full" /></div>
                        <div className="flex items-center justify-between mb-5">
                            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Restablecer Contraseña</h2>
                            <button onClick={() => setShowResetModal(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors">
                                <X size={20} className="text-slate-400" />
                            </button>
                        </div>
                        <p className="text-sm text-slate-500 mb-4">
                            Ingresa tu correo electrónico y te enviaremos un enlace para restablecer tu contraseña.
                        </p>
                        <form onSubmit={handlePasswordReset} className="space-y-4">
                            <div className="relative">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                <input type="email" value={resetEmail} onChange={(e) => setResetEmail(e.target.value)}
                                    className="input-field pl-11" placeholder="tu@correo.com" required />
                            </div>
                            <button type="submit" disabled={resetLoading} className="btn-primary disabled:opacity-50">
                                {resetLoading ? 'Enviando...' : 'Enviar enlace'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
