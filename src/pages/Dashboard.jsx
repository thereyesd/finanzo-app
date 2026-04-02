import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { collection, query, where, orderBy, limit, onSnapshot, addDoc, doc, updateDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import Header from '../components/layout/Header';
import BottomNav from '../components/layout/BottomNav';
import { SkeletonCard } from '../components/ui/SkeletonLoader';
import {
    formatCurrency, getCurrencySymbol, getGreeting, getMonthlyTotals, generateInsights, calcPercentage
} from '../utils/helpers';
import { getCategoryById } from '../data/categories';
import {
    AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid
} from 'recharts';
import {
    TrendingUp, TrendingDown, Plus, ArrowRight,
    Target, PieChart, Lightbulb, Wallet, X, ArrowDown, ArrowUp, Pencil
} from 'lucide-react';

const CustomTooltip = ({ active, payload, label, currency }) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-3 shadow-xl text-xs">
                <p className="font-bold text-slate-700 dark:text-slate-200 mb-1">{label}</p>
                {payload.map((p, i) => (
                    <p key={i} style={{ color: p.color }} className="font-semibold">
                        {p.name === 'ingresos' ? 'Ingresos' : 'Gastos'}: {formatCurrency(p.value, currency)}
                    </p>
                ))}
            </div>
        );
    }
    return null;
};

export default function Dashboard() {
    const { user, userProfile } = useAuth();
    const navigate = useNavigate();
    const [transactions, setTransactions] = useState([]);
    const [recentTransactions, setRecentTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showCargarModal, setShowCargarModal] = useState(false);
    const [cargarAmount, setCargarAmount] = useState('');
    const [cargarType, setCargarType] = useState('income');
    const [cargarDesc, setCargarDesc] = useState('');
    const [saving, setSaving] = useState(false);

    // Edit state
    const [editTarget, setEditTarget] = useState(null);
    const [editAmount, setEditAmount] = useState('');
    const [editDesc, setEditDesc] = useState('');
    const [editType, setEditType] = useState('income');
    const [editSaving, setEditSaving] = useState(false);

    const currency = userProfile?.currency || 'PYG';
    const greeting = getGreeting();
    const firstName = userProfile?.name?.split(' ')[0] || 'Usuario';

    useEffect(() => {
        if (!user) return;

        // All transactions for stats/chart
        const qAll = query(
            collection(db, 'transactions'),
            where('userId', '==', user.uid),
            orderBy('date', 'desc')
        );

        const unsubAll = onSnapshot(qAll, (snap) => {
            const data = snap.docs.map(d => ({ id: d.id, ...d.data() }));
            setTransactions(data);
            setLoading(false);
        });

        // Recent 5 for list
        const qRecent = query(
            collection(db, 'transactions'),
            where('userId', '==', user.uid),
            orderBy('date', 'desc'),
            limit(5)
        );

        const unsubRecent = onSnapshot(qRecent, (snap) => {
            setRecentTransactions(snap.docs.map(d => ({ id: d.id, ...d.data() })));
        });

        return () => { unsubAll(); unsubRecent(); };
    }, [user]);

    // This month stats
    const now = new Date();
    const thisMonth = transactions.filter(t => {
        const d = new Date(t.date);
        return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    });
    const totalIncome = thisMonth.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
    const totalExpenses = thisMonth.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
    const balance = totalIncome - totalExpenses;
    const savingsRate = totalIncome > 0 ? calcPercentage(balance, totalIncome) : 0;

    // Chart data
    const chartData = getMonthlyTotals(transactions, 6);

    // Insights
    const insights = generateInsights(transactions, [], currency);

    const openEdit = (txn) => {
        setEditTarget(txn);
        setEditAmount(String(txn.amount));
        setEditDesc(txn.description);
        setEditType(txn.type);
    };

    const closeEdit = () => {
        setEditTarget(null);
        setEditAmount('');
        setEditDesc('');
        setEditType('income');
    };

    const handleEdit = async (e) => {
        e.preventDefault();
        if (!editAmount) return;
        setEditSaving(true);
        try {
            await updateDoc(doc(db, 'transactions', editTarget.id), {
                amount: parseFloat(editAmount),
                description: editDesc,
                type: editType,
            });
            closeEdit();
        } catch (err) {
            console.error(err);
        } finally {
            setEditSaving(false);
        }
    };

    const handleCargar = async (e) => {
        e.preventDefault();
        if (!cargarAmount) return;
        setSaving(true);
        try {
            await addDoc(collection(db, 'transactions'), {
                userId: user.uid,
                type: cargarType,
                amount: parseFloat(cargarAmount),
                description: cargarDesc || (cargarType === 'income' ? 'Ingreso cargado' : 'Gasto registrado'),
                category: 'other',
                date: new Date().toISOString(),
                createdAt: new Date().toISOString(),
            });
            setShowCargarModal(false);
            setCargarAmount('');
            setCargarDesc('');
            setCargarType('income');
        } catch (err) {
            console.error(err);
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="min-h-screen bg-background-light dark:bg-background-dark pb-28">
            <Header title="Finanzo" />

            <main className="max-w-md mx-auto px-4 space-y-4 pt-4">

                {/* Greeting */}
                <div className="animate-fade-in-up">
                    <p className="text-sm text-slate-500 dark:text-slate-400">{greeting},</p>
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white">{firstName} 👋</h2>
                </div>

                {/* Main Balance Card */}
                {loading ? (
                    <SkeletonCard />
                ) : (
                    <div className="gradient-primary rounded-3xl p-5 text-white shadow-xl shadow-primary/25 animate-fade-in-up" style={{ animationDelay: '50ms' }}>
                        <div className="flex items-center justify-between mb-1">
                            <p className="text-sm font-medium opacity-80">Balance este mes</p>
                            <div className="flex items-center gap-1.5 bg-white/20 px-2.5 py-1 rounded-lg text-xs font-bold">
                                <Wallet size={12} /> {savingsRate}% ahorro
                            </div>
                        </div>
                        <p className="text-3xl font-bold mt-1 mb-4">{formatCurrency(balance, currency)}</p>
                        <button
                            onClick={() => setShowCargarModal(true)}
                            className="w-full mb-4 bg-white/20 hover:bg-white/30 active:scale-[0.98] transition-all rounded-2xl py-2.5 text-sm font-bold flex items-center justify-center gap-2"
                        >
                            <Plus size={16} /> Cargar monto
                        </button>
                        <div className="grid grid-cols-2 gap-3">
                            <div className="bg-white/15 rounded-2xl p-3.5">
                                <div className="flex items-center gap-2 mb-1">
                                    <TrendingUp size={14} className="text-green-300" />
                                    <p className="text-[11px] font-semibold opacity-70 uppercase">Ingresos</p>
                                </div>
                                <p className="font-bold text-sm">{formatCurrency(totalIncome, currency)}</p>
                            </div>
                            <div className="bg-white/15 rounded-2xl p-3.5">
                                <div className="flex items-center gap-2 mb-1">
                                    <TrendingDown size={14} className="text-red-300" />
                                    <p className="text-[11px] font-semibold opacity-70 uppercase">Gastos</p>
                                </div>
                                <p className="font-bold text-sm">{formatCurrency(totalExpenses, currency)}</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Quick Actions */}
                <div className="grid grid-cols-3 gap-3 animate-fade-in-up" style={{ animationDelay: '100ms' }}>
                    <button
                        onClick={() => navigate('/transactions', { state: { openModal: true } })}
                        className="flex flex-col items-center gap-2 bg-primary/10 dark:bg-primary/20 rounded-2xl p-4 active:scale-95 transition-transform"
                    >
                        <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-md shadow-primary/30">
                            <Plus size={20} className="text-white" />
                        </div>
                        <span className="text-xs font-semibold text-primary">Agregar</span>
                    </button>
                    <Link to="/budgets" className="flex flex-col items-center gap-2 bg-purple-50 dark:bg-purple-900/20 rounded-2xl p-4 active:scale-95 transition-transform">
                        <div className="w-10 h-10 bg-purple-500 rounded-xl flex items-center justify-center shadow-md shadow-purple-500/30">
                            <PieChart size={20} className="text-white" />
                        </div>
                        <span className="text-xs font-semibold text-purple-600 dark:text-purple-400">Presupuesto</span>
                    </Link>
                    <Link to="/savings" className="flex flex-col items-center gap-2 bg-green-50 dark:bg-green-900/20 rounded-2xl p-4 active:scale-95 transition-transform">
                        <div className="w-10 h-10 bg-green-500 rounded-xl flex items-center justify-center shadow-md shadow-green-500/30">
                            <Target size={20} className="text-white" />
                        </div>
                        <span className="text-xs font-semibold text-green-600 dark:text-green-400">Metas</span>
                    </Link>
                </div>

                {/* Chart */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-100 dark:border-slate-800 animate-fade-in-up" style={{ animationDelay: '150ms' }}>
                    <h3 className="text-sm font-bold text-slate-700 dark:text-slate-200 mb-4">Últimos 6 meses</h3>
                    <ResponsiveContainer width="100%" height={160}>
                        <AreaChart data={chartData} margin={{ top: 0, right: 0, left: -30, bottom: 0 }}>
                            <defs>
                                <linearGradient id="incomeGrad" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                                </linearGradient>
                                <linearGradient id="expenseGrad" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                            <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                            <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                            <Tooltip content={<CustomTooltip currency={currency} />} />
                            <Area type="monotone" dataKey="ingresos" stroke="#22c55e" strokeWidth={2} fill="url(#incomeGrad)" dot={false} />
                            <Area type="monotone" dataKey="gastos" stroke="#ef4444" strokeWidth={2} fill="url(#expenseGrad)" dot={false} />
                        </AreaChart>
                    </ResponsiveContainer>
                    <div className="flex items-center justify-center gap-5 mt-2">
                        <div className="flex items-center gap-1.5">
                            <div className="w-2.5 h-2.5 rounded-full bg-green-500" />
                            <span className="text-xs text-slate-500">Ingresos</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <div className="w-2.5 h-2.5 rounded-full bg-red-500" />
                            <span className="text-xs text-slate-500">Gastos</span>
                        </div>
                    </div>
                </div>

                {/* Insights */}
                {insights.length > 0 && (
                    <div className="space-y-2 animate-fade-in-up" style={{ animationDelay: '200ms' }}>
                        <h3 className="text-sm font-bold text-slate-700 dark:text-slate-200 flex items-center gap-2">
                            <Lightbulb size={15} className="text-amber-500" /> Insights
                        </h3>
                        {insights.map((insight, i) => (
                            <div key={i} className={`rounded-2xl p-4 border ${
                                insight.type === 'warning' ? 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800' :
                                insight.type === 'success' ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800' :
                                'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800'
                            }`}>
                                <p className="font-bold text-sm text-slate-800 dark:text-slate-200">{insight.icon} {insight.title}</p>
                                <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">{insight.message}</p>
                            </div>
                        ))}
                    </div>
                )}

                {/* Recent Transactions */}
                <div className="animate-fade-in-up" style={{ animationDelay: '250ms' }}>
                    <div className="flex items-center justify-between mb-3">
                        <h3 className="text-sm font-bold text-slate-700 dark:text-slate-200">Últimas transacciones</h3>
                        <Link to="/transactions" className="text-xs text-primary font-semibold flex items-center gap-1">
                            Ver todas <ArrowRight size={13} />
                        </Link>
                    </div>

                    {loading ? (
                        <div className="space-y-2">
                            {[...Array(3)].map((_, i) => <SkeletonCard key={i} />)}
                        </div>
                    ) : recentTransactions.length === 0 ? (
                        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-8 text-center">
                            <p className="text-3xl mb-2">💸</p>
                            <p className="text-sm font-semibold text-slate-600 dark:text-slate-400">Sin transacciones aún</p>
                            <button
                                onClick={() => navigate('/transactions', { state: { openModal: true } })}
                                className="mt-3 text-xs text-primary font-bold"
                            >
                                Agregar primera transacción
                            </button>
                        </div>
                    ) : (
                        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 overflow-hidden">
                            {recentTransactions.map((txn, i) => {
                                const cat = getCategoryById(txn.category);
                                const Icon = cat.icon;
                                const isExpense = txn.type === 'expense';
                                return (
                                    <div
                                        key={txn.id}
                                        className={`flex items-center gap-3.5 px-4 py-3.5 ${i < recentTransactions.length - 1 ? 'border-b border-slate-50 dark:border-slate-800/50' : ''}`}
                                    >
                                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${cat.bgLight} ${cat.bgDark} ${cat.text}`}>
                                            <Icon size={18} />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">{txn.description}</p>
                                            <p className="text-xs text-slate-400">{cat.name}</p>
                                        </div>
                                        <div className="flex items-center gap-1.5 shrink-0">
                                            <p className={`text-sm font-bold ${isExpense ? 'text-red-500' : 'text-green-600'}`}>
                                                {isExpense ? '-' : '+'}{formatCurrency(txn.amount, currency)}
                                            </p>
                                            <button onClick={() => openEdit(txn)}
                                                className="p-1.5 bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 rounded-lg transition-all">
                                                <Pencil size={13} className="text-blue-500" />
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

            </main>

            <BottomNav />

            {/* Edit Transaction Modal */}
            {editTarget && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-end justify-center">
                    <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-t-3xl p-6 shadow-2xl animate-slide-up">
                        <div className="flex justify-center mb-4">
                            <div className="w-10 h-1 bg-slate-300 dark:bg-slate-700 rounded-full" />
                        </div>
                        <div className="flex items-center justify-between mb-5">
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center">
                                    <Pencil size={15} className="text-blue-600" />
                                </div>
                                <h2 className="text-xl font-bold text-slate-900 dark:text-white">Editar transacción</h2>
                            </div>
                            <button onClick={closeEdit} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors">
                                <X size={20} className="text-slate-400" />
                            </button>
                        </div>
                        <form onSubmit={handleEdit} className="space-y-4">
                            <div className="grid grid-cols-2 gap-3">
                                <button type="button" onClick={() => setEditType('income')}
                                    className={`p-3.5 rounded-2xl border-2 font-bold flex flex-col items-center gap-1.5 transition-all ${editType === 'income' ? 'border-green-500 bg-green-50 dark:bg-green-900/20 text-green-600' : 'border-slate-200 dark:border-slate-700 text-slate-400'}`}>
                                    <ArrowUp size={22} /> Ingreso
                                </button>
                                <button type="button" onClick={() => setEditType('expense')}
                                    className={`p-3.5 rounded-2xl border-2 font-bold flex flex-col items-center gap-1.5 transition-all ${editType === 'expense' ? 'border-red-500 bg-red-50 dark:bg-red-900/20 text-red-500' : 'border-slate-200 dark:border-slate-700 text-slate-400'}`}>
                                    <ArrowDown size={22} /> Gasto
                                </button>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Monto</label>
                                <div className="relative">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl font-bold text-slate-400">{getCurrencySymbol(currency)}</span>
                                    <input type="number" value={editAmount} onChange={(e) => setEditAmount(e.target.value)}
                                        className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl py-4 pl-12 text-3xl font-bold focus:ring-2 focus:ring-primary outline-none text-slate-900 dark:text-white"
                                        placeholder="0" autoFocus required />
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Descripción</label>
                                <input type="text" value={editDesc} onChange={(e) => setEditDesc(e.target.value)}
                                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl py-3 px-4 text-sm outline-none focus:ring-2 focus:ring-primary text-slate-900 dark:text-white placeholder:text-slate-400"
                                    placeholder="Descripción" required />
                            </div>
                            <button type="submit" disabled={editSaving}
                                className="w-full py-4 rounded-2xl font-bold text-white bg-blue-500 hover:bg-blue-600 shadow-lg shadow-blue-500/25 transition-all disabled:opacity-50">
                                {editSaving ? 'Guardando...' : 'Guardar cambios'}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* Cargar Monto Modal */}
            {showCargarModal && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-end justify-center">
                    <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-t-3xl p-6 shadow-2xl animate-slide-up">
                        <div className="flex justify-center mb-4">
                            <div className="w-10 h-1 bg-slate-300 dark:bg-slate-700 rounded-full" />
                        </div>
                        <div className="flex items-center justify-between mb-5">
                            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Cargar monto</h2>
                            <button onClick={() => setShowCargarModal(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors">
                                <X size={20} className="text-slate-400" />
                            </button>
                        </div>

                        <form onSubmit={handleCargar} className="space-y-4">
                            {/* Tipo */}
                            <div className="grid grid-cols-2 gap-3">
                                <button type="button" onClick={() => setCargarType('income')}
                                    className={`p-3.5 rounded-2xl border-2 font-bold flex flex-col items-center gap-1.5 transition-all ${cargarType === 'income' ? 'border-green-500 bg-green-50 dark:bg-green-900/20 text-green-600' : 'border-slate-200 dark:border-slate-700 text-slate-400'}`}>
                                    <ArrowUp size={22} /> Ingreso
                                </button>
                                <button type="button" onClick={() => setCargarType('expense')}
                                    className={`p-3.5 rounded-2xl border-2 font-bold flex flex-col items-center gap-1.5 transition-all ${cargarType === 'expense' ? 'border-red-500 bg-red-50 dark:bg-red-900/20 text-red-500' : 'border-slate-200 dark:border-slate-700 text-slate-400'}`}>
                                    <ArrowDown size={22} /> Gasto
                                </button>
                            </div>

                            {/* Monto */}
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Monto</label>
                                <div className="relative">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl font-bold text-slate-400">{getCurrencySymbol(currency)}</span>
                                    <input
                                        type="number"
                                        value={cargarAmount}
                                        onChange={(e) => setCargarAmount(e.target.value)}
                                        className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl py-4 pl-12 text-3xl font-bold focus:ring-2 focus:ring-primary outline-none text-slate-900 dark:text-white"
                                        placeholder="0"
                                        autoFocus
                                        required
                                    />
                                </div>
                            </div>

                            {/* Descripción */}
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Descripción (opcional)</label>
                                <input
                                    type="text"
                                    value={cargarDesc}
                                    onChange={(e) => setCargarDesc(e.target.value)}
                                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl py-3 px-4 text-sm outline-none focus:ring-2 focus:ring-primary text-slate-900 dark:text-white placeholder:text-slate-400"
                                    placeholder="Ej. Sueldo de abril"
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={saving}
                                className={`w-full py-4 rounded-2xl font-bold text-white transition-all disabled:opacity-50 ${cargarType === 'income' ? 'bg-green-500 hover:bg-green-600 shadow-lg shadow-green-500/25' : 'bg-red-500 hover:bg-red-600 shadow-lg shadow-red-500/25'}`}
                            >
                                {saving ? 'Guardando...' : `Registrar ${cargarType === 'income' ? 'ingreso' : 'gasto'}`}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
