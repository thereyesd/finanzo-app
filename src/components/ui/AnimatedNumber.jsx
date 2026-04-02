import { useState, useEffect, useRef } from 'react';

export default function AnimatedNumber({
    value,
    duration = 800,
    formatter,
    className = '',
}) {
    const [displayValue, setDisplayValue] = useState(value);
    const prevValue = useRef(value);
    const animationRef = useRef(null);

    useEffect(() => {
        const from = prevValue.current;
        const to = value;
        prevValue.current = value;

        if (from === to) return;

        const startTime = performance.now();

        const animate = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);

            // Ease-out cubic
            const eased = 1 - Math.pow(1 - progress, 3);
            const current = from + (to - from) * eased;

            setDisplayValue(current);

            if (progress < 1) {
                animationRef.current = requestAnimationFrame(animate);
            } else {
                setDisplayValue(to);
            }
        };

        animationRef.current = requestAnimationFrame(animate);

        return () => {
            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current);
            }
        };
    }, [value, duration]);

    const formatted = formatter
        ? formatter(displayValue)
        : Math.round(displayValue).toLocaleString();

    return (
        <span className={`animate-count-up ${className}`}>
            {formatted}
        </span>
    );
}
