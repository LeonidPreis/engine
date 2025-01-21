import { Matrix4 } from "./matrix";

export enum RotationOrder {
    XYZ = 'XYZ',
    XZY = 'XZY',
    YXZ = 'YXZ',
    YZX = 'YZX',
    ZXY = 'ZXY',
    ZYX = 'ZYX'
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

    private getIntrinsicRotation(cA: number, sA: number, cB: number, sB: number, cG: number, sG: number): Matrix4 {
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
            default:
                throw new Error("Unknown order. Use 'XYZ', 'XZY', 'YXZ', 'YZX', 'ZXY' or 'ZYX'.");
        }
    }

    private getExtrinsicRotation(cA: number, sA: number, cB: number, sB: number, cG: number, sG: number): Matrix4 {
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
            default:
                throw new Error("Unknown order. Use 'XYZ', 'XZY', 'YXZ', 'YZX', 'ZXY' or 'ZYX'.");
        }
    }

    RotateXYZ(): Matrix4 {
        const cA = Math.cos(this.alpha),  sA = Math.sin(this.alpha);
        const cB = Math.cos(this.beta),   sB = Math.sin(this.beta);
        const cG = Math.cos(this.gamma),  sG = Math.sin(this.gamma);
    
        return this.intrinsic
            ? this.getIntrinsicRotation(cA, sA, cB, sB, cG, sG)
            : this.getExtrinsicRotation(cA, sA, cB, sB, cG, sG);
    }

}