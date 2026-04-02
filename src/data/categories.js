import {
    Utensils,
    Car,
    Home,
    ShoppingCart,
    Tv,
    CreditCard,
    Heart,
    GraduationCap,
    Briefcase,
    Zap,
    Gift,
    Plane
} from 'lucide-react';

export const categories = [
    { id: 'food', name: 'Alimentación', icon: Utensils, color: 'orange', hex: '#F97316', bgLight: 'bg-orange-100', bgDark: 'dark:bg-orange-900/30', text: 'text-orange-600', bgSolid: 'bg-orange-500' },
    { id: 'transport', name: 'Transporte', icon: Car, color: 'blue', hex: '#3B82F6', bgLight: 'bg-blue-100', bgDark: 'dark:bg-blue-900/30', text: 'text-blue-600', bgSolid: 'bg-blue-500' },
    { id: 'housing', name: 'Vivienda', icon: Home, color: 'purple', hex: '#A855F7', bgLight: 'bg-purple-100', bgDark: 'dark:bg-purple-900/30', text: 'text-purple-600', bgSolid: 'bg-purple-500' },
    { id: 'shopping', name: 'Compras', icon: ShoppingCart, color: 'green', hex: '#22C55E', bgLight: 'bg-green-100', bgDark: 'dark:bg-green-900/30', text: 'text-green-600', bgSolid: 'bg-green-500' },
    { id: 'entertainment', name: 'Entretenimiento', icon: Tv, color: 'pink', hex: '#EC4899', bgLight: 'bg-pink-100', bgDark: 'dark:bg-pink-900/30', text: 'text-pink-600', bgSolid: 'bg-pink-500' },
    { id: 'health', name: 'Salud', icon: Heart, color: 'red', hex: '#EF4444', bgLight: 'bg-red-100', bgDark: 'dark:bg-red-900/30', text: 'text-red-600', bgSolid: 'bg-red-500' },
    { id: 'education', name: 'Educación', icon: GraduationCap, color: 'indigo', hex: '#6366F1', bgLight: 'bg-indigo-100', bgDark: 'dark:bg-indigo-900/30', text: 'text-indigo-600', bgSolid: 'bg-indigo-500' },
    { id: 'services', name: 'Servicios', icon: Zap, color: 'yellow', hex: '#EAB308', bgLight: 'bg-yellow-100', bgDark: 'dark:bg-yellow-900/30', text: 'text-yellow-600', bgSolid: 'bg-yellow-500' },
    { id: 'other', name: 'Otros', icon: CreditCard, color: 'slate', hex: '#64748B', bgLight: 'bg-slate-100', bgDark: 'dark:bg-slate-800', text: 'text-slate-600', bgSolid: 'bg-slate-500' },
];

export const getCategoryById = (id) => {
    return categories.find(c => c.id === id) || categories[categories.length - 1];
};

export const getCategoryIcon = (id) => {
    const cat = getCategoryById(id);
    return cat.icon;
};

export const getCategoryColor = (id) => {
    const cat = getCategoryById(id);
    return cat.hex;
};
