import { Vector, Vector4, Vector3 } from './vector';
import { Matrix, Matrix4 } from './matrix';
import { Quaternion } from './quaternion';

export class Euler {
    degrees: number = 57.29577951308232;
    radians: number = 0.017453292519943295;
    coordinatesSystem: 'RHS' | 'LHS' = 'RHS';
    order: 'XYZ' | 'XZY' | 'YXZ' | 'YZX' | 'ZXY' | 'ZYX' = 'XYZ';
    roll: number;
    pitch: number;
    yaw: number;

    constructor(roll: number = 0, pitch: number = 0, yaw: number = 0) {
        this.roll = roll;
        this.pitch = pitch;
        this.yaw = yaw;
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

    setOrder(order: 'XYZ' | 'XZY' | 'YXZ' | 'YZX' | 'ZXY' | 'ZYX'): void {
        if (order !== 'XYZ' && order !== 'XZY' && order !== 'YXZ' && order !== 'YZX' && order !== 'ZXY' && order !== 'ZYX') {
            throw new Error("Unknown order. Use 'XYZ', 'XZY', 'YXZ', 'YZX', 'ZXY' or 'ZYX'.");
        }
        this.order = order;
    }

    getOrder(): string {
        return this.order;
    }

    static fromAngleAxis(angleRadians: number, axis: Vector3 | Vector4, order: 'XYZ' | 'XZY' | 'YXZ' | 'YZX' | 'ZXY' | 'ZYX' = 'XYZ'): Euler {
        const degrees = 57.29577951308232;
        const [c, s] = [Math.cos(angleRadians), Math.sin(angleRadians)];
        const R11 = c + axis.x * axis.x * (1 - c);
        const R12 = axis.x * axis.y * (1 - c) - axis.z * s;
        const R13 = axis.x * axis.z * (1 - c) + axis.y * s;
        const R21 = axis.y * axis.x * (1 - c) + axis.z * s;
        const R22 = c + axis.y * axis.y * (1 - c);
        const R23 = axis.y * axis.z * (1 - c) - axis.x * s;
        const R31 = axis.z * axis.x * (1 - c) - axis.y * s;
        const R32 = axis.z * axis.y * (1 - c) + axis.x * s;
        const R33 = c + axis.z * axis.z * (1 - c);
        let pitch: number, roll: number, yaw: number;

        switch (order) {
            case 'XYZ':
                pitch = Math.asin(-R31);
                if (Math.abs(pitch) < Math.PI / 2) {
                    roll = Math.atan2(R32, R33);
                    yaw = Math.atan2(R21, R11);
                } else {
                    roll = Math.atan2(-R12, R22);
                    yaw = 0;
                }
                break;
            case 'XZY':
                pitch = Math.asin(R32);
                if (Math.abs(pitch) < Math.PI / 2) {
                    roll = Math.atan2(-R23, R22);
                    yaw = Math.atan2(-R31, R11);
                } else {
                    roll = 0;
                    yaw = Math.atan2(R12, R22);
                }
                break;
            case 'YXZ':
                pitch = Math.asin(-R13);
                if (Math.abs(pitch) < Math.PI / 2) {
                    roll = Math.atan2(R23, R33);
                    yaw = Math.atan2(R12, R11);
                } else {
                    roll = 0;
                    yaw = Math.atan2(-R21, R22);
                }
                break;
            case 'YZX':
                pitch = Math.asin(R13);
                if (Math.abs(pitch) < Math.PI / 2) {
                    roll = Math.atan2(-R12, R11);
                    yaw = Math.atan2(-R31, R32);
                } else {
                    roll = 0;
                    yaw = Math.atan2(R21, R22);
                }
                break;
            case 'ZXY':
                pitch = Math.asin(R31);
                if (Math.abs(pitch) < Math.PI / 2) {
                    roll = Math.atan2(-R21, R11);
                    yaw = Math.atan2(-R32, R33);
                } else {
                    roll = 0;
                    yaw = Math.atan2(R12, R22);
                }
                break;
            case 'ZYX':
                pitch = Math.asin(-R31);
                if (Math.abs(pitch) < Math.PI / 2) {
                    roll = Math.atan2(R32, R33);
                    yaw = Math.atan2(R21, R11);
                } else {
                    roll = Math.atan2(-R12, R22);
                    yaw = 0;
                }
                break;
            default:
                throw new Error("Unknown order. Use 'XYZ', 'XZY', 'YXZ', 'YZX', 'ZXY' or 'ZYX'.");
        }
        return new Euler(roll * degrees, pitch * degrees, yaw * degrees);
    }

    static fromRotationMatrix(m4: Matrix4): Euler {
        const degrees = 57.29577951308232;
        const roll = -Math.atan(m4.m32 / m4.m33) * degrees;
        const pitch = Math.atan(-m4.m31 / Math.sqrt(m4.m32 ** 2 + m4.m33 ** 2)) * degrees;
        const yaw = Math.atan(m4.m21 / m4.m11) * degrees;
        return new Euler(roll, pitch, yaw);
    }

    static fromQuaternion(q: Quaternion) {
        const degrees = 57.29577951308232;
        return new Euler(
           -Math.atan2(2 *(q.w * q.x + q.y * q.z), 1 - 2 * (q.x ** 2 + q.y ** 2)) * degrees,
            Math.asin(2 * (q.w * q.y - q.z * q.x)) * degrees,
            Math.atan2(2 *(q.w * q.z + q.x * q.y), 1 - 2 * (q.y ** 2 + q.z ** 2)) * degrees
        );
    }

    toRotationAngle(): number {
        const matrix = this.rotateXYZ();
        return Math.acos((matrix.m11 + matrix.m22 + matrix.m33 - 1) / 2);
    }

    toRotationAxis(): Vector4 {
        const matrix = this.rotateXYZ();
            const divider = 2 * Math.sin(this.toRotationAngle());
            return new Vector4(
                (matrix.m32 - matrix.m23) / divider,
                (matrix.m13 - matrix.m31) / divider,
                (matrix.m21 - matrix.m12) / divider,
                1
            );
    }

    toQuaternion(): Quaternion {
        const matrix = this.rotateXYZ();
        let w = ((1 + matrix.m11 + matrix.m22 + matrix.m33) / 4)**0.5;
        let x = ((1 + matrix.m11 - matrix.m22 - matrix.m33) / 4)**0.5;
        let y = ((1 - matrix.m11 + matrix.m22 - matrix.m33) / 4)**0.5;
        let z = ((1 - matrix.m11 - matrix.m22 + matrix.m33) / 4)**0.5;

        if (w > x && w > y && w > z) {
            let divider = 4 * w;
            return new Quaternion(
                w,
                (matrix.m32 - matrix.m23) / divider,
                (matrix.m13 - matrix.m31) / divider,
                (matrix.m21 - matrix.m12) / divider
            );
        }
        if (x > w && x > y && x > z) {
            let divider = 4 * x;
            return new Quaternion(
                (matrix.m32 - matrix.m23) / divider,
                x,
                (matrix.m12 + matrix.m21) / divider,
                (matrix.m13 + matrix.m31) / divider
            );
        }
        if (y > w && y > x && y > z) {
            let divider = 4 * y;
            return new Quaternion(
                (matrix.m13 - matrix.m31) / divider,
                (matrix.m12 + matrix.m21) / divider,
                y,
                (matrix.m23 + matrix.m32) / divider
            );
        }
        if (z > w && z > x && z > y) {
            let divider = 4 * z;
            return new Quaternion(
                (matrix.m21 - matrix.m12) / divider,
                (matrix.m13 + matrix.m31) / divider,
                (matrix.m23 + matrix.m32) / divider,
                z
            );
        }
        throw new Error("Cannot determine quaternion from matrix.");
    }

    rotateX(): Matrix4 {
        this.roll *= this.radians;
        const [c, s] = [Math.cos(this.roll), Math.sin(this.roll)];
        switch (this.coordinatesSystem) {
            case 'LHS':
                return new Matrix4(
                    1, 0, 0, 0,
                    0, c,-s, 0,
                    0, s, c, 0,
                    0, 0, 0, 1
                );
            case 'RHS':
            default:
                return new Matrix4(
                    1, 0, 0, 0,
                    0, c, s, 0,
                    0,-s, c, 0,
                    0, 0, 0, 1
                );
        }
    }

    rotateY(): Matrix4 {
        this.pitch *= this.degrees;
        const [c, s] = [Math.cos(this.pitch), Math.sin(this.pitch)];
        switch (this.coordinatesSystem) {
            case 'LHS':
                return new Matrix4(
                    c, 0, s, 0,
                    0, 1, 0, 0,
                    -s,0, c, 0,
                    0, 0, 0, 1
                );
            case 'RHS':
            default:
                return new Matrix4(
                    c, 0,-s, 0,
                    0, 1, 0, 0,
                    s, 0, c, 0,
                    0, 0, 0, 1
                );
        }
    }

    rotateZ(): Matrix4 {
        this.yaw *= this.degrees;
        const [c, s] = [Math.cos(this.yaw), Math.sin(this.yaw)];
        switch (this.coordinatesSystem) {
            case 'LHS':
                return new Matrix4(
                    c,-s, 0, 0,
                    s, c, 0, 0,
                    0, 0, 1, 0,
                    0, 0, 0, 1
                );
            case 'RHS':
            default:
                return new Matrix4(
                    c, s, 0, 0,
                   -s, c, 0, 0,
                    0, 0, 1, 0,
                    0, 0, 0, 1
                );
        }
    }

    rotateXYZ(): Matrix4 {
        let rX: number, rY: number, rZ: number;

        switch (this.coordinatesSystem) {
            case 'LHS':
                rX = -this.roll * this.radians;
                rY =  this.pitch * this.radians;
                rZ =  this.yaw * this.radians;
                break;
            case 'RHS':
            default:
                rX =  this.roll * this.radians;
                rY = -this.pitch * this.radians;
                rZ = -this.yaw * this.radians;
                break;
        }

        const [cA, sA] = [Math.cos(rX), Math.sin(rX)];
        const [cB, sB] = [Math.cos(rY), Math.sin(rY)];
        const [cG, sG] = [Math.cos(rZ), Math.sin(rZ)];

        switch (this.order) {
            case 'XYZ':
                return new Matrix4(
                    cG * cB,  sG * cA + cG * sB * sA, sG * sA - cG * sB * cA, 0,
                   -sG * cB,  cG * cA - sG * sB * sA, sG * sA + cG * sB * cA, 0,
                    sB,      -cB * sA,                cB * cA,                0,
                    0,        0,                      0,                      1
                );
            case 'XZY':
                return new Matrix4(
                    cB * cG, cB * sG * cA + sB * sA, cB * sG * sA - sB * cA, 0,
                   -sG,      cG * cA,                cG * sA,                0,
                    sB * cG, sB * sG * cA - cB * sA, sB * sG * sA + cB * cA, 0,
                    0,       0,                      0,                      1
                );
            case 'YXZ':
                return new Matrix4(
                    cG * cB + sG * sA * sB, sG * cA,-cG * sB + sG * sA * cB, 0,
                   -sG * cB + cG * sA * sB, cG * cA, sG * sB + cG * sA * cB, 0,
                    cA * sB,               -sA,      cA * cB,                0,
                    0,                      0,       0,                      1
                );
            case 'YZX':
                return new Matrix4(
                    cG * cB,                 sG,     -cG * sB,               0,
                   -cA * sG * cB + sA * sB,  cA * cG, cA * sG * sB + sA * cB,0,
                    sA * sG * cB + cA * sB, -sA * cG,-sA * sG * sB + cA * cB,0,
                    0,                       0,       0,                     1
                );
            case 'ZXY':
                return new Matrix4(
                    cB * cG - sB * sA * sG, cB * sG + sB * sA * cG,-sB * cA, 0,
                   -cA * sG,                cA * cG,                sA,      0,
                    sB * cG + cB * sA * sG, sB * sG - cB * sA * cG, cB * cA, 0,
                    0,                      0,                      0,       1
                );
            case 'ZYX':
                return new Matrix4(
                    cB * cG,                cB * sG,               -sB,      0,
                    sA * sB * cG - cA * sG, sA * sB * sG + cA * cG, sA * cB, 0,
                    cA * sB * cG + sA * sG, cA * sB * sG - sA * cG, cA * cB, 0,
                    0,                      0,                      0,       1
                );
            default:
                throw new Error("Unknown order. Use 'XYZ', 'XZY', 'YXZ', 'YZX', 'ZXY' or 'ZYX'.");
        }
    }
}