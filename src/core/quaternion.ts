import { Euler, RotationOrder } from "./euler";
import { Matrix4 } from "./matrix4";
import { Vector4 } from "./vector4"

export class Quaternion {
    constructor(public w: number = 1, public x: number = 1, public y: number = 1, public z: number = 1) {}

    public equals(q: Quaternion, epsilon: number = 1e-6): boolean {
        return Math.abs(this.w - q.w) < epsilon &&
               Math.abs(this.x - q.x) < epsilon &&
               Math.abs(this.y - q.y) < epsilon &&
               Math.abs(this.z - q.z) < epsilon;
    }
    public clone(): Quaternion {
        return new Quaternion(this.w, this.x, this.y, this.z);
    }

    public length(): number {
        return (this.w * this.w + this.x * this.x + this.y * this.y + this.z * this.z)**0.5;
    }

    public normalize(): Quaternion {
        const length = this.length();
        if (length == 0) {
            throw new Error('Quaternion of zero-length cannot be normalized.');
        }
        return new Quaternion(this.w / length, this.x / length, this.y / length, this.z / length);
    }

    public conjugate(): Quaternion {
        return new Quaternion(this.w, -this.x, -this.y, -this.z);
    }

    public inverse(): Quaternion {
        const lengthSquared = this.length()**2;
        return new Quaternion(
            this.w / lengthSquared,
           -this.x / lengthSquared,
           -this.y / lengthSquared,
           -this.z / lengthSquared
        );
    }

    public add(q: Quaternion): Quaternion {
        return new Quaternion(
            this.w + q.w,
            this.x + q.x,
            this.y + q.y,
            this.z + q.z
        );
    }

    public subtract(q: Quaternion): Quaternion {
        return new Quaternion(
            this.w - q.w,
            this.x - q.x,
            this.y - q.y,
            this.z - q.z
        );
    }

    public scale(s: number): Quaternion {
        return new Quaternion(this.w * s, this.x * s, this.y * s, this.z * s);
    }

    public dot(q: Quaternion): number {
        return this.w * q.w + this.x * q.x + this.y * q.y + this.z * q.z;
    }

    public angle(q: Quaternion): number {
        const lengths = this.length() * q.length();
        if (lengths == 0) {
            console.error('Quaternion of zero-length cannot be normalized.');
            return 0;
        }
        return 2 * Math.acos(Math.abs(this.dot(q) / (lengths)));
    }

    public toRotationAngle(): number {
        return 2 * Math.acos(this.w);
    }

    public toRotationAxis(): Vector4 {
        const sin = Math.sin(this.toRotationAngle() / 2);
        return new Vector4(this.x / sin, this.y / sin, this.z / sin, 1);
    }

    public toRotationMatrix(): Matrix4 {
        const w = this.w, x = this.x, y = this.y, z = this.z;
        return new Matrix4(
            1 - 2 * (y * y + z * z), 2 * (x * y + w * z), 2 * (x * z - w * y), 0,
            2 * (x * y - w * z), 1 - 2 * (x * x + z * z), 2 * (y * z + w * x), 0,
            2 * (x * z + w * y), 2 * (y * z - w * x), 1 - 2 * (x * x + y * y), 0,
            0,                   0,                       0,                   1
        );
    }

    public multiply(q: Quaternion): Quaternion {
        return new Quaternion(
            this.w * q.w - this.x * q.x - this.y * q.y - this.z * q.z,
            this.w * q.x + this.x * q.w + this.y * q.z - this.z * q.y,
            this.w * q.y - this.x * q.z + this.y * q.w + this.z * q.x,
            this.w * q.z + this.x * q.y - this.y * q.x + this.z * q.w
        );
    }

    public applyToVector(v4: Vector4): Vector4 {
        const vectorQuat = new Quaternion(0, v4.x, v4.y, v4.z);
        const qInverse = this.clone().inverse();
        const resultQuat = this.multiply(vectorQuat).multiply(qInverse)
        return new Vector4(resultQuat.x, resultQuat.y, resultQuat.z, 1);
    }

    public slerp(q: Quaternion, t: number): Quaternion {
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

    public static fromAngleAxis(angle: number, axis: Vector4): Quaternion {
        angle /= 2;
        const sin = Math.sin(angle);
        return new Quaternion(
            Math.cos(angle),
            axis.x * sin,
            axis.y * sin,
            axis.z * sin
        );
    }

    private static fromIntrinsicEuler(euler: Euler): Quaternion {
        const [alpha, beta, gamma] = [euler.alpha / 2, euler.beta / 2, euler.gamma / 2];
        const [cA, sA] = [Math.cos(alpha), Math.sin(alpha)];
        const [cB, sB] = [Math.cos(beta),  Math.sin(beta)];
        const [cG, sG] = [Math.cos(gamma), Math.sin(gamma)];

        switch (euler.order) {
            case RotationOrder.XYZ:
                return new Quaternion(
                  -sA * sB * sG + cA * cB * cG,
                   sA * cB * cG + sB * sG * cA,
                  -sA * sG * cB + sB * cA * cG,
                   sA * sB * cG + sG * cA * cB);
            case RotationOrder.XZY:
                return new Quaternion(
                    sA * sB * sG + cA * cB * cG,
                    sA * cB * cG - sB * sG * cA,
                   -sA * sB * cG + sG * cA * cB,
                    sA * sG * cB + sB * cA * cG);
            case RotationOrder.YXZ:
                return new Quaternion(
                    sA * sB * sG + cA * cB * cG,
                    sA * sG * cB + sB * cA * cG,
                    sA * cB * cG - sB * sG * cA,
                   -sA * sB * cG + sG * cA * cB);
            case RotationOrder.YZX:
                return new Quaternion(
                   -sA * sB * sG + cA * cB * cG,
                    sA * sB * cG + sG * cA * cB,
                    sA * cB * cG + sB * sG * cA,
                   -sA * sG * cB + sB * cA * cG);
            case RotationOrder.ZXY:
                return new Quaternion(
                   -sA * sB * sG + cA * cB * cG,
                   -sA * sG * cB + sB * cA * cG,
                    sA * sB * cG + sG * cA * cB,
                    sA * cB * cG + sB * sG * cA);
            case RotationOrder.ZYX:
                return new Quaternion(
                    sA * sB * sG + cA * cB * cG,
                   -sA * sB * cG + sG * cA * cB,
                    sA * sG * cB + sB * cA * cG,
                    sA * cB * cG - sB * sG * cA);
            case RotationOrder.XYX:
                return new Quaternion(
                    cA * cB * cG - sA * cB * sG,
                    cA * cB * sG + sA * cB * cG,
                    cA * sB * cG + sA * sB * sG,
                   -cA * sB * sG + sA * sB * cG);
            case RotationOrder.XZX:
                return new Quaternion(
                    cA * cB * cG - sA * cB * sG,
                    cA * cB * sG + sA * cB * cG,
                   -sA * sB * cG + cA * sB * sG,
                    sA * sB * sG + cA * sB * cG);
            case RotationOrder.YXY:
                return new Quaternion(
                    cA * cB * cG - sA * cB * sG,
                    cA * sB * cG + sA * sB * sG,
                    cA * cB * sG + sA * cB * cG,
                    cA * sB * sG - sA * sB * cG);
            case RotationOrder.YZY:
                return new Quaternion(
                    cA * cB * cG - sA * cB * sG,
                    sA * sB * cG - cA * sB * sG,
                    cA * cB * sG + sA * cB * cG,
                    sA * sB * sG + cA * sB * cG);
            case RotationOrder.ZXZ:
                return new Quaternion(
                    cA * cB * cG - sA * cB * sG,
                    cA * sB * cG + sA * sB * sG,
                   -cA * sB * sG + sA * sB * cG,
                    cA * cB * sG + sA * cB * cG);
            case RotationOrder.ZYZ:
                return new Quaternion(
                    cA * cB * cG - sA * cB * sG,
                   -sA * sB * cG + cA * sB * sG,
                    sA * sB * sG + cA * sB * cG,
                    cA * cB * sG + sA * cB * cG);
        }
    }

    private static fromExtrinsicEuler(euler: Euler): Quaternion {
        const [alpha, beta, gamma] = [euler.alpha / 2, euler.beta / 2, euler.gamma / 2];
        const [cA, sA] = [Math.cos(alpha), Math.sin(alpha)];
        const [cB, sB] = [Math.cos(beta),  Math.sin(beta)];
        const [cG, sG] = [Math.cos(gamma), Math.sin(gamma)];

        switch (euler.order) {
            case RotationOrder.XYZ:
                return new Quaternion(
                    cG * cB * cA - sG * sB * sA,
                    sG * cB * cA + cG * sB * sA,
                   -sG * cB * sA + cG * sB * cA,
                    cG * cB * sA + sG * sB * cA);
            case RotationOrder.XZY:
                return new Quaternion(
                    cG * cB * cA + sG * sB * sA,
                    sG * cB * cA - cG * sB * sA,
                    cG * cB * sA - sG * sB * cA,
                    sG * cB * sA + cG * sB * cA);
            case RotationOrder.YXZ:
                return new Quaternion(
                    cG * cB * cA + sG * sB * sA,
                    cG * sB * cA + sG * cB * sA,
                   -cG * sB * sA + sG * cB * cA,
                    cG * cB * sA - sG * sB * cA);
            case RotationOrder.YZX:
                return new Quaternion(
                    cG * cB * cA - sG * sB * sA,
                    cG * cB * sA + sG * sB * cA,
                    sG * cB * cA + cG * sB * sA,
                   -sG * cB * sA + cG * sB * cA);
            case RotationOrder.ZXY:
                return new Quaternion(
                    cG * cB * cA - sG * sB * sA,
                    cG * sB * cA - sG * cB * sA,
                    cG * cB * sA + sG * sB * cA,
                    cG * sB * sA + sG * cB * cA);
            case RotationOrder.ZYX:
                return new Quaternion(
                    cG * cB * cA + sG * sB * sA,
                    cG * cB * sA - sG * sB * cA,
                    cG * sB * cA + sG * cB * sA,
                   -cG * sB * sA + sG * cB * cA);
            case RotationOrder.XYX:
                return new Quaternion(
                    cG * cB * cA - sG * cB * sA,
                    cG * cB * sA + sG * cB * cA,
                    cG * sB * cA + sG * sB * sA,
                    -cG * sB * sA + sG * sB * cA);
            case RotationOrder.XZX:
                return new Quaternion(
                    cG * cB * cA - sG * cB * sA,
                    cG * cB * sA + sG * cB * cA,
                    -sG * sB * cA + cG * sB * sA,
                    sG * sB * sA + cG * sB * cA);
            case RotationOrder.YXY:
                return new Quaternion(
                    cG * cB * cA - sG * cB * sA,
                    cG * sB * cA + sG * sB * sA,
                    cG * cB * sA + sG * cB * cA,
                    cG * sB * sA - sG * sB * cA);
            case RotationOrder.YZY:
                return new Quaternion(
                    cG * cB * cA - sG * cB * sA,
                    sA * sB * cG - cA * sB * sG,
                    cG * cB * sA + sG * cB * cA,
                    sG * sB * sA + cG * sB * cA);
            case RotationOrder.ZXZ:
                return new Quaternion(
                    cG * cB * cA - sG * cB * sA,
                    cG * sB * cA + sG * sB * sA,
                    -cG * sB * sA + sG * sB * cA,
                    cG * cB * sA + sG * cB * cA);
            case RotationOrder.ZYZ:
                return new Quaternion(
                    cG * cB * cA - sG * cB * sA,
                    -sG * sB * cA + cG * sB * sA,
                    sG * sB * sA + cG * sB * cA,
                    cG * cB * sA + sG * cB * cA);
        }
    }

    public static fromEuler(euler: Euler): Quaternion {
        return euler.intrinsic
            ? Quaternion.fromIntrinsicEuler(euler)
            : Quaternion.fromExtrinsicEuler(euler);
    }

    static fromRotationMatrix(m4: Matrix4): Quaternion {
        return new Quaternion(
            0.5 * ( m4.m11 + m4.m22 + m4.m33 + 1)**0.5,
            0.5 * ( m4.m11 - m4.m22 - m4.m33 + 1)**0.5 * Math.sign(m4.m32 - m4.m23),
            0.5 * (-m4.m11 + m4.m22 - m4.m33 + 1)**0.5 * Math.sign(m4.m13 - m4.m31),
            0.5 * (-m4.m11 - m4.m22 + m4.m33 + 1)**0.5 * Math.sign(m4.m21 - m4.m12)
        );
    }

    static rotateX(v4: Vector4, alpha: number): Vector4 {
        const qv = new Quaternion(0, v4.x, v4.y, v4.z);
        const q = Quaternion.fromAngleAxis(alpha, new Vector4(1, 0, 0, 1));
        const t = q.multiply(qv).multiply(q.inverse())
        return new Vector4(t.x, t.y, t.z, 1);
    }

    static rotateY(v4: Vector4, beta: number): Vector4 {
        const qv = new Quaternion(0, v4.x, v4.y, v4.z);
        const q =  Quaternion.fromAngleAxis(beta, new Vector4(0, 1, 0, 1));
        const t = q.multiply(qv).multiply(q.inverse())
        return new Vector4(t.x, t.y, t.z, 1);
    }

    static rotateZ(v4: Vector4, gamma: number): Vector4 {
        const qv = new Quaternion(0, v4.x, v4.y, v4.z);
        const q = Quaternion.fromAngleAxis(gamma, new Vector4(0, 0, 1, 1));
        const t = q.multiply(qv).multiply(q.inverse())
        return new Vector4(t.x, t.y, t.z, 1);
    }

    static rotateXYZ(v4: Vector4, alpha: number, beta: number, gamma: number): Vector4 {
        const qX = Quaternion.fromAngleAxis(alpha, new Vector4(1, 0, 0, 1));
        const qY = Quaternion.fromAngleAxis(beta, new Vector4(0, 1, 0, 1));
        const qZ = Quaternion.fromAngleAxis(gamma, new Vector4(0, 0, 1, 1));
        const qXYZ = qX.multiply(qY.multiply(qZ));
        const t = qXYZ.multiply(new Quaternion(0, v4.x, v4.y, v4.z)).multiply(qXYZ.inverse())
        return new Vector4(t.x, t.y, t.z, 1);
    }

    public toEuler(order: RotationOrder, intrinsic: boolean = true): Euler {
        this.normalize();
        return new Euler(
            Math.atan2(2 * (this.w * this.x + this.y * this.z), 1 - 2 * (this.x * this.x + this.y * this.y)),
            -Math.PI / 2 + 2 * Math.atan2((1 + 2 * (this.w * this.y - this.x * this.z))**0.5, (1 - 2 * (this.w * this.y - this.x * this.z))**0.5),
            Math.atan2(2 * (this.w * this.z + this.x * this.y), 1 - 2 * (this.y * this.y + this.z* this.z)),
            order,
            intrinsic
        );
    }
}