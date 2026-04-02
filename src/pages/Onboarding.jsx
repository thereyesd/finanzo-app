import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ChevronLeft, User, Globe, DollarSign, Wallet, Sparkles, Check } from 'lucide-react';

const countries = [
    { code: 'PY', name: 'Paraguay', currency: 'PYG', flag: '🇵🇾' },
    { code: 'AR', name: 'Argentina', currency: 'ARS', flag: '🇦🇷' },
    { code: 'US', name: 'Estados Unidos', currency: 'USD', flag: '🇺🇸' },
    { code: 'BR', name: 'Brasil', currency: 'BRL', flag: '🇧🇷' },
    { code: 'MX', name: 'México', currency: 'MXN', flag: '🇲🇽' },
    { code: 'CO', name: 'Colombia', currency: 'COP', flag: '🇨🇴' },
    { code: 'CL', name: 'Chile', currency: 'CLP', flag: '🇨🇱' },
    { code: 'PE', name: 'Perú', currency: 'PEN', flag: '🇵🇪' },
    { code: 'UY', name: 'Uruguay', currency: 'UYU', flag: '🇺🇾' },
    { code: 'ES', name: 'España', currency: 'EUR', flag: '🇪🇸' },
];

const currencies = [
    { code: 'PYG', name: 'Guaraní', symbol: '₲', flag: '🇵🇾' },
    { code: 'USD', name: 'Dólar', symbol: '$', flag: '🇺🇸' },
    { code: 'ARS', name: 'Peso Argentino', symbol: '$', flag: '🇦🇷' },
    { code: 'EUR', name: 'Euro', symbol: '€', flag: '🇪🇺' },
    { code: 'BRL', name: 'Real', symbol: 'R$', flag: '🇧🇷' },
    { code: 'MXN', name: 'Peso Mexicano', symbol: '$', flag: '🇲🇽' },
    { code: 'COP', name: 'Peso Colombiano', symbol: '$', flag: '🇨🇴' },
    { code: 'CLP', name: 'Peso Chileno', symbol: '$', flag: '🇨🇱' },
    { code: 'PEN', name: 'Sol', symbol: 'S/', flag: '🇵🇪' },
    { code: 'UYU', name: 'Peso Uruguayo', symbol: '$', flag: '🇺🇾' },
];

const stepColors = ['bg-blue-100 dark:bg-blue-900/30 text-blue-600', 'bg-green-100 dark:bg-green-900/30 text-green-600', 'bg-purple-100 dark:bg-purple-900/30 text-purple-600', 'bg-amber-100 dark:bg-amber-900/30 text-amber-600', 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600'];

export default function Onboarding() {
    const [step, setStep] = useState(1);
    const [name, setName] = useState('');
    const [country, setCountry] = useState('PY');
    const [currency, setCurrency] = useState('PYG');
    const [initialBalance, setInitialBalance] = useState('');
    const [loading, setLoading] = useState(false);
    const [direction, setDirection] = useState('right');
    const { userProfile, updateUserProfile } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (userProfile?.name) setName(userProfile.name);
    }, [userProfile]);

    const goNext = () => { setDirection('right'); setStep(s => s + 1); };
    const goBack = () => { setDirection('left'); step > 1 ? setStep(s => s - 1) : navigate('/login'); };

    const handleComplete = async () => {
        setLoading(true);
        try {
            await updateUserProfile({ name, country, currency, initialBalance: parseFloat(initialBalance) || 0, onboardingCompleted: true });
            navigate('/dashboard');
        } catch {
            setLoading(false);
        }
    };

    const totalSteps = 5;
    const curSymbol = currencies.find(c => c.code === currency)?.symbol || '₲';

    return (
        <div className="min-h-screen bg-white dark:bg-background-dark flex flex-col max-w-md mx-auto">
            {/* Header */}
            <div className="flex items-center p-4 pb-2 justify-between">
                <button onClick={goBack}
                    className="text-slate-900 dark:text-white flex size-10 shrink-0 items-center justify-center rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                    <ChevronLeft size={24} />
                </button>
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                        <Wallet className="text-white" size={16} />
                    </div>
                    <span className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">Finanzo</span>
                </div>
                <div className="w-10" />
            </div>

            {/* Progress */}
            <div className="flex w-full flex-row items-center justify-center gap-2.5 py-4 px-6">
                {[1, 2, 3, 4, 5].map((s) => (
                    <div key={s} className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${s <= step ? 'bg-primary' : 'bg-slate-200 dark:bg-slate-700'}`} />
                ))}
            </div>

            {/* Content */}
            <div className={`flex-1 px-6 ${direction === 'right' ? 'animate-fade-in-up' : 'animate-fade-in'}`} key={step}>
                {step === 1 && (
                    <div className="space-y-6">
                        <div className="text-center pt-4">
                            <div className={`w-16 h-16 mx-auto rounded-2xl flex items-center justify-center mb-4 ${stepColors[0]}`}>
                                <User size={28} />
                            </div>
                            <h1 className="text-slate-900 dark:text-white text-[28px] font-bold leading-tight pb-2 tracking-tight">
                                Perfil de Usuario
                            </h1>
                            <p className="text-slate-500 dark:text-slate-400 text-sm px-4">
                                Cuéntanos un poco sobre ti para personalizar tu experiencia.
                            </p>
                        </div>
                        <div className="pt-4">
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Nombre Completo</label>
                            <input type="text" value={name} onChange={(e) => setName(e.target.value)}
                                className="input-field text-lg" placeholder="Ej. Juan Pérez" />
                        </div>
                    </div>
                )}

                {step === 2 && (
                    <div className="space-y-6">
                        <div className="text-center pt-4">
                            <div className={`w-16 h-16 mx-auto rounded-2xl flex items-center justify-center mb-4 ${stepColors[1]}`}>
                                <Globe size={28} />
                            </div>
                            <h1 className="text-slate-900 dark:text-white text-[28px] font-bold leading-tight pb-2 tracking-tight">
                                Tu Ubicación
                            </h1>
                            <p className="text-slate-500 dark:text-slate-400 text-sm px-4">
                                Selecciona tu país para ajustar la configuración regional.
                            </p>
                        </div>
                        <div className="space-y-1.5 pt-2 max-h-[45vh] overflow-y-auto">
                            {countries.map((c) => (
                                <button key={c.code} onClick={() => setCountry(c.code)}
                                    className={`w-full flex items-center justify-between p-3.5 rounded-xl transition-all ${country === c.code ? 'bg-primary/10 ring-2 ring-primary' : 'hover:bg-slate-50 dark:hover:bg-slate-800'}`}>
                                    <div className="flex items-center gap-3">
                                        <span className="text-2xl">{c.flag}</span>
                                        <span className="font-medium text-sm text-slate-900 dark:text-white">{c.name}</span>
                                    </div>
                                    {country === c.code && <Check size={18} className="text-primary" />}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {step === 3 && (
                    <div className="space-y-6">
                        <div className="text-center pt-4">
                            <div className={`w-16 h-16 mx-auto rounded-2xl flex items-center justify-center mb-4 ${stepColors[2]}`}>
                                <DollarSign size={28} />
                            </div>
                            <h1 className="text-slate-900 dark:text-white text-[28px] font-bold leading-tight pb-2 tracking-tight">
                                Moneda Preferida
                            </h1>
                            <p className="text-slate-500 dark:text-slate-400 text-sm px-4">
                                Selecciona la moneda principal para tus finanzas.
                            </p>
                        </div>
                        <div className="grid grid-cols-2 gap-3 pt-2 max-h-[45vh] overflow-y-auto">
                            {currencies.map((c) => (
                                <button key={c.code} onClick={() => setCurrency(c.code)}
                                    className={`p-4 rounded-xl border-2 transition-all text-left ${currency === c.code
                                        ? 'border-primary bg-primary/5 text-primary'
                                        : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'}`}>
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="text-lg">{c.flag}</span>
                                        <span className="text-xl font-bold">{c.symbol}</span>
                                    </div>
                                    <p className="text-xs font-semibold">{c.code}</p>
                                    <p className="text-[10px] opacity-70">{c.name}</p>
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {step === 4 && (
                    <div className="space-y-6">
                        <div className="text-center pt-4">
                            <div className={`w-16 h-16 mx-auto rounded-2xl flex items-center justify-center mb-4 ${stepColors[3]}`}>
                                <Wallet size={28} />
                            </div>
                            <h1 className="text-slate-900 dark:text-white text-[28px] font-bold leading-tight pb-2 tracking-tight">
                                Saldo Actual
                            </h1>
                            <p className="text-slate-500 dark:text-slate-400 text-sm px-4">
                                ¿Con cuánto dinero comienzas? (Efectivo, banco, etc.)
                            </p>
                        </div>
                        <div className="pt-6">
                            <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-3xl font-bold text-slate-400">
                                    {curSymbol}
                                </span>
                                <input type="number" value={initialBalance} onChange={(e) => setInitialBalance(e.target.value)}
                                    className="w-full bg-slate-50 dark:bg-slate-900 border-none rounded-2xl py-6 pl-14 text-4xl font-bold focus:ring-2 focus:ring-primary text-slate-900 dark:text-white text-center"
                                    placeholder="0" />
                            </div>
                            <p className="text-center text-xs text-slate-400 mt-4">Podrás ajustar esto más tarde.</p>
                        </div>
                    </div>
                )}

                {step === 5 && (
                    <div className="space-y-6">
                        <div className="text-center pt-4">
                            <div className={`w-20 h-20 mx-auto rounded-2xl flex items-center justify-center mb-4 ${stepColors[4]}`}>
                                <span className="text-4xl">🎉</span>
                            </div>
                            <h1 className="text-slate-900 dark:text-white text-[28px] font-bold leading-tight pb-2 tracking-tight">
                                ¡Todo listo!
                            </h1>
                            <p className="text-slate-500 dark:text-slate-400 text-sm px-4">
                                Tu perfil está configurado. Comienza a gestionar tus finanzas.
                            </p>
                        </div>

                        <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-5 mt-4 border border-slate-100 dark:border-slate-700">
                            <h3 className="font-bold text-slate-900 dark:text-white mb-4 text-lg">Resumen</h3>
                            <div className="space-y-3 text-sm">
                                {[
                                    { label: 'Nombre', value: name },
                                    { label: 'País', value: `${countries.find(c => c.code === country)?.flag} ${countries.find(c => c.code === country)?.name}` },
                                    { label: 'Moneda', value: `${currencies.find(c => c.code === currency)?.flag} ${currency}` },
                                    { label: 'Saldo Inicial', value: `${curSymbol} ${parseFloat(initialBalance || 0).toLocaleString()}`, highlight: true },
                                ].map((item, i) => (
                                    <div key={i} className={`flex justify-between items-center py-2 ${i < 3 ? 'border-b border-slate-200 dark:border-slate-700' : ''}`}>
                                        <span className="text-slate-500">{item.label}</span>
                                        <span className={`font-semibold ${item.highlight ? 'text-primary font-bold' : 'text-slate-900 dark:text-white'}`}>
                                            {item.value}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Footer CTA */}
            <div className="p-6 pb-10">
                <button
                    onClick={() => step < totalSteps ? goNext() : handleComplete()}
                    disabled={loading || (step === 1 && !name)}
                    className="btn-primary disabled:opacity-50 shadow-lg shadow-primary/20 flex items-center justify-center gap-2">
                    {loading ? 'Guardando...' : step < totalSteps ? 'Continuar' : <><Sparkles size={18} /> Comenzar</>}
                </button>
                {step > 1 && step < totalSteps && (
                    <p className="text-center text-xs text-slate-400 mt-3">Paso {step} de {totalSteps}</p>
                )}
            </div>
        </div>
    );
}
