import { Vector4 } from './vector4';
import { Vector3 } from './vector3';
import { Matrix4 } from './matrix4';
import { Euler, RotationOrder } from './euler';
import { Quaternion } from './quaternion';

export type Position = Vector3 | Vector4;
export type Orientation = Matrix4 | Euler | Quaternion
export type Scale = Vector3 | Vector4;

export interface ITransformation {
    get position(): Position;
    set position(position: Position);

    get orientation(): Orientation;
    set orientation(orientation: Orientation);

    get scale(): Scale;
    set scale(scale: Scale);
}

export class Transformation implements ITransformation {
    private _position: Position = new Vector3(0,0,0); 
    private _orientation: Orientation = new Matrix4;
    private _scale: Scale = new Vector3(1,1,1);
    private _lastTransform: Matrix4 = new Matrix4;
    private _dirty: boolean = true;
 
    constructor(
        position: Position = new Vector3(0,0,0),
        orientation: Orientation = new Euler(0,0,0, RotationOrder.XYZ, true),
        scale: Scale = new Vector3(1,1,1)
    ) {
        this._position = position;
        this._orientation = orientation;
        this._scale = scale;
    }

    get position(): Position {
        return this._position;
    }

    set position(position: Position) {
        this._position = position;
        this._dirty = true;
    }

    get orientation(): Orientation {
        return this._orientation;
    }

    set orientation(orientation: Orientation) {
        this._orientation = orientation;
        this._dirty = true;
    }

    get scale(): Scale {
        return this._scale;
    }

    set scale(scale: Scale) {
        this._scale = scale;
        this._dirty = true;
    }    

    private getScaleMatrix(): Matrix4 {
        return new Matrix4(
            this._scale.x,0, 0, 0,
            0, this._scale.y,0, 0,
            0, 0, this._scale.z,0,
            0, 0, 0,  1
        );
    }

    private getRotationMatrix(): Matrix4 {
        if (this._orientation instanceof Matrix4) {
            return this._orientation;
        } else if (this._orientation instanceof Euler) {
            return this._orientation.rotateXYZ();
        } else if (this._orientation instanceof Quaternion) {
            return this._orientation.toRotationMatrix();
        } else {
            throw new Error("Rotation must be either a Matrix4, Euler or Quaternion.");
        }
    }

    private getTranslationMatrix(): Matrix4 {
        return new Matrix4(
            1, 0, 0, this._position.x,
            0, 1, 0, this._position.y,
            0, 0, 1, this._position.z,
            0, 0, 0,           1
        );
    }

    private getTransformationMatrix(): Matrix4 {
        return this.getScaleMatrix()
            .multiplyMatrix(this.getRotationMatrix())
            .multiplyMatrix(this.getTranslationMatrix());
    }

    public getTransformation(): Matrix4 {
        if (this._dirty) {
            this._dirty = false;
            this._lastTransform = this.getTransformationMatrix();
        }
        return this._lastTransform;
    }
}