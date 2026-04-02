import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { collection, query, where, onSnapshot, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../config/firebase';
import Header from '../components/layout/Header';
import BottomNav from '../components/layout/BottomNav';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import EmptyState from '../components/ui/EmptyState';
import AnimatedNumber from '../components/ui/AnimatedNumber';
import { formatCurrency, getCurrencySymbol, calcPercentage } from '../utils/helpers';
import { Plus, X, Target, Pencil, Trash2, TrendingUp, Calendar, Clock, PartyPopper } from 'lucide-react';

export default function SavingsGoals() {
    const { user, userProfile } = useAuth();
    const toast = useToast();
    const [goals, setGoals] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [showAddFunds, setShowAddFunds] = useState(null);
    const [editingGoal, setEditingGoal] = useState(null);
    const [deleteTarget, setDeleteTarget] = useState(null);

    const [name, setName] = useState('');
    const [targetAmount, setTargetAmount] = useState('');
    const [deadline, setDeadline] = useState('');
    const [addAmount, setAddAmount] = useState('');
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (!user) return;
        const q = query(collection(db, 'savingsGoals'), where('userId', '==', user.uid));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            setGoals(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
            setLoading(false);
        });
        return () => unsubscribe();
    }, [user]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!name || !targetAmount) return;
        setSaving(true);
        try {
            if (editingGoal) {
                await updateDoc(doc(db, 'savingsGoals', editingGoal.id), { name, targetAmount: parseFloat(targetAmount), deadline: deadline || null, updatedAt: new Date().toISOString() });
                toast.success('Actualizada', 'Meta actualizada correctamente.');
            } else {
                await addDoc(collection(db, 'savingsGoals'), { userId: user.uid, name, targetAmount: parseFloat(targetAmount), currentAmount: 0, deadline: deadline || null, createdAt: new Date().toISOString() });
                toast.success('Creada', 'Nueva meta de ahorro creada.');
            }
            resetForm();
        } catch (error) { toast.error('Error', 'No se pudo guardar la meta.'); }
        finally { setSaving(false); }
    };

    const handleAddFunds = async (e) => {
        e.preventDefault();
        if (!addAmount || !showAddFunds) return;
        setSaving(true);
        try {
            const goal = goals.find(g => g.id === showAddFunds);
            const newAmount = (goal.currentAmount || 0) + parseFloat(addAmount);
            await updateDoc(doc(db, 'savingsGoals', showAddFunds), { currentAmount: newAmount, updatedAt: new Date().toISOString() });
            const isComplete = newAmount >= goal.targetAmount;
            if (isComplete) {
                toast.success('Meta completada!', `Alcanzaste tu meta "${goal.name}".`);
            } else {
                toast.success('Aporte registrado', `Se agregaron ${formatCurrency(parseFloat(addAmount), currency)} a "${goal.name}".`);
            }
            setShowAddFunds(null); setAddAmount('');
        } catch (error) { toast.error('Error', 'No se pudo agregar el aporte.'); }
        finally { setSaving(false); }
    };

    const handleEdit = (goal) => { setEditingGoal(goal); setName(goal.name); setTargetAmount(goal.targetAmount.toString()); setDeadline(goal.deadline || ''); setShowModal(true); };

    const handleDelete = async () => {
        if (!deleteTarget) return;
        try { await deleteDoc(doc(db, 'savingsGoals', deleteTarget)); toast.success('Eliminada', 'Meta eliminada.'); }
        catch (error) { toast.error('Error', 'No se pudo eliminar.'); }
        setDeleteTarget(null);
    };

    const resetForm = () => { setShowModal(false); setEditingGoal(null); setName(''); setTargetAmount(''); setDeadline(''); };

    const currency = userProfile?.currency || 'PYG';
    const totalSavings = goals.reduce((sum, g) => sum + (g.currentAmount || 0), 0);
    const completedGoals = goals.filter(g => g.currentAmount >= g.targetAmount).length;

    // Estimate time to reach goal
    const getTimeEstimate = (goal) => {
        if (!goal.deadline) return null;
        const remaining = goal.targetAmount - (goal.currentAmount || 0);
        if (remaining <= 0) return null;
        const daysLeft = Math.ceil((new Date(goal.deadline) - new Date()) / 86400000);
        if (daysLeft <= 0) return 'Vencida';
        if (daysLeft <= 30) return `${daysLeft} días restantes`;
        return `${Math.ceil(daysLeft / 30)} meses restantes`;
    };

    return (
        <div className="min-h-screen bg-background-light dark:bg-background-dark pb-24">
            <Header title="Metas de Ahorro" />

            <main className="max-w-md mx-auto">
                {/* Summary Card */}
                <div className="p-4 animate-fade-in-up">
                    <div className="gradient-success rounded-2xl p-6 text-white shadow-xl shadow-green-500/20">
                        <div className="flex items-center gap-3 mb-2">
                            <Target size={24} />
                            <p className="text-sm opacity-80 font-medium">Total Ahorrado</p>
                        </div>
                        <h2 className="text-3xl font-bold">
                            <AnimatedNumber value={totalSavings} formatter={(v) => formatCurrency(v, currency)} />
                        </h2>
                        <div className="flex gap-4 mt-3 pt-3 border-t border-white/15">
                            <p className="text-sm opacity-80">{goals.length} meta{goals.length !== 1 ? 's' : ''} activa{goals.length !== 1 ? 's' : ''}</p>
                            {completedGoals > 0 && <p className="text-sm opacity-80">{completedGoals} completada{completedGoals !== 1 ? 's' : ''}</p>}
                        </div>
                    </div>
                </div>

                {/* Add Button */}
                <div className="px-4 py-2">
                    <button onClick={() => { resetForm(); setShowModal(true); }}
                        className="w-full bg-primary hover:bg-primary-dark text-white font-bold py-3.5 rounded-2xl flex items-center justify-center gap-2 transition-all active:scale-[0.97] shadow-md shadow-primary/20">
                        <Plus size={20} /> <span>Nueva Meta</span>
                    </button>
                </div>

                {/* Goals List */}
                <div className="px-4 py-2 space-y-3 stagger-children">
                    {loading ? (
                        <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="skeleton h-40 rounded-2xl" />)}</div>
                    ) : goals.length === 0 ? (
                        <EmptyState variant="savings" action={() => setShowModal(true)} actionLabel="Crear meta" />
                    ) : (
                        goals.map((goal) => {
                            const percentage = calcPercentage(goal.currentAmount || 0, goal.targetAmount);
                            const isComplete = (goal.currentAmount || 0) >= goal.targetAmount;
                            const timeEstimate = getTimeEstimate(goal);

                            return (
                                <div key={goal.id} className={`card p-4 ${isComplete ? 'ring-2 ring-green-500/30' : ''}`}>
                                    <div className="flex items-start justify-between mb-3">
                                        <div className="flex items-center gap-3">
                                            <div className={`flex size-11 shrink-0 items-center justify-center rounded-xl ${isComplete ? 'bg-green-100 dark:bg-green-900/30 text-green-600' : 'bg-primary/10 text-primary'}`}>
                                                {isComplete ? <PartyPopper size={22} /> : <Target size={22} />}
                                            </div>
                                            <div>
                                                <p className="font-bold text-sm text-slate-900 dark:text-white">{goal.name}</p>
                                                <div className="flex items-center gap-2 mt-0.5">
                                                    {goal.deadline && (
                                                        <p className="text-xs text-slate-400 flex items-center gap-1">
                                                            <Calendar size={11} /> {new Date(goal.deadline).toLocaleDateString('es-PY', { day: 'numeric', month: 'short', year: 'numeric' })}
                                                        </p>
                                                    )}
                                                    {timeEstimate && !isComplete && (
                                                        <p className="text-xs text-slate-400 flex items-center gap-1">
                                                            <Clock size={11} /> {timeEstimate}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex gap-0.5">
                                            <button onClick={() => handleEdit(goal)} className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
                                                <Pencil size={14} className="text-slate-400" />
                                            </button>
                                            <button onClick={() => setDeleteTarget(goal.id)} className="p-1.5 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors">
                                                <Trash2 size={14} className="text-red-500" />
                                            </button>
                                        </div>
                                    </div>

                                    {/* Progress */}
                                    <div className="mb-3">
                                        <div className="flex justify-between text-xs mb-1.5">
                                            <span className="text-slate-500 font-medium">Progreso</span>
                                            <span className={`font-bold ${isComplete ? 'text-green-500' : 'text-slate-900 dark:text-white'}`}>{percentage}%</span>
                                        </div>
                                        <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2.5">
                                            <div className={`h-2.5 rounded-full transition-all animate-progress-fill ${isComplete ? 'bg-green-500' : 'bg-primary'}`}
                                                style={{ width: `${percentage}%` }} />
                                        </div>
                                    </div>

                                    <div className="flex justify-between items-center">
                                        <div>
                                            <p className="text-base font-bold text-slate-900 dark:text-white">{formatCurrency(goal.currentAmount || 0, currency)}</p>
                                            <p className="text-xs text-slate-400">de {formatCurrency(goal.targetAmount, currency)}</p>
                                        </div>
                                        {!isComplete ? (
                                            <button onClick={() => setShowAddFunds(goal.id)}
                                                className="bg-primary/10 hover:bg-primary/20 text-primary font-semibold px-4 py-2 rounded-xl flex items-center gap-1.5 transition-colors text-sm">
                                                <TrendingUp size={16} /> Aportar
                                            </button>
                                        ) : (
                                            <span className="badge-success px-3 py-1.5 rounded-xl font-semibold">Completada</span>
                                        )}
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </main>

            {/* Add/Edit Goal Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-end justify-center animate-backdrop-in">
                    <div className="bg-white dark:bg-background-dark w-full max-w-md rounded-t-3xl p-6 shadow-2xl animate-slide-up">
                        <div className="flex justify-center mb-4"><div className="w-10 h-1 bg-slate-300 dark:bg-slate-700 rounded-full" /></div>
                        <div className="flex items-center justify-between mb-5">
                            <h2 className="text-xl font-bold text-slate-900 dark:text-white">{editingGoal ? 'Editar Meta' : 'Nueva Meta'}</h2>
                            <button onClick={resetForm} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"><X size={20} className="text-slate-400" /></button>
                        </div>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Nombre de la meta</label>
                                <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="input-field" placeholder="Ej. Vacaciones, Auto nuevo" required />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Monto objetivo</label>
                                <div className="relative">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl font-bold text-slate-400">{getCurrencySymbol(currency)}</span>
                                    <input type="number" value={targetAmount} onChange={(e) => setTargetAmount(e.target.value)}
                                        className="w-full bg-slate-50 dark:bg-slate-900 border-none rounded-2xl py-4 pl-12 text-3xl font-bold focus:ring-2 focus:ring-primary text-slate-900 dark:text-white" placeholder="0" required />
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Fecha límite (Opcional)</label>
                                <input type="date" value={deadline} onChange={(e) => setDeadline(e.target.value)} className="input-field" />
                            </div>
                            <button type="submit" disabled={saving} className="btn-primary mt-4 disabled:opacity-50">
                                {saving ? 'Guardando...' : editingGoal ? 'Actualizar' : 'Crear Meta'}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* Add Funds Modal */}
            {showAddFunds && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-end justify-center animate-backdrop-in">
                    <div className="bg-white dark:bg-background-dark w-full max-w-md rounded-t-3xl p-6 shadow-2xl animate-slide-up">
                        <div className="flex justify-center mb-4"><div className="w-10 h-1 bg-slate-300 dark:bg-slate-700 rounded-full" /></div>
                        <div className="flex items-center justify-between mb-5">
                            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Agregar Aporte</h2>
                            <button onClick={() => { setShowAddFunds(null); setAddAmount(''); }} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors">
                                <X size={20} className="text-slate-400" />
                            </button>
                        </div>
                        <form onSubmit={handleAddFunds} className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Monto a aportar</label>
                                <div className="relative">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl font-bold text-slate-400">{getCurrencySymbol(currency)}</span>
                                    <input type="number" value={addAmount} onChange={(e) => setAddAmount(e.target.value)}
                                        className="w-full bg-slate-50 dark:bg-slate-900 border-none rounded-2xl py-4 pl-12 text-3xl font-bold focus:ring-2 focus:ring-primary text-slate-900 dark:text-white" placeholder="0" required />
                                </div>
                            </div>
                            <button type="submit" disabled={saving} className="btn-primary mt-4 disabled:opacity-50">
                                {saving ? 'Guardando...' : 'Agregar Aporte'}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            <ConfirmDialog isOpen={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={handleDelete}
                title="¿Eliminar meta?" message="La meta de ahorro será eliminada permanentemente." confirmText="Eliminar" variant="danger" />

            <BottomNav />
        </div>
    );
}
