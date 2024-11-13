import { Matrix, Matrix4 } from './matrix'

export abstract class AbstractVector<T extends AbstractVector<T>> {
    abstract clone(): T;
    abstract negate(): T;
    abstract length(): number;
    abstract normalize(): T;
    abstract multiplyScalar(s: number): T;
    abstract add(v: T): T;
    abstract subtract(v: T): T;
    abstract dot(v: T): number;
    abstract cross(v: T): T | number;
    abstract angle(v: T): number;
    abstract project(v: T): number;
}

export class Vector2 extends AbstractVector<Vector2> {
    constructor(public x: number = 0, public y: number = 0) {
        super();
        this.x = x;
        this.y = y;
    }

    clone(): Vector2 {
        return new Vector2(this.x, this.y);
    }

    negate(): Vector2 {
        return new Vector2(-this.x, -this.y);
    }

    length(): number {
        return (this.x * this.x + this.y * this.y)**0.5;
    }

    normalize(): Vector2 {
        const length = this.length();
        if (length !== 0) {
            return new Vector2(this.x / length, this.y / length);
        }
        throw new Error('Vector of zero-length cannot be normalized.');
    }

    multiplyScalar(s: number): Vector2 {
        return new Vector2(this.x * s, this.y * s);
    }

    add(v2: Vector2): Vector2 {
        return new Vector2(this.x + v2.x, this.y + v2.y);
    }

    subtract(v2: Vector2): Vector2 {
        return new Vector2(this.x - v2.x, this.y - v2.y);
    }

    dot(v2: Vector2): number {
        return this.x * v2.x + this.y * v2.y;
    }

    cross(v2: Vector2): number {
        return this.x * v2.y - this.y * v2.x;
    }

    angle(v2: Vector2): number {
        const lengths = this.length() * v2.length();
        if (lengths !== 0) {
            return Math.acos(this.dot(v2) / lengths);
        }
        throw new Error('Angle of zero-length vector cannot be calculated.');
    }

    project(v2: Vector2): number {
        const lenght = v2.length();
        if (lenght !== 0) {
            return this.dot(v2) / lenght;
        }
        throw new Error('It is not possible to project onto a vector of zero-length.')
    }
}

export class Vector3 extends AbstractVector<Vector3> {
    constructor(public x: number = 0, public y: number = 0, public z: number = 0) {
        super();
        this.x = x;
        this.y = y;
        this.z = z;
    }

    clone(): Vector3 {
        return new Vector3(this.x, this.y, this.z);
    }

    negate(): Vector3 {
        return new Vector3(-this.x, -this.y, -this.z);
    }

    length(): number {
        return (this.x * this.x + this.y * this.y + this.z * this.z)**0.5;
    }

    normalize(): Vector3 {
        const length = this.length();
        if (length !== 0) {
            return new Vector3(this.x / length, this.y / length, this.z / length);
        }
        throw new Error('Vector of zero-length cannot be normalized.');
    }

    multiplyScalar(s: number): Vector3 {
        return new Vector3(this.x * s, this.y * s, this.z * s);
    }

    add(v3: Vector3): Vector3 {
        return new Vector3(this.x + v3.x, this.y + v3.y, this.z + v3.z);
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

    angle(v3: Vector3): number {
        const lengths = this.length() * v3.length();
        if (lengths !== 0) {
            return Math.acos(this.dot(v3) / lengths);
        }
        throw new Error('Angle of zero-length vector cannot be calculated.');
    }

    project(v3: Vector3): number {
        const lenght = v3.length();
        if (lenght !== 0) {
            return this.dot(v3) / lenght;
        }
        throw new Error('It is not possible to project onto a vector of zero-length.')
    }
}

export class Vector4 extends AbstractVector<Vector4> {
    constructor(public x: number = 0, public y: number = 0, public z: number = 0, public w: number = 1) {
        super();
        this.x = x;
        this.y = y;
        this.z = z;
        this.w = w;
    }

    clone(): Vector4 {
        return new Vector4(this.x, this.y, this.z, this.w);
    }

    negate(): Vector4 {
        return new Vector4(-this.x, -this.y, -this.z, -this.w);
    }

    length(): number {
        return (this.x * this.x + this.y * this.y + this.z * this.z + this.w * this.w)**0.5;
    }

    normalize(): Vector4 {
        const length = this.length();
        if (length !== 0) {
            return new Vector4(this.x / length, this.y / length, this.z / length, this.w / length);
        }
        throw new Error('Vector of zero-length cannot be normalized.');
    }

    multiplyScalar(s: number): Vector4 {
        return new Vector4(this.x * s, this.y * s, this.z * s, this.w * s);
    }

    multiplyMatrix(m: Matrix4): Vector4 {
        return new Vector4(
            this.x * m.m11 + this.y * m.m21 + this.z * m.m31 + this.w * m.m41,
            this.x * m.m12 + this.y * m.m22 + this.z * m.m32 + this.w * m.m42,
            this.x * m.m13 + this.y * m.m23 + this.z * m.m33 + this.w * m.m43,
            this.x * m.m14 + this.y * m.m24 + this.z * m.m34 + this.w * m.m44,
        );
    }

    add(v4: Vector4): Vector4 {
        return new Vector4(this.x + v4.x, this.y + v4.y, this.z + v4.z, this.w + v4.w);
    }

    subtract(v4: Vector4): Vector4 {
        return new Vector4(this.x - v4.x, this.y - v4.y, this.z - v4.z, this.w - v4.w);
    }

    dot(v4: Vector4): number {
        return this.x * v4.x + this.y * v4.y + this.z * v4.z + this.w* v4.w;
    }

    cross(v4: Vector4): Vector4 {
        return new Vector4(
            this.y * v4.z - this.z * v4.y,
            this.z * v4.x - this.x * v4.z,
            this.x * v4.y - this.y * v4.x,
            1
        );
    }

    angle(v4: Vector4): number {
        const lengths = this.length() * v4.length();
        if (lengths !== 0) {
            return Math.acos(this.dot(v4) / lengths);
        }
        throw new Error('Angle of zero-length vector cannot be calculated.');
    }

    project(v4: Vector4): number {
        const lenght = v4.length();
        if (lenght !== 0) {
            return this.dot(v4) / lenght;
        }
        throw new Error('It is not possible to project onto a vector of zero-length.')
    }
}

export class Vector extends AbstractVector<Vector>{
    data: number[];
    constructor(data: number[]) {
        super();
        this.data = data;
    }

    public get x(): number {
        return this.data[0];
    }

    public get y(): number {
        return this.data[1];
    }

    public get z(): number {
        return this.data[2];
    }

    public get w(): number {
        return this.data[3];
    }

    public set x(x: number) {
        this.data[0] = x;
    }

    public set y(y: number) {
        this.data[1] = y;
    }

    public set z(z: number) {
        this.data[2] = z;
    }

    public set w(w: number) {
        this.data[3] = w;
    }

    clone(): Vector {
        return this;
    }

    negate(): Vector {
        return new Vector(this.data.map(value => -value));
    }

    length(): number {
        return Math.sqrt(this.data.reduce((sum, value) => sum + value ** 2, 0));
    }

    normalize(): Vector {
        const length = this.length();
        if (length !== 0) {
            return new Vector(this.data.map(value => value/length));
        }
        throw new Error('Vector of zero-length cannot be normalized.');
    }

    multiplyScalar(s: number): Vector {
        return new Vector(this.data.map(value => value * s));
    }

    multiplyMatrix(m: Matrix): Vector {        
        const result: number[] = [];
        for (let i = 0; i < m.data.length; i++) {
            let sum = 0;
            for (let j = 0; j < this.data.length; j++) {
                sum += this.data[j] * m.data[j][i];
            }
            result.push(sum);
        }
        return new Vector(result);
    }

    add(v: Vector): Vector { 
        return new Vector(this.data.map((value, index) => value + v.data[index]));
    }
    
    subtract(v: Vector): Vector { 
        return new Vector(this.data.map((value, index) => value + v.data[index]));
    }

    dot(v: Vector): number {
        let result = 0;
        for (let i = 0; i < this.data.length; i++) {
            result += this.data[i] * v.data[i];
        }
        return result;
    }

    cross(v: Vector): Vector {
        return new Vector([
            this.y * v.z - this.z * v.y,
            this.z * v.x - this.x * v.z,
            this.x * v.y - this.y * v.x,
            1
        ]);
    }

    angle(v: Vector): number {
        const lengths = this.length() * v.length();
        if (lengths !== 0) {
            return Math.acos(this.dot(v) / lengths);
        }
        throw new Error('Angle of zero-length vector cannot be calculated.');
    }

    project(v: Vector): number {
        const lenght = v.length();
        if (lenght !== 0) {
            return this.dot(v) / lenght;
        }
        throw new Error('It is not possible to project onto a vector of zero-length.')
    }
}