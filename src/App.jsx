import { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { Wallet } from 'lucide-react';

// Lazy loaded pages for code splitting
const LandingPage = lazy(() => import('./pages/LandingPage'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const Onboarding = lazy(() => import('./pages/Onboarding'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Transactions = lazy(() => import('./pages/Transactions'));
const Budgets = lazy(() => import('./pages/Budgets'));
const SavingsGoals = lazy(() => import('./pages/SavingsGoals'));
const Pricing = lazy(() => import('./pages/Pricing'));
const Profile = lazy(() => import('./pages/Profile'));

// Branded loading screen
function LoadingScreen() {
    return (
        <div className="min-h-screen bg-background-light dark:bg-background-dark flex flex-col items-center justify-center gap-4">
            <div className="relative">
                <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center shadow-lg shadow-primary/30 animate-scale-bounce">
                    <Wallet className="text-white" size={32} />
                </div>
                <div className="absolute inset-0 w-16 h-16 bg-primary/20 rounded-2xl animate-ping" />
            </div>
            <div className="flex flex-col items-center gap-1">
                <span className="text-xl font-bold text-primary tracking-tight">Finanzo</span>
                <span className="text-xs text-slate-400">Cargando...</span>
            </div>
        </div>
    );
}

// Protected Route Component
function ProtectedRoute({ children }) {
    const { user, loading } = useAuth();

    if (loading) return <LoadingScreen />;
    if (!user) return <Navigate to="/login" replace />;

    return <Suspense fallback={<LoadingScreen />}>{children}</Suspense>;
}

// Public Route (redirect to dashboard if logged in)
function PublicRoute({ children }) {
    const { user, loading } = useAuth();

    if (loading) return <LoadingScreen />;
    if (user) return <Navigate to="/dashboard" replace />;

    return <Suspense fallback={<LoadingScreen />}>{children}</Suspense>;
}

function AppRoutes() {
    return (
        <Routes>
            {/* Public Routes */}
            <Route path="/" element={
                <Suspense fallback={<LoadingScreen />}>
                    <LandingPage />
                </Suspense>
            } />
            <Route path="/login" element={
                <PublicRoute><Login /></PublicRoute>
            } />
            <Route path="/register" element={
                <PublicRoute><Register /></PublicRoute>
            } />
            <Route path="/pricing" element={
                <Suspense fallback={<LoadingScreen />}>
                    <Pricing />
                </Suspense>
            } />

            {/* Protected Routes */}
            <Route path="/onboarding" element={
                <ProtectedRoute><Onboarding /></ProtectedRoute>
            } />
            <Route path="/dashboard" element={
                <ProtectedRoute><Dashboard /></ProtectedRoute>
            } />
            <Route path="/transactions" element={
                <ProtectedRoute><Transactions /></ProtectedRoute>
            } />
            <Route path="/transactions/new" element={
                <ProtectedRoute><Transactions /></ProtectedRoute>
            } />
            <Route path="/budgets" element={
                <ProtectedRoute><Budgets /></ProtectedRoute>
            } />
            <Route path="/savings" element={
                <ProtectedRoute><SavingsGoals /></ProtectedRoute>
            } />
            <Route path="/profile" element={
                <ProtectedRoute><Profile /></ProtectedRoute>
            } />
            <Route path="/settings" element={
                <ProtectedRoute><Profile /></ProtectedRoute>
            } />

            {/* Catch all */}
            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    );
}

function App() {
    return (
        <Router>
            <AuthProvider>
                <ToastProvider>
                    <AppRoutes />
                </ToastProvider>
            </AuthProvider>
        </Router>
    );
}

export default App;
