import { Matrix } from './matrix'

export class Vector {
    data: number[];
    constructor(data: number[]) {
        this.data = data;
    }

    public get x(): number {
        return this.data[0];
    }

    public get y(): number {
        return this.data[1];
    }

    public get z(): number {
        return this.data[2];
    }

    public get w(): number {
        return this.data[3];
    }

    public set x(x: number) {
        this.data[0] = x;
    }

    public set y(y: number) {
        this.data[1] = y;
    }

    public set z(z: number) {
        this.data[2] = z;
    }

    public set w(w: number) {
        this.data[3] = w;
    }

    length(): number {
        return Math.sqrt(this.data.reduce((sum, value) => sum + value ** 2, 0));
    }

    normalize(): Vector {
        const length = this.length();
        if (length === 0) {
            throw new Error('Vector of zero length cannot be normalized');
        }
        return new Vector(this.data.map(value => value/length));
    }

    static multiply = class {
        static matrix(v: Vector, m: Matrix): Vector {
            const result: number[] = [];
            for (let i = 0; i < v.data.length; i++) {
                let s = 0;
                for (let j = 0; j < v.data.length; j++) {
                    s += v.data[j] * m.data[i][j];
                }
                result.push(s);
            }
            return new Vector(result);
        }

        static scalar(v: Vector, s: number): Vector {
            const vs: number[] = [];
            for (let i = 0; i < v.data.length; i++) {
                vs.push(v.data[i] * s);
            }
            return new Vector(vs);
        }
    }

    static add(vA: Vector, vB: Vector): Vector {
        const result: number[] = [];
        for (let i = 0; i < vA.data.length; i++) {
            result.push(vA.data[i] + vB.data[i]);
        }
        return new Vector(result);
    }

    static subtract(vA: Vector, vB: Vector): Vector {
        const result: number[] = [];
        for (let i = 0; i < vA.data.length; i++) {
            result.push(vA.data[i] - vB.data[i]);
        }
        return new Vector(result);
    }

    static dot(vA: Vector, vB: Vector): number {
        let result = 0;
        for (let i = 0; i < vA.data.length; i++) {
            result += vA.data[i] * vB.data[i];
        }
        return result;
    }

    static cross(vA: Vector, vB: Vector): Vector {
        return new Vector([
            vA.y * vB.z - vA.z * vB.y,
            vA.z * vB.x - vA.x * vB.z,
            vA.x * vB.y - vA.y * vB.x,
            1
        ]);
    }

    static angle(vA: Vector, vB: Vector): number {
        const lengths = vA.length() * vB.length();
        if (lengths === 0) {
            throw new Error('Angle of zero-length vector cannot be calculated');
        }
        return Math.acos(Vector.dot(vA, vB)/lengths);
    }
}