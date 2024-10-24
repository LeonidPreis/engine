import { Vector } from './vector';

export class Matrix {
    data: number[][];

    constructor(data: number[][]) {
        this.data = data;
    }

    clone(): Matrix {
        return new Matrix(this.data.map(row => row.slice()));
    }

    transpose(): Matrix {
        const matrix = this.clone();
        const result: number[][] = [];
        for (let i = 0; i < matrix.data[0].length; i++) {
            result[i] = [];
            for (let j = 0; j < matrix.data.length; j++) {
                result[i][j] = matrix.data[j][i];
            }
        }
        return new Matrix(result);
    }

    determinant(epsilon: number = 1e-6): number {
        if (!Matrix.compatibility(this.data)) {
            throw new Error("The number of rows must be equal to the number of columns.");
        }
        const matrix = this.clone();
        let determinant = 1;
        for (let i = 0; i < matrix.data.length; i++) {
            let k = i;
            for (let j = i + 1; j < matrix.data.length; ++j) {
                if (Math.abs(matrix.data[j][i]) > Math.abs(matrix.data[k][i])) {
                    k = j;
                }
            }
            if (Math.abs(matrix.data[k][i]) < epsilon) { return 0; }
            [matrix.data[i], matrix.data[k]] = [matrix.data[k], matrix.data[i]];
            if (i !== k) { determinant = -determinant; }
            determinant *= matrix.data[i][i];
            for (let j = i + 1; j < matrix.data.length; ++j) {
                matrix.data[i][j] /= matrix.data[i][i];
            }
            for (let j = 0; j < matrix.data.length; ++j) {
                if (j !== i && Math.abs(matrix.data[j][i]) > epsilon) {
                    for (let k = i + 1; k < matrix.data.length; ++k) {
                        matrix.data[j][k] -= matrix.data[i][k] * matrix.data[j][i];
                    }
                }
            }
        }
        return determinant;
    }

    degree(degree: number): Matrix {
        if (degree <= 0) {
            throw new Error("The degree of the matrix must be positive and greater than one.");
        }
        if (degree === 1) { return this; }
        let result = Matrix.multiply.matrix(this, new Matrix(this.data));
        for (let i = 3; i <= degree; i++) {
            result = Matrix.multiply.matrix(this, result);
        }
        return result;
    }

    rank(epsilon: number = 1e-6): number {
        if (!Matrix.compatibility(this.data)) {
            throw new Error("The number of rows must be equal to the number of columns.");
        }
        const matrix = this.clone();
        const lineUsed: boolean[] = [];
        let rank = 0;
        for (let i = 0; i < matrix.data.length; i++) {
            lineUsed[i] = false;
        }
        for (let i = 0; i < matrix.data[0].length; i++) {
            let j;
            for (j = 0; j < matrix.data.length; j++) {
                if (!lineUsed[j] && Math.abs(matrix.data[j][i]) > epsilon) {
                    break;
                }
            }
            if (j !== matrix.data.length) {
                rank++;
                lineUsed[j] = true;
                for (let p = i + 1; p < matrix.data[0].length; p++) {
                    matrix.data[j][p] /= matrix.data[j][i];
                }
                for (let k = 0; k < matrix.data.length; k++) {
                    if (k !== j && Math.abs(matrix.data[k][i]) > epsilon) {
                        for (let p = i + 1; p < matrix.data[0].length; p++) {
                            matrix.data[k][p] -= matrix.data[j][p] * matrix.data[k][i];
                        }
                    }
                }
            }
        }
        return rank;
    }

    inverse(m: number = 3, epsilon: number = 1e-6, maxIterations: number = 1000): Matrix | Error {
        if (!Matrix.compatibility(this.data)) {
            throw new Error("The number of rows must be equal to the number of columns.");
        }
        const matrix = this.clone();
        const e = Matrix.identity(matrix.data.length);
        const norms = Matrix.norma.first(matrix) * Matrix.norma.infinity(matrix);
        const t = matrix.transpose();
        let u0: number[][] = [];
        for (let i = 0; i < matrix.data.length; i++) {
            u0[i] = [];
            for (let j = 0; j < matrix.data.length; j++) {
                u0[i][j] = t.data[i][j] / norms;
            }
        }
        let k = 0;
        while (k <= maxIterations) {
            const psi = Matrix.subtract(e, Matrix.multiply.matrix(matrix, new Matrix(u0)));
            let psiNorma = 0;
            for (let i = 0; i < psi.data.length; i++) {
                for (let j = 0; j < psi.data[0].length; j++) {
                    psiNorma += Math.abs(psi.data[i][j]) ** m;
                }
            }
            psiNorma = psiNorma ** 0.5;
            if (psiNorma <= epsilon) {
                return new Matrix(u0);
            } else {
                const psiPrevious = psi;
                const u1 = Matrix.multiply.matrix(new Matrix(u0), Matrix.add(e, psiPrevious));
                u0 = u1.data;
                k++;
            }
        }
        return new Error('The number of iterations is insufficient for the calculation.');
    }

    static equal(mA: Matrix, mB: Matrix, digits: number = 1): boolean {
        let equal = true;
        for (let i = 0; i < mA.data.length; i++) {
            for (let j = 0; j < mA.data[0].length; j++) {
                if (parseFloat(mA.data[i][j].toFixed(digits)) === parseFloat(mB.data[i][j].toFixed(digits))) {
                    continue;
                } else { equal = false; }
            }
        }
        return equal;
    }

    static compatibility(mA: number[][], mB: number[][] | undefined = undefined): boolean {
        if (mB === undefined) {
            return mA.length > 0 && mA.every(row => row.length === mA.length);
        }
        if (mA.length !== mB.length) {
            return false;
        }
        for (let i = 0; i < mA.length; i++) {
            if (mA[i].length !== mB[i].length) {
                return false;
            }
        }
        return true;
    }

    static sort(array: number[]): number[] {
        const sortedArray: number[] = [];
        const index: number[] = [];
        while (array.length > 0) {
            let smallest = array[0];
            let smallestIndex = 0;
            for (let i = 1; i < array.length; i++) {
                if (array[i] < smallest) {
                    smallest = array[i];
                    smallestIndex = i;
                }
            }
            index.push(smallestIndex);
            sortedArray.push(array.splice(smallestIndex, 1)[0]);
        }
        return sortedArray;
    }

    static identity(order: number): Matrix {
        const result: number[][] = [];
        for (let i = 0; i < order; i++) {
            result[i] = [];
            for (let j = 0; j < order; j++) {
                result[i][j] = i === j ? 1 : 0;
            }
        }
        return new Matrix(result);
    }

    static add(mA: Matrix, mB: Matrix): Matrix {
        const result: number[][] = [];
        for (let i = 0; i < mA.data.length; i++) {
            result[i] = [];
            for (let j = 0; j < mA.data[0].length; j++) {
                result[i][j] = mA.data[i][j] + mB.data[i][j];
            }
        }
        return new Matrix(result);
    }

    static subtract(mA: Matrix, mB: Matrix): Matrix {
        const result: number[][] = [];
        for (let i = 0; i < mA.data.length; i++) {
            result[i] = [];
            for (let j = 0; j < mA.data[0].length; j++) {
                result[i][j] = mA.data[i][j] - mB.data[i][j];
            }
        }
        return new Matrix(result);
    }

    static multiply = class {
        static scalar(m: Matrix, s: number): Matrix {
            const result: number[][] = [];
            for (let i = 0; i < m.data.length; i++) {
                result[i] = [];
                for (let j = 0; j < m.data[0].length; j++) {
                    result[i][j] = m.data[i][j] * s;
                }
            }
            return new Matrix(result);
        }

        static vector(m: Matrix, v: Vector): Vector {
            const result: number[] = [];
            for (let i = 0; i < m.data.length; i++) {
                let s = 0;
                for (let j = 0; j < m.data[i].length; j++) {
                    s += m.data[i][j] * v.data[j];
                }
                result.push(s);
            }
            return new Vector(result);
        }

        static matrix(mA: Matrix, mB: Matrix): Matrix {
            if (!Matrix.compatibility(mA.data, mB.data)) {
                throw new Error("The number of rows must be equal to the number of columns.");
            }
            const result: number[][] = [];
            for (let i = 0; i < mA.data.length; i++) {
                result[i] = [];
                for (let j = 0; j < mB.data[0].length; j++) {
                    let s = 0;
                    for (let k = 0; k < mB.data.length; k++) {
                        s += mA.data[i][k] * mB.data[k][j];
                    }
                    result[i][j] = s;
                }
            }
            return new Matrix(result);
        }
    }

    static norma = class {
        static first(m: Matrix): number {
            let max = 0;
            for (let j = 0; j < m.data[0].length; j++) {
                let s = 0;
                for (let i = 0; i < m.data.length; i++) {
                    s += Math.abs(m.data[i][j]);
                }
                if (s > max) { max = s; }
            }
            return max;
        }

        static infinity(m: Matrix): number {
            let max = 0;
            for (let i = 0; i < m.data.length; i++) {
                let s = 0;
                for (let j = 0; j < m.data[0].length; j++) {
                    s += Math.abs(m.data[i][j]);
                }
                if (s > max) { max = s; }
            }
            return max;
        }
    }
}