import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { collection, query, where, orderBy, onSnapshot, addDoc, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import Header from '../components/layout/Header';
import BottomNav from '../components/layout/BottomNav';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import EmptyState from '../components/ui/EmptyState';
import { SkeletonTransactionList } from '../components/ui/SkeletonLoader';
import { formatCurrency, getCurrencySymbol, formatDate } from '../utils/helpers';
import { categories, getCategoryById } from '../data/categories';
import {
    X, Search, Trash2, Pencil,
    ArrowDown, ArrowUp,
    TrendingUp, TrendingDown,
    Calendar,
} from 'lucide-react';

const dateFilters = [
    { id: 'all', label: 'Todo' },
    { id: '7d', label: '7 días' },
    { id: '30d', label: '30 días' },
    { id: 'month', label: 'Este mes' },
];

export default function Transactions() {
    const location = useLocation();
    const { user, userProfile } = useAuth();
    const toast = useToast();
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [filter, setFilter] = useState('all');
    const [dateFilter, setDateFilter] = useState('month');
    const [searchQuery, setSearchQuery] = useState('');
    const [deleteTarget, setDeleteTarget] = useState(null);

    // Edit state
    const [editTarget, setEditTarget] = useState(null);
    const [editAmount, setEditAmount] = useState('');
    const [editDescription, setEditDescription] = useState('');
    const [editCategory, setEditCategory] = useState('other');
    const [editType, setEditType] = useState('expense');
    const [editSaving, setEditSaving] = useState(false);

    // New transaction form state
    const [type, setType] = useState('expense');
    const [amount, setAmount] = useState('');
    const [description, setDescription] = useState('');
    const [category, setCategory] = useState('other');
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (location.state?.openModal) {
            setShowModal(true);
            window.history.replaceState({}, '');
        }
    }, [location.state]);

    useEffect(() => {
        if (!user) return;
        const q = query(collection(db, 'transactions'), where('userId', '==', user.uid), orderBy('date', 'desc'));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            setTransactions(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
            setLoading(false);
        });
        return () => unsubscribe();
    }, [user]);

    const openEdit = (txn) => {
        setEditTarget(txn);
        setEditAmount(String(txn.amount));
        setEditDescription(txn.description);
        setEditCategory(txn.category);
        setEditType(txn.type);
    };

    const closeEdit = () => {
        setEditTarget(null);
        setEditAmount('');
        setEditDescription('');
        setEditCategory('other');
        setEditType('expense');
    };

    const handleEdit = async (e) => {
        e.preventDefault();
        if (!editAmount || !editDescription) return;
        setEditSaving(true);
        try {
            await updateDoc(doc(db, 'transactions', editTarget.id), {
                amount: parseFloat(editAmount),
                description: editDescription,
                category: editCategory,
                type: editType,
            });
            toast.success('Actualizada', 'La transacción fue editada correctamente.');
            closeEdit();
        } catch (error) {
            toast.error('Error', 'No se pudo actualizar la transacción.');
        } finally {
            setEditSaving(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!amount || !description) return;
        setSaving(true);
        try {
            await addDoc(collection(db, 'transactions'), {
                userId: user.uid, type, amount: parseFloat(amount),
                description, category, date: new Date().toISOString(), createdAt: new Date().toISOString()
            });
            setShowModal(false);
            setAmount(''); setDescription(''); setCategory('other'); setType('expense');
            toast.success('Transacción guardada', `${type === 'income' ? 'Ingreso' : 'Gasto'} registrado correctamente.`);
        } catch (error) {
            toast.error('Error', 'No se pudo guardar la transacción.');
        } finally { setSaving(false); }
    };

    const handleDelete = async () => {
        if (!deleteTarget) return;
        try {
            await deleteDoc(doc(db, 'transactions', deleteTarget));
            toast.success('Eliminada', 'La transacción fue eliminada.');
        } catch (error) {
            toast.error('Error', 'No se pudo eliminar.');
        }
        setDeleteTarget(null);
    };

    const now = new Date();
    const filtered = transactions.filter(txn => {
        if (filter !== 'all' && txn.type !== filter) return false;
        if (searchQuery && !txn.description.toLowerCase().includes(searchQuery.toLowerCase())) return false;
        if (dateFilter !== 'all') {
            const txnDate = new Date(txn.date);
            if (dateFilter === '7d' && (now - txnDate) > 7 * 86400000) return false;
            if (dateFilter === '30d' && (now - txnDate) > 30 * 86400000) return false;
            if (dateFilter === 'month' && (txnDate.getMonth() !== now.getMonth() || txnDate.getFullYear() !== now.getFullYear())) return false;
        }
        return true;
    });

    const grouped = filtered.reduce((groups, txn) => {
        const date = formatDate(txn.date);
        if (!groups[date]) groups[date] = [];
        groups[date].push(txn);
        return groups;
    }, {});

    const currency = userProfile?.currency || 'PYG';
    const totalIncome = filtered.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
    const totalExpenses = filtered.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);

    return (
        <div className="min-h-screen bg-background-light dark:bg-background-dark pb-24">
            <Header title="Transacciones" />

            <main className="max-w-md mx-auto">
                {/* Summary Card */}
                <div className="p-4 animate-fade-in-up">
                    <div className="gradient-primary rounded-2xl p-5 text-white shadow-lg shadow-primary/20">
                        <p className="text-sm opacity-80 font-medium mb-1">Resumen del período</p>
                        <div className="grid grid-cols-2 gap-4 mt-3">
                            <div className="flex items-center gap-2">
                                <div className="bg-green-400/20 p-1.5 rounded-lg">
                                    <TrendingUp size={16} className="text-green-300" />
                                </div>
                                <div>
                                    <p className="text-[10px] uppercase opacity-70">Ingresos</p>
                                    <p className="text-sm font-bold">{formatCurrency(totalIncome, currency)}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="bg-red-400/20 p-1.5 rounded-lg">
                                    <TrendingDown size={16} className="text-red-300" />
                                </div>
                                <div>
                                    <p className="text-[10px] uppercase opacity-70">Gastos</p>
                                    <p className="text-sm font-bold">{formatCurrency(totalExpenses, currency)}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Search */}
                <div className="px-4 mb-3 animate-fade-in-up" style={{ animationDelay: '50ms' }}>
                    <div className="relative">
                        <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Buscar por descripción..."
                            className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl py-2.5 pl-10 pr-4 text-sm outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary text-slate-900 dark:text-white placeholder:text-slate-400"
                        />
                    </div>
                </div>

                {/* Filters */}
                <div className="px-4 animate-fade-in-up" style={{ animationDelay: '100ms' }}>
                    <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
                        {[{ id: 'all', label: 'Todos' }, { id: 'income', label: 'Ingresos' }, { id: 'expense', label: 'Gastos' }].map((f) => (
                            <button key={f.id} onClick={() => setFilter(f.id)}
                                className={`px-4 py-2 rounded-full whitespace-nowrap text-sm font-medium transition-all ${filter === f.id ? 'bg-primary text-white shadow-md shadow-primary/20' : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'}`}>
                                {f.label}
                            </button>
                        ))}
                        <div className="w-px bg-slate-200 dark:bg-slate-700 mx-1" />
                        {dateFilters.map((f) => (
                            <button key={f.id} onClick={() => setDateFilter(f.id)}
                                className={`px-3 py-2 rounded-full whitespace-nowrap text-xs font-medium transition-all flex items-center gap-1 ${dateFilter === f.id ? 'bg-slate-800 dark:bg-white text-white dark:text-slate-900' : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400'}`}>
                                {f.id !== 'all' && <Calendar size={12} />} {f.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Transaction List */}
                <div className="mt-4">
                    {loading ? (
                        <SkeletonTransactionList count={6} />
                    ) : Object.keys(grouped).length === 0 ? (
                        <EmptyState variant={searchQuery ? 'search' : 'transactions'} action={searchQuery ? undefined : () => setShowModal(true)} actionLabel="Agregar transacción" />
                    ) : (
                        <div className="stagger-children">
                            {Object.entries(grouped).map(([date, txns]) => (
                                <div key={date}>
                                    <div className="px-4 py-2 bg-slate-50 dark:bg-slate-900/50 text-[11px] font-bold text-slate-500 uppercase tracking-wider">{date}</div>
                                    {txns.map((txn) => {
                                        const cat = getCategoryById(txn.category);
                                        const Icon = cat.icon;
                                        const isExpense = txn.type === 'expense';
                                        return (
                                            <div key={txn.id} className="flex items-center gap-3.5 bg-white dark:bg-background-dark px-4 py-3.5 border-b border-slate-50 dark:border-slate-800/50 group">
                                                <div className={`flex size-11 items-center justify-center rounded-xl shrink-0 ${cat.bgLight} ${cat.bgDark} ${cat.text}`}>
                                                    <Icon size={22} />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="font-semibold text-sm text-slate-900 dark:text-white truncate">{txn.description}</p>
                                                    <p className="text-xs text-slate-400">{cat.name}</p>
                                                </div>
                                                <div className="text-right shrink-0 flex items-center gap-1">
                                                    <p className={`font-bold text-sm ${isExpense ? 'text-red-500' : 'text-green-600'}`}>
                                                        {isExpense ? '-' : '+'}{formatCurrency(txn.amount, currency)}
                                                    </p>
                                                    <button onClick={() => openEdit(txn)}
                                                        className="p-1.5 opacity-0 group-hover:opacity-100 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-all ml-1">
                                                        <Pencil size={14} className="text-blue-500" />
                                                    </button>
                                                    <button onClick={() => setDeleteTarget(txn.id)}
                                                        className="p-1.5 opacity-0 group-hover:opacity-100 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all">
                                                        <Trash2 size={14} className="text-red-500" />
                                                    </button>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </main>

            {/* Add Transaction Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-end justify-center animate-backdrop-in">
                    <div className="bg-white dark:bg-background-dark w-full max-w-md rounded-t-3xl p-6 shadow-2xl animate-slide-up">
                        <div className="flex justify-center mb-4">
                            <div className="w-10 h-1 bg-slate-300 dark:bg-slate-700 rounded-full" />
                        </div>
                        <div className="flex items-center justify-between mb-5">
                            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Nueva Transacción</h2>
                            <button onClick={() => setShowModal(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors">
                                <X size={20} className="text-slate-400" />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-2 gap-3">
                                <button type="button" onClick={() => setType('expense')}
                                    className={`p-3.5 rounded-2xl border-2 font-bold flex flex-col items-center gap-1.5 transition-all ${type === 'expense' ? 'border-red-500 bg-red-50 dark:bg-red-900/20 text-red-500' : 'border-slate-200 dark:border-slate-700 text-slate-400'}`}>
                                    <ArrowDown size={22} /> Gasto
                                </button>
                                <button type="button" onClick={() => setType('income')}
                                    className={`p-3.5 rounded-2xl border-2 font-bold flex flex-col items-center gap-1.5 transition-all ${type === 'income' ? 'border-green-500 bg-green-50 dark:bg-green-900/20 text-green-500' : 'border-slate-200 dark:border-slate-700 text-slate-400'}`}>
                                    <ArrowUp size={22} /> Ingreso
                                </button>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Monto</label>
                                <div className="relative">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl font-bold text-slate-400">{getCurrencySymbol(currency)}</span>
                                    <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)}
                                        className="w-full bg-slate-50 dark:bg-slate-900 border-none rounded-2xl py-4 pl-12 text-3xl font-bold focus:ring-2 focus:ring-primary text-slate-900 dark:text-white" placeholder="0" required />
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Descripción</label>
                                <input type="text" value={description} onChange={(e) => setDescription(e.target.value)}
                                    className="input-field" placeholder="Ej. Supermercado" required />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Categoría</label>
                                <div className="grid grid-cols-3 gap-2">
                                    {categories.map((cat) => {
                                        const Icon = cat.icon;
                                        return (
                                            <button key={cat.id} type="button" onClick={() => setCategory(cat.id)}
                                                className={`p-2.5 rounded-xl border-2 flex flex-col items-center gap-1 transition-all ${category === cat.id ? 'border-primary bg-primary/5 text-primary' : 'border-slate-200 dark:border-slate-700 text-slate-500'}`}>
                                                <Icon size={18} />
                                                <span className="text-[10px] font-medium leading-tight">{cat.name}</span>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                            <button type="submit" disabled={saving} className="btn-primary mt-4 disabled:opacity-50">
                                {saving ? 'Guardando...' : 'Guardar Transacción'}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* Edit Transaction Modal */}
            {editTarget && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-end justify-center">
                    <div className="bg-white dark:bg-background-dark w-full max-w-md rounded-t-3xl p-6 shadow-2xl animate-slide-up">
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
                            {/* Tipo */}
                            <div className="grid grid-cols-2 gap-3">
                                <button type="button" onClick={() => setEditType('expense')}
                                    className={`p-3.5 rounded-2xl border-2 font-bold flex flex-col items-center gap-1.5 transition-all ${editType === 'expense' ? 'border-red-500 bg-red-50 dark:bg-red-900/20 text-red-500' : 'border-slate-200 dark:border-slate-700 text-slate-400'}`}>
                                    <ArrowDown size={22} /> Gasto
                                </button>
                                <button type="button" onClick={() => setEditType('income')}
                                    className={`p-3.5 rounded-2xl border-2 font-bold flex flex-col items-center gap-1.5 transition-all ${editType === 'income' ? 'border-green-500 bg-green-50 dark:bg-green-900/20 text-green-500' : 'border-slate-200 dark:border-slate-700 text-slate-400'}`}>
                                    <ArrowUp size={22} /> Ingreso
                                </button>
                            </div>
                            {/* Monto */}
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Monto</label>
                                <div className="relative">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl font-bold text-slate-400">{getCurrencySymbol(currency)}</span>
                                    <input
                                        type="number"
                                        value={editAmount}
                                        onChange={(e) => setEditAmount(e.target.value)}
                                        className="w-full bg-slate-50 dark:bg-slate-900 border-none rounded-2xl py-4 pl-12 text-3xl font-bold focus:ring-2 focus:ring-primary outline-none text-slate-900 dark:text-white"
                                        placeholder="0"
                                        autoFocus
                                        required
                                    />
                                </div>
                            </div>
                            {/* Descripción */}
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Descripción</label>
                                <input
                                    type="text"
                                    value={editDescription}
                                    onChange={(e) => setEditDescription(e.target.value)}
                                    className="input-field"
                                    placeholder="Ej. Supermercado"
                                    required
                                />
                            </div>
                            {/* Categoría */}
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Categoría</label>
                                <div className="grid grid-cols-3 gap-2">
                                    {categories.map((cat) => {
                                        const Icon = cat.icon;
                                        return (
                                            <button key={cat.id} type="button" onClick={() => setEditCategory(cat.id)}
                                                className={`p-2.5 rounded-xl border-2 flex flex-col items-center gap-1 transition-all ${editCategory === cat.id ? 'border-primary bg-primary/5 text-primary' : 'border-slate-200 dark:border-slate-700 text-slate-500'}`}>
                                                <Icon size={18} />
                                                <span className="text-[10px] font-medium leading-tight">{cat.name}</span>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                            <button type="submit" disabled={editSaving}
                                className="w-full py-4 rounded-2xl font-bold text-white bg-blue-500 hover:bg-blue-600 shadow-lg shadow-blue-500/25 transition-all disabled:opacity-50">
                                {editSaving ? 'Guardando...' : 'Guardar cambios'}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* Delete Confirmation */}
            <ConfirmDialog
                isOpen={!!deleteTarget}
                onClose={() => setDeleteTarget(null)}
                onConfirm={handleDelete}
                title="¿Eliminar transacción?"
                message="Esta acción no se puede deshacer. La transacción será eliminada permanentemente."
                confirmText="Eliminar"
                variant="danger"
            />

            <BottomNav />
        </div>
    );
}
