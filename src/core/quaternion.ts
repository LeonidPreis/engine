

class Quaternion {
    constructor(public w: number = 1, public x: number = 1, public y: number = 1, public z: number = 1) {}

    public equals(q: Quaternion, epsilon: number = 1e-6): boolean {
        return Math.abs(this.w - q.w) < epsilon &&
               Math.abs(this.x - q.x) < epsilon &&
               Math.abs(this.y - q.y) < epsilon &&
               Math.abs(this.z - q.z) < epsilon;
    }
    public clone(): Quaternion {
        return new Quaternion(this.w, this.x, this.y, this.z);
    }

    public length(): number {
        return (this.w * this.w + this.x * this.x + this.y * this.y + this.z * this.z)**0.5;
    }

    public normalize(): Quaternion {
        const length = this.length();
        if (length == 0) {
            throw new Error('Quaternion of zero-length cannot be normalized.');
        }
        return new Quaternion(this.w / length, this.x / length, this.y / length, this.z / length);
    }

    public conjugate(): Quaternion {
        return new Quaternion(this.w, -this.x, -this.y, -this.z);
    }

    public inverse(): Quaternion {
        const lengthSquared = this.length()**2;
        return new Quaternion(
            this.w / lengthSquared,
           -this.x / lengthSquared,
           -this.y / lengthSquared,
           -this.z / lengthSquared
        );
    }

    public add(q: Quaternion): Quaternion {
        return new Quaternion(
            this.w + q.w,
            this.x + q.x,
            this.y + q.y,
            this.z + q.z
        );
    }

    public subtract(q: Quaternion): Quaternion {
        return new Quaternion(
            this.w - q.w,
            this.x - q.x,
            this.y - q.y,
            this.z - q.z
        );
    }

    public scale(s: number): Quaternion {
        return new Quaternion(this.w * s, this.x * s, this.y * s, this.z * s);
    }

    public dot(q: Quaternion): number {
        return this.w * q.w + this.x * q.x + this.y * q.y + this.z * q.z;
    }
}