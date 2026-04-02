/**
 * Format currency amount based on currency code
 */
export const formatCurrency = (amount, currency = 'PYG') => {
    const num = Number(amount) || 0;
    if (currency === 'PYG') {
        return `₲ ${num.toLocaleString('es-PY')}`;
    }
    return new Intl.NumberFormat('es-PY', {
        style: 'currency',
        currency: currency,
    }).format(num);
};

/**
 * Get currency symbol
 */
export const getCurrencySymbol = (currency = 'PYG') => {
    const symbols = {
        PYG: '₲',
        USD: '$',
        ARS: '$',
        EUR: '€',
        BRL: 'R$',
        MXN: '$',
        COP: '$',
        CLP: '$',
        PEN: 'S/',
    };
    return symbols[currency] || '$';
};

/**
 * Format date as relative time ("hace 2 días", "hoy", "ayer")
 */
export const formatRelativeDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMinutes = Math.floor(diffMs / (1000 * 60));

    if (diffMinutes < 1) return 'Ahora mismo';
    if (diffMinutes < 60) return `Hace ${diffMinutes} min`;
    if (diffHours < 24) return `Hace ${diffHours}h`;
    if (diffDays === 0) return 'Hoy';
    if (diffDays === 1) return 'Ayer';
    if (diffDays < 7) return `Hace ${diffDays} días`;
    if (diffDays < 30) return `Hace ${Math.floor(diffDays / 7)} sem`;
    if (diffDays < 365) return `Hace ${Math.floor(diffDays / 30)} meses`;
    return `Hace ${Math.floor(diffDays / 365)} años`;
};

/**
 * Format date as readable string
 */
export const formatDate = (dateString, options = {}) => {
    const date = new Date(dateString);
    const defaultOptions = {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        ...options
    };
    return date.toLocaleDateString('es-PY', defaultOptions);
};

/**
 * Format date as short string
 */
export const formatShortDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-PY', {
        day: 'numeric',
        month: 'short',
    });
};

/**
 * Get greeting based on time of day
 */
export const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Buenos días';
    if (hour < 18) return 'Buenas tardes';
    return 'Buenas noches';
};

/**
 * Calculate percentage safely
 */
export const calcPercentage = (value, total) => {
    if (!total || total === 0) return 0;
    return Math.min(Math.round((value / total) * 100), 100);
};

/**
 * Generate financial insights based on transaction data
 */
export const generateInsights = (transactions, budgets, currency = 'PYG') => {
    const insights = [];
    const now = new Date();
    const thisMonth = transactions.filter(t => {
        const d = new Date(t.date);
        return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    });

    const lastMonth = transactions.filter(t => {
        const d = new Date(t.date);
        const lm = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        return d.getMonth() === lm.getMonth() && d.getFullYear() === lm.getFullYear();
    });

    const thisMonthExpenses = thisMonth.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
    const lastMonthExpenses = lastMonth.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
    const thisMonthIncome = thisMonth.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);

    if (lastMonthExpenses > 0) {
        const changePercent = Math.round(((thisMonthExpenses - lastMonthExpenses) / lastMonthExpenses) * 100);
        if (changePercent > 20) {
            insights.push({
                type: 'warning',
                icon: '📈',
                title: 'Gastos elevados',
                message: `Tus gastos aumentaron un ${changePercent}% respecto al mes pasado.`
            });
        } else if (changePercent < -10) {
            insights.push({
                type: 'success',
                icon: '🎉',
                title: '¡Buen control!',
                message: `Redujiste tus gastos un ${Math.abs(changePercent)}% este mes.`
            });
        }
    }

    if (thisMonthIncome > 0 && thisMonthExpenses > 0) {
        const savingsRate = Math.round(((thisMonthIncome - thisMonthExpenses) / thisMonthIncome) * 100);
        if (savingsRate > 30) {
            insights.push({
                type: 'success',
                icon: '💰',
                title: 'Excelente ahorro',
                message: `Estás ahorrando el ${savingsRate}% de tus ingresos este mes.`
            });
        } else if (savingsRate < 10 && savingsRate >= 0) {
            insights.push({
                type: 'info',
                icon: '💡',
                title: 'Tip de ahorro',
                message: 'Intenta ahorrar al menos el 20% de tus ingresos mensuales.'
            });
        }
    }

    // Find top spending category
    const categorySpending = {};
    thisMonth.filter(t => t.type === 'expense').forEach(t => {
        categorySpending[t.category] = (categorySpending[t.category] || 0) + t.amount;
    });
    const topCategory = Object.entries(categorySpending).sort((a, b) => b[1] - a[1])[0];
    if (topCategory && thisMonthExpenses > 0) {
        const pct = Math.round((topCategory[1] / thisMonthExpenses) * 100);
        if (pct > 50) {
            insights.push({
                type: 'info',
                icon: '🔍',
                title: 'Gasto concentrado',
                message: `El ${pct}% de tus gastos es en una sola categoría. Considera diversificar.`
            });
        }
    }

    return insights;
};

/**
 * Get months data for chart (last N months)
 */
export const getMonthLabels = (count = 6) => {
    const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    const result = [];
    const now = new Date();
    for (let i = count - 1; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        result.push({
            label: months[d.getMonth()],
            month: d.getMonth(),
            year: d.getFullYear(),
        });
    }
    return result;
};

/**
 * Calculate monthly totals from transactions
 */
export const getMonthlyTotals = (transactions, monthsCount = 6) => {
    const months = getMonthLabels(monthsCount);
    return months.map(m => {
        const monthTxns = transactions.filter(t => {
            const d = new Date(t.date);
            return d.getMonth() === m.month && d.getFullYear() === m.year;
        });
        return {
            name: m.label,
            ingresos: monthTxns.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0),
            gastos: monthTxns.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0),
        };
    });
};
