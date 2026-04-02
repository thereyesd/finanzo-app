import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useNavigate } from 'react-router-dom';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../config/firebase';
import BottomNav from '../components/layout/BottomNav';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import {
    User, Mail, Globe, DollarSign, LogOut, ChevronRight, Crown,
    Shield, Bell, HelpCircle, Moon, Sun, X, Check, Camera,
    TrendingUp, Target, Receipt
} from 'lucide-react';

const currencies = [
    { code: 'PYG', name: 'Guaraní', symbol: '₲', flag: '🇵🇾' },
    { code: 'USD', name: 'Dólar', symbol: '$', flag: '🇺🇸' },
    { code: 'EUR', name: 'Euro', symbol: '€', flag: '🇪🇺' },
    { code: 'ARS', name: 'Peso Argentino', symbol: '$', flag: '🇦🇷' },
    { code: 'BRL', name: 'Real', symbol: 'R$', flag: '🇧🇷' },
    { code: 'CLP', name: 'Peso Chileno', symbol: '$', flag: '🇨🇱' },
    { code: 'COP', name: 'Peso Colombiano', symbol: '$', flag: '🇨🇴' },
    { code: 'MXN', name: 'Peso Mexicano', symbol: '$', flag: '🇲🇽' },
    { code: 'PEN', name: 'Sol', symbol: 'S/', flag: '🇵🇪' },
    { code: 'UYU', name: 'Peso Uruguayo', symbol: '$', flag: '🇺🇾' },
];

const countries = [
    { code: 'PY', name: 'Paraguay', flag: '🇵🇾' },
    { code: 'AR', name: 'Argentina', flag: '🇦🇷' },
    { code: 'BR', name: 'Brasil', flag: '🇧🇷' },
    { code: 'CL', name: 'Chile', flag: '🇨🇱' },
    { code: 'CO', name: 'Colombia', flag: '🇨🇴' },
    { code: 'MX', name: 'México', flag: '🇲🇽' },
    { code: 'PE', name: 'Perú', flag: '🇵🇪' },
    { code: 'UY', name: 'Uruguay', flag: '🇺🇾' },
    { code: 'US', name: 'Estados Unidos', flag: '🇺🇸' },
    { code: 'ES', name: 'España', flag: '🇪🇸' },
];

export default function Profile() {
    const { user, userProfile, logout, updateUserProfile } = useAuth();
    const toast = useToast();
    const navigate = useNavigate();

    const [showEditProfile, setShowEditProfile] = useState(false);
    const [showCurrencyPicker, setShowCurrencyPicker] = useState(false);
    const [showCountryPicker, setShowCountryPicker] = useState(false);
    const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
    const [editName, setEditName] = useState('');
    const [saving, setSaving] = useState(false);
    const [stats, setStats] = useState({ transactions: 0, budgets: 0, goals: 0 });

    // Dark Mode with persistence
    const [darkMode, setDarkMode] = useState(() => {
        if (localStorage.theme === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
            document.documentElement.classList.add('dark');
            return true;
        }
        document.documentElement.classList.remove('dark');
        return false;
    });

    // Fetch user stats
    useEffect(() => {
        if (!user) return;
        const fetchStats = async () => {
            try {
                const [txnSnap, budgetSnap, goalSnap] = await Promise.all([
                    getDocs(query(collection(db, 'transactions'), where('userId', '==', user.uid))),
                    getDocs(query(collection(db, 'budgets'), where('userId', '==', user.uid))),
                    getDocs(query(collection(db, 'savingsGoals'), where('userId', '==', user.uid))),
                ]);
                setStats({ transactions: txnSnap.size, budgets: budgetSnap.size, goals: goalSnap.size });
            } catch { /* silent */ }
        };
        fetchStats();
    }, [user]);

    const toggleDarkMode = () => {
        if (darkMode) {
            document.documentElement.classList.remove('dark');
            localStorage.theme = 'light';
            setDarkMode(false);
        } else {
            document.documentElement.classList.add('dark');
            localStorage.theme = 'dark';
            setDarkMode(true);
        }
    };

    const handleLogout = async () => {
        try {
            await logout();
            navigate('/login');
        } catch {
            toast.error('Error', 'No se pudo cerrar sesión.');
        }
        setShowLogoutConfirm(false);
    };

    const handleEditProfile = async (e) => {
        e.preventDefault();
        if (!editName.trim()) return;
        setSaving(true);
        try {
            await updateUserProfile({ name: editName.trim() });
            toast.success('Perfil actualizado', 'Tu nombre fue actualizado correctamente.');
            setShowEditProfile(false);
        } catch {
            toast.error('Error', 'No se pudo actualizar el perfil.');
        } finally { setSaving(false); }
    };

    const handleCurrencyChange = async (code) => {
        try {
            await updateUserProfile({ currency: code });
            toast.success('Moneda actualizada', `Ahora usas ${code}.`);
            setShowCurrencyPicker(false);
        } catch {
            toast.error('Error', 'No se pudo cambiar la moneda.');
        }
    };

    const handleCountryChange = async (code) => {
        try {
            await updateUserProfile({ country: code });
            const country = countries.find(c => c.code === code);
            toast.success('País actualizado', `Cambiado a ${country?.name || code}.`);
            setShowCountryPicker(false);
        } catch {
            toast.error('Error', 'No se pudo cambiar el país.');
        }
    };

    const initial = userProfile?.name?.charAt(0)?.toUpperCase() || user?.email?.charAt(0)?.toUpperCase() || 'U';
    const currentCurrency = currencies.find(c => c.code === (userProfile?.currency || 'PYG'));
    const currentCountry = countries.find(c => c.code === (userProfile?.country || 'PY'));
    const memberSince = userProfile?.createdAt ? new Date(userProfile.createdAt).toLocaleDateString('es-PY', { month: 'long', year: 'numeric' }) : '';

    const menuItems = [
        {
            title: 'Cuenta',
            items: [
                { icon: User, label: 'Editar perfil', onClick: () => { setEditName(userProfile?.name || ''); setShowEditProfile(true); } },
                { icon: Shield, label: 'Seguridad', value: 'Activa', onClick: () => toast.info('Seguridad', 'Tu cuenta está protegida con Firebase Auth.') },
                { icon: Bell, label: 'Notificaciones', value: 'Activadas', onClick: () => toast.info('Próximamente', 'Las notificaciones push estarán disponibles pronto.') },
            ]
        },
        {
            title: 'Preferencias',
            items: [
                { icon: Globe, label: 'País', value: currentCountry ? `${currentCountry.flag} ${currentCountry.name}` : 'Paraguay', onClick: () => setShowCountryPicker(true) },
                { icon: DollarSign, label: 'Moneda', value: currentCurrency ? `${currentCurrency.flag} ${currentCurrency.code}` : 'PYG', onClick: () => setShowCurrencyPicker(true) },
            ]
        },
        {
            title: 'Soporte',
            items: [
                { icon: HelpCircle, label: 'Centro de ayuda', onClick: () => toast.info('Ayuda', 'Visita finanzo.app/ayuda para más información.') },
                { icon: Mail, label: 'Contactar soporte', onClick: () => window.location.href = 'mailto:soporte@finanzo.app' },
            ]
        }
    ];

    return (
        <div className="min-h-screen bg-background-light dark:bg-background-dark pb-24">
            {/* Header with gradient */}
            <div className="gradient-primary pt-12 pb-20 px-6 relative overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.1),transparent_70%)]" />
                <div className="max-w-md mx-auto relative">
                    <h1 className="text-2xl font-bold text-white mb-6">Mi Perfil</h1>

                    <div className="flex items-center gap-4">
                        <div className="relative">
                            <div className="w-18 h-18 bg-white/20 rounded-2xl flex items-center justify-center text-white text-2xl font-bold overflow-hidden ring-2 ring-white/30"
                                style={{ width: '4.5rem', height: '4.5rem' }}>
                                {userProfile?.photoURL ? (
                                    <img src={userProfile.photoURL} alt="" className="w-full h-full object-cover" />
                                ) : (
                                    <span className="text-3xl">{initial}</span>
                                )}
                            </div>
                            <button onClick={() => { setEditName(userProfile?.name || ''); setShowEditProfile(true); }}
                                className="absolute -bottom-1 -right-1 w-7 h-7 bg-white rounded-full flex items-center justify-center shadow-lg">
                                <Camera size={14} className="text-primary" />
                            </button>
                        </div>
                        <div className="text-white">
                            <h2 className="font-bold text-xl">{userProfile?.name || 'Usuario'}</h2>
                            <p className="text-white/70 text-sm">{user?.email}</p>
                            {memberSince && <p className="text-white/50 text-xs mt-0.5">Miembro desde {memberSince}</p>}
                        </div>
                    </div>
                </div>
            </div>

            <main className="max-w-md mx-auto -mt-12 px-4 animate-fade-in-up">
                {/* Stats Card */}
                <div className="card p-4 mb-4 shadow-lg">
                    <div className="grid grid-cols-3 gap-3">
                        <div className="text-center">
                            <div className="w-10 h-10 mx-auto bg-primary/10 rounded-xl flex items-center justify-center mb-1.5">
                                <Receipt size={18} className="text-primary" />
                            </div>
                            <p className="text-lg font-bold text-slate-900 dark:text-white">{stats.transactions}</p>
                            <p className="text-[10px] text-slate-400 font-medium">Transacciones</p>
                        </div>
                        <div className="text-center">
                            <div className="w-10 h-10 mx-auto bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center mb-1.5">
                                <TrendingUp size={18} className="text-green-600" />
                            </div>
                            <p className="text-lg font-bold text-slate-900 dark:text-white">{stats.budgets}</p>
                            <p className="text-[10px] text-slate-400 font-medium">Presupuestos</p>
                        </div>
                        <div className="text-center">
                            <div className="w-10 h-10 mx-auto bg-yellow-100 dark:bg-yellow-900/30 rounded-xl flex items-center justify-center mb-1.5">
                                <Target size={18} className="text-yellow-600" />
                            </div>
                            <p className="text-lg font-bold text-slate-900 dark:text-white">{stats.goals}</p>
                            <p className="text-[10px] text-slate-400 font-medium">Metas</p>
                        </div>
                    </div>
                </div>

                {/* Plan Card */}
                <div className="card p-4 mb-4 cursor-pointer hover:shadow-lg transition-shadow"
                    onClick={() => navigate('/pricing')}>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-11 h-11 bg-yellow-100 dark:bg-yellow-900/30 rounded-xl flex items-center justify-center">
                                <Crown className="text-yellow-600" size={22} />
                            </div>
                            <div>
                                <p className="font-bold text-slate-900 dark:text-white">
                                    Plan {userProfile?.plan ? userProfile.plan.charAt(0).toUpperCase() + userProfile.plan.slice(1) : 'Gratis'}
                                </p>
                                <p className="text-xs text-slate-500">
                                    {userProfile?.plan === 'free' || !userProfile?.plan ? 'Actualiza para más funciones' : 'Ver detalles del plan'}
                                </p>
                            </div>
                        </div>
                        <ChevronRight className="text-slate-400" size={20} />
                    </div>
                </div>

                {/* Dark Mode Toggle */}
                <div className="card p-4 mb-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${darkMode ? 'bg-indigo-100 dark:bg-indigo-900/30' : 'bg-amber-100 dark:bg-amber-900/30'}`}>
                                {darkMode ? <Moon size={20} className="text-indigo-600" /> : <Sun size={20} className="text-amber-600" />}
                            </div>
                            <div>
                                <span className="font-semibold text-slate-900 dark:text-white">Modo oscuro</span>
                                <p className="text-xs text-slate-400">{darkMode ? 'Activado' : 'Desactivado'}</p>
                            </div>
                        </div>
                        <button onClick={toggleDarkMode}
                            className={`w-12 h-7 rounded-full transition-colors relative ${darkMode ? 'bg-primary' : 'bg-slate-200 dark:bg-slate-700'}`}>
                            <div className={`absolute top-1 w-5 h-5 bg-white rounded-full shadow-md transition-all ${darkMode ? 'left-6' : 'left-1'}`} />
                        </button>
                    </div>
                </div>

                {/* Menu Sections */}
                {menuItems.map((section, idx) => (
                    <div key={idx} className="mb-4">
                        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 px-1">
                            {section.title}
                        </h3>
                        <div className="card overflow-hidden divide-y divide-slate-100 dark:divide-slate-800">
                            {section.items.map((item, i) => {
                                const Icon = item.icon;
                                return (
                                    <div key={i} onClick={item.onClick}
                                        className="flex items-center justify-between p-4 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors active:scale-[0.99]">
                                        <div className="flex items-center gap-3">
                                            <Icon size={20} className="text-slate-400" />
                                            <span className="font-medium text-sm text-slate-900 dark:text-white">{item.label}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            {item.value && <span className="text-sm text-slate-500">{item.value}</span>}
                                            <ChevronRight size={16} className="text-slate-300" />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                ))}

                {/* Logout Button */}
                <button onClick={() => setShowLogoutConfirm(true)}
                    className="w-full bg-red-50 dark:bg-red-900/20 text-red-600 font-bold py-4 rounded-2xl flex items-center justify-center gap-2 mt-4 hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors active:scale-[0.97]">
                    <LogOut size={20} /> Cerrar sesión
                </button>

                <p className="text-center text-xs text-slate-400 mt-6 pb-4">Finanzo v1.0.0</p>
            </main>

            {/* Edit Profile Modal */}
            {showEditProfile && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-end justify-center animate-backdrop-in">
                    <div className="bg-white dark:bg-background-dark w-full max-w-md rounded-t-3xl p-6 shadow-2xl animate-slide-up">
                        <div className="flex justify-center mb-4"><div className="w-10 h-1 bg-slate-300 dark:bg-slate-700 rounded-full" /></div>
                        <div className="flex items-center justify-between mb-5">
                            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Editar Perfil</h2>
                            <button onClick={() => setShowEditProfile(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors">
                                <X size={20} className="text-slate-400" />
                            </button>
                        </div>
                        <form onSubmit={handleEditProfile} className="space-y-4">
                            <div className="flex justify-center mb-2">
                                <div className="w-20 h-20 bg-primary/10 rounded-2xl flex items-center justify-center text-primary text-3xl font-bold overflow-hidden">
                                    {userProfile?.photoURL ? (
                                        <img src={userProfile.photoURL} alt="" className="w-full h-full object-cover" />
                                    ) : (
                                        initial
                                    )}
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Nombre</label>
                                <input type="text" value={editName} onChange={(e) => setEditName(e.target.value)}
                                    className="input-field" placeholder="Tu nombre" required />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Email</label>
                                <input type="email" value={user?.email || ''} disabled
                                    className="input-field opacity-50 cursor-not-allowed" />
                            </div>
                            <button type="submit" disabled={saving} className="btn-primary mt-4 disabled:opacity-50">
                                {saving ? 'Guardando...' : 'Guardar Cambios'}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* Currency Picker Modal */}
            {showCurrencyPicker && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-end justify-center animate-backdrop-in">
                    <div className="bg-white dark:bg-background-dark w-full max-w-md rounded-t-3xl p-6 shadow-2xl animate-slide-up max-h-[70vh] flex flex-col">
                        <div className="flex justify-center mb-4"><div className="w-10 h-1 bg-slate-300 dark:bg-slate-700 rounded-full" /></div>
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Seleccionar Moneda</h2>
                            <button onClick={() => setShowCurrencyPicker(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors">
                                <X size={20} className="text-slate-400" />
                            </button>
                        </div>
                        <div className="overflow-y-auto space-y-1 flex-1">
                            {currencies.map((cur) => (
                                <button key={cur.code} onClick={() => handleCurrencyChange(cur.code)}
                                    className={`w-full flex items-center justify-between p-3.5 rounded-xl transition-all ${userProfile?.currency === cur.code ? 'bg-primary/10 ring-2 ring-primary' : 'hover:bg-slate-50 dark:hover:bg-slate-800'}`}>
                                    <div className="flex items-center gap-3">
                                        <span className="text-2xl">{cur.flag}</span>
                                        <div className="text-left">
                                            <p className="font-semibold text-sm text-slate-900 dark:text-white">{cur.name}</p>
                                            <p className="text-xs text-slate-400">{cur.code} ({cur.symbol})</p>
                                        </div>
                                    </div>
                                    {userProfile?.currency === cur.code && <Check size={20} className="text-primary" />}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Country Picker Modal */}
            {showCountryPicker && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-end justify-center animate-backdrop-in">
                    <div className="bg-white dark:bg-background-dark w-full max-w-md rounded-t-3xl p-6 shadow-2xl animate-slide-up max-h-[70vh] flex flex-col">
                        <div className="flex justify-center mb-4"><div className="w-10 h-1 bg-slate-300 dark:bg-slate-700 rounded-full" /></div>
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Seleccionar País</h2>
                            <button onClick={() => setShowCountryPicker(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors">
                                <X size={20} className="text-slate-400" />
                            </button>
                        </div>
                        <div className="overflow-y-auto space-y-1 flex-1">
                            {countries.map((c) => (
                                <button key={c.code} onClick={() => handleCountryChange(c.code)}
                                    className={`w-full flex items-center justify-between p-3.5 rounded-xl transition-all ${userProfile?.country === c.code ? 'bg-primary/10 ring-2 ring-primary' : 'hover:bg-slate-50 dark:hover:bg-slate-800'}`}>
                                    <div className="flex items-center gap-3">
                                        <span className="text-2xl">{c.flag}</span>
                                        <p className="font-semibold text-sm text-slate-900 dark:text-white">{c.name}</p>
                                    </div>
                                    {userProfile?.country === c.code && <Check size={20} className="text-primary" />}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Logout Confirmation */}
            <ConfirmDialog
                isOpen={showLogoutConfirm}
                onClose={() => setShowLogoutConfirm(false)}
                onConfirm={handleLogout}
                title="¿Cerrar sesión?"
                message="Tendrás que iniciar sesión nuevamente para acceder a tu cuenta."
                confirmText="Cerrar sesión"
                variant="danger"
            />

            <BottomNav />
        </div>
    );
}
