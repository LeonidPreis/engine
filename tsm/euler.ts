import { Vector } from './vector';
import { Matrix } from './matrix';
import { Quaternion } from './quaternion';

export class Euler {
    static coordinatesSystem: 'RHS' | 'LHS' = 'RHS';
    static order: 'XYZ' | 'XZY' | 'YXZ' | 'YZX' | 'ZXY' | 'ZYX' = 'XYZ';
    data: number[];

    constructor(data: number[] = [0, 0, 0]) {
        this.data = data;
    }

    static setCoordinatesSystem(system: 'RHS' | 'LHS'): void {
        if (system !== 'RHS' && system !== 'LHS') {
            throw new Error("Unknown coordinate system. Use 'LHS' or 'RHS'.");
        }
        Euler.coordinatesSystem = system;
    }

    static getCoordinatesSystem(): string {
        return Euler.coordinatesSystem;
    }

    static setOrder(order: 'XYZ' | 'XZY' | 'YXZ' | 'YZX' | 'ZXY' | 'ZYX'): void {
        if (order !== 'XYZ' && order !== 'XZY' && order !== 'YXZ' && order !== 'YZX' && order !== 'ZXY' && order !== 'ZYX') {
            throw new Error("Unknown order. Use 'XYZ', 'XZY', 'YXZ', 'YZX', 'ZXY' or 'ZYX'.");
        }
        Euler.order = order;
    }

    static getOrder(): string {
        return Euler.order;
    }

    static from = class {
        static angleAxis(angle: number, axis: Vector): Euler {
            const [deg, rad] = [180 / Math.PI, Math.PI / 180];
            const [c, s] = [Math.cos(angle * rad), Math.sin(angle * rad)];
            const R11 = c + axis.data[0] * axis.data[0] * (1 - c);
            const R12 = axis.data[0] * axis.data[1] * (1 - c) - axis.data[2] * s;
            const R13 = axis.data[0] * axis.data[2] * (1 - c) + axis.data[1] * s;
            const R21 = axis.data[1] * axis.data[0] * (1 - c) + axis.data[2] * s;
            const R22 = c + axis.data[1] * axis.data[1] * (1 - c);
            const R23 = axis.data[1] * axis.data[2] * (1 - c) - axis.data[0] * s;
            const R31 = axis.data[2] * axis.data[0] * (1 - c) - axis.data[1] * s;
            const R32 = axis.data[2] * axis.data[1] * (1 - c) + axis.data[0] * s;
            const R33 = c + axis.data[2] * axis.data[2] * (1 - c);
            let pitch: number, roll: number, yaw: number;

            switch (Euler.order) {
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
            return new Euler([roll * deg, pitch * deg, yaw * deg]);
        }

        static matrix(m: Matrix): Euler {
            const deg = 180 / Math.PI;
            const roll = -Math.atan(m.data[2][1] / m.data[2][2]) * deg;
            const pitch = Math.atan(-m.data[2][0] / Math.sqrt(m.data[2][1] ** 2 + m.data[2][2] ** 2)) * deg;
            const yaw = Math.atan(m.data[1][0] / m.data[0][0]) * deg;
            return new Euler([roll, pitch, yaw]);
        }

        static quaternion(q: Quaternion): Euler {
            const deg = 180 / Math.PI;
            return new Euler([
               -Math.atan2(2 *(q.w * q.x + q.y * q.z), 1 - 2 * (q.x ** 2 + q.y ** 2)) * deg,
                Math.asin(2 * (q.w * q.y - q.z * q.x)) * deg,
                Math.atan2(2 *(q.w * q.z + q.x * q.y), 1 - 2 * (q.y ** 2 + q.z ** 2)) * deg
            ]);
        }
    }

    static to = class {
        static axis(m: Matrix): Vector {
            const divider = 2 * Math.sin(Euler.to.angle(m));
            return new Vector([
                (m.data[2][1] - m.data[1][2]) / divider,
                (m.data[0][2] - m.data[2][0]) / divider,
                (m.data[1][0] - m.data[0][1]) / divider
            ]);
        }

        static angle(m: Matrix): number {
            return Math.acos((m.data[0][0] + m.data[1][1] + m.data[2][2] - 1) / 2);
        }

        static quaternion(m: Matrix): Quaternion {
            let w = Math.sqrt((1 + m.data[0][0] + m.data[1][1] + m.data[2][2]) / 4);
            let x = Math.sqrt((1 + m.data[0][0] - m.data[1][1] - m.data[2][2]) / 4);
            let y = Math.sqrt((1 - m.data[0][0] + m.data[1][1] - m.data[2][2]) / 4);
            let z = Math.sqrt((1 - m.data[0][0] - m.data[1][1] + m.data[2][2]) / 4);

            if (w > x && w > y && w > z) {
                let divider = 4 * w;
                return new Quaternion([
                    w,
                    (m.data[2][1] - m.data[1][2]) / divider,
                    (m.data[0][2] - m.data[2][0]) / divider,
                    (m.data[1][0] - m.data[0][1]) / divider
                ]);
            }
            if (x > w && x > y && x > z) {
                let divider = 4 * x;
                return new Quaternion([
                    (m.data[2][1] - m.data[1][2]) / divider,
                    x,
                    (m.data[0][1] + m.data[1][0]) / divider,
                    (m.data[0][2] + m.data[2][0]) / divider
                ]);
            }
            if (y > w && y > x && y > z) {
                let divider = 4 * y;
                return new Quaternion([
                    (m.data[0][2] - m.data[2][0]) / divider,
                    (m.data[0][1] + m.data[1][0]) / divider,
                    y,
                    (m.data[1][2] + m.data[2][1]) / divider
                ]);
            }
            if (z > w && z > x && z > y) {
                let divider = 4 * z;
                return new Quaternion([
                    (m.data[1][0] - m.data[0][1]) / divider,
                    (m.data[0][2] + m.data[2][0]) / divider,
                    (m.data[1][2] + m.data[2][1]) / divider,
                    z
                ]);
            }
            throw new Error("Cannot determine quaternion from matrix.");
        }
    }

    static rotate = class {
        static x(roll: number): Matrix {
            roll *= Math.PI / 180;
            const [c, s] = [Math.cos(roll), Math.sin(roll)];
            switch (Euler.coordinatesSystem) {
                case 'LHS':
                    return new Matrix([
                        [1, 0, 0, 0],
                        [0, c,-s, 0],
                        [0, s, c, 0],
                        [0, 0, 0, 1]
                    ]);
                case 'RHS':
                default:
                    return new Matrix([
                        [1, 0, 0, 0],
                        [0, c, s, 0],
                        [0,-s, c, 0],
                        [0, 0, 0, 1]
                    ]);
            }
        }

        static y(pitch: number): Matrix {
            pitch *= Math.PI / 180;
            const [c, s] = [Math.cos(pitch), Math.sin(pitch)];
            switch (Euler.coordinatesSystem) {
                case 'LHS':
                    return new Matrix([
                        [c, 0, s, 0],
                        [0, 1, 0, 0],
                        [-s,0, c, 0],
                        [0, 0, 0, 1]
                    ]);
                case 'RHS':
                default:
                    return new Matrix([
                        [c, 0,-s, 0],
                        [0, 1, 0, 0],
                        [s, 0, c, 0],
                        [0, 0, 0, 1]
                    ]);
            }
        }

        static z(yaw: number): Matrix {
            yaw *= Math.PI / 180;
            const [c, s] = [Math.cos(yaw), Math.sin(yaw)];
            switch (Euler.coordinatesSystem) {
                case 'LHS':
                    return new Matrix([
                        [c,-s, 0, 0],
                        [s, c, 0, 0],
                        [0, 0, 1, 0],
                        [0, 0, 0, 1]
                    ]);
                case 'RHS':
                default:
                    return new Matrix([
                        [c, s, 0, 0],
                        [-s,c, 0, 0],
                        [0, 0, 1, 0],
                        [0, 0, 0, 1]
                    ]);
            }
        }

        static xyz(rotation: Euler): Matrix {
            let rad = Math.PI / 180;
            let rX: number, rY: number, rZ: number;

            switch (Euler.coordinatesSystem) {
                case 'LHS':
                    rX = -rotation.data[0] * rad;
                    rY = rotation.data[1] * rad;
                    rZ = rotation.data[2] * rad;
                    break;
                case 'RHS':
                default:
                    rX = rotation.data[0] * rad;
                    rY = -rotation.data[1] * rad;
                    rZ = -rotation.data[2] * rad;
                    break;
            }

            const [cA, sA] = [Math.cos(rX), Math.sin(rX)];
            const [cB, sB] = [Math.cos(rY), Math.sin(rY)];
            const [cG, sG] = [Math.cos(rZ), Math.sin(rZ)];

            switch (Euler.order) {
                case 'XYZ':
                    return new Matrix([
                        [cG * cB,  sG * cA + cG * sB * sA, sG * sA - cG * sB * cA, 0],
                        [-sG * cB, cG * cA - sG * sB * sA, sG * sA + cG * sB * cA, 0],
                        [sB,      -cB * sA,                cB * cA,                0],
                        [0,        0,                      0,                      1]
                    ]);
                case 'XZY':
                    return new Matrix([
                        [cB * cG, cB * sG * cA + sB * sA, cB * sG * sA - sB * cA, 0],
                        [-sG,     cG * cA,                cG * sA,                0],
                        [sB * cG, sB * sG * cA - cB * sA, sB * sG * sA + cB * cA, 0],
                        [0,       0,                      0,                      1]
                    ]);
                case 'YXZ':
                    return new Matrix([
                        [cG * cB + sG * sA * sB, sG * cA,-cG * sB + sG * sA * cB, 0],
                        [-sG * cB + cG * sA * sB,cG * cA, sG * sB + cG * sA * cB, 0],
                        [cA * sB,               -sA,      cA * cB,                0],
                        [0,                      0,       0,                      1]
                    ]);
                case 'YZX':
                    return new Matrix([
                        [cG * cB,                 sG,     -cG * sB,               0],
                        [-cA * sG * cB + sA * sB, cA * cG, cA * sG * sB + sA * cB,0],
                        [sA * sG * cB + cA * sB, -sA * cG,-sA * sG * sB + cA * cB,0],
                        [0,                       0,       0,                     1]
                    ]);
                case 'ZXY':
                    return new Matrix([
                        [cB * cG - sB * sA * sG, cB * sG + sB * sA * cG,-sB * cA, 0],
                        [-cA * sG,               cA * cG,                sA,      0],
                        [sB * cG + cB * sA * sG, sB * sG - cB * sA * cG, cB * cA, 0],
                        [0,                      0,                      0,       1]
                    ]);
                case 'ZYX':
                    return new Matrix([
                        [cB * cG,                cB * sG,               -sB,      0],
                        [sA * sB * cG - cA * sG, sA * sB * sG + cA * cG, sA * cB, 0],
                        [cA * sB * cG + sA * sG, cA * sB * sG - sA * cG, cA * cB, 0],
                        [0,                      0,                      0,       1]
                    ]);
                default:
                    throw new Error("Unknown order. Use 'XYZ', 'XZY', 'YXZ', 'YZX', 'ZXY' or 'ZYX'.");
            }
        }
    }
}