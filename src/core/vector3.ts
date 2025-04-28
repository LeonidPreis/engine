export class Vector3 {
    constructor(public x: number = 0, public y: number = 0, public z: number = 0) {}

    public equals(vB: Vector3, precision: number = 1e-6): boolean {
        return  Math.abs(this.x - vB.x) <= precision && 
                Math.abs(this.y - vB.y) <= precision &&
                Math.abs(this.z - vB.z) <= precision;
    }
    
    public clone(): Vector3 {
        return new Vector3(this.x, this.y, this.z);
    }

    public negate(): Vector3 {
        return new Vector3(-this.x, -this.y, -this.z);
    }

    public length(): number {
        return (this.x * this.x + this.y * this.y + this.z * this.z)**0.5;
    }

    normalize(): Vector3 {
        const length = this.length();
        if (length === 0) { return new Vector3; }
        return new Vector3(this.x / length, this.y / length, this.z / length);
    }

    scale(s: number): Vector3 {
        return new Vector3(this.x * s, this.y * s, this.z * s);
    }

    public add(vB: Vector3): Vector3 {
        return new Vector3(this.x + vB.x, this.y + vB.y, this.z + vB.z);
    }

    subtract(v3: Vector3): Vector3 {
        return new Vector3(this.x - v3.x, this.y - v3.y, this.z - v3.z);
    }

    public dot(vB: Vector3): number {
        return this.x * vB.x + this.y * vB.y + this.z * vB.z;
    }

    public cross(vB: Vector3): Vector3 {
        return new Vector3(
            this.y * vB.z - this.z * vB.y,
            this.z * vB.x - this.x * vB.z,
            this.x * vB.y - this.y * vB.x,
        );
    }

    public angle(vB: Vector3, degrees: boolean = false): number {
        const lengths = this.length() * vB.length();
        if (lengths === 0) return 0;
        const angle: number = Math.acos(this.dot(vB) / lengths);
        if (degrees) return angle * 180 / Math.PI;
        return angle;
    }

    public project(v3: Vector3): number {
        const length = v3.length();
        if (length == 0) { return 0; }
        return this.dot(v3) / length;
    }

    public distance(vB: Vector3): number {
        return ((this.x - vB.x)**2 + (this.y - vB.y)**2 + (this.z - vB.z)**2)**0.5;
    }

    public static between(from: Vector3, to: Vector3): Vector3 {
        return new Vector3(to.x - from.x, to.y - from.y, to.z - from.z).normalize();
    }

    public toFloat32Array(): Float32Array {
        return new Float32Array([this.x, this.y, this.z]);
    }

    public orthonormalBasis(epsilon: number = 1e-6): [Vector3, Vector3] {
        let forward: Vector3 = this.normalize();
        let up: Vector3 = Math.abs(forward.y) < 1.0 - epsilon
            ? new Vector3(0, 1, 0)
            : new Vector3(1, 0, 0);
        let right: Vector3 = up.cross(forward).normalize();
        up = forward.cross(right).normalize();
        return [right, up];
    }
}