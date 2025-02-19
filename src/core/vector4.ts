import { Matrix4 } from "./matrix4";

export class Vector4 {
    constructor(public x: number = 0, public y: number = 0, public z: number = 0, public w: number = 1) {}

    public equal(v4: Vector4, precision: number = 1e-6): boolean {
        return  Math.abs(this.x - v4.x) <= precision && 
                Math.abs(this.y - v4.y) <= precision &&
                Math.abs(this.z - v4.z) <= precision &&
                Math.abs(this.w - v4.w) <= precision;
    }

    public clone(): Vector4 {
        return new Vector4(this.x, this.y, this.z, this.w);
    }

    public negate(): Vector4 {
        return new Vector4(-this.x, -this.y, -this.z, -this.w);
    }

    public length(): number {
        return (this.x * this.x + this.y * this.y + this.z * this.z + this.w * this.w)**0.5;
    }

    public normalize(): Vector4 {
        const length = this.length();
        if (length === 0) { return new Vector4; }
        return new Vector4(this.x / length, this.y / length, this.z / length, this.w / length);
    }

    public scale(s: number): Vector4 {
        return new Vector4(this.x * s, this.y * s, this.z * s, this.w * s);
    }

    public multiplyMatrix(m4: Matrix4): Vector4 {
        return new Vector4(
            this.x * m4.m11 + this.y * m4.m21 + this.z * m4.m31 + this.w * m4.m41,
            this.x * m4.m12 + this.y * m4.m22 + this.z * m4.m32 + this.w * m4.m42,
            this.x * m4.m13 + this.y * m4.m23 + this.z * m4.m33 + this.w * m4.m43,
            this.x * m4.m14 + this.y * m4.m24 + this.z * m4.m34 + this.w * m4.m44,
        );
    }

    public add(v4: Vector4): Vector4 {
        return new Vector4(this.x + v4.x, this.y + v4.y, this.z + v4.z, this.w + v4.w);
    }

    public subtract(v4: Vector4): Vector4 {
        return new Vector4(this.x - v4.x, this.y - v4.y, this.z - v4.z, this.w - v4.w);
    }

    public dot(v4: Vector4): number {
        return this.x * v4.x + this.y * v4.y + this.z * v4.z;
    }

    public cross(v4: Vector4): Vector4 {
        return new Vector4(
            this.y * v4.z - this.z * v4.y,
          -(this.z * v4.x - this.x * v4.z),
            this.x * v4.y - this.y * v4.x,
            1
        );
    }

    public angle(v4: Vector4, degrees: boolean = false): number {
        const lengths = this.length() * v4.length();
        if (lengths === 0) { return 0; }
        const angle: number = Math.acos(this.dot(v4) / lengths);
        if (degrees) {
            return angle * 180 / Math.PI;
        } else {
            return angle;
        }
        
    }

    public project(v4: Vector4): number {
        const length = v4.length();
        if (length == 0) { return 0; }
        return this.dot(v4) / length;
    }

    public distance(v4: Vector4): number {
        return ((this.x - v4.x)**2 + (this.y - v4.y)**2 + (this.z - v4.z)**2)**0.5;
    }

    public static between(from: Vector4, to: Vector4): Vector4 {
        return new Vector4(to.x - from.x, to.y - from.y, to.z - from.z, to.w  - from.w);
    }

    public toFloat32Array(): Float32Array {
        return new Float32Array([this.x, this.y, this.z, this.w]);
    }
}