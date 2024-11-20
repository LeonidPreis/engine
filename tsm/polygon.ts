import { Color } from "./color";
import { Vector4 } from "./vector";

export class Polygon {
    vA: number;
    vB: number;
    vC: number;
    cA: Color;
    cB: Color;
    cC: Color;
    normalView: Vector4 | null = null;
    constructor(
        vA: number,
        vB: number,
        vC: number,
        cA: Color = new Color('RGBA', [255, 0, 255, 255]),
        cB: Color = new Color('RGBA', [255, 0, 255, 255]),
        cC: Color = new Color('RGBA', [255, 0, 255, 255])
    ) {
        this.vA = vA;
        this.vB = vB;
        this.vC = vC;
        this.cA = cA;
        this.cB = cB;
        this.cC = cC;
    }

    calculateNormal(projected: Vector4[]): Vector4 {
        return projected[this.vB].subtract(projected[this.vA]).cross(projected[this.vC].subtract(projected[this.vA]));
    }
}