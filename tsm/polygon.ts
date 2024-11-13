import { Color } from "./color";
import { Vector4 } from "./vector";

export class Polygon {
    vA: number;
    vB: number;
    vC: number;
    cA: Color;
    cB: Color;
    cC: Color
    constructor(
        vA: number,
        vB: number,
        vC: number,
        cA: Color,
        cB: Color,
        cC: Color
    ) {
        this.vA = vA;
        this.vB = vB;
        this.vC = vC;
        this.cA = cA;
        this.cB = cB;
        this.cC = cC;
    }

    normal(projected: Vector4[]): Vector4 {
        return projected[this.vB].subtract(projected[this.vA]).cross(projected[this.vC].subtract(projected[this.vA]));
    }
}