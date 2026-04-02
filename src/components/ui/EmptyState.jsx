import { Inbox, TrendingUp, Target, PieChart, Search } from 'lucide-react';

const VARIANTS = {
    transactions: {
        icon: TrendingUp,
        title: 'Sin transacciones',
        message: 'Agrega tu primera transacción para empezar a controlar tus finanzas.',
        color: 'text-blue-400',
        bg: 'bg-blue-50 dark:bg-blue-900/20',
    },
    budgets: {
        icon: PieChart,
        title: 'Sin presupuestos',
        message: 'Crea tu primer presupuesto para controlar tus gastos mensuales.',
        color: 'text-purple-400',
        bg: 'bg-purple-50 dark:bg-purple-900/20',
    },
    savings: {
        icon: Target,
        title: 'Sin metas de ahorro',
        message: 'Crea tu primera meta para empezar a ahorrar con propósito.',
        color: 'text-green-400',
        bg: 'bg-green-50 dark:bg-green-900/20',
    },
    search: {
        icon: Search,
        title: 'Sin resultados',
        message: 'No encontramos resultados para tu búsqueda.',
        color: 'text-slate-400',
        bg: 'bg-slate-50 dark:bg-slate-800',
    },
    default: {
        icon: Inbox,
        title: 'Nada aquí todavía',
        message: 'Comienza agregando tu primer elemento.',
        color: 'text-slate-400',
        bg: 'bg-slate-50 dark:bg-slate-800',
    },
};

export default function EmptyState({
    variant = 'default',
    title,
    message,
    action,
    actionLabel,
    className = '',
}) {
    const v = VARIANTS[variant] || VARIANTS.default;
    const Icon = v.icon;

    return (
        <div className={`flex flex-col items-center justify-center py-12 px-6 animate-fade-in-up ${className}`}>
            <div className={`w-20 h-20 ${v.bg} rounded-3xl flex items-center justify-center mb-5`}>
                <Icon size={36} className={v.color} strokeWidth={1.5} />
            </div>
            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200 mb-2 text-center">
                {title || v.title}
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 text-center max-w-xs leading-relaxed">
                {message || v.message}
            </p>
            {action && (
                <button
                    onClick={action}
                    className="mt-5 bg-primary/10 hover:bg-primary/20 text-primary font-semibold px-6 py-2.5 rounded-xl transition-colors"
                >
                    {actionLabel || 'Comenzar'}
                </button>
            )}
        </div>
    );
}
