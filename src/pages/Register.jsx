import { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Wallet, Eye, EyeOff, Mail, Lock, User, ArrowRight, Check, X as XIcon } from 'lucide-react';

function PasswordStrength({ password }) {
    const checks = useMemo(() => [
        { label: 'Mínimo 6 caracteres', pass: password.length >= 6 },
        { label: 'Una mayúscula', pass: /[A-Z]/.test(password) },
        { label: 'Un número', pass: /[0-9]/.test(password) },
    ], [password]);

    const strength = checks.filter(c => c.pass).length;
    const colors = ['bg-red-500', 'bg-yellow-500', 'bg-green-500'];
    const labels = ['Débil', 'Media', 'Fuerte'];

    if (!password) return null;

    return (
        <div className="mt-2 space-y-2 animate-fade-in">
            <div className="flex gap-1.5">
                {[0, 1, 2].map(i => (
                    <div key={i} className={`h-1.5 flex-1 rounded-full transition-all ${i < strength ? colors[Math.min(strength - 1, 2)] : 'bg-slate-200 dark:bg-slate-700'}`} />
                ))}
            </div>
            <div className="flex items-center justify-between">
                <div className="flex flex-wrap gap-x-3 gap-y-1">
                    {checks.map((check, i) => (
                        <span key={i} className={`text-[10px] flex items-center gap-1 ${check.pass ? 'text-green-500' : 'text-slate-400'}`}>
                            {check.pass ? <Check size={10} /> : <XIcon size={10} />} {check.label}
                        </span>
                    ))}
                </div>
                {strength > 0 && (
                    <span className={`text-[10px] font-bold ${strength === 3 ? 'text-green-500' : strength === 2 ? 'text-yellow-500' : 'text-red-500'}`}>
                        {labels[strength - 1]}
                    </span>
                )}
            </div>
        </div>
    );
}

export default function Register() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { register, loginWithGoogle } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        if (password !== confirmPassword) { setError('Las contraseñas no coinciden.'); return; }
        if (password.length < 6) { setError('La contraseña debe tener al menos 6 caracteres.'); return; }
        setLoading(true);
        try {
            await register(email, password, name);
            navigate('/onboarding');
        } catch (err) {
            if (err.code === 'auth/email-already-in-use') {
                setError('Este correo ya está registrado.');
            } else {
                setError('Error al crear la cuenta. Intenta nuevamente.');
            }
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

    return (
        <div className="min-h-screen bg-background-light dark:bg-background-dark flex flex-col">
            {/* Header */}
            <div className="w-full gradient-primary px-6 py-8 relative overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.1),transparent_60%)]" />
                <div className="relative">
                    <div className="flex items-center gap-2.5 mb-4">
                        <div className="bg-white p-2 rounded-xl shadow-lg">
                            <Wallet className="text-primary" size={28} />
                        </div>
                        <span className="text-3xl font-bold text-white tracking-tight">Finanzo</span>
                    </div>
                    <h1 className="text-white text-2xl font-bold">Crea tu cuenta</h1>
                    <p className="text-white/70 text-sm mt-1">Comienza a gestionar tus finanzas de forma inteligente.</p>
                </div>
            </div>

            {/* Register Form */}
            <div className="flex-1 px-6 -mt-4 relative z-20 animate-fade-in-up">
                <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl p-6 mb-8 border border-slate-200 dark:border-slate-800">
                    {error && (
                        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-3.5 rounded-xl mb-4 animate-fade-in">
                            <p className="text-sm text-red-600 dark:text-red-400 font-medium">{error}</p>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Nombre completo</label>
                            <div className="relative">
                                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                <input type="text" value={name} onChange={(e) => setName(e.target.value)}
                                    className="input-field pl-11" placeholder="Juan Pérez" required />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Correo electrónico</label>
                            <div className="relative">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                                    className="input-field pl-11" placeholder="ejemplo@correo.com" required />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Contraseña</label>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                <input type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)}
                                    className="input-field pl-11 pr-12" placeholder="Mínimo 6 caracteres" required />
                                <button type="button" onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors">
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                            <PasswordStrength password={password} />
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Confirmar contraseña</label>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                <input type={showPassword ? 'text' : 'password'} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
                                    className="input-field pl-11" placeholder="Repite tu contraseña" required />
                                {confirmPassword && (
                                    <div className="absolute right-4 top-1/2 -translate-y-1/2">
                                        {password === confirmPassword ? (
                                            <Check size={18} className="text-green-500" />
                                        ) : (
                                            <XIcon size={18} className="text-red-500" />
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>

                        <button type="submit" disabled={loading}
                            className="btn-primary mt-4 disabled:opacity-50 flex items-center justify-center gap-2">
                            {loading ? 'Creando cuenta...' : <><span>Crear cuenta</span> <ArrowRight size={18} /></>}
                        </button>
                    </form>

                    <div className="flex items-center my-6">
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
                        ¿Ya tienes una cuenta?{' '}
                        <Link to="/login" className="text-primary font-bold hover:underline ml-1">Inicia sesión</Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
