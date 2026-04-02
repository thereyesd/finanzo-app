import { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';

const ToastContext = createContext();

export const useToast = () => {
    const context = useContext(ToastContext);
    if (!context) throw new Error('useToast must be used within ToastProvider');
    return context;
};

const ICONS = {
    success: CheckCircle,
    error: AlertCircle,
    info: Info,
    warning: AlertTriangle,
};

const STYLES = {
    success: 'bg-green-50 dark:bg-green-900/30 border-green-200 dark:border-green-800 text-green-800 dark:text-green-300',
    error: 'bg-red-50 dark:bg-red-900/30 border-red-200 dark:border-red-800 text-red-800 dark:text-red-300',
    info: 'bg-blue-50 dark:bg-blue-900/30 border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-300',
    warning: 'bg-yellow-50 dark:bg-yellow-900/30 border-yellow-200 dark:border-yellow-800 text-yellow-800 dark:text-yellow-300',
};

const ICON_STYLES = {
    success: 'text-green-600 dark:text-green-400',
    error: 'text-red-600 dark:text-red-400',
    info: 'text-blue-600 dark:text-blue-400',
    warning: 'text-yellow-600 dark:text-yellow-400',
};

let toastId = 0;

export function ToastProvider({ children }) {
    const [toasts, setToasts] = useState([]);

    const removeToast = useCallback((id) => {
        setToasts(prev => prev.map(t => t.id === id ? { ...t, exiting: true } : t));
        setTimeout(() => {
            setToasts(prev => prev.filter(t => t.id !== id));
        }, 250);
    }, []);

    const toast = useCallback(({ type = 'info', title, message, duration = 3500 }) => {
        const id = ++toastId;
        setToasts(prev => [...prev, { id, type, title, message, exiting: false }]);
        if (duration > 0) {
            setTimeout(() => removeToast(id), duration);
        }
        return id;
    }, [removeToast]);

    const success = useCallback((title, message) => toast({ type: 'success', title, message }), [toast]);
    const error = useCallback((title, message) => toast({ type: 'error', title, message, duration: 5000 }), [toast]);
    const info = useCallback((title, message) => toast({ type: 'info', title, message }), [toast]);
    const warning = useCallback((title, message) => toast({ type: 'warning', title, message, duration: 4500 }), [toast]);

    return (
        <ToastContext.Provider value={{ toast, success, error, info, warning, removeToast }}>
            {children}

            {/* Toast Container */}
            <div className="fixed top-4 right-4 left-4 sm:left-auto sm:w-96 z-[100] flex flex-col gap-2 pointer-events-none">
                {toasts.map((t) => {
                    const Icon = ICONS[t.type];
                    return (
                        <div
                            key={t.id}
                            className={`
                                pointer-events-auto flex items-start gap-3 p-4 rounded-2xl border shadow-lg
                                ${STYLES[t.type]}
                                ${t.exiting ? 'animate-toast-exit' : 'animate-toast-enter'}
                            `}
                        >
                            <Icon size={20} className={`shrink-0 mt-0.5 ${ICON_STYLES[t.type]}`} />
                            <div className="flex-1 min-w-0">
                                {t.title && (
                                    <p className="font-bold text-sm">{t.title}</p>
                                )}
                                {t.message && (
                                    <p className="text-sm opacity-80 mt-0.5">{t.message}</p>
                                )}
                            </div>
                            <button
                                onClick={() => removeToast(t.id)}
                                className="shrink-0 p-1 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                            >
                                <X size={14} />
                            </button>
                        </div>
                    );
                })}
            </div>
        </ToastContext.Provider>
    );
}
