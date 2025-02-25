import { Matrix4 } from "./matrix4";

export enum RotationOrder {
    XYZ = 'XYZ',
    XZY = 'XZY',
    YXZ = 'YXZ',
    YZX = 'YZX',
    ZXY = 'ZXY',
    ZYX = 'ZYX',
    XYX = 'XYX',
    XZX = 'XZX',
    YXY = 'YXY',
    YZY = 'YZY',
    ZXZ = 'ZXZ',
    ZYZ = 'ZYZ'
}

export class Euler {
    alpha: number;
    beta: number;
    gamma: number;
    order: RotationOrder;
    intrinsic: boolean;

    constructor(alpha: number = 0, beta: number = 0, gamma: number = 0, order: RotationOrder = RotationOrder.XYZ, intrinsic = true) {
        this.alpha = alpha;
        this.beta = beta;
        this.gamma = gamma;
        this.order = order;
        this.intrinsic = intrinsic;
    }

    public equals(other: Euler, epsilon: number = 1e-6): boolean {
        return  Math.abs(this.alpha - other.alpha) < epsilon &&
                Math.abs(this.beta - other.beta) < epsilon &&
                Math.abs(this.gamma - other.gamma) < epsilon &&
                this.order === other.order &&
                this.intrinsic === other.intrinsic;
    }

    private getMatrixIntrinsicRotation(cA: number, sA: number, cB: number, sB: number, cG: number, sG: number): Matrix4 {
        switch (this.order) {
            case RotationOrder.XYZ:
                return new Matrix4(
                    cB*cG,           -cB*sG,            sB,    0,
                    cA*sG + sA*sB*cG, cA*cG - sA*sB*sG,-sA*cB, 0,
                    sA*sG - cA*sB*cG, cA*sB*sG + sA*cG, cA*cB, 0,
                    0,                0,                0,     1);
            case RotationOrder.XZY:
                return new Matrix4(
                    cG*cB,           -sB,    sG*cB,            0,
                    cA*cG*sB + sA*sG, cA*cB, cA*sG*sB - sA*cG, 0,
                    sA*cG*sB - cA*sG, sA*cB, cA*cG + sA*sG*sB, 0,
                    0,                0,     0,                1);
            case RotationOrder.YXZ:
                return new Matrix4(
                    sB*sA*sG + cA*cG, sB*sA*cG - cA*sG, cB*sA, 0,
                    cB*sG,            cB*cG,           -sB,    0,
                    sB*cA*sG - sA*cG, sB*cA*cG + sA*sG, cB*cA, 0,
                    0,                0,                0,     1);
            case RotationOrder.YZX:
                return new Matrix4(
                    cA*cB, sG*sA - cG*cA*sB, cG*sA + sG*cA*sB, 0,
                    sB,    cG*cB,           -sG*cB,            0,
                   -sA*cB, cG*sA*sB + sG*cA, cG*cA - sG*sA*sB, 0,
                    0,     0,                0,                1);
            case RotationOrder.ZXY:
                return new Matrix4(
                    cG*cA - sB*sG*sA,-cB*sA, sB*cG*sA + sG*cA, 0,
                    sB*sG*cA + cG*sA, cB*cA, sG*sA - sB*cG*cA, 0,
                   -cB*sG,            sB,    cB*cG,            0,
                    0,                0,     0,                1);
            case RotationOrder.ZYX:
                return new Matrix4(
                    cB*cA, sG*sB*cA - cG*sA, cG*sB*cA + sG*sA, 0,
                    cB*sA, cG*cA + sG*sB*sA, cG*sB*sA - sG*cA, 0,
                   -sB,    sG*cB,            cG*cB,            0,
                    0,     0,                0,                1);
            case RotationOrder.XYX:
                return new Matrix4(
                    cB,    sB*sG,            sB*cG,            0,
                    sA*sB, cA*cG - sA*cB*sG,-cA*sG - sA*cB*cG, 0,
                   -cA*sB, cA*cB*sG + sA*cG, cA*cB*cG - sA*sG, 0,
                    0,     0,               0,                 1);
            case RotationOrder.XZX:
                return new Matrix4(
                    cB,   -sB*cG,            sB*sG,            0,
                    cA*sB, cA*cB*cG - sA*sG,-cA*cB*sG - sA*cG, 0,
                    sA*sB, cA*sG + sA*cB*cG, cA*cG - sA*cB*sG, 0,
                    0,     0,                0,                1);
            case RotationOrder.YXY:
                return new Matrix4(
                    cA*cG - sA*cB*sG, sA*sB, cA*sG + sA*cB*cG, 0,
                    sB*sG,            cB,   -sB*cG,            0,
                   -cA*cB*sG - sA*cG, cA*sB, cA*cB*cG - sA*sG, 0,
                    0,                0,     0,                1);
            case RotationOrder.YZY:
                return new Matrix4(
                    cA*cB*cG - sA*sG,-cA*sB, cA*cB*sG + sA*cG, 0,
                    sB*cG,            cB,    sB*sG,            0,
                   -cA*sG - sA*cB*cG, sA*sB, cA*cG - sA*cB*sG, 0,
                    0,                0,     0,                1);
            case RotationOrder.ZXZ:
                return new Matrix4(
                    cA*cG - sA*cB*sG,-cA*sG - sA*cB*cG,  sA*sB, 0,
                    cA*cB*sG + sA*cG, cA*cB*cG - sA*sG, -cA*sB, 0,
                    sB*sG,            sB*cG,             cB,    0,
                    0,                0,                 0,     1);
            case RotationOrder.ZYZ:
                return new Matrix4(
                    cA*cB*cG - sA*sG,-cA*cB*sG - sA*cG, cA*sB, 0,
                    cA*sG + sA*cB*cG, cA*cG - sA*cB*sG, sA*sB, 0,
                   -sB*cG,            sB*sG,            cB,    0,
                    0,                0,                0,     1);
            default:
                throw new Error("Unknown order. Use 'XYZ', 'XZY', 'YXZ', 'YZX', 'ZXY', 'ZYX', 'XYX', 'XZX', 'YXY', 'YZY', 'ZXZ', 'ZYZ'.");
        }
    }

    private getMatrixExtrinsicRotation(cA: number, sA: number, cB: number, sB: number, cG: number, sG: number): Matrix4 {
        switch (this.order) {
            case RotationOrder.XYZ:
                return new Matrix4(
                    cB*cA,           -cB*sA,            sB,    0,
                    cG*sA + sG*sB*cA, cG*cA - sG*sB*sA,-sG*cB, 0,
                    sG*sA - cG*sB*cA, cG*sB*sA + sG*cA, cG*cB, 0,
                    0,                0,                0,     1);
            case RotationOrder.XZY:
                return new Matrix4(
                    cA*cB,           -sB,    sA*cB,            0,
                    cG*cA*sB + sG*sA, cG*cB, cG*sA*sB - sG*cA, 0,
                    sG*cA*sB - cG*sA, sG*cB, cG*cA + sG*sA*sB, 0,
                    0,                0,     0,                1);
            case RotationOrder.YXZ:
                return new Matrix4(
                    sB*sG*sA + cG*cA, sB*sG*cA - cG*sA, cB*sG, 0,
                    cB*sA,            cB*cA,           -sB,    0,
                    sB*cG*sA - sG*cA, sB*cG*cA + sG*sA, cB*cG, 0,
                    0,                0,                0,     1);
            case RotationOrder.YZX:
                return new Matrix4(
                    cG*cB, sA*sG - cA*cG*sB, cA*sG + sA*cG*sB, 0,
                    sB,    cA*cB,           -sA*cB,            0,
                   -sG*cB, cA*sG*sB + sA*cG, cA*cG - sA*sG*sB, 0,
                    0,     0,                0,                1);
            case RotationOrder.ZXY:
                return new Matrix4(
                    cA*cG - sB*sA*sG,-cB*sG, sB*cA*sG + sA*cG, 0,
                    sB*sA*cG + cA*sG, cB*cG, sA*sG - sB*cA*cG, 0,
                   -cB*sA,            sB,    cB*cA,            0,
                    0,                0,     0,                1);
            case RotationOrder.ZYX:
                return new Matrix4(
                    cB*cG, sA*sB*cG - cA*sG, cA*sB*cG + sA*sG, 0,
                    cB*sG, cA*cG + sA*sB*sG, cA*sB*sG - sA*cG, 0,
                   -sB,    sA*cB,            cA*cB,            0,
                    0,     0,                0,                1);
            case RotationOrder.XYX:
                return new Matrix4(
                    cB,    sB*sA,            sB*cA,            0,
                    sG*sB, cG*cA - sG*cB*sA,-cG*sA - sG*cB*cA, 0,
                   -cG*sB, cG*cB*sA + sG*cA, cG*cB*cA - sG*sA, 0,
                    0,     0,               0,                 1);
            case RotationOrder.XZX:
                return new Matrix4(
                    cB,   -sB*cA,            sB*sA,            0,
                    cG*sB, cG*cB*cA - sG*sA,-cG*cB*sA - sG*cA, 0,
                    sG*sB, cG*sA + sG*cB*cA, cG*cA - sG*cB*sA, 0,
                    0,     0,                0,                1);
            case RotationOrder.YXY:
                return new Matrix4(
                    cG*cA - sG*cB*sA, sG*sB, cG*sA + sG*cB*cA, 0,
                    sB*sA,            cB,   -sB*cA,            0,
                   -cG*cB*sA - sG*cA, cG*sB, cG*cB*cA - sG*sA, 0,
                    0,                0,     0,                1);
            case RotationOrder.YZY:
                return new Matrix4(
                    cG*cB*cA - sG*sA,-cG*sB, cG*cB*sA + sG*cA, 0,
                    sB*cA,            cB,    sB*sA,            0,
                   -cG*sA - sG*cB*cA, sG*sB, cG*cA - sG*cB*sA, 0,
                    0,                0,     0,                1);
            case RotationOrder.ZXZ:
                return new Matrix4(
                    cG*cA - sG*cB*sA,-cG*sA - sG*cB*cA,  sG*sB, 0,
                    cG*cB*sA + sG*cA, cG*cB*cA - sG*sA, -cG*sB, 0, 
                    sB*sA,            sB*cA,             cB,    0,
                    0,                0,                 0,     1);
            case RotationOrder.ZYZ:
                return new Matrix4(
                    cG*cB*cA - sG*sA,-cG*cB*sA - sG*cA, cG*sB, 0,
                    cG*sA + sG*cB*cA, cG*cA - sG*cB*sA, sG*sB, 0,
                   -sB*cA,            sB*sA,            cB,    0,
                    0,                0,                0,     1);
            default:
                throw new Error("Unknown order. Use'XYZ', 'XZY', 'YXZ', 'YZX', 'ZXY', 'ZYX', 'XYX', 'XZX', 'YXY', 'YZY', 'ZXZ', 'ZYZ'.");
        }
    }

    rotateX(): Matrix4 {
        const c = Math.cos(this.alpha);
        const s = Math.sin(this.alpha);
        return new Matrix4(
            1, 0, 0, 0,
            0, c,-s, 0,
            0, s, c, 0,
            0, 0, 0, 1
        );
    }
    
    rotateY(): Matrix4 {
        const c = Math.cos(this.beta);
        const s = Math.sin(this.beta);
        return new Matrix4(
            c, 0, s, 0,
            0, 1, 0, 0,
           -s, 0, c, 0,
            0, 0, 0, 1
        );
    }
    
    rotateZ(): Matrix4 {
        const c = Math.cos(this.gamma);
        const s = Math.sin(this.gamma);
        return new Matrix4(
            c,-s, 0, 0,
            s, c, 0, 0,
            0, 0, 1, 0,
            0, 0, 0, 1
        );
    }

    rotateXYZ(): Matrix4 {
        const cA = Math.cos(this.alpha),  sA = Math.sin(this.alpha);
        const cB = Math.cos(this.beta),   sB = Math.sin(this.beta);
        const cG = Math.cos(this.gamma),  sG = Math.sin(this.gamma);
    
        return this.intrinsic
            ? this.getMatrixIntrinsicRotation(cA, sA, cB, sB, cG, sG)
            : this.getMatrixExtrinsicRotation(cA, sA, cB, sB, cG, sG);
    }

    private static fromIntrinsicMatrixXYZ(rotation: Matrix4, epsilon: number = 1e-6) {
        let alpha: number, beta: number, gamma: number, sinBeta: number, cosBeta: number;
        sinBeta = rotation.m13;
        cosBeta = Math.sqrt(1.0 - sinBeta * sinBeta);

        if (cosBeta > epsilon) {
            alpha = Math.atan2(-rotation.m23, rotation.m33);
            beta = Math.atan2(sinBeta, cosBeta);
            gamma = Math.atan2(-rotation.m12, rotation.m11);
        } else {
            alpha = 0;
            if (sinBeta < 0) {
                beta = -Math.PI / 2;
                gamma = -Math.atan2(rotation.m21, rotation.m22);
            } else {
                beta = Math.PI / 2;
                gamma = Math.atan2(rotation.m21, -rotation.m22);
            }
        }

        return new Euler(alpha, beta, gamma, RotationOrder.XYZ, true);
    }

    private static fromExtrinsicMatrixXYZ(rotation: Matrix4, epsilon: number = 1e-6) {
        let alpha: number, beta: number, gamma: number, sinBeta: number, cosBeta: number;
        sinBeta = rotation.m13;
        cosBeta = Math.sqrt(1.0 - sinBeta * sinBeta);
        
        if (cosBeta > epsilon) {
            alpha = Math.atan2(-rotation.m12, rotation.m11);
            beta = Math.atan2(rotation.m13, cosBeta);
            gamma = Math.atan2(-rotation.m23, rotation.m33);
        } else {
            alpha = 0;
            if (sinBeta < 0) {
                beta = -Math.PI / 2;
                gamma = -Math.atan2(rotation.m21, rotation.m22);
            } else {
                beta = Math.PI / 2;
                gamma = Math.atan2(rotation.m21, rotation.m22);
            }
        }
    
        return new Euler(alpha, beta, gamma, RotationOrder.XYZ, false);
    }

    private static fromIntrinsicMatrixXZY(rotation: Matrix4, epsilon: number = 1e-6) {
        let alpha: number, beta: number, gamma: number, sinBeta: number, cosBeta: number;
        sinBeta = rotation.m12;
        cosBeta = Math.sqrt(1.0 - sinBeta * sinBeta);

        if (cosBeta > epsilon) {
            alpha = Math.atan2(rotation.m32, rotation.m22);
            beta = Math.atan2(-sinBeta, cosBeta);
            gamma = Math.atan2(rotation.m13, rotation.m11);
        } else {
            alpha = 0;
            if (sinBeta < 0.0) {
                beta = -Math.PI / 2;
                gamma = Math.atan2(rotation.m23, rotation.m33);
            } else {
                beta = Math.PI / 2;
                gamma = Math.atan2(rotation.m23, rotation.m33);
            }
        }
    
        return new Euler(alpha, beta, gamma, RotationOrder.XZY, true);
    }

    private static fromExtrinsicMatrixXZY(rotation: Matrix4, epsilon: number = 1e-6) {
        let alpha: number, beta: number, gamma: number, sinBeta: number, cosBeta: number;
        sinBeta = rotation.m12;
        cosBeta = Math.sqrt(1.0 - sinBeta * sinBeta);

        if (cosBeta > epsilon) {
            alpha = Math.atan2(rotation.m13, rotation.m11);
            beta = Math.atan2(-sinBeta, cosBeta);
            gamma = Math.atan2(rotation.m32, rotation.m22);
        } else {
            alpha = 0;
            if (sinBeta < 0.0) {
                beta = Math.PI / 2;
                gamma = Math.atan2(rotation.m31, rotation.m33);
            } else {
                beta = -Math.PI / 2;
                gamma = Math.atan2(rotation.m31, rotation.m33);
            }
        }
    
        return new Euler(alpha, beta, gamma, RotationOrder.XZY, false);
    }

    private static fromIntrinsicMatrixYXZ(rotation: Matrix4, epsilon: number = 1e-6) {
        let alpha: number, beta: number, gamma: number, sinBeta: number, cosBeta: number;
        sinBeta = rotation.m23;
        cosBeta = Math.sqrt(1.0 - sinBeta * sinBeta);

        if (cosBeta > epsilon) {
            alpha = Math.atan2(rotation.m13, rotation.m33);
            beta = Math.atan2(-sinBeta, cosBeta);
            gamma = Math.atan2(rotation.m21, rotation.m22);
        } else {
            alpha = 0;
            if (sinBeta < 0.0) {
                beta = Math.PI / 2;
                gamma = Math.atan2(rotation.m31, rotation.m32);
            } else {
                beta = -Math.PI / 2;
                gamma = Math.atan2(rotation.m31, rotation.m32);
            }
        }

        return new Euler(alpha, beta, gamma, RotationOrder.YXZ, true);
    }

    private static fromExtrinsicMatrixYXZ(rotation: Matrix4, epsilon: number = 1e-6) {
        let alpha: number, beta: number, gamma: number, sinBeta: number, cosBeta: number;
        sinBeta = rotation.m23;
        cosBeta = Math.sqrt(1.0 - sinBeta * sinBeta);

        if (cosBeta > epsilon) {
            alpha = Math.atan2(rotation.m21, rotation.m22);
            beta = Math.atan2(-sinBeta, cosBeta);
            gamma = Math.atan2(rotation.m13, rotation.m33);
        } else {
            alpha = 0;
            if (sinBeta < 0.0) {
                beta = Math.PI / 2;
                gamma = Math.atan2(rotation.m12, rotation.m32);
            } else {
                beta = -Math.PI / 2;
                gamma = Math.atan2(rotation.m12, rotation.m32);
            }
        }

        return new Euler(alpha, beta, gamma, RotationOrder.YXZ, false);
    }

    private static fromIntrinsicMatrixYZX(rotation: Matrix4, epsilon: number = 1e-6) {
        let alpha: number, beta: number, gamma: number, sinBeta: number, cosBeta: number;
        sinBeta = rotation.m21;
        cosBeta = Math.sqrt(1.0 - sinBeta * sinBeta);

        if (cosBeta > epsilon) {
            alpha = Math.atan2(-rotation.m31, rotation.m11);
            beta = Math.atan2(sinBeta, cosBeta);
            gamma = Math.atan2(-rotation.m23, rotation.m22);
        } else {
            alpha = 0;
            if (sinBeta < 0.0) {
                beta = -Math.PI / 2;
                gamma = -Math.atan2(rotation.m32, rotation.m33);
            } else {
                beta = Math.PI / 2;
                gamma = Math.atan2(rotation.m32, rotation.m33);
            }
        }

        return new Euler(alpha, beta, gamma, RotationOrder.YZX, true);
    }

    private static fromExtrinsicMatrixYZX(rotation: Matrix4, epsilon: number = 1e-6) {
        let alpha: number, beta: number, gamma: number, sinBeta: number, cosBeta: number;
        sinBeta = rotation.m21;
        cosBeta = Math.sqrt(1.0 - sinBeta * sinBeta);

        if (cosBeta > epsilon) {
            alpha = Math.atan2(-rotation.m23, rotation.m22);
            beta = Math.atan2(sinBeta, cosBeta);
            gamma = Math.atan2(-rotation.m31, rotation.m11);
        } else {
            alpha = 0;
            if (sinBeta < 0.0) {
                beta = -Math.PI / 2;
                gamma = -Math.atan2(rotation.m23, rotation.m33);
            } else {
                beta = Math.PI / 2;
                gamma = Math.atan2(rotation.m23, rotation.m33);
            }
        }

        return new Euler(alpha, beta, gamma, RotationOrder.YZX, false);
    }

    private static fromIntrinsicMatrixZXY(rotation: Matrix4, epsilon: number = 1e-6) {
        let alpha: number, beta: number, gamma: number, sinBeta: number, cosBeta: number;
        sinBeta = rotation.m32;
        cosBeta = Math.sqrt(1.0 - sinBeta * sinBeta);
    
        if (cosBeta > epsilon) {
            alpha = Math.atan2(-rotation.m12, rotation.m22);
            beta = Math.atan2(sinBeta, cosBeta);
            gamma = Math.atan2(-rotation.m31, rotation.m33);
        } else {
            alpha = 0;
            if (sinBeta < 0.0) {
                beta = -Math.PI / 2;
                gamma = Math.atan2(rotation.m21, rotation.m22);
            } else {
                beta = Math.PI / 2;
                gamma = Math.atan2(rotation.m21, rotation.m22);
            }
        }
    
        return new Euler(alpha, beta, gamma, RotationOrder.ZXY, true);
    }

    private static fromExtrinsicMatrixZXY(rotation: Matrix4, epsilon: number = 1e-6) {
        let alpha: number, beta: number, gamma: number, sinBeta: number, cosBeta: number;
        sinBeta = rotation.m32;
        cosBeta = Math.sqrt(1.0 - sinBeta * sinBeta);
    
        if (cosBeta > epsilon) {
            alpha = Math.atan2(-rotation.m31, rotation.m33);
            beta = Math.atan2(sinBeta, cosBeta);
            gamma = Math.atan2(-rotation.m12, rotation.m22);
        } else {
            alpha = 0;
            if (sinBeta < 0.0) {
                beta = -Math.PI / 2;
                gamma = Math.atan2(rotation.m21, rotation.m11);
            } else {
                beta = Math.PI / 2;
                gamma = Math.atan2(rotation.m21, rotation.m11);
            }
        }
    
        return new Euler(alpha, beta, gamma, RotationOrder.ZXY, false);
    }

    private static fromIntrinsicMatrixZYX(rotation: Matrix4, epsilon: number = 1e-6) {
        let alpha: number, beta: number, gamma: number, sinBeta: number, cosBeta: number;
        sinBeta = rotation.m31;
        cosBeta = Math.sqrt(1.0 - sinBeta * sinBeta);
    
        if (cosBeta > epsilon) { 
            alpha = Math.atan2(rotation.m21, rotation.m11);
            beta = Math.atan2(-sinBeta, cosBeta);
            gamma = Math.atan2(rotation.m32, rotation.m33);
        } else {
            alpha = 0;
            if (sinBeta < 0.0) {
                beta = -Math.PI / 2;
                gamma = Math.atan2(rotation.m12, rotation.m22);
            } else {
                beta = Math.PI / 2;
                gamma = Math.atan2(rotation.m12, rotation.m22);
            }
        }
    
        return new Euler(alpha, beta, gamma, RotationOrder.ZYX, true);
    }

    private static fromExtrinsicMatrixZYX(rotation: Matrix4, epsilon: number = 1e-6) {
        let alpha: number, beta: number, gamma: number, sinBeta: number, cosBeta: number;
        sinBeta = rotation.m31;
        cosBeta = Math.sqrt(1.0 - sinBeta * sinBeta);
    
        if (cosBeta > epsilon) { 
            alpha = Math.atan2(rotation.m32, rotation.m33);
            beta = Math.atan2(-sinBeta, cosBeta);
            gamma = Math.atan2(rotation.m21, rotation.m11);
        } else {
            alpha = 0;
            if (sinBeta < 0.0) {
                beta = Math.PI / 2;
                gamma = Math.atan2(rotation.m23, rotation.m22);
            } else {
                beta = -Math.PI / 2;
                gamma = Math.atan2(rotation.m23, rotation.m22);
            }
        }
    
        return new Euler(alpha, beta, gamma, RotationOrder.ZYX, false);
    }

    private static fromIntrinsicMatrixXYX(rotation: Matrix4, epsilon: number = 1e-6) {
        let alpha: number, beta: number, gamma: number, sinBeta: number, cosBeta: number;
        cosBeta = rotation.m11;
        sinBeta = Math.sqrt(1.0 - cosBeta*cosBeta);
    
        if (cosBeta > epsilon) { 
            alpha = Math.atan2(rotation.m21, -rotation.m31);
            beta = Math.atan2(sinBeta, cosBeta);
            gamma = Math.atan2(rotation.m12, rotation.m13);
        } else {
            alpha = 0;
            if (sinBeta < 0.0) {
                beta = -Math.PI / 2;
                gamma = Math.atan2(rotation.m23, rotation.m22);
            } else {
                beta =  Math.PI / 2;
                gamma = Math.atan2(rotation.m23, rotation.m22);
            }
        }
    
        return new Euler(alpha, beta, gamma, RotationOrder.XYX, true);
    }

    private static fromExtrinsicMatrixXYX(rotation: Matrix4, epsilon: number = 1e-6) {
        let alpha: number, beta: number, gamma: number, sinBeta: number, cosBeta: number;
        cosBeta = rotation.m11;
        sinBeta = Math.sqrt(1.0 - cosBeta*cosBeta);
    
        if (cosBeta > epsilon) { 
            alpha = Math.atan2(rotation.m12, rotation.m13);
            beta = Math.atan2(sinBeta, cosBeta);
            gamma = Math.atan2(rotation.m21, -rotation.m31);
        } else {
            alpha = 0;
            if (sinBeta < 0.0) {
                beta = Math.PI / 2;
                gamma = Math.atan2(rotation.m21, -rotation.m31);
            } else {
                beta = -Math.PI / 2;
                gamma = Math.atan2(rotation.m21, -rotation.m31);
            }
        }
    
        return new Euler(alpha, beta, gamma, RotationOrder.XYX, false);
    }

    private static fromIntrinsicMatrixXZX(rotation: Matrix4, epsilon: number = 1e-6) {
        let alpha: number, beta: number, gamma: number, sinBeta: number, cosBeta: number;
        cosBeta = rotation.m11;
        sinBeta = Math.sqrt(1.0 - cosBeta*cosBeta);
    
        if (cosBeta > epsilon) { 
            alpha = Math.atan2(rotation.m31, rotation.m21);
            beta = Math.atan2(sinBeta, cosBeta);
            gamma = Math.atan2(rotation.m13, -rotation.m12);
        } else {
            alpha = 0;
            if (sinBeta < 0.0) {
                beta = -Math.PI / 2;
                gamma = Math.atan2(rotation.m13, -rotation.m12);
            } else {
                beta = -Math.PI / 2;
                gamma = Math.atan2(rotation.m13, -rotation.m12);
            }
        }
    
        return new Euler(alpha, beta, gamma, RotationOrder.XZX, true);
    }

    private static fromExtrinsicMatrixXZX(rotation: Matrix4, epsilon: number = 1e-6) {
        let alpha: number, beta: number, gamma: number, sinBeta: number, cosBeta: number;
        cosBeta = rotation.m11;
        sinBeta = Math.sqrt(1.0 - cosBeta*cosBeta);

        if (cosBeta > epsilon) { 
            alpha = Math.atan2(rotation.m13, -rotation.m12);
            beta = Math.atan2(sinBeta, cosBeta);
            gamma = Math.atan2(rotation.m31, rotation.m21);
        } else {
            alpha = 0;
            if (sinBeta < 0.0) {
                beta = -Math.PI / 2;
                gamma = Math.atan2(rotation.m31, rotation.m21);
            } else {
                beta = Math.PI / 2;
                gamma = Math.atan2(rotation.m31, rotation.m21);
            }
        }
    
        return new Euler(alpha, beta, gamma, RotationOrder.XZX, false);
    }

    private static fromIntrinsicMatrixYXY(rotation: Matrix4, epsilon: number = 1e-6) {
        let alpha: number, beta: number, gamma: number, sinBeta: number, cosBeta: number;
        cosBeta = rotation.m22;
        sinBeta = Math.sqrt(1.0 - cosBeta*cosBeta);
    
        if (cosBeta > epsilon) { 
            alpha = Math.atan2(rotation.m12, rotation.m32);
            beta = Math.atan2(sinBeta, cosBeta);
            gamma = Math.atan2(rotation.m21, -rotation.m23);
        } else {
            alpha = 0;
            if (sinBeta < 0.0) {
                beta = -Math.PI / 2;
                gamma = Math.atan2(rotation.m21, -rotation.m23);
            } else {
                beta = Math.PI / 2;
                gamma = Math.atan2(rotation.m21, -rotation.m23);
            }
        }
    
        return new Euler(alpha, beta, gamma, RotationOrder.YXY, true);
    }

    private static fromExtrinsicMatrixYXY(rotation: Matrix4, epsilon: number = 1e-6) {
        let alpha: number, beta: number, gamma: number, sinBeta: number, cosBeta: number;
        cosBeta = rotation.m22;
        sinBeta = Math.sqrt(1.0 - cosBeta*cosBeta);
    
        if (cosBeta > epsilon) { 
            alpha = Math.atan2(rotation.m21, -rotation.m23);
            beta = Math.atan2(sinBeta, cosBeta);
            gamma = Math.atan2(rotation.m12, rotation.m32);
        } else {
            alpha = 0;
            if (sinBeta < 0.0) {
                beta = -Math.PI / 2;
                gamma = Math.atan2(rotation.m12, rotation.m32);
            } else {
                beta = Math.PI / 2;
                gamma = Math.atan2(rotation.m12, rotation.m32);
            }
        }
    
        return new Euler(alpha, beta, gamma, RotationOrder.YXY, false);
    }

    private static fromIntrinsicMatrixYZY(rotation: Matrix4, epsilon: number = 1e-6) {
        let alpha: number, beta: number, gamma: number, sinBeta: number, cosBeta: number;
        cosBeta = rotation.m22;
        sinBeta = Math.sqrt(1.0 - cosBeta*cosBeta);
    
        if (cosBeta > epsilon) { 
            alpha = Math.atan2(rotation.m32, -rotation.m12);
            beta = Math.atan2(sinBeta, cosBeta);
            gamma = Math.atan2(rotation.m23, rotation.m21);
        } else {
            alpha = 0;
            if (sinBeta < 0.0) {
                beta = -Math.PI / 2;
                gamma = Math.atan2(rotation.m23, -rotation.m21);
            } else {
                beta = Math.PI / 2;
                gamma = Math.atan2(rotation.m23, -rotation.m21);
            }
        }
    
        return new Euler(alpha, beta, gamma, RotationOrder.YZY, true);
    }

    private static fromExtrinsicMatrixYZY(rotation: Matrix4, epsilon: number = 1e-6) {
        let alpha: number, beta: number, gamma: number, sinBeta: number, cosBeta: number;
        cosBeta = rotation.m22;
        sinBeta = Math.sqrt(1.0 - cosBeta*cosBeta);
    
        if (cosBeta > epsilon) { 
            alpha = Math.atan2(rotation.m23, rotation.m21);
            beta = Math.atan2(sinBeta, cosBeta);
            gamma = Math.atan2(rotation.m32, -rotation.m12);
        } else {
            alpha = 0;
            if (sinBeta < 0.0) {
                beta = -Math.PI / 2;
                gamma = Math.atan2(rotation.m32, -rotation.m12);
            } else {
                beta = Math.PI / 2;
                gamma = Math.atan2(rotation.m32, -rotation.m12);
            }
        }
    
        return new Euler(alpha, beta, gamma, RotationOrder.YZY, false);
    }

    private static fromIntrinsicMatrixZXZ(rotation: Matrix4, epsilon: number = 1e-6) {
        let alpha: number, beta: number, gamma: number, sinBeta: number, cosBeta: number;
        cosBeta = rotation.m33;
        sinBeta = Math.sqrt(1.0 - cosBeta*cosBeta);
    
        if (cosBeta > epsilon) { 
            alpha = Math.atan2(rotation.m13, -rotation.m23);
            beta = Math.atan2(sinBeta, cosBeta);
            gamma = Math.atan2(rotation.m31, rotation.m32);
        } else {
            alpha = 0;
            if (sinBeta < 0.0) {
                beta = -Math.PI / 2;
                gamma = Math.atan2(rotation.m31, -rotation.m32);
            } else {
                beta =  Math.PI / 2;
                gamma = Math.atan2(rotation.m31, -rotation.m32);
            }
        }
        return new Euler(alpha, beta, gamma, RotationOrder.ZXZ, true);
    }

    private static fromExtrinsicMatrixZXZ(rotation: Matrix4, epsilon: number = 1e-6) {
        let alpha: number, beta: number, gamma: number, sinBeta: number, cosBeta: number;
        cosBeta = rotation.m33;
        sinBeta = Math.sqrt(1.0 - cosBeta*cosBeta);
    
        if (cosBeta > epsilon) { 
            alpha = Math.atan2(rotation.m31, rotation.m32);
            beta = Math.atan2(sinBeta, cosBeta);
            gamma = Math.atan2(rotation.m13, -rotation.m23);
        } else {
            alpha = 0;
            if (sinBeta < 0.0) {
                beta = -Math.PI / 2;
                gamma = Math.atan2(rotation.m13, -rotation.m23);
            } else {
                beta = Math.PI / 2;
                gamma = Math.atan2(rotation.m13, -rotation.m23);
            }
        }
    
        return new Euler(alpha, beta, gamma, RotationOrder.ZXZ, false);
    }

    private static fromIntrinsicMatrixZYZ(rotation: Matrix4, epsilon: number = 1e-6) {
        let alpha: number, beta: number, gamma: number, sinBeta: number, cosBeta: number;
        cosBeta = rotation.m33;
        sinBeta = Math.sqrt(1.0 - cosBeta*cosBeta);
    
        if (cosBeta > epsilon) { 
            alpha = Math.atan2(rotation.m23, rotation.m13);
            beta = Math.atan2(sinBeta, cosBeta);
            gamma = Math.atan2(rotation.m32, -rotation.m31);
        } else {
            alpha = 0;
            if (sinBeta < 0.0) {
                beta = -Math.PI / 2;
                gamma = Math.atan2(rotation.m32, -rotation.m31);
            } else {
                beta = Math.PI / 2;
                gamma = Math.atan2(rotation.m32, -rotation.m31);
            }
        }
    
        return new Euler(alpha, beta, gamma, RotationOrder.ZYZ, true);
    }

    private static fromExtrinsicMatrixZYZ(rotation: Matrix4, epsilon: number = 1e-6) {
        let alpha: number, beta: number, gamma: number, sinBeta: number, cosBeta: number;
        cosBeta = rotation.m33;
        sinBeta = Math.sqrt(1.0 - cosBeta*cosBeta);
    
        if (rotation.m33 > epsilon) { 
            alpha = Math.atan2(rotation.m32, -rotation.m31);
            beta = Math.atan2(sinBeta, cosBeta);
            gamma = Math.atan2(rotation.m23, rotation.m13);
        } else {
            alpha = 0;
            if (sinBeta < 0.0) {
                beta = -Math.PI / 2;
                gamma = Math.atan2(rotation.m23, rotation.m13);
            } else {
                beta = Math.PI / 2;
                gamma = Math.atan2(rotation.m23, rotation.m13);
            }
        }
        return new Euler(alpha, beta, gamma, RotationOrder.ZYZ, false);
    }

    private static getEulerIntrinsicRotation(rotation: Matrix4, order: RotationOrder, epsilon: number = 1e-6) {
        switch (order) {
            case RotationOrder.XYZ:
                return Euler.fromIntrinsicMatrixXYZ(rotation, epsilon);
            case RotationOrder.XZY:
                return Euler.fromIntrinsicMatrixXZY(rotation, epsilon);
            case RotationOrder.YXZ:
                return Euler.fromIntrinsicMatrixYXZ(rotation, epsilon);
            case RotationOrder.YZX:
                return Euler.fromIntrinsicMatrixYZX(rotation, epsilon);
            case RotationOrder.ZXY:
                return Euler.fromIntrinsicMatrixZXY(rotation, epsilon);
            case RotationOrder.ZYX:
                return Euler.fromIntrinsicMatrixZYX(rotation, epsilon);
            case RotationOrder.XYX:
                return Euler.fromIntrinsicMatrixXYX(rotation, epsilon);
            case RotationOrder.XZX:
                return Euler.fromIntrinsicMatrixXZX(rotation, epsilon);
            case RotationOrder.YXY:
                return Euler.fromIntrinsicMatrixYXY(rotation, epsilon);
            case RotationOrder.YZY:
                return Euler.fromIntrinsicMatrixYZY(rotation, epsilon);
            case RotationOrder.ZXZ:
                return Euler.fromIntrinsicMatrixZXZ(rotation, epsilon);
            case RotationOrder.ZYZ:
                return Euler.fromIntrinsicMatrixZYZ(rotation, epsilon);
            default:
                throw new Error("Unknown order. Use 'XYZ', 'XZY', 'YXZ', 'YZX', 'ZXY', 'ZYX', 'XYX', 'XZX', 'YXY', 'YZY', 'ZXZ', 'ZYZ'.");
        }
    }

    private static getEulerExtrinsicRotation(rotation: Matrix4, order: RotationOrder, epsilon: number = 1e-6) {
        switch (order) {
            case RotationOrder.XYZ:
                return Euler.fromExtrinsicMatrixXYZ(rotation, epsilon);
            case RotationOrder.XZY:
                return Euler.fromExtrinsicMatrixXZY(rotation, epsilon);
            case RotationOrder.YXZ:
                return Euler.fromExtrinsicMatrixYXZ(rotation, epsilon);
            case RotationOrder.YZX:
                return Euler.fromExtrinsicMatrixYZX(rotation, epsilon);
            case RotationOrder.ZXY:
                return Euler.fromExtrinsicMatrixZXY(rotation, epsilon);
            case RotationOrder.ZYX:
                return Euler.fromExtrinsicMatrixZYX(rotation, epsilon);
            case RotationOrder.XYX:
                return Euler.fromExtrinsicMatrixXYX(rotation, epsilon);
            case RotationOrder.XZX:
                return Euler.fromExtrinsicMatrixXZX(rotation, epsilon);
            case RotationOrder.YXY:
                return Euler.fromExtrinsicMatrixYXY(rotation, epsilon);
            case RotationOrder.YZY:
                return Euler.fromExtrinsicMatrixYZY(rotation, epsilon);
            case RotationOrder.ZXZ:
                return Euler.fromExtrinsicMatrixZXZ(rotation, epsilon);
            case RotationOrder.ZYZ:
                return Euler.fromExtrinsicMatrixZYZ(rotation, epsilon);
            default:
                throw new Error("Unknown order. Use 'XYZ', 'XZY', 'YXZ', 'YZX', 'ZXY', 'ZYX', 'XYX', 'XZX', 'YXY', 'YZY', 'ZXZ', 'ZYZ'.");
        }
    }

    static fromMatrix(rotation: Matrix4, order: RotationOrder = RotationOrder.XYZ, intrinsic = true, epsilon = 1e-6): Euler {
        return intrinsic
            ? Euler.getEulerIntrinsicRotation(rotation, order, epsilon)
            : Euler.getEulerExtrinsicRotation(rotation, order, epsilon);
    }
} 