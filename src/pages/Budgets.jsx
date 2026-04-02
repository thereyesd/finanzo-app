import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { collection, query, where, onSnapshot, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../config/firebase';
import Header from '../components/layout/Header';
import BottomNav from '../components/layout/BottomNav';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import EmptyState from '../components/ui/EmptyState';
import { formatCurrency, getCurrencySymbol, calcPercentage } from '../utils/helpers';
import { categories, getCategoryById } from '../data/categories';
import { Plus, X, Pencil, Trash2, AlertTriangle, CheckCircle } from 'lucide-react';

export default function Budgets() {
    const { user, userProfile } = useAuth();
    const toast = useToast();
    const [budgets, setBudgets] = useState([]);
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingBudget, setEditingBudget] = useState(null);
    const [deleteTarget, setDeleteTarget] = useState(null);

    const [category, setCategory] = useState('food');
    const [limit, setLimit] = useState('');
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (!user) return;
        const budgetsQuery = query(collection(db, 'budgets'), where('userId', '==', user.uid));
        const unsubBudgets = onSnapshot(budgetsQuery, (snapshot) => {
            setBudgets(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
            setLoading(false);
        });
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const txnQuery = query(collection(db, 'transactions'), where('userId', '==', user.uid), where('type', '==', 'expense'));
        const unsubTxns = onSnapshot(txnQuery, (snapshot) => {
            setTransactions(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })).filter(txn => new Date(txn.date) >= startOfMonth));
        });
        return () => { unsubBudgets(); unsubTxns(); };
    }, [user]);

    const getSpentByCategory = (categoryId) => transactions.filter(t => t.category === categoryId).reduce((sum, t) => sum + t.amount, 0);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!limit) return;
        setSaving(true);
        try {
            if (editingBudget) {
                await updateDoc(doc(db, 'budgets', editingBudget.id), { category, limit: parseFloat(limit), updatedAt: new Date().toISOString() });
                toast.success('Actualizado', 'Presupuesto actualizado correctamente.');
            } else {
                await addDoc(collection(db, 'budgets'), { userId: user.uid, category, limit: parseFloat(limit), period: 'monthly', createdAt: new Date().toISOString() });
                toast.success('Creado', 'Nuevo presupuesto creado.');
            }
            setShowModal(false); setEditingBudget(null); setLimit(''); setCategory('food');
        } catch (error) {
            toast.error('Error', 'No se pudo guardar el presupuesto.');
        } finally { setSaving(false); }
    };

    const handleEdit = (budget) => { setEditingBudget(budget); setCategory(budget.category); setLimit(budget.limit.toString()); setShowModal(true); };

    const handleDelete = async () => {
        if (!deleteTarget) return;
        try { await deleteDoc(doc(db, 'budgets', deleteTarget)); toast.success('Eliminado', 'Presupuesto eliminado.'); }
        catch (error) { toast.error('Error', 'No se pudo eliminar.'); }
        setDeleteTarget(null);
    };

    const currency = userProfile?.currency || 'PYG';

    // Summary stats
    const totalBudgeted = budgets.reduce((s, b) => s + b.limit, 0);
    const totalSpent = budgets.reduce((s, b) => s + getSpentByCategory(b.category), 0);


    // Health indicator
    const healthPct = totalBudgeted > 0 ? (totalSpent / totalBudgeted) * 100 : 0;
    const healthStatus = healthPct > 100 ? { label: 'Excedido', color: 'text-red-500', bg: 'bg-red-100 dark:bg-red-900/30', icon: AlertTriangle } :
        healthPct > 80 ? { label: 'Cuidado', color: 'text-yellow-500', bg: 'bg-yellow-100 dark:bg-yellow-900/30', icon: AlertTriangle } :
        { label: 'Saludable', color: 'text-green-500', bg: 'bg-green-100 dark:bg-green-900/30', icon: CheckCircle };

    return (
        <div className="min-h-screen bg-background-light dark:bg-background-dark pb-24">
            <Header title="Presupuestos" />

            <main className="max-w-md mx-auto">
                {/* Summary */}
                <div className="p-4 animate-fade-in-up">
                    <div className="card p-5">
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <p className="text-sm text-slate-500 font-medium">Control de Gastos</p>
                                <p className="text-xs text-slate-400 mt-0.5">{budgets.length} presupuesto{budgets.length !== 1 ? 's' : ''} activo{budgets.length !== 1 ? 's' : ''}</p>
                            </div>
                            <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full ${healthStatus.bg}`}>
                                <healthStatus.icon size={14} className={healthStatus.color} />
                                <span className={`text-xs font-bold ${healthStatus.color}`}>{healthStatus.label}</span>
                            </div>
                        </div>
                        {totalBudgeted > 0 && (
                            <>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-xs text-slate-400 font-medium">Gastado</p>
                                        <p className="text-lg font-bold text-slate-900 dark:text-white">{formatCurrency(totalSpent, currency)}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-slate-400 font-medium">Presupuestado</p>
                                        <p className="text-lg font-bold text-slate-900 dark:text-white">{formatCurrency(totalBudgeted, currency)}</p>
                                    </div>
                                </div>
                                <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2.5 mt-4">
                                    <div className={`h-2.5 rounded-full transition-all animate-progress-fill ${healthPct > 100 ? 'bg-red-500' : healthPct > 80 ? 'bg-yellow-500' : 'bg-green-500'}`}
                                        style={{ width: `${Math.min(healthPct, 100)}%` }} />
                                </div>
                                <p className="text-xs text-slate-400 mt-2 text-right">{Math.round(healthPct)}% utilizado</p>
                            </>
                        )}
                    </div>
                </div>

                {/* Add Button */}
                <div className="px-4 py-2">
                    <button onClick={() => { setEditingBudget(null); setCategory('food'); setLimit(''); setShowModal(true); }}
                        className="w-full bg-primary hover:bg-primary-dark text-white font-bold py-3.5 rounded-2xl flex items-center justify-center gap-2 transition-all active:scale-[0.97] shadow-md shadow-primary/20">
                        <Plus size={20} /> <span>Nuevo Presupuesto</span>
                    </button>
                </div>

                {/* Budget List */}
                <div className="px-4 py-2 space-y-3 stagger-children">
                    {loading ? (
                        <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="skeleton h-28 rounded-2xl" />)}</div>
                    ) : budgets.length === 0 ? (
                        <EmptyState variant="budgets" action={() => setShowModal(true)} actionLabel="Crear presupuesto" />
                    ) : (
                        budgets.map((budget) => {
                            const cat = getCategoryById(budget.category);
                            const Icon = cat.icon;
                            const spent = getSpentByCategory(budget.category);
                            const percentage = calcPercentage(spent, budget.limit);
                            const isOverBudget = spent > budget.limit;
                            const isWarning = percentage > 80 && !isOverBudget;

                            return (
                                <div key={budget.id} className={`card p-4 ${isOverBudget ? 'border-l-4 border-l-red-500' : ''}`}>
                                    <div className="flex items-center gap-3 mb-3">
                                        <div className={`flex size-11 shrink-0 items-center justify-center rounded-xl ${cat.bgSolid} text-white`}>
                                            <Icon size={22} />
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <p className="font-bold text-sm text-slate-900 dark:text-white">{cat.name}</p>
                                                    <p className="text-xs text-slate-500">{formatCurrency(spent, currency)} de {formatCurrency(budget.limit, currency)}</p>
                                                </div>
                                                <div className="flex gap-0.5">
                                                    <button onClick={() => handleEdit(budget)} className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
                                                        <Pencil size={14} className="text-slate-400" />
                                                    </button>
                                                    <button onClick={() => setDeleteTarget(budget.id)} className="p-1.5 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors">
                                                        <Trash2 size={14} className="text-red-500" />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2.5">
                                        <div className={`h-2.5 rounded-full transition-all animate-progress-fill ${isOverBudget ? 'bg-red-500' : isWarning ? 'bg-yellow-500' : 'bg-green-500'}`}
                                            style={{ width: `${percentage}%` }} />
                                    </div>

                                    <div className="flex justify-between items-center mt-2">
                                        <span className="text-xs text-slate-400">{percentage}%</span>
                                        {isOverBudget && (
                                            <span className="text-xs font-semibold text-red-500 flex items-center gap-1">
                                                <AlertTriangle size={12} /> Excedido por {formatCurrency(spent - budget.limit, currency)}
                                            </span>
                                        )}
                                        {isWarning && (
                                            <span className="text-xs font-semibold text-yellow-500">Cerca del límite</span>
                                        )}
                                        {!isOverBudget && !isWarning && (
                                            <span className="text-xs text-slate-400">Restante: {formatCurrency(budget.limit - spent, currency)}</span>
                                        )}
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </main>

            {/* Add/Edit Budget Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-end justify-center animate-backdrop-in">
                    <div className="bg-white dark:bg-background-dark w-full max-w-md rounded-t-3xl p-6 shadow-2xl animate-slide-up">
                        <div className="flex justify-center mb-4"><div className="w-10 h-1 bg-slate-300 dark:bg-slate-700 rounded-full" /></div>
                        <div className="flex items-center justify-between mb-5">
                            <h2 className="text-xl font-bold text-slate-900 dark:text-white">{editingBudget ? 'Editar Presupuesto' : 'Nuevo Presupuesto'}</h2>
                            <button onClick={() => { setShowModal(false); setEditingBudget(null); }} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors">
                                <X size={20} className="text-slate-400" />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="space-y-4">
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
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Límite mensual</label>
                                <div className="relative">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl font-bold text-slate-400">{getCurrencySymbol(currency)}</span>
                                    <input type="number" value={limit} onChange={(e) => setLimit(e.target.value)}
                                        className="w-full bg-slate-50 dark:bg-slate-900 border-none rounded-2xl py-4 pl-12 text-3xl font-bold focus:ring-2 focus:ring-primary text-slate-900 dark:text-white" placeholder="0" required />
                                </div>
                            </div>
                            <button type="submit" disabled={saving} className="btn-primary mt-4 disabled:opacity-50">
                                {saving ? 'Guardando...' : editingBudget ? 'Actualizar' : 'Crear Presupuesto'}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            <ConfirmDialog isOpen={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={handleDelete}
                title="¿Eliminar presupuesto?" message="El presupuesto será eliminado permanentemente." confirmText="Eliminar" variant="danger" />

            <BottomNav />
        </div>
    );
}
