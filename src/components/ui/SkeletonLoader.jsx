export function Skeleton({ className = '', width, height }) {
    return (
        <div
            className={`skeleton ${className}`}
            style={{ width, height }}
        />
    );
}

export function SkeletonText({ lines = 3, className = '' }) {
    return (
        <div className={`space-y-2 ${className}`}>
            {Array.from({ length: lines }).map((_, i) => (
                <div
                    key={i}
                    className="skeleton h-4 rounded-lg"
                    style={{ width: i === lines - 1 ? '60%' : '100%' }}
                />
            ))}
        </div>
    );
}

export function SkeletonCard({ className = '' }) {
    return (
        <div className={`card p-4 space-y-3 ${className}`}>
            <div className="flex items-center gap-3">
                <Skeleton className="w-12 h-12 rounded-xl" />
                <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-3/4 rounded-lg" />
                    <Skeleton className="h-3 w-1/2 rounded-lg" />
                </div>
            </div>
        </div>
    );
}

export function SkeletonBalanceCard() {
    return (
        <div className="gradient-primary rounded-2xl p-6 space-y-4 animate-pulse-soft">
            <Skeleton className="h-4 w-24 rounded-lg !bg-white/20" />
            <Skeleton className="h-8 w-40 rounded-lg !bg-white/20" />
            <div className="flex gap-6 mt-4 pt-4 border-t border-white/10">
                <div className="space-y-2">
                    <Skeleton className="h-3 w-16 rounded-lg !bg-white/20" />
                    <Skeleton className="h-4 w-24 rounded-lg !bg-white/20" />
                </div>
                <div className="space-y-2">
                    <Skeleton className="h-3 w-16 rounded-lg !bg-white/20" />
                    <Skeleton className="h-4 w-24 rounded-lg !bg-white/20" />
                </div>
            </div>
        </div>
    );
}

export function SkeletonTransactionList({ count = 5 }) {
    return (
        <div className="space-y-1">
            {Array.from({ length: count }).map((_, i) => (
                <div key={i} className="flex items-center gap-4 px-4 py-4">
                    <Skeleton className="w-12 h-12 rounded-xl shrink-0" />
                    <div className="flex-1 space-y-2">
                        <Skeleton className="h-4 w-3/4 rounded-lg" />
                        <Skeleton className="h-3 w-1/2 rounded-lg" />
                    </div>
                    <Skeleton className="h-5 w-20 rounded-lg shrink-0" />
                </div>
            ))}
        </div>
    );
}

export function SkeletonChart() {
    return (
        <div className="card p-6 space-y-4">
            <Skeleton className="h-5 w-32 rounded-lg" />
            <div className="flex items-end justify-center gap-2 h-48">
                {[40, 65, 45, 80, 55, 70].map((h, i) => (
                    <Skeleton
                        key={i}
                        className="w-8 rounded-t-lg"
                        style={{ height: `${h}%` }}
                    />
                ))}
            </div>
        </div>
    );
}
