import { useState } from 'react';
import { Search, Wallet, X, Bell } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function Header({ title = 'Finanzo', showSearch = true }) {
    const { userProfile } = useAuth();
    const [searchOpen, setSearchOpen] = useState(false);

    const initial = userProfile?.name?.charAt(0)?.toUpperCase() || 'U';

    return (
        <header className="sticky top-0 z-30 glass border-b border-slate-200/50 dark:border-slate-800/50">
            <div className="flex items-center justify-between px-4 py-3 max-w-md mx-auto">
                {/* Left: Logo + Title */}
                <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 bg-primary rounded-xl flex items-center justify-center shadow-md shadow-primary/20">
                        <Wallet className="text-white" size={18} />
                    </div>
                    <h1 className="text-lg font-bold tracking-tight text-slate-900 dark:text-white">{title}</h1>
                </div>

                {/* Right: Actions */}
                <div className="flex items-center gap-1.5">
                    {showSearch && (
                        <button
                            onClick={() => setSearchOpen(true)}
                            className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        >
                            <Search size={20} className="text-slate-500 dark:text-slate-400" />
                        </button>
                    )}

                    <button className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors relative">
                        <Bell size={20} className="text-slate-500 dark:text-slate-400" />
                        <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white dark:ring-slate-900" />
                    </button>

                    <Link
                        to="/profile"
                        className="w-9 h-9 rounded-xl bg-primary/10 dark:bg-primary/20 flex items-center justify-center text-primary font-bold text-sm ml-0.5 hover:bg-primary/20 transition-colors overflow-hidden"
                    >
                        {userProfile?.photoURL ? (
                            <img src={userProfile.photoURL} alt="" className="w-9 h-9 rounded-xl object-cover" />
                        ) : (
                            initial
                        )}
                    </Link>
                </div>
            </div>

            {/* Search Overlay */}
            {searchOpen && (
                <div className="absolute inset-0 z-50 glass animate-fade-in">
                    <div className="flex items-center gap-3 px-4 py-3 max-w-md mx-auto">
                        <div className="flex-1 relative">
                            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input
                                autoFocus
                                type="text"
                                placeholder="Buscar transacciones..."
                                className="w-full bg-slate-100 dark:bg-slate-800 rounded-xl py-2.5 pl-10 pr-4 text-sm outline-none focus:ring-2 focus:ring-primary/30 text-slate-900 dark:text-white placeholder:text-slate-400"
                            />
                        </div>
                        <button
                            onClick={() => setSearchOpen(false)}
                            className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        >
                            <X size={20} className="text-slate-500" />
                        </button>
                    </div>
                </div>
            )}
        </header>
    );
}
