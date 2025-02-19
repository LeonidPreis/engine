export class Benchmark {
    static measurePerformance(fn: () => void, name: string, iterations: number = 10): void {
        let totalOperations = 0;
        for (let i = 0; i < iterations; i++) {
            const startTime = performance.now();
            let count = 0;
            while (performance.now() - startTime < 1000) {
                fn();
                count++;
            }
            totalOperations += count;
        }
        const averageOperations = Math.floor(totalOperations / iterations);
        console.log(`${name}: ${averageOperations} operations per second (average of ${iterations} runs).`);
    }
}