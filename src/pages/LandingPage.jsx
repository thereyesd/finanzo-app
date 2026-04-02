import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
    Wallet, TrendingUp, PieChart, Target, Shield,
    ArrowRight, Star, Zap, BarChart3, Bell,
    Users, Globe, Lock
} from 'lucide-react';

const features = [
    { icon: TrendingUp, title: 'Control Total', description: 'Registra todos tus ingresos y gastos en un solo lugar.', color: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600' },
    { icon: PieChart, title: 'Presupuestos Inteligentes', description: 'Establece límites por categoría y recibe alertas.', color: 'bg-purple-100 dark:bg-purple-900/30 text-purple-600' },
    { icon: Target, title: 'Metas de Ahorro', description: 'Define objetivos y haz seguimiento de tu progreso.', color: 'bg-green-100 dark:bg-green-900/30 text-green-600' },
    { icon: Shield, title: 'Seguro y Privado', description: 'Tus datos están protegidos con encriptación de nivel bancario.', color: 'bg-amber-100 dark:bg-amber-900/30 text-amber-600' },
];

const steps = [
    { number: '01', title: 'Crea tu cuenta', description: 'Regístrate gratis en menos de 30 segundos.', icon: Zap },
    { number: '02', title: 'Registra tus movimientos', description: 'Agrega ingresos y gastos de forma rápida.', icon: BarChart3 },
    { number: '03', title: 'Establece presupuestos', description: 'Define límites mensuales por categoría.', icon: Bell },
    { number: '04', title: 'Alcanza tus metas', description: 'Ahorra de forma inteligente y cumple tus objetivos.', icon: Target },
];

const stats = [
    { value: '10,000+', label: 'Usuarios activos', icon: Users },
    { value: '₲50B+', label: 'Gestionados', icon: Globe },
    { value: '99.9%', label: 'Uptime', icon: Zap },
    { value: '256-bit', label: 'Encriptación', icon: Lock },
];

const testimonials = [
    { name: 'María García', role: 'Emprendedora', content: 'Finanzo me ayudó a organizar las finanzas de mi negocio. ¡Ya ahorro un 30% más cada mes!', rating: 5 },
    { name: 'Carlos Rodríguez', role: 'Ingeniero', content: 'La mejor app de finanzas que he usado. Simple, rápida y muy completa.', rating: 5 },
    { name: 'Ana Martínez', role: 'Diseñadora', content: 'Las metas de ahorro me motivaron a cumplir mis objetivos financieros.', rating: 5 },
];

function useScrollReveal() {
    const ref = useRef(null);
    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('animate-fade-in-up');
                        entry.target.style.opacity = '1';
                        observer.unobserve(entry.target);
                    }
                });
            },
            { threshold: 0.1 }
        );
        const children = ref.current?.querySelectorAll('.reveal');
        children?.forEach((child) => observer.observe(child));
        return () => observer.disconnect();
    }, []);
    return ref;
}

export default function LandingPage() {
    const sectionRef = useScrollReveal();

    return (
        <div className="min-h-screen bg-white dark:bg-background-dark" ref={sectionRef}>
            {/* Header */}
            <header className="sticky top-0 z-50 bg-white/80 dark:bg-background-dark/80 backdrop-blur-xl border-b border-slate-100 dark:border-slate-800">
                <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                        <div className="bg-primary p-2 rounded-xl shadow-md shadow-primary/20">
                            <Wallet className="text-white" size={22} />
                        </div>
                        <span className="text-2xl font-bold text-primary tracking-tight">Finanzo</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <Link to="/login" className="text-slate-600 dark:text-slate-300 font-medium hover:text-primary transition-colors hidden sm:block px-4 py-2">
                            Iniciar sesión
                        </Link>
                        <Link to="/register" className="bg-primary text-white font-bold px-5 py-2.5 rounded-xl hover:bg-primary-dark transition-all shadow-md shadow-primary/20 text-sm">
                            Empezar gratis
                        </Link>
                    </div>
                </div>
            </header>

            {/* Hero Section */}
            <section className="relative overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(43,108,238,0.08),transparent_50%)]" />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(43,108,238,0.05),transparent_50%)]" />
                <div className="max-w-6xl mx-auto px-4 py-20 md:py-32 relative">
                    <div className="text-center max-w-3xl mx-auto">
                        <span className="inline-flex items-center gap-2 bg-primary/10 text-primary font-semibold px-4 py-1.5 rounded-full text-sm mb-8">
                            <Zap size={14} /> Nueva versión disponible
                        </span>
                        <h1 className="text-4xl md:text-6xl font-bold text-slate-900 dark:text-white mb-6 leading-[1.1] tracking-tight">
                            Toma el control de tus{' '}
                            <span className="text-primary relative">
                                finanzas personales
                                <svg className="absolute -bottom-2 left-0 w-full" viewBox="0 0 300 12" fill="none">
                                    <path d="M2 10C50 4 100 2 150 6C200 10 250 4 298 8" stroke="currentColor" strokeWidth="3" strokeLinecap="round" className="text-primary/30" />
                                </svg>
                            </span>
                        </h1>
                        <p className="text-lg md:text-xl text-slate-600 dark:text-slate-400 mb-10 max-w-2xl mx-auto leading-relaxed">
                            La aplicación más simple y poderosa para gestionar tu dinero.
                            Registra gastos, crea presupuestos y alcanza tus metas de ahorro.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Link to="/register"
                                className="bg-primary text-white font-bold px-8 py-4 rounded-2xl hover:bg-primary-dark transition-all shadow-xl shadow-primary/25 flex items-center justify-center gap-2 active:scale-[0.97]">
                                Comenzar gratis <ArrowRight size={20} />
                            </Link>
                            <Link to="/pricing"
                                className="bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white font-bold px-8 py-4 rounded-2xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-all flex items-center justify-center gap-2">
                                Ver planes
                            </Link>
                        </div>
                    </div>

                    {/* App Preview */}
                    <div className="mt-16 relative max-w-sm mx-auto">
                        <div className="gradient-primary rounded-3xl p-5 shadow-2xl shadow-primary/30">
                            <div className="bg-white dark:bg-slate-900 rounded-2xl p-5">
                                <div className="flex items-center justify-between mb-4">
                                    <div>
                                        <p className="text-xs text-slate-400 font-medium">Balance Total</p>
                                        <p className="text-2xl font-bold text-slate-900 dark:text-white mt-0.5">₲ 12,450,000</p>
                                    </div>
                                    <div className="flex items-center gap-1.5 bg-green-100 dark:bg-green-900/30 text-green-600 px-2.5 py-1 rounded-lg text-sm font-bold">
                                        <TrendingUp size={14} /> +12.5%
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-2.5">
                                    <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-xl">
                                        <p className="text-[10px] text-green-600 font-medium uppercase">Ingresos</p>
                                        <p className="font-bold text-green-600 mt-0.5">₲ 5,200,000</p>
                                    </div>
                                    <div className="bg-red-50 dark:bg-red-900/20 p-3 rounded-xl">
                                        <p className="text-[10px] text-red-500 font-medium uppercase">Gastos</p>
                                        <p className="font-bold text-red-500 mt-0.5">₲ 2,150,000</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="absolute -z-10 top-8 left-8 right-8 bottom-0 bg-primary/20 rounded-3xl blur-2xl" />
                    </div>
                </div>
            </section>

            {/* Stats Bar */}
            <section className="py-12 bg-slate-50 dark:bg-slate-900/50 border-y border-slate-100 dark:border-slate-800">
                <div className="max-w-6xl mx-auto px-4">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                        {stats.map((stat, i) => {
                            const Icon = stat.icon;
                            return (
                                <div key={i} className="text-center reveal" style={{ opacity: 0 }}>
                                    <Icon size={20} className="text-primary mx-auto mb-2" />
                                    <p className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white">{stat.value}</p>
                                    <p className="text-sm text-slate-500 mt-1">{stat.label}</p>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* Features */}
            <section className="py-20">
                <div className="max-w-6xl mx-auto px-4">
                    <div className="text-center mb-14 reveal" style={{ opacity: 0 }}>
                        <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4 tracking-tight">
                            Todo lo que necesitas
                        </h2>
                        <p className="text-slate-600 dark:text-slate-400 max-w-2xl mx-auto text-lg">
                            Herramientas poderosas para gestionar tu dinero de forma inteligente.
                        </p>
                    </div>
                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
                        {features.map((feature, i) => {
                            const Icon = feature.icon;
                            return (
                                <div key={i} className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-100 dark:border-slate-800 hover:shadow-xl hover:-translate-y-1 transition-all reveal" style={{ opacity: 0 }}>
                                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${feature.color}`}>
                                        <Icon size={24} />
                                    </div>
                                    <h3 className="font-bold text-slate-900 dark:text-white mb-2">{feature.title}</h3>
                                    <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">{feature.description}</p>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* How it Works */}
            <section className="py-20 bg-slate-50 dark:bg-slate-900/50">
                <div className="max-w-4xl mx-auto px-4">
                    <div className="text-center mb-14 reveal" style={{ opacity: 0 }}>
                        <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4 tracking-tight">
                            Cómo funciona
                        </h2>
                        <p className="text-slate-600 dark:text-slate-400 text-lg">
                            Comienza en minutos con estos simples pasos.
                        </p>
                    </div>
                    <div className="space-y-6">
                        {steps.map((step, i) => {
                            const Icon = step.icon;
                            return (
                                <div key={i} className="flex items-start gap-5 bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-100 dark:border-slate-800 reveal" style={{ opacity: 0 }}>
                                    <div className="shrink-0 w-12 h-12 gradient-primary rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-md shadow-primary/20">
                                        {step.number}
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="font-bold text-slate-900 dark:text-white text-lg mb-1">{step.title}</h3>
                                        <p className="text-slate-500 dark:text-slate-400 text-sm">{step.description}</p>
                                    </div>
                                    <Icon size={24} className="text-slate-300 dark:text-slate-600 shrink-0 hidden sm:block" />
                                </div>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* Testimonials */}
            <section className="py-20">
                <div className="max-w-6xl mx-auto px-4">
                    <div className="text-center mb-14 reveal" style={{ opacity: 0 }}>
                        <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4 tracking-tight">
                            Lo que dicen nuestros usuarios
                        </h2>
                    </div>
                    <div className="grid md:grid-cols-3 gap-5">
                        {testimonials.map((testimonial, i) => (
                            <div key={i} className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-100 dark:border-slate-800 hover:shadow-lg transition-shadow reveal" style={{ opacity: 0 }}>
                                <div className="flex gap-1 mb-4">
                                    {[...Array(testimonial.rating)].map((_, j) => (
                                        <Star key={j} className="text-yellow-400 fill-yellow-400" size={16} />
                                    ))}
                                </div>
                                <p className="text-slate-600 dark:text-slate-400 mb-5 leading-relaxed">"{testimonial.content}"</p>
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
                                        {testimonial.name.charAt(0)}
                                    </div>
                                    <div>
                                        <p className="font-bold text-slate-900 dark:text-white text-sm">{testimonial.name}</p>
                                        <p className="text-xs text-slate-500">{testimonial.role}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="py-20 gradient-primary relative overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.1),transparent_50%)]" />
                <div className="max-w-4xl mx-auto px-4 text-center relative">
                    <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 tracking-tight reveal" style={{ opacity: 0 }}>
                        Comienza a gestionar tu dinero hoy
                    </h2>
                    <p className="text-white/80 mb-10 max-w-xl mx-auto text-lg reveal" style={{ opacity: 0 }}>
                        Únete a miles de usuarios que ya controlan sus finanzas con Finanzo.
                    </p>
                    <Link to="/register"
                        className="inline-flex items-center gap-2 bg-white text-primary font-bold px-8 py-4 rounded-2xl hover:bg-slate-50 transition-all shadow-xl active:scale-[0.97] reveal" style={{ opacity: 0 }}>
                        Crear cuenta gratis <ArrowRight size={20} />
                    </Link>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-slate-900 text-white py-12">
                <div className="max-w-6xl mx-auto px-4">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                        <div className="flex items-center gap-2.5">
                            <div className="bg-primary p-2 rounded-xl">
                                <Wallet className="text-white" size={20} />
                            </div>
                            <span className="text-xl font-bold">Finanzo</span>
                        </div>
                        <div className="flex gap-8 text-sm text-slate-400">
                            <a href="#" className="hover:text-white transition-colors">Términos</a>
                            <a href="#" className="hover:text-white transition-colors">Privacidad</a>
                            <a href="#" className="hover:text-white transition-colors">Contacto</a>
                        </div>
                        <div className="flex items-center gap-3">
                            <Shield size={14} className="text-green-500" />
                            <p className="text-sm text-slate-400">Datos protegidos con SSL</p>
                        </div>
                    </div>
                    <div className="border-t border-slate-800 mt-8 pt-8 text-center">
                        <p className="text-sm text-slate-500">© 2026 Finanzo. Todos los derechos reservados.</p>
                    </div>
                </div>
            </footer>
        </div>
    );
}
