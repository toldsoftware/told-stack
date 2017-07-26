let perfNow: () => number = null;

if (typeof window !== 'undefined' && window.performance) {
    perfNow = () => performance.now();
} else if (typeof process !== 'undefined' && process.hrtime) {
    const start = process.hrtime();
    perfNow = () => {
        const t = process.hrtime(start);
        return t[0] * 1000 + t[1] / 1e6;
    }
} else {
    const start = Date.now();
    perfNow = () => Date.now() - start;
}

export { perfNow };