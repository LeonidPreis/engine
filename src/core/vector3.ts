export class Vector3 {
    constructor(public x: number = 0, public y: number = 0, public z: number = 0) {}

    public equal(v3: Vector3, precision: number = 1e-6): boolean {
        return  Math.abs(this.x - v3.x) <= precision && 
                Math.abs(this.y - v3.y) <= precision &&
                Math.abs(this.z - v3.z) <= precision;
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

    dot(v3: Vector3): number {
        return this.x * v3.x + this.y * v3.y + this.z * v3.z;
    }

    cross(v3: Vector3): Vector3 {
        return new Vector3(
            this.y * v3.z - this.z * v3.y,
            this.z * v3.x - this.x * v3.z,
            this.x * v3.y - this.y * v3.x,
        );
    }

    public angle(vB: Vector3, degrees: boolean = false): number {
        const lengths = this.length() * vB.length();
        if (lengths === 0) { return 0; }
        const angle: number = Math.acos(this.dot(vB) / lengths);
        if (degrees) {
            return angle * 180 / Math.PI;
        } else {
            return angle;
        }  
    }

    public project(v3: Vector3): number {
        const length = v3.length();
        if (length == 0) { return 0; }
        return this.dot(v3) / length;
    }

    public distance(v3: Vector3): number {
        return ((this.x - v3.x)**2 + (this.y - v3.y)**2 + (this.z - v3.z)**2)**0.5;
    }

    public static between(from: Vector3, to: Vector3): Vector3 {
        return new Vector3(to.x - from.x, to.y - from.y, to.z - from.z);
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