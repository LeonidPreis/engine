import { Matrix4 } from './matrix';
import { Vector3, Vector4 } from './vector';
import { Euler } from './euler';

export class Quaternion {
    degrees: number = 57.29577951308232;
    radians: number = 0.017453292519943295;
    coordinatesSystem: 'RHS' | 'LHS' = 'RHS';
    w: number;
    x: number;
    y: number;
    z: number;

    constructor(w: number, x: number, y: number, z: number) {
        this.w = w;
        this.x = x;
        this.y = y;
        this.z = z;
    }

    setCoordinatesSystem(system: 'RHS' | 'LHS'): void {
        if (system !== 'RHS' && system !== 'LHS') {
            throw new Error("Unknown coordinate system. Use 'LHS' or 'RHS'.");
        }
        this.coordinatesSystem = system;
    }

    getCoordinatesSystem(): string {
        return this.coordinatesSystem;
    }

    clone(): Quaternion {
        return new Quaternion(this.w, this.x, this.y, this.z);
    }

    length(): number {
        return (this.w * this.w + this.x * this.x + this.y * this.y + this.z * this.z)**0.5;
    }

    normalize(): Quaternion {
        const length = this.length();
        if (length !== 0) {
            return new Quaternion(this.w / length, this.x / length, this.y / length, this.z / length);
        }
        throw new Error('Quaternion of zero-length cannot be normalized.');
    }

    conjugate(): Quaternion {
        return new Quaternion(this.w, -this.x, -this.y, -this.z);
    }

    inverse(): Quaternion {
        const lengthSquared = this.length()**2;
        return new Quaternion(
            this.w / lengthSquared,
           -this.x / lengthSquared,
           -this.y / lengthSquared,
           -this.z / lengthSquared
        );
    }

    add(q: Quaternion): Quaternion {
        return new Quaternion(
            this.w + q.w,
            this.x + q.x,
            this.y + q.y,
            this.z + q.z
        );
    }

    subtract(q: Quaternion): Quaternion {
        return new Quaternion(
            this.w - q.w,
            this.x - q.x,
            this.y - q.y,
            this.z - q.z
        );
    }

    multiplyQuaternion(q: Quaternion): Quaternion {
        return new Quaternion(
            this.w * q.w - this.x * q.x - this.y * q.y - this.z * q.z,
            this.w * q.x + this.x * q.w + this.y * q.z - this.z * q.y,
            this.w * q.y - this.x * q.z + this.y * q.w + this.z * q.x,
            this.w * q.z + this.x * q.y - this.y * q.x + this.z * q.w
        );
    }

    multiplyScalar(s: number): Quaternion {
        return new Quaternion(this.w * s, this.x * s, this.y * s, this.z * s);
    }

    dot(q: Quaternion): number {
        return this.w * q.w + this.x * q.x + this.y * q.y + this.z * q.z;
    }

    angle(q: Quaternion): number {
        return 2 * Math.acos(Math.abs(this.dot(q)/(this.length() * q.length())));
    }

    equals(q: Quaternion): boolean {
        return this.w === q.w &&
               this.x === q.x &&
               this.y === q.y &&
               this.z === q.z;
    }

    toAngle(): number {
        return 2 * Math.acos(this.w);
    }

    toAxis(): Vector4 {
        const sin = Math.sin(this.toAngle() / 2);
        return new Vector4(this.x / sin, this.y / sin, this.z / sin, 1);
    }

    toalpha(): number {
        return -Math.atan2(2 * (this.w * this.x + this.y * this.z), 1 - 2 * (this.x * this.x + this.y * this.y));
    }

    tobeta(): number {
        return Math.asin(2 * (this.w * this.y - this.z * this.x));
    }

    togamma(): number {
        return Math.atan2(2 * (this.w * this.z + this.x * this.y), 1 - 2 * (this.y * this.y + this.z * this.z));
    }

    toEuler(): Euler {
        return new Euler(
            this.toalpha() * this.degrees,
            this.tobeta() * this.degrees,
            this.togamma() * this.degrees
        );
    }

    toRotationMatrix(): Matrix4 {
        const w = this.w, x = this.x, y = this.y, z = this.z;
        switch (this.coordinatesSystem) {
            case 'LHS':
                return new Matrix4(
                    1 - 2 * (y * y + z * z), 2 * (x * y - w * z), 2 * (x * z + w * y), 0,
                    2 * (x * y + w * z), 1 - 2 * (x * x + z * z), 2 * (y * z - w * x), 0,
                    2 * (x * z - w * y), 2 * (y * z + w * x), 1 - 2 * (x * x + y * y), 0,
                    0,                   0,                       0,                   1
                );
            case 'RHS':
                return new Matrix4(
                    1 - 2 * (y * y + z * z), 2 * (x * y + w * z), 2 * (x * z - w * y), 0,
                    2 * (x * y - w * z), 1 - 2 * (x * x + z * z), 2 * (y * z + w * x), 0,
                    2 * (x * z + w * y), 2 * (y * z - w * x), 1 - 2 * (x * x + y * y), 0,
                    0,                   0,                       0,                   1
                );
        }
    }

    toString(): string {
        return `w: ${this.w.toFixed(4)} i: ${this.x.toFixed(4)} j: ${this.y.toFixed(4)} k: ${this.z.toFixed(4)}`;
    }

    applyToVector(v4: Vector4): Vector4 {
        const vectorQuat = new Quaternion(0, v4.x, v4.y, v4.z);
        const qInverse = this.clone().inverse();
        const resultQuat = this.multiplyQuaternion(vectorQuat).multiplyQuaternion(qInverse)
        return new Vector4(resultQuat.x, resultQuat.y, resultQuat.z, 1);
    }

    slerp(q: Quaternion, t: number): Quaternion {
        if (t <= 0) {return this;}
        if (t >= 1) {return q;}

        let cos = this.dot(q);

        if (cos < 0) { q = q.inverse(); cos = -cos; }
        if (Math.abs(cos) >= 1) { return q; }

        const theta = Math.acos(cos);
        const sin = Math.sqrt(1 - cos*cos);

        if (Math.abs(sin) < 1e-3) {
            return new Quaternion(
                0.5 * this.w + 0.5 * q.w,
                0.5 * this.x + 0.5 * q.x,
                0.5 * this.y + 0.5 * q.y,
                0.5 * this.z + 0.5 * q.z
            );
        }

        const ratioA = Math.sin((1 - t) * theta) / sin;
        const ratioB = Math.sin(t * theta) / sin;

        return new Quaternion(
            ratioA * this.w + ratioB * q.w,
            ratioA * this.x + ratioB * q.x,
            ratioA * this.y + ratioB * q.y,
            ratioA * this.z + ratioB * q.z
        );
    }

    static fromAngleAxis(angleDegrees: number, axis: Vector3 | Vector4) {
        angleDegrees *= Math.PI / 360;
        const sin = Math.sin(angleDegrees);
        return new Quaternion(
            Math.cos(angleDegrees),
            axis.x * sin,
            axis.y * sin,
            axis.z * sin
        );
    }

    static fromEuler(e: Euler): Quaternion {
        const radians = Math.PI / 360;
        const [alpha, beta, gamma] = [e.alpha * radians, e.beta * radians, e.gamma * radians];
        const [cA, sA] = [Math.cos(alpha), Math.sin(alpha)];
        const [cB, sB] = [Math.cos(beta), Math.sin(beta)];
        const [cG, sG] = [Math.cos(gamma), Math.sin(gamma)];

        switch (e.order) {
            case 'XYZ':
                return new Quaternion(
                    cA * cB * cG - sA * sB * sG,
                   -sA * cB * cG - cA * sB * sG,
                    cA * sB * cG + sA * cB * sG,
                    cA * cB * sG + sA * sB * cG
                );
            case 'XZY':
                return new Quaternion(
                    cA * cB * cG + sA * sB * sG,
                   -sA * cB * cG + cA * sB * sG,
                    cA * sB * cG - sA * cB * sG,
                    cA * cB * sG + sA * sB * cG
                );
            case 'YXZ':
                return new Quaternion(
                    cA * cB * cG + sA * sB * sG,
                   -sA * cB * cG - cA * sB * sG,
                    cA * sB * cG - sA * cB * sG,
                    cA * cB * sG - sA * sB * cG
                );
            case 'YZX':
                return new Quaternion(
                    cA * cB * cG - sA * sB * sG,
                   -sA * cB * cG - cA * sB * sG,
                    cA * sB * cG + sA * cB * sG,
                    cA * cB * sG - sA * sB * cG
                );
            case 'ZXY':
                return new Quaternion(
                    cA * cB * cG - sA * sB * sG,
                   -sA * cB * cG + cA * sB * sG,
                    cA * sB * cG + sA * cB * sG,
                    cA * cB * sG + sA * sB * cG
                );
            case 'ZYX':
                return new Quaternion(
                    cA * cB * cG + sA * sB * sG,
                   -sA * cB * cG + cA * sB * sG,
                    cA * sB * cG + sA * cB * sG,
                    cA * cB * sG - sA * sB * cG
                );
            default:
                throw new Error("Unknown order. Use 'XYZ', 'XZY', 'YXZ', 'YZX', 'ZXY' or 'ZYX'.");
        }
    }

    static fromRotationMatrix(m4: Matrix4): Quaternion {
        return new Quaternion(
            0.5 * (m4.m11 + m4.m22 + m4.m33 + 1)**0.5,
            0.5 * (m4.m11 - m4.m22 - m4.m33 + 1)**0.5 * Math.sign(m4.m32 - m4.m23),
            0.5 * (-m4.m11 + m4.m22 - m4.m33 + 1)**0.5 * Math.sign(m4.m13 - m4.m31),
            0.5 * (-m4.m11 - m4.m22 + m4.m33 + 1)**0.5 * Math.sign(m4.m21 - m4.m12)
        );
    }

    static rotateX(v4: Vector4, alpha: number): Vector4 {
        const qv = new Quaternion(0, v4.x, v4.y, v4.z);
        const q = Quaternion.fromAngleAxis(alpha, new Vector4(1, 0, 0, 1));
        const t = q.multiplyQuaternion(qv).multiplyQuaternion(q.inverse())
        return new Vector4(t.x, t.y, t.z, 1);
    }

    static rotateY(v4: Vector4, beta: number): Vector4 {
        const qv = new Quaternion(0, v4.x, v4.y, v4.z);
        const q =  Quaternion.fromAngleAxis(beta, new Vector4(0, 1, 0, 1));
        const t = q.multiplyQuaternion(qv).multiplyQuaternion(q.inverse())
        return new Vector4(t.x, t.y, t.z, 1);
    }

    static rotateZ(v4: Vector4, gamma: number): Vector4 {
        const qv = new Quaternion(0, v4.x, v4.y, v4.z);
        const q = Quaternion.fromAngleAxis(gamma, new Vector4(0, 0, 1, 1));
        const t = q.multiplyQuaternion(qv).multiplyQuaternion(q.inverse())
        return new Vector4(t.x, t.y, t.z, 1);
    }

    static rotateXYZ(v4: Vector4, alpha: number, beta: number, gamma: number): Vector4 {
        const qX = Quaternion.fromAngleAxis(alpha, new Vector4(1, 0, 0, 1));
        const qY = Quaternion.fromAngleAxis(beta, new Vector4(0, 1, 0, 1));
        const qZ = Quaternion.fromAngleAxis(gamma, new Vector4(0, 0, 1, 1));
        const qXYZ = qX.multiplyQuaternion(qY.multiplyQuaternion(qZ));
        const t = qXYZ.multiplyQuaternion(new Quaternion(0, v4.x, v4.y, v4.z)).multiplyQuaternion(qXYZ.inverse())
        return new Vector4(t.x, t.y, t.z, 1);
    }
}