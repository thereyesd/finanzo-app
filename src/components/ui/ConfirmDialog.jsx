import { AlertTriangle, Trash2, Info, X } from 'lucide-react';

const VARIANTS = {
    danger: {
        icon: Trash2,
        iconBg: 'bg-red-100 dark:bg-red-900/30',
        iconColor: 'text-red-600 dark:text-red-400',
        confirmBtn: 'bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-600/25',
    },
    warning: {
        icon: AlertTriangle,
        iconBg: 'bg-yellow-100 dark:bg-yellow-900/30',
        iconColor: 'text-yellow-600 dark:text-yellow-400',
        confirmBtn: 'bg-yellow-600 hover:bg-yellow-700 text-white shadow-lg shadow-yellow-600/25',
    },
    info: {
        icon: Info,
        iconBg: 'bg-blue-100 dark:bg-blue-900/30',
        iconColor: 'text-blue-600 dark:text-blue-400',
        confirmBtn: 'bg-primary hover:bg-primary-dark text-white shadow-lg shadow-primary/25',
    },
};

export default function ConfirmDialog({
    isOpen,
    onClose,
    onConfirm,
    title = '¿Estás seguro?',
    message = 'Esta acción no se puede deshacer.',
    confirmText = 'Confirmar',
    cancelText = 'Cancelar',
    variant = 'danger',
    loading = false,
}) {
    if (!isOpen) return null;

    const v = VARIANTS[variant] || VARIANTS.info;
    const Icon = v.icon;

    return (
        <div
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-backdrop-in"
            onClick={onClose}
        >
            <div
                className="bg-white dark:bg-slate-900 w-full max-w-sm rounded-2xl p-6 shadow-2xl animate-scale-in"
                onClick={e => e.stopPropagation()}
            >
                <div className="flex justify-end">
                    <button
                        onClick={onClose}
                        className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    >
                        <X size={16} className="text-slate-400" />
                    </button>
                </div>

                <div className="flex flex-col items-center text-center -mt-2">
                    <div className={`w-14 h-14 ${v.iconBg} rounded-2xl flex items-center justify-center mb-4`}>
                        <Icon size={28} className={v.iconColor} />
                    </div>

                    <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
                        {title}
                    </h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mb-6 px-2">
                        {message}
                    </p>
                </div>

                <div className="flex gap-3">
                    <button
                        onClick={onClose}
                        disabled={loading}
                        className="flex-1 py-3 text-slate-600 dark:text-slate-400 font-semibold rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    >
                        {cancelText}
                    </button>
                    <button
                        onClick={onConfirm}
                        disabled={loading}
                        className={`flex-1 py-3 font-bold rounded-xl transition-all active:scale-[0.97] disabled:opacity-50 ${v.confirmBtn}`}
                    >
                        {loading ? 'Procesando...' : confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
}
