import { Vector3, Vector4 } from './vector';
import { Matrix4 } from './matrix';
import { Euler } from './euler';
import { Quaternion } from './quaternion';

export interface ITransformation {
    position: Vector3 | Vector4;
    orientation: Matrix4 | Euler | Quaternion;
    scale: Vector3 | Vector4;
    setPosition(position:Vector3 | Vector4);
    setOrientation(orientation: Matrix4);
    setScale?(scale: Vector3 | Vector4);
}

export class Transformation implements ITransformation {
    coordinatesSystem: 'RHS' | 'LHS' = 'RHS';
    position: Vector3 = new Vector3(0,0,0); 
    orientation: Matrix4 | Euler | Quaternion = new Matrix4;
    scale: Vector3 = new Vector3(1,1,1);
    private lastTransform: Matrix4 = new Matrix4;
    private subjectToUpdate: boolean = true;
 
    constructor(
        position: Vector3 | Vector4 = new Vector3(0,0,0),
        orientation: Matrix4 | Euler | Quaternion = new Matrix4,
        scale: Vector3 | Vector4 = new Vector3(1,1,1)
    ) {
        this.position = position;
        this.orientation = orientation;
        this.scale = scale;
    }

    setCoordinatesSystem(system: 'RHS' | 'LHS'): void {
        if (system !== 'RHS' && system !== 'LHS') {
            throw new Error("Unknown coordinate system. Use 'LHS' or 'RHS'.");
        }
        this.coordinatesSystem = system;
    }

    getCoordinatesSystem(): string {
        return this.coordinatesSystem;
    }

    setPosition(position: Vector3 | Vector4): void {
        this.position = position;
        this.subjectToUpdate = true;
    }

    setScale(scale: Vector3 | Vector4): void {
        this.scale = scale;
        this.subjectToUpdate = true;
    }

    setOrientation(orientation: Matrix4 | Euler | Quaternion): void {
        if (orientation instanceof Matrix4) {
            this.orientation = orientation;
        } else if (orientation instanceof Euler) {
            this.orientation = orientation.rotateXYZ();
        } else if (orientation instanceof Quaternion) {
            this.orientation = orientation.toRotationMatrix();
        } else {
            throw new Error("Rotation must be either a Matrix4, Euler or Quaternion.");
        }
        this.subjectToUpdate = true;
    }

    getTransformation(): Matrix4 {
        if (!this.subjectToUpdate) {
            return this.lastTransform;
        }
        this.lastTransform = this.complex(this.position, this.orientation, this.scale);
        this.subjectToUpdate = false;
        return this.lastTransform;
    }

    getScaleMatrix(s: Vector3 | Vector4): Matrix4 {
        return new Matrix4(
            s.x,0, 0, 0,
            0, s.y,0, 0,
            0, 0, s.z,0,
            0, 0, 0,  1
        );
    }

    getTranslationMatrix(t: Vector3 | Vector4): Matrix4 {
        switch (this.coordinatesSystem) {
            case 'LHS':
                return new Matrix4(
                    1, 0, 0, t.x,
                    0, 1, 0, t.y,
                    0, 0, 1,-t.z,
                    0, 0, 0,   1
                );
            case 'RHS':
            default:
                return new Matrix4(
                    1, 0, 0, t.x,
                    0, 1, 0, t.y,
                    0, 0, 1, t.z,
                    0, 0, 0,   1
                );
        }
    }

    getRotationMatrix(rotation: Matrix4 | Euler | Quaternion): Matrix4 {
        if (rotation instanceof Matrix4) {
            return rotation;
        } else if (rotation instanceof Euler) {
            return rotation.rotateXYZ();
        } else if (rotation instanceof Quaternion) {
            return rotation.toRotationMatrix();
        } else {
            throw new Error("Rotation must be either a Matrix4, Euler or Quaternion.");
        }
    }

    complex(position: Vector3 | Vector4, orientation: Matrix4 | Euler | Quaternion, scale: Vector3 | Vector4): Matrix4 {
        return this.getRotationMatrix(orientation).multiplyMatrix(this.getScaleMatrix(scale)).multiplyMatrix(this.getTranslationMatrix(position));
    }
}