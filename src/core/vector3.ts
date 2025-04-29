export class Vector3 {
    static readonly leftward: Vector3 = new Vector3(-1, 0, 0);
    static readonly rightward: Vector3 = new Vector3(1, 0, 0);
    static readonly upward: Vector3 = new Vector3(0, 1, 0);
    static readonly downward: Vector3 = new Vector3(0,-1, 0);
    static readonly forward: Vector3 = new Vector3(0, 0, 1);
    static readonly backward: Vector3 = new Vector3(0, 0,-1);
    static readonly zero: Vector3 = new Vector3(0, 0, 0);

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

    public normalize(): Vector3 {
        const length = this.length();
        if (length === 0) { return new Vector3; }
        return new Vector3(this.x / length, this.y / length, this.z / length);
    }

    public scale(s: number): Vector3 {
        return new Vector3(this.x * s, this.y * s, this.z * s);
    }

    public add(vB: Vector3): Vector3 {
        return new Vector3(this.x + vB.x, this.y + vB.y, this.z + vB.z);
    }

    public subtract(vB: Vector3): Vector3 {
        return new Vector3(this.x - vB.x, this.y - vB.y, this.z - vB.z);
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

    public projectionLength(vB: Vector3): number {
        const length = vB.length();
        if (length == 0) return 0;
        return this.dot(vB) / length;
    }

    public projectionVector(vB: Vector3): Vector3 {
        const length = vB.length();
        if (length == 0) return new Vector3;
        const multiplier = this.dot(vB) / length**2;
        return vB.scale(multiplier);
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

    public orthonormalBasis(): [Vector3, Vector3, Vector3] {
        let forward: Vector3 = new Vector3(this.x, this.y, this.z).normalize();
        let up: Vector3, right: Vector3;
        if (Math.abs(forward.y) > 1 - 1e-6) {
            up = Vector3.rightward.cross(forward);
            right = forward.cross(up);
        } else {
            right = forward.cross(Vector3.upward);
            up = right.cross(forward);
        }
        return [right, up, forward];
    }
}