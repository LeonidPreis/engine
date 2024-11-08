import { Matrix } from './matrix';
import { Vector } from './vector';
import { Euler } from './euler';

export class Quaternion {
    static coordinatesSystem: 'RHS' | 'LHS' = 'RHS';
    data: number[];

    constructor(data: number[] = [0, 0, 0, 0]) {
        this.data = data;
    }

    public get w(): number {
        return this.data[0];
    }

    public get x(): number {
        return this.data[1];
    }

    public get y(): number {
        return this.data[2];
    }

    public get z(): number {
        return this.data[3];
    }

    clone(): Quaternion {
        return new Quaternion([this.w, this.x, this.y, this.z]);
    }

    length(): number {
        return Math.sqrt(this.w**2 + this.x**2 + this.y**2 + this.z**2);
    }

    normalize(): Quaternion {
        const length = this.length();
        if (length === 0) {
            throw new Error('Quaternion of zero length cannot be normalized');
        }
        return new Quaternion(this.data.map(value => value / length));
    }

    norma(): number {
        return (this.w**2 + this.x**2 + this.y**2 + this.z**2)**0.5;
    }

    conjugate(): Quaternion {
        return new Quaternion([this.w, -this.x, -this.y, -this.z]);
    }

    inverse(): Quaternion {
        const lengthSquared = this.length()**2;
        return new Quaternion([
           this.w / lengthSquared,
           -this.x / lengthSquared,
           -this.y / lengthSquared,
           -this.z / lengthSquared
        ]);
    }

    static add(qA: Quaternion, qB: Quaternion): Quaternion {
        return new Quaternion([
            qA.w + qB.w,
            qA.x + qB.x,
            qA.y + qB.y,
            qA.z + qB.z
        ])
    }

    static subtract(qA: Quaternion, qB: Quaternion): Quaternion {
        return new Quaternion([
            qA.w - qB.w,
            qA.x - qB.x,
            qA.y - qB.y,
            qA.z - qB.z
        ])
    }

    static setCoordinatesSystem(system: 'RHS' | 'LHS'): void {
        if (system !== 'RHS' && system !== 'LHS') {
            throw new Error("Unknown coordinate system. Use 'LHS' or 'RHS'.");
        }
        Quaternion.coordinatesSystem = system;
    }

    static getCoordinatesSystem(): string {
        return Quaternion.coordinatesSystem;
    }

    static equals(qA: Quaternion, qB: Quaternion): boolean {
        return qA.w === qB.w &&
               qA.x === qB.x &&
               qA.y === qB.y &&
               qA.z === qB.z
    }

    static to = class {
        static axis(q: Quaternion): Vector {
            const sin = Math.sin(Quaternion.to.angle(q) / 2);
            return new Vector([q.x / sin, q.y / sin, q.z / sin, 1]);
        }

        static angle(q: Quaternion): number {
            return 2 * Math.acos(q.w);
        }

        static #roll(q: Quaternion): number {
            const x = q.x, y = q.y, z = q.z, w = q.w;
            return -Math.atan2(2 * (w * x + y * z), 1 - 2 * (x * x + y * y));
        }

        static #pitch(q: Quaternion): number {
            const x = q.x, y = q.y, z = q.z, w = q.w;
            return Math.asin(2 * (w * y - z * x));
        }

        static #yaw(q: Quaternion): number {
            const x = q.x, y = q.y, z = q.z, w = q.w;
            return Math.atan2(2 * (w * z + x * y), 1 - 2 * (y * y + z * z));
        }

        static euler(q: Quaternion): Euler {
            const deg = 180 / Math.PI;
            return new Euler([
                Quaternion.to.#roll(q) * deg,
                Quaternion.to.#pitch(q) * deg,
                Quaternion.to.#yaw(q) * deg
            ]);
        }

        static matrix(q: Quaternion): Matrix {
            const x = q.x, y = q.y, z = q.z, w = q.w;
            switch (Quaternion.coordinatesSystem) {
                case 'LHS':
                    return new Matrix([
                        [1 - 2 * (y * y + z * z), 2 * (x * y - w * z), 2 * (x * z + w * y), 0],
                        [2 * (x * y + w * z), 1 - 2 * (x * x + z * z), 2 * (y * z - w * x), 0],
                        [2 * (x * z - w * y), 2 * (y * z + w * x), 1 - 2 * (x * x + y * y), 0],
                        [0,                   0,                       0,                   1]
                    ]);
                case 'RHS':
                    return new Matrix([
                        [1 - 2 * (y * y + z * z), 2 * (x * y + w * z), 2 * (x * z - w * y), 0],
                        [2 * (x * y - w * z), 1 - 2 * (x * x + z * z), 2 * (y * z + w * x), 0],
                        [2 * (x * z + w * y), 2 * (y * z - w * x), 1 - 2 * (x * x + y * y), 0],
                        [0,                   0,                       0,                   1]
                    ]);
            }
        }

        static string(q: Quaternion): string {
            return `w: ${q.w.toFixed(4)} i: ${q.x.toFixed(4)} j: ${q.y.toFixed(4)} k: ${q.z.toFixed(4)}`;
        }
    }

    static from = class {
        static angleAxis(angle: number, axis: Vector): Quaternion {
            angle *= Math.PI / 360;
            const sin = Math.sin(angle);
            return new Quaternion([
                Math.cos(angle),
                axis.x * sin,
                axis.y * sin,
                axis.z * sin
            ]);
        }

        static euler(e: Euler): Quaternion {
            const rad = Math.PI / 360;
            const [roll, pitch, yaw] = [e.data[0]*rad, e.data[1]*rad, e.data[2]*rad];
            const [cA, sA] = [Math.cos(roll), Math.sin(roll)];
            const [cB, sB] = [Math.cos(pitch), Math.sin(pitch)];
            const [cG, sG] = [Math.cos(yaw), Math.sin(yaw)];

            switch (Euler.order) {
                case 'XYZ':
                    return new Quaternion([
                        cA * cB * cG - sA * sB * sG,
                       -sA * cB * cG - cA * sB * sG,
                        cA * sB * cG + sA * cB * sG,
                        cA * cB * sG + sA * sB * cG
                    ]);
                case 'XZY':
                    return new Quaternion([
                        cA * cB * cG + sA * sB * sG,
                       -sA * cB * cG + cA * sB * sG,
                        cA * sB * cG - sA * cB * sG,
                        cA * cB * sG + sA * sB * cG
                    ]);
                case 'YXZ':
                    return new Quaternion([
                        cA * cB * cG + sA * sB * sG,
                       -sA * cB * cG - cA * sB * sG,
                        cA * sB * cG - sA * cB * sG,
                        cA * cB * sG - sA * sB * cG
                    ]);
                case 'YZX':
                    return new Quaternion([
                        cA * cB * cG - sA * sB * sG,
                       -sA * cB * cG - cA * sB * sG,
                        cA * sB * cG + sA * cB * sG,
                        cA * cB * sG - sA * sB * cG
                    ]);
                case 'ZXY':
                    return new Quaternion([
                        cA * cB * cG - sA * sB * sG,
                       -sA * cB * cG + cA * sB * sG,
                        cA * sB * cG + sA * cB * sG,
                        cA * cB * sG + sA * sB * cG
                    ]);
                case 'ZYX':
                    return new Quaternion([
                        cA * cB * cG + sA * sB * sG,
                       -sA * cB * cG + cA * sB * sG,
                        cA * sB * cG + sA * cB * sG,
                        cA * cB * sG - sA * sB * cG
                    ]);
                default:
                    throw new Error("Unknown order. Use 'XYZ', 'XZY', 'YXZ', 'YZX', 'ZXY' or 'ZYX'.");
            }
        }

        static matrix(m: Matrix): Quaternion {
            return new Quaternion([
                0.5*(m.data[0][0]+m.data[1][1]+m.data[2][2]+1)**0.5,
                0.5*(m.data[0][0]-m.data[1][1]-m.data[2][2]+1)**0.5*Math.sign(m.data[2][1]-m.data[1][2]),
                0.5*(-m.data[0][0]+m.data[1][1]-m.data[2][2]+1)**0.5*Math.sign(m.data[0][2]-m.data[2][0]),
                0.5*(-m.data[0][0]-m.data[1][1]+m.data[2][2]+1)**0.5*Math.sign(m.data[1][0]-m.data[0][1])
            ]);
        }
    }

    static multiply = class {
        static quaternion(qA: Quaternion, qB: Quaternion): Quaternion {
            return new Quaternion([
                qA.w * qB.w - qA.x * qB.x - qA.y * qB.y - qA.z * qB.z,
                qA.w * qB.x + qA.x * qB.w + qA.y * qB.z - qA.z * qB.y,
                qA.w * qB.y - qA.x * qB.z + qA.y * qB.w + qA.z * qB.x,
                qA.w * qB.z + qA.x * qB.y - qA.y * qB.x + qA.z * qB.w
            ]);
        }

        static vector(q: Quaternion, v: Vector): Vector {
            // return new Quaternion([
            //    -q.x * v.y - q.y * v.z - q.z * v.w,
            //     q.w * v.y + q.y * v.w - q.z * v.z,
            //     q.w * v.z - q.x * v.w + q.z * v.y,
            //     q.w * v.w + q.x * v.z - q.y * v.y
            // ]);
            const vectorQuat = new Quaternion([0, v.x, v.y, v.z]);
            const qInverse = q.inverse();
            const resultQuat = Quaternion.multiply.quaternion(
                Quaternion.multiply.quaternion(q, vectorQuat),
                qInverse
            );
            return new Vector([resultQuat.x, resultQuat.y, resultQuat.z,1]);
        }

        static scalar(q: Quaternion, s: number): Quaternion {
            return new Quaternion([q.w*s, q.x*s, q.y*s, q.z*s,]);
        }
    }

    static rotate = class {
        static x(v: Vector, roll: number): Vector {
            const qv = new Quaternion([0, v.x, v.y, v.z]);
            const q = Quaternion.from.angleAxis(roll, new Vector([1, 0, 0, 1]));
            const t = Quaternion.multiply.quaternion(Quaternion.multiply.quaternion(q, qv), q.inverse());
            return new Vector([t.x, t.y, t.z, 1]);
        }

        static y(v: Vector, pitch: number): Vector {
            const qv = new Quaternion([0, v.x, v.y, v.z]);
            const q = Quaternion.from.angleAxis(pitch, new Vector([0, 1, 0, 1]));
            const t = Quaternion.multiply.quaternion(Quaternion.multiply.quaternion(q, qv), q.inverse());
            return new Vector([t.x, t.y, t.z, 1]);
        }

        static z(v: Vector, yaw: number): Vector {
            const qv = new Quaternion([0, v.x, v.y, v.z]);
            const q = Quaternion.from.angleAxis(yaw, new Vector([0, 0, 1, 1]));
            const t = Quaternion.multiply.quaternion(Quaternion.multiply.quaternion(q, qv), q.inverse());
            return new Vector([t.x, t.y, t.z, 1]);
        }

        static xyz(v: Vector, roll: number, pitch: number, yaw: number): Vector {
            const qX = Quaternion.from.angleAxis(roll, new Vector([1, 0, 0, 1]));
            const qY = Quaternion.from.angleAxis(pitch, new Vector([0, 1, 0, 1]));
            const qZ = Quaternion.from.angleAxis(yaw, new Vector([0, 0, 1, 1]));
            const qXYZ = Quaternion.multiply.quaternion(qX, Quaternion.multiply.quaternion(qY, qZ));
            const t = Quaternion.multiply.quaternion(Quaternion.multiply.quaternion(qXYZ, new Quaternion([0, v.x, v.y, v.z])), qXYZ.inverse());;
            return new Vector([t.x, t.y, t.z, 1]);
        }
    }

    static slerp(qAn: Quaternion, qBn: Quaternion, t: number): Quaternion {
        if (t <= 0) {return qAn;}
        if (t >= 1) {return qBn;}

        let cos = Quaternion.dot(qAn, qBn);

        if (cos < 0) { qBn = qBn.inverse(); cos = -cos; }
        if (Math.abs(cos) >= 1) { return qBn; }

        const theta = Math.acos(cos);
        const sin = Math.sqrt(1-cos*cos);

        if (Math.abs(sin) < 1e-3) {
            return new Quaternion([
                0.5*qAn.w + 0.5*qBn.w,
                0.5*qAn.x + 0.5*qBn.x,
                0.5*qAn.y + 0.5*qBn.y,
                0.5*qAn.z + 0.5*qBn.z
            ]);
        }

        const ratioA = Math.sin((1-t)*theta)/sin;
        const ratioB = Math.sin(t*theta)/sin;

        return new Quaternion([
            ratioA*qAn.w + ratioB*qBn.w,
            ratioA*qAn.x + ratioB*qBn.x,
            ratioA*qAn.y + ratioB*qBn.y,
            ratioA*qAn.z + ratioB*qBn.z
        ]);
    }

    static dot(qAn: Quaternion, qBn: Quaternion): number {
        return qAn.w*qBn.w + qAn.x*qBn.x + qAn.y*qBn.y + qAn.z*qBn.z;
    }

    static angle(qAn: Quaternion, qBn: Quaternion): number {
        return 2 * Math.acos(Math.abs(Quaternion.dot(qAn, qBn)/(qAn.norma()*qBn.norma())));
    }
}