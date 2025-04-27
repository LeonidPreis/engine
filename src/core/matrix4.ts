import { Vector4 } from "./vector4";

export class Matrix4 {
    constructor(
        public m11: number = 1, public m12: number = 0, public m13: number = 0, public m14: number = 0,
        public m21: number = 0, public m22: number = 1, public m23: number = 0, public m24: number = 0,
        public m31: number = 0, public m32: number = 0, public m33: number = 1, public m34: number = 0,
        public m41: number = 0, public m42: number = 0, public m43: number = 0, public m44: number = 1
    ) {}

    public equal(m4: Matrix4, precision: number = 1e-6): boolean {
        return  Math.abs(this.m11 - m4.m11) <= precision && 
                Math.abs(this.m12 - m4.m12) <= precision &&
                Math.abs(this.m13 - m4.m13) <= precision &&
                Math.abs(this.m14 - m4.m14) <= precision &&
                Math.abs(this.m21 - m4.m21) <= precision && 
                Math.abs(this.m22 - m4.m22) <= precision &&
                Math.abs(this.m23 - m4.m23) <= precision &&
                Math.abs(this.m24 - m4.m24) <= precision &&
                Math.abs(this.m31 - m4.m31) <= precision && 
                Math.abs(this.m32 - m4.m32) <= precision &&
                Math.abs(this.m33 - m4.m33) <= precision &&
                Math.abs(this.m34 - m4.m34) <= precision &&
                Math.abs(this.m41 - m4.m41) <= precision && 
                Math.abs(this.m42 - m4.m42) <= precision &&
                Math.abs(this.m43 - m4.m43) <= precision &&
                Math.abs(this.m44 - m4.m44) <= precision;
    }

    public clone(): Matrix4 {
        return new Matrix4(
            this.m11, this.m12, this.m13, this.m14,
            this.m21, this.m22, this.m23, this.m24,
            this.m31, this.m32, this.m33, this.m34,
            this.m41, this.m42, this.m43, this.m44
        );
    }

    public transpose(): Matrix4 {
        return new Matrix4(
            this.m11, this.m21, this.m31, this.m41,
            this.m12, this.m22, this.m32, this.m42,
            this.m13, this.m23, this.m33, this.m43,
            this.m14, this.m24, this.m34, this.m44
        );
    }

    public determinant(): number {
        const minorA = this.m33 * this.m44 - this.m34 * this.m43;
        const minorB = this.m32 * this.m44 - this.m34 * this.m42;
        const minorC = this.m32 * this.m43 - this.m33 * this.m42;
        const minorD = this.m31 * this.m44 - this.m34 * this.m41;
        const minorE = this.m31 * this.m43 - this.m33 * this.m41;
        const minorF = this.m31 * this.m42 - this.m32 * this.m41;

        return  this.m11 * (this.m22 * minorA - this.m23 * minorB + this.m24 * minorC)-
                this.m12 * (this.m21 * minorA - this.m23 * minorD + this.m24 * minorE)+
                this.m13 * (this.m21 * minorB - this.m22 * minorD + this.m24 * minorF)-
                this.m14 * (this.m21 * minorC - this.m22 * minorE + this.m23 * minorF);
    }

    public scale(s: number): Matrix4 {
        return new Matrix4(
            this.m11 * s, this.m12 * s, this.m13 * s, this.m14 * s,
            this.m21 * s, this.m22 * s, this.m23 * s, this.m24 * s,
            this.m31 * s, this.m32 * s, this.m33 * s, this.m34 * s,
            this.m41 * s, this.m42 * s, this.m43 * s, this.m44 * s
        );
    }

    public multiplyVector(v4: Vector4): Vector4 {   
        return new Vector4(
            this.m11 * v4.x + this.m12 * v4.y + this.m13 * v4.z + this.m14 * v4.w,
            this.m21 * v4.x + this.m22 * v4.y + this.m23 * v4.z + this.m24 * v4.w,
            this.m31 * v4.x + this.m32 * v4.y + this.m33 * v4.z + this.m34 * v4.w,
            this.m41 * v4.x + this.m42 * v4.y + this.m43 * v4.z + this.m44 * v4.w
        );
    }

    public multiplyMatrix(m4: Matrix4): Matrix4 {
        return new Matrix4(
            this.m11 * m4.m11 + this.m12 * m4.m21 + this.m13 * m4.m31 + this.m14 * m4.m41,
            this.m11 * m4.m12 + this.m12 * m4.m22 + this.m13 * m4.m32 + this.m14 * m4.m42,
            this.m11 * m4.m13 + this.m12 * m4.m23 + this.m13 * m4.m33 + this.m14 * m4.m43,
            this.m11 * m4.m14 + this.m12 * m4.m24 + this.m13 * m4.m34 + this.m14 * m4.m44,
            this.m21 * m4.m11 + this.m22 * m4.m21 + this.m23 * m4.m31 + this.m24 * m4.m41,
            this.m21 * m4.m12 + this.m22 * m4.m22 + this.m23 * m4.m32 + this.m24 * m4.m42,
            this.m21 * m4.m13 + this.m22 * m4.m23 + this.m23 * m4.m33 + this.m24 * m4.m43,
            this.m21 * m4.m14 + this.m22 * m4.m24 + this.m23 * m4.m34 + this.m24 * m4.m44,
            this.m31 * m4.m11 + this.m32 * m4.m21 + this.m33 * m4.m31 + this.m34 * m4.m41,
            this.m31 * m4.m12 + this.m32 * m4.m22 + this.m33 * m4.m32 + this.m34 * m4.m42,
            this.m31 * m4.m13 + this.m32 * m4.m23 + this.m33 * m4.m33 + this.m34 * m4.m43,
            this.m31 * m4.m14 + this.m32 * m4.m24 + this.m33 * m4.m34 + this.m34 * m4.m44,
            this.m41 * m4.m11 + this.m42 * m4.m21 + this.m43 * m4.m31 + this.m44 * m4.m41,
            this.m41 * m4.m12 + this.m42 * m4.m22 + this.m43 * m4.m32 + this.m44 * m4.m42,
            this.m41 * m4.m13 + this.m42 * m4.m23 + this.m43 * m4.m33 + this.m44 * m4.m43,
            this.m41 * m4.m14 + this.m42 * m4.m24 + this.m43 * m4.m34 + this.m44 * m4.m44,
        );
    }

    public inverse(): Matrix4 | undefined {
        const determinant = this.determinant();

        if (determinant === 0) { return; }

        const minorA = this.m33 * this.m44 - this.m34 * this.m43;
        const minorB = this.m32 * this.m44 - this.m34 * this.m42;
        const minorC = this.m32 * this.m43 - this.m33 * this.m42;
        const minorD = this.m23 * this.m44 - this.m24 * this.m43;
        const minorE = this.m22 * this.m44 - this.m24 * this.m42;
        const minorF = this.m22 * this.m43 - this.m23 * this.m42;
        const minorG = this.m22 * this.m34 - this.m24 * this.m32;
        const minorH = this.m22 * this.m33 - this.m23 * this.m32;
        const minorI = this.m31 * this.m44 - this.m34 * this.m41;
        const minorJ = this.m31 * this.m43 - this.m33 * this.m41;
        const minorK = this.m21 * this.m44 - this.m24 * this.m41;
        const minorL = this.m21 * this.m43 - this.m23 * this.m41;
        const minorM = this.m23 * this.m34 - this.m24 * this.m33;
        const minorN = this.m21 * this.m34 - this.m24 * this.m31;
        const minorO = this.m21 * this.m33 - this.m23 * this.m31;
        const minorP = this.m31 * this.m42 - this.m32 * this.m41;
        const minorQ = this.m21 * this.m42 - this.m22 * this.m41;
        const minorR = this.m21 * this.m32 - this.m22 * this.m31;
        const multiplyer = 1.0 / determinant;

        return new Matrix4(
            multiplyer * (this.m22 * minorA - this.m23 * minorB + this.m24 * minorC),
           -multiplyer * (this.m12 * minorA - this.m13 * minorB + this.m14 * minorC),
            multiplyer * (this.m12 * minorD - this.m13 * minorE + this.m14 * minorF),
           -multiplyer * (this.m12 * minorM - this.m13 * minorG + this.m14 * minorH),
           -multiplyer * (this.m21 * minorA - this.m23 * minorI + this.m24 * minorJ),
            multiplyer * (this.m11 * minorA - this.m13 * minorI + this.m14 * minorJ),
           -multiplyer * (this.m11 * minorD - this.m13 * minorK + this.m14 * minorL),
            multiplyer * (this.m11 * minorM - this.m13 * minorN + this.m14 * minorO),
            multiplyer * (this.m21 * minorB - this.m22 * minorI + this.m24 * minorP),
           -multiplyer * (this.m11 * minorB - this.m12 * minorI + this.m14 * minorP),
            multiplyer * (this.m11 * minorE - this.m12 * minorK + this.m14 * minorQ),
           -multiplyer * (this.m11 * minorG - this.m12 * minorN + this.m14 * minorR),
           -multiplyer * (this.m21 * minorC - this.m22 * minorJ + this.m23 * minorP),
            multiplyer * (this.m11 * minorC - this.m12 * minorJ + this.m13 * minorP),
           -multiplyer * (this.m11 * minorF - this.m12 * minorL + this.m13 * minorQ),
            multiplyer * (this.m11 * minorH - this.m12 * minorO + this.m13 * minorR)
        );
    }

    public degree(d: number): Matrix4 {
        if (d <= 0) { throw new Error("The degree of the matrix must be integer and greater than one."); }
        if (d == 1) { return this; }
        let result = this.multiplyMatrix(this);
        for (let i = 3; i <= d; i++) {
            result = this.multiplyMatrix(result);
        }
        return result;
    }

    public add(m4: Matrix4): Matrix4 {
        return new Matrix4(
            this.m11 + m4.m11, this.m12 + m4.m12, this.m13 + m4.m13, this.m14 + m4.m14,
            this.m21 + m4.m21, this.m22 + m4.m22, this.m23 + m4.m23, this.m24 + m4.m24,
            this.m31 + m4.m31, this.m32 + m4.m32, this.m33 + m4.m33, this.m34 + m4.m34,
            this.m41 + m4.m41, this.m42 + m4.m42, this.m43 + m4.m43, this.m44 + m4.m44
        );
    }

    public subtract(m4: Matrix4): Matrix4 {
        return new Matrix4(
            this.m11 - m4.m11, this.m12 - m4.m12, this.m13 - m4.m13, this.m14 - m4.m14,
            this.m21 - m4.m21, this.m22 - m4.m22, this.m23 - m4.m23, this.m24 - m4.m24,
            this.m31 - m4.m31, this.m32 - m4.m32, this.m33 - m4.m33, this.m34 - m4.m34,
            this.m41 - m4.m41, this.m42 - m4.m42, this.m43 - m4.m43, this.m44 - m4.m44
        );
    }

    public getRightVector(): Vector4 {
        return new Vector4(this.m11, this.m12, this.m13, this.m14);
    }
    
    public getUpVector(): Vector4 {
        return new Vector4(this.m21, this.m22, this.m23, this.m24);
    }
    public getForwardVector(): Vector4 {
        return new Vector4(this.m31, this.m32, this.m33, this.m34);
    }

    public toFloat32Array(): Float32Array {
        return new Float32Array([
            this.m11, this.m12, this.m13, this.m14,
            this.m21, this.m22, this.m23, this.m24,
            this.m31, this.m32, this.m33, this.m34,
            this.m41, this.m42, this.m43, this.m44
        ]);
    }

    static fromBasis(right: Vector4, up: Vector4, forward: Vector4): Matrix4 {
        return new Matrix4(
            right.x,   right.y,   right.z,   0,
            up.x,      up.y,      up.z,      0,
            forward.x, forward.y, forward.z, 0,
            0,         0,         0,         1 
        );
    }
}