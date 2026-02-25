import { useRef, useEffect } from 'react';

interface ClickSparkProps {
    sparkColor?: string;
    sparkSize?: number;
    sparkRadius?: number;
    sparkCount?: number;
    duration?: number;
    easing?: 'linear' | 'ease-in' | 'ease-out' | 'ease-in-out';
    extraScale?: number;
}

const ClickSpark = ({
    sparkColor = '#fff',
    sparkSize = 10,
    sparkRadius = 15,
    sparkCount = 8,
    duration = 400,
    easing = 'ease-out',
    extraScale = 1.0,
}: ClickSparkProps) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const sparksRef = useRef<Array<{ x: number; y: number; angle: number; startTime: number }>>([]);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let animationId: number;

        // Simple resize - make canvas match window exactly
        const resize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };

        resize();
        window.addEventListener('resize', resize);

        const easeFunc = (t: number): number => {
            switch (easing) {
                case 'linear': return t;
                case 'ease-in': return t * t;
                case 'ease-in-out': return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
                default: return t * (2 - t); // ease-out
            }
        };

        const createSpark = (x: number, y: number) => {
            const now = performance.now();
            for (let i = 0; i < sparkCount; i++) {
                const angle = (2 * Math.PI * i) / sparkCount;
                sparksRef.current.push({ x, y, angle, startTime: now });
            }
        };

        const handleClick = (e: MouseEvent) => {
            // Use click coordinates directly - no transformations
            createSpark(e.clientX, e.clientY);
        };

        window.addEventListener('click', handleClick);

        const animate = (time: number) => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            const sparks = sparksRef.current;

            for (let i = sparks.length - 1; i >= 0; i--) {
                const spark = sparks[i];
                const elapsed = time - spark.startTime;

                if (elapsed >= duration) {
                    sparks.splice(i, 1);
                    continue;
                }

                const progress = elapsed / duration;
                const eased = easeFunc(progress);
                const distance = eased * sparkRadius * extraScale;
                const lineLength = sparkSize * (1 - eased);

                const x1 = spark.x + distance * Math.cos(spark.angle);
                const y1 = spark.y + distance * Math.sin(spark.angle);
                const x2 = spark.x + (distance + lineLength) * Math.cos(spark.angle);
                const y2 = spark.y + (distance + lineLength) * Math.sin(spark.angle);

                ctx.strokeStyle = sparkColor;
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.moveTo(x1, y1);
                ctx.lineTo(x2, y2);
                ctx.stroke();
            }

            animationId = requestAnimationFrame(animate);
        };

        animationId = requestAnimationFrame(animate);

        return () => {
            window.removeEventListener('resize', resize);
            window.removeEventListener('click', handleClick);
            cancelAnimationFrame(animationId);
        };
    }, [sparkColor, sparkSize, sparkRadius, sparkCount, duration, easing, extraScale]);

    return (
        <canvas
            ref={canvasRef}
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100vw',
                height: '100vh',
                pointerEvents: 'none',
                zIndex: 9999,
            }}
        />
    );
};

export default ClickSpark;
