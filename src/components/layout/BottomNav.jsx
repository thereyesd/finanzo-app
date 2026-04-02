import { Link, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, ArrowLeftRight, Target, User, Plus } from 'lucide-react';

const navItems = [
    { path: '/dashboard', icon: LayoutDashboard, label: 'Inicio' },
    { path: '/transactions', icon: ArrowLeftRight, label: 'Movimientos' },
    { path: '/add', icon: Plus, label: 'Agregar', isFab: true },
    { path: '/savings', icon: Target, label: 'Metas' },
    { path: '/profile', icon: User, label: 'Perfil' },
];

export default function BottomNav() {
    const location = useLocation();
    const navigate = useNavigate();

    const handleFabClick = () => {
        navigate('/transactions', { state: { openModal: true } });
    };

    return (
        <nav className="fixed bottom-0 left-0 right-0 z-40">
            <div className="glass border-t border-slate-200/50 dark:border-slate-800/50 pb-6 pt-2">
                <div className="max-w-md mx-auto flex justify-around items-end px-2">
                    {navItems.map((item) => {
                        const Icon = item.icon;

                        if (item.isFab) {
                            return (
                                <button
                                    key="fab"
                                    onClick={handleFabClick}
                                    className="relative -mt-7 flex flex-col items-center"
                                >
                                    <div className="w-14 h-14 bg-primary rounded-2xl flex items-center justify-center shadow-lg shadow-primary/30 active:scale-90 transition-transform hover:shadow-xl hover:shadow-primary/40">
                                        <Plus size={26} className="text-white" strokeWidth={2.5} />
                                    </div>
                                    <span className="text-[10px] font-medium text-primary mt-1">{item.label}</span>
                                </button>
                            );
                        }

                        const isActive = location.pathname === item.path;

                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                className="flex flex-col items-center gap-0.5 py-1 px-3 transition-all duration-200"
                            >
                                <div className={`relative p-1.5 rounded-xl transition-colors duration-200 ${isActive ? 'bg-primary/10' : ''}`}>
                                    <Icon
                                        size={22}
                                        strokeWidth={isActive ? 2.5 : 1.8}
                                        className={`transition-colors duration-200 ${isActive ? 'text-primary' : 'text-slate-400 dark:text-slate-500'}`}
                                    />
                                    {isActive && (
                                        <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-primary rounded-full" />
                                    )}
                                </div>
                                <span className={`text-[10px] font-medium transition-colors duration-200 ${isActive ? 'text-primary' : 'text-slate-400 dark:text-slate-500'}`}>
                                    {item.label}
                                </span>
                            </Link>
                        );
                    })}
                </div>
            </div>
        </nav>
    );
}
