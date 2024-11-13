import { Vector, Vector4 } from './vector';

export abstract class AbstractMatrix<T extends AbstractMatrix<T>> {
    abstract clone(): T;
    abstract transpose(): T;
    abstract determinant(): number;
    abstract multiplyScalar(s: number): T;
    abstract multiplyMatrix(m: T): T;
    abstract degree(degree: number): T;
    abstract add(m: T): T;
    abstract subtract(m: T): T;
}

export class Matrix extends AbstractMatrix<Matrix> {
    data: number[][];

    constructor(data: number[][]) {
        super();
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

    degree(d: number): Matrix {
        if (d <= 0) {
            throw new Error("The degree of the matrix must be positive and greater than one.");
        }
        if (d === 1) { return this; }
        let result = this.multiplyMatrix(new Matrix(this.data));
        for (let i = 3; i <= d; i++) {
            result = this.multiplyMatrix(result);
        }
        return result;
    }

    rank(epsilon: number = 1e-6): number {
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
        const matrix = this.clone();
        const e = Matrix.identity(matrix.data.length);
        const norms = matrix.firstNorma() * matrix.infinityNorma();
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
            const psi = e.subtract(matrix.multiplyMatrix(new Matrix(u0)));
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
                const u1 = new Matrix(u0).multiplyMatrix(e.add(psiPrevious));
                u0 = u1.data;
                k++;
            }
        }
        return new Error('The number of iterations is insufficient for the calculation.');
    }

    equal(m: Matrix, digits: number = 1): boolean {
        let equal = true;
        for (let i = 0; i < this.data.length; i++) {
            for (let j = 0; j < this.data[0].length; j++) {
                if (parseFloat(this.data[i][j].toFixed(digits)) === parseFloat(m.data[i][j].toFixed(digits))) {
                    continue;
                } else { equal = false; }
            }
        }
        return equal;
    }

    compatibility(m: Matrix | undefined): boolean {
        if (m === undefined) {
            var isSquare: boolean = this.data.length > 0 && this.data.every(row => row.length === this.data.length);
            if (isSquare) { 
                return true; 
            }
            throw new Error(`The number of rows and columns of the matrix must be equal.\nYour matrix has ${this.data.length} rows and ${this.data[0]} columns.`);
        }
        var result = true;
        if (this.data.length !== m.data.length) {
            result = false;
        }
        for (let i = 0; i < this.data.length; i++) {
            if (this.data[i].length !== m.data[i].length) {
                result = false;
            }
        }
        if (result) {
            return true;
        }
        throw new Error(`The number of rows of the first matrix must be equal to the number of columns of the second matrix..\nYour first matrix has ${this.data.length} rows and ${this.data[0]} columns and your second matrix has ${m.data.length} rows and ${m.data[0]} columns.`);
    }

    static sortRow(array: number[]): number[] {
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

    add(m: Matrix): Matrix {
        const result: number[][] = [];
        for (let i = 0; i < this.data.length; i++) {
            result[i] = [];
            for (let j = 0; j < this.data[0].length; j++) {
                result[i][j] = this.data[i][j] + m.data[i][j];
            }
        }
        return new Matrix(result);
    }

    subtract(m: Matrix): Matrix {
        const result: number[][] = [];
        for (let i = 0; i < this.data.length; i++) {
            result[i] = [];
            for (let j = 0; j < this.data[0].length; j++) {
                result[i][j] = this.data[i][j] - m.data[i][j];
            }
        }
        return new Matrix(result);
    }

    multiplyScalar(s: number): Matrix {
        const result: number[][] = [];
        for (let i = 0; i < this.data.length; i++) {
            result[i] = [];
            for (let j = 0; j < this.data[0].length; j++) {
                result[i][j] = this.data[i][j] * s;
            }
        }
        return new Matrix(result);
    }

    multiplyVector(v: Vector): Vector {
        const result: number[] = [];
        for (let i = 0; i < this.data.length; i++) {
            let s = 0;
            for (let j = 0; j < this.data[i].length; j++) {
                s += this.data[i][j] * v.data[j];
            }
            result.push(s);
        }
        return new Vector(result);
    }

    multiplyMatrix(m: Matrix): Matrix {
        const result: number[][] = [];
        for (let i = 0; i < this.data.length; i++) {
            result[i] = [];
            for (let j = 0; j < m.data[0].length; j++) {
                let s = 0;
                for (let k = 0; k < m.data.length; k++) {
                    s += this.data[i][k] * m.data[k][j];
                }
                result[i][j] = s;
            }
        }
        return new Matrix(result);
    }

    firstNorma(): number {
        let max = 0;
            for (let j = 0; j < this.data[0].length; j++) {
                let s = 0;
                for (let i = 0; i < this.data.length; i++) {
                    s += Math.abs(this.data[i][j]);
                }
                if (s > max) { max = s; }
            }
        return max;
    }

    infinityNorma(): number {
        let max = 0;
        for (let i = 0; i < this.data.length; i++) {
            let s = 0;
            for (let j = 0; j < this.data[0].length; j++) {
                s += Math.abs(this.data[i][j]);
            }
            if (s > max) { max = s; }
        }
        return max;
    }
}

export class Matrix4 extends AbstractMatrix<Matrix4> {
    constructor(
        public m11: number = 1, public m12: number = 0, public m13: number = 0, public m14: number = 0,
        public m21: number = 0, public m22: number = 1, public m23: number = 0, public m24: number = 0,
        public m31: number = 0, public m32: number = 0, public m33: number = 1, public m34: number = 0,
        public m41: number = 0, public m42: number = 0, public m43: number = 0, public m44: number = 1
    ) {
        super();
        this.m11 = m11;
        this.m12 = m12;
        this.m13 = m13;
        this.m14 = m14;
        this.m21 = m21;
        this.m22 = m22;
        this.m23 = m23;
        this.m24 = m24;
        this.m31 = m31;
        this.m32 = m32;
        this.m33 = m33;
        this.m34 = m34;
        this.m41 = m41;
        this.m42 = m42;
        this.m43 = m43;
        this.m44 = m44;
    }

    clone(): Matrix4 {
        return new Matrix4(
            this.m11, this.m12, this.m13, this.m14,
            this.m21, this.m22, this.m23, this.m24,
            this.m31, this.m32, this.m33, this.m34,
            this.m41, this.m42, this.m43, this.m44
        );
    }

    transpose(): Matrix4 {
        return new Matrix4(
            this.m11, this.m21, this.m31, this.m41,
            this.m12, this.m22, this.m32, this.m42,
            this.m13, this.m23, this.m33, this.m43,
            this.m14, this.m24, this.m34, this.m44
        )
    }

    determinant(): number {
        const { m11, m12, m13, m14, m21, m22, m23, m24, m31, m32, m33, m34, m41, m42, m43, m44 } = this;

        return  m11 * (m22 * (m33 * m44 - m43 * m34) - m23 * (m32 * m44 - m42 * m34) + m24 * (m32 * m43 - m42 * m33))-
                m12 * (m21 * (m33 * m44 - m43 * m34) - m23 * (m31 * m44 - m41 * m34) + m24 * (m31 * m43 - m41 * m33))+
                m13 * (m21 * (m32 * m44 - m42 * m34) - m22 * (m31 * m44 - m41 * m34) + m24 * (m31 * m42 - m41 * m32))-
                m14 * (m21 * (m32 * m43 - m42 * m33) - m22 * (m31 * m43 - m41 * m33) + m23 * (m31 * m42 - m41 * m32));
    }

    multiplyScalar(s: number): Matrix4 {
        const { m11, m12, m13, m14, m21, m22, m23, m24, m31, m32, m33, m34, m41, m42, m43, m44 } = this;
        
        return new Matrix4(
            m11 * s, m12 * s, m13 * s, m14 * s,
            m21 * s, m22 * s, m23 * s, m24 * s,
            m31 * s, m32 * s, m33 * s, m34 * s,
            m41 * s, m42 * s, m43 * s, m44 * s
        );
    }

    multiplyVector(v4: Vector4): Vector4 {
        const { m11, m12, m13, m14, m21, m22, m23, m24, m31, m32, m33, m34, m41, m42, m43, m44 } = this;
        const { x: v11, y: v21, z: v31, w: v41} = v4;
        
        return new Vector4(
            m11 * v11 + m12 * v21 + m13 * v31 + m14 * v41,
            m21 * v11 + m22 * v21 + m23 * v31 + m24 * v41,
            m31 * v11 + m32 * v21 + m33 * v31 + m34 * v41,
            m41 * v11 + m42 * v21 + m43 * v31 + m44 * v41
        );
    }

    multiplyMatrix(m4: Matrix4): Matrix4 {
        const { m11, m12, m13, m14, m21, m22, m23, m24, m31, m32, m33, m34, m41, m42, m43, m44 } = this;
        const { m11: n11, m12: n12, m13: n13, m14: n14, m21: n21, m22: n22, m23: n23, m24: n24, m31: n31, m32: n32, m33: n33, m34: n34, m41: n41, m42: n42, m43: n43, m44: n44 } = m4;
        
        return new Matrix4(
            m11 * n11 + m12 * n21 + m13 * n31 + m14 * n41,
            m11 * n12 + m12 * n22 + m13 * n32 + m14 * n42,
            m11 * n13 + m12 * n23 + m13 * n33 + m14 * n43,
            m11 * n14 + m12 * n24 + m13 * n34 + m14 * n44,
            m21 * n11 + m22 * n21 + m23 * n31 + m24 * n41,
            m21 * n12 + m22 * n22 + m23 * n32 + m24 * n42,
            m21 * n13 + m22 * n23 + m23 * n33 + m24 * n43,
            m21 * n14 + m22 * n24 + m23 * n34 + m24 * n44,
            m31 * n11 + m32 * n21 + m33 * n31 + m34 * n41,
            m31 * n12 + m32 * n22 + m33 * n32 + m34 * n42,
            m31 * n13 + m32 * n23 + m33 * n33 + m34 * n43,
            m31 * n14 + m32 * n24 + m33 * n34 + m34 * n44,
            m41 * n11 + m42 * n21 + m43 * n31 + m44 * n41,
            m41 * n12 + m42 * n22 + m43 * n32 + m44 * n42,
            m41 * n13 + m42 * n23 + m43 * n33 + m44 * n43,
            m41 * n14 + m42 * n24 + m43 * n34 + m44 * n44,
        );
    }

    inverse(): Matrix4 {
        const { m11, m12, m13, m14, m21, m22, m23, m24, m31, m32, m33, m34, m41, m42, m43, m44 } = this;
        const determinant = this.determinant();
    
        if (determinant !== 0) {
            const d = 1 / determinant;
            const m2132 = m21 * m32, m2133 = m21 * m33, m2134 = m21 * m34, m2142 = m21 * m42, m2143 = m21 * m43, m2144 = m21 * m44;
            const m2231 = m22 * m31, m2233 = m22 * m33, m2234 = m22 * m34, m2241 = m22 * m41, m2243 = m22 * m43, m2244 = m22 * m44;
            const m2331 = m23 * m31, m2332 = m23 * m32, m2334 = m23 * m34, m2341 = m23 * m41, m2342 = m23 * m42, m2344 = m23 * m44;
            const m2431 = m24 * m31, m2432 = m24 * m32, m2433 = m24 * m33, m2441 = m24 * m41, m2442 = m24 * m42, m2443 = m24 * m43;
            const m3142 = m31 * m42, m3143 = m31 * m43, m3144 = m31 * m44, m3241 = m32 * m41, m3243 = m32 * m43, m3244 = m32 * m44;
            const m3341 = m33 * m41, m3342 = m33 * m42, m3344 = m33 * m44, m3441 = m34 * m41, m3442 = m34 * m42, m3443 = m34 * m43;
    
            return new Matrix4(
                d * (m44 * (m11 * (m2233 - m2332) - m12 * (m2133 - m2331) + m13 * (m2132 - m2231))),
                d * (m34 * (m11 * (m2243 - m2342) - m12 * (m2143 - m2341) + m13 * (m2142 - m2241))),
                d * (m24 * (m11 * (m3243 - m3342) - m12 * (m3143 - m3341) + m13 * (m3142 - m3241))),
                d * (m14 * (m21 * (m3243 - m3342) - m22 * (m3143 - m3341) + m23 * (m3142 - m3241))),
                d * (m43 * (m11 * (m2234 - m2432) - m12 * (m2134 - m2431) + m14 * (m2132 - m2231))),
                d * (m33 * (m11 * (m2244 - m2442) - m12 * (m2144 - m2441) + m14 * (m2142 - m2241))),
                d * (m23 * (m11 * (m3244 - m3442) - m12 * (m3144 - m3441) + m14 * (m3142 - m3241))),
                d * (m13 * (m21 * (m3244 - m3442) - m22 * (m3144 - m3441) + m24 * (m3142 - m3241))),
                d * (m42 * (m11 * (m2334 - m2433) - m13 * (m2134 - m2431) + m14 * (m2133 - m2331))),
                d * (m32 * (m11 * (m2344 - m2443) - m13 * (m2144 - m2441) + m14 * (m2143 - m2341))),
                d * (m22 * (m11 * (m3344 - m3443) - m13 * (m3144 - m3441) + m14 * (m3143 - m3341))),
                d * (m12 * (m21 * (m3344 - m3443) - m23 * (m3144 - m3441) + m24 * (m3143 - m3341))),
                d * (m41 * (m12 * (m2334 - m2433) - m13 * (m2234 - m2432) + m14 * (m2233 - m2332))),
                d * (m31 * (m12 * (m2344 - m2443) - m13 * (m2244 - m2442) + m14 * (m2243 - m2342))),
                d * (m21 * (m12 * (m3344 - m3443) - m13 * (m3244 - m3442) + m14 * (m3243 - m3342))),
                d * (m11 * (m22 * (m3344 - m3443) - m23 * (m3244 - m3442) + m24 * (m3243 - m3342)))
            );
        }
    }

    degree(d: number): Matrix4 {
        if (d <= 0) {
            throw new Error("The degree of the matrix must be positive and greater than one.");
        }
        if (d === 1) { return this; }
        let result = this.multiplyMatrix(this);
        for (let i = 3; i <= d; i++) {
            result = this.multiplyMatrix(result);
        }
        return result;
    }

    add(m: Matrix4): Matrix4 {
        return new Matrix4(
            this.m11 + m.m11, this.m12 + m.m12, this.m13 + m.m13, this.m14 + m.m14,
            this.m21 + m.m21, this.m22 + m.m22, this.m23 + m.m23, this.m24 + m.m24,
            this.m31 + m.m31, this.m32 + m.m32, this.m33 + m.m33, this.m34 + m.m34,
            this.m41 + m.m41, this.m42 + m.m42, this.m43 + m.m43, this.m44 + m.m44
        );
    }

    subtract(m: Matrix4): Matrix4 {
        return new Matrix4(
            this.m11 - m.m11, this.m12 - m.m12, this.m13 - m.m13, this.m14 - m.m14,
            this.m21 - m.m21, this.m22 - m.m22, this.m23 - m.m23, this.m24 - m.m24,
            this.m31 - m.m31, this.m32 - m.m32, this.m33 - m.m33, this.m34 - m.m34,
            this.m41 - m.m41, this.m42 - m.m42, this.m43 - m.m43, this.m44 - m.m44
        );
    }
}