import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Check, Zap, Crown } from 'lucide-react';

const plans = [
    {
        id: 'free',
        name: 'Gratis',
        price: '₲ 0',
        period: '/mes',
        description: 'Perfecto para empezar',
        features: [
            '50 transacciones/mes',
            '3 categorías',
            'Dashboard básico',
            'Soporte por email'
        ],
        buttonText: 'Plan actual',
        disabled: true,
        highlight: false
    },
    {
        id: 'pro',
        name: 'Pro',
        price: '₲ 79,900',
        period: '/semana',
        description: 'Para uso personal avanzado',
        features: [
            'Transacciones ilimitadas',
            'Categorías ilimitadas',
            'Presupuestos avanzados',
            'Exportar a PDF/CSV',
            'Metas de ahorro',
            'Soporte prioritario'
        ],
        buttonText: 'Suscribirse',
        variantId: import.meta.env.VITE_LEMONSQUEEZY_VARIANT_PRO,
        disabled: false,
        highlight: true
    },
    {
        id: 'premium',
        name: 'Premium',
        price: '₲ 149,999',
        period: '/semana',
        description: 'Para familias y negocios',
        features: [
            'Todo lo de Pro',
            'Múltiples cuentas',
            'Reportes avanzados',
            'Sincronización bancaria',
            'API Access',
            'Soporte 24/7'
        ],
        buttonText: 'Suscribirse',
        variantId: import.meta.env.VITE_LEMONSQUEEZY_VARIANT_PREMIUM,
        disabled: false,
        highlight: false
    }
];

export default function Pricing() {
    const { user, userProfile } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(null);

    const handleSubscribe = async (plan) => {
        if (!user) {
            navigate('/login');
            return;
        }

        if (!plan.variantId) return;

        setLoading(plan.id);

        try {
            // Open Lemon Squeezy checkout
            const checkoutUrl = `${import.meta.env.VITE_LEMONSQUEEZY_STORE_URL}/checkout/buy/${plan.variantId}?checkout[email]=${encodeURIComponent(user.email)}&checkout[custom][user_id]=${user.uid}`;

            window.open(checkoutUrl, '_blank');
        } catch (error) {
            console.error('Error opening checkout:', error);
        } finally {
            setLoading(null);
        }
    };

    const currentPlan = userProfile?.plan || 'free';

    return (
        <div className="min-h-screen bg-background-light dark:bg-background-dark">
            {/* Header */}
            <header className="sticky top-0 z-30 bg-white/80 dark:bg-background-dark/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800">
                <div className="flex items-center p-4 justify-between max-w-md mx-auto">
                    <button onClick={() => navigate(-1)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full">
                        <ChevronLeft size={24} />
                    </button>
                    <h1 className="text-lg font-bold">Planes y Precios</h1>
                    <div className="w-10" />
                </div>
            </header>

            <main className="max-w-md mx-auto px-4 py-6">
                {/* Hero */}
                <div className="text-center mb-8">
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                        Elige tu plan
                    </h2>
                    <p className="text-slate-500 dark:text-slate-400">
                        Desbloquea todas las funciones y lleva el control total de tus finanzas.
                    </p>
                </div>

                {/* Plans */}
                <div className="space-y-4">
                    {plans.map((plan) => {
                        const isCurrentPlan = currentPlan === plan.id;

                        return (
                            <div
                                key={plan.id}
                                className={`relative card p-6 ${plan.highlight ? 'border-2 border-primary shadow-lg shadow-primary/10' : ''
                                    }`}
                            >
                                {plan.highlight && (
                                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-white text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
                                        <Zap size={12} />
                                        Popular
                                    </div>
                                )}

                                <div className="flex items-center gap-3 mb-4">
                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${plan.id === 'premium' ? 'bg-yellow-100 text-yellow-600' :
                                            plan.id === 'pro' ? 'bg-primary/10 text-primary' :
                                                'bg-slate-100 text-slate-600'
                                        }`}>
                                        {plan.id === 'premium' ? <Crown size={20} /> : <Zap size={20} />}
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-slate-900 dark:text-white">{plan.name}</h3>
                                        <p className="text-xs text-slate-500">{plan.description}</p>
                                    </div>
                                </div>

                                <div className="mb-4">
                                    <span className="text-3xl font-bold text-slate-900 dark:text-white">{plan.price}</span>
                                    <span className="text-slate-500">{plan.period}</span>
                                </div>

                                <ul className="space-y-2 mb-6">
                                    {plan.features.map((feature, i) => (
                                        <li key={i} className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                                            <Check size={16} className="text-green-500 shrink-0" />
                                            {feature}
                                        </li>
                                    ))}
                                </ul>

                                <button
                                    onClick={() => handleSubscribe(plan)}
                                    disabled={plan.disabled || isCurrentPlan || loading === plan.id}
                                    className={`w-full py-3 rounded-xl font-bold transition-all ${isCurrentPlan
                                            ? 'bg-slate-100 dark:bg-slate-800 text-slate-500 cursor-not-allowed'
                                            : plan.highlight
                                                ? 'bg-primary text-white hover:bg-primary/90 shadow-lg shadow-primary/20'
                                                : 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white hover:bg-slate-200 dark:hover:bg-slate-700'
                                        }`}
                                >
                                    {loading === plan.id ? 'Abriendo...' : isCurrentPlan ? 'Plan actual' : plan.buttonText}
                                </button>
                            </div>
                        );
                    })}
                </div>

                {/* FAQ Link */}
                <div className="mt-8 text-center">
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                        ¿Preguntas? <a href="#" className="text-primary font-medium">Ver FAQ</a>
                    </p>
                </div>
            </main>
        </div>
    );
}
