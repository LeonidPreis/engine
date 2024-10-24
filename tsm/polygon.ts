import { Color } from "./color";
import { Vector } from "./vector";

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

    normal(projected: Vector[]): Vector {
        return Vector.cross(
            Vector.subtract(projected[this.vB], projected[this.vA]),
            Vector.subtract(projected[this.vC], projected[this.vA]));
    }
}