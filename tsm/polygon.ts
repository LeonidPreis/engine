import { Color } from "./color";
import { Vector3, Vector4 } from "./vector";

export class Polygon {
    vA: number;
    vB: number;
    vC: number;
    cA: Color;
    cB: Color;
    cC: Color;
    nA: Vector4 | null = null;
    nB: Vector4 | null = null;
    nC: Vector4 | null = null;
    center: Vector4 | null = null;
    constructor(
        vA: number,
        vB: number,
        vC: number,
        cA: Color = new Color('RGBA', [255, 0, 255, 255]),
        cB: Color = new Color('RGBA', [255, 0, 255, 255]),
        cC: Color = new Color('RGBA', [255, 0, 255, 255]),
        nA: Vector4 | null = null,
        nB: Vector4 | null = null,
        nC: Vector4 | null = null
    ) {
        this.vA = vA;
        this.vB = vB;
        this.vC = vC;
        this.cA = cA;
        this.cB = cB;
        this.cC = cC;
        this.nA = nA;
        this.nB = nB;
        this.nC = nC;
    }

    calculateNormal(projected: Vector4[]): Vector4 {
        return (projected[this.vB].subtract(projected[this.vA]).cross(projected[this.vC].subtract(projected[this.vA]))).normalize();
    }

    planeEquation(vertices: Vector4[] | Vector3[]): Vector4 {
        var vA = vertices[this.vA], vB = vertices[this.vB], vC = vertices[this.vC];
        var xBA = vB.x - vA.x, xCA = vC.x - vA.x;
        var yBA = vB.y - vA.y, yCA = vC.y - vA.y;
        var zBA = vB.z - vA.z, zCA = vC.z - vA.z;
        var A = yBA * zCA - yCA * zBA;
        var B = xBA * zCA - xCA * zBA;
        var C = xBA * yCA - xCA * yBA;
        var D = A * vA.x - B * vA.y + C * vA.z;
        return new Vector4(A,-B,C,-D);
    }

    distanseToPoint(vertices: Vector4[] | Vector3[], point: Vector4 | Vector3): number {
        var plane = this.planeEquation(vertices);
        return Math.abs(plane.x * point.x + plane.y * point.y + plane.z * point.z + plane.w) / (plane.x * plane.x + plane.y * plane.y + plane.z * plane.z)**0.5;
    }

    centerPoint(vertices: Vector4[] | Vector3[]) {
        const vA = vertices[this.vA], vB = vertices[this.vB], vC = vertices[this.vC];
        const x = (vA.x + vB.x + vC.x) / 3;
        const y = (vA.y + vB.y + vC.y) / 3;
        const z = (vA.z + vB.z + vC.z) / 3;
        return new Vector4(x,y,z);
    }
}

export class Line {
    vA: number;
    vB: number;
    cA: Color;
    cB: Color;

    constructor(
        vA: number,
        vB: number,
        cA: Color,
        cB: Color
    ) {
        this.vA = vA;
        this.vB = vB;
        this.cA = cA,
        this.cB = cB;
    }
}