import { Euler } from './euler';
import { Matrix4 } from './matrix';
import { IModel } from './model'
import { Quaternion } from './quaternion';
import { ITransformation, Transformation } from './transformation';
import { Vector4, Vector3 } from './vector';

export interface IInstance {
    model: IModel;
    position: Vector3 | Vector4;
    orientation: Matrix4 | Euler | Quaternion;
    scale: Vector3 | Vector4;
    transformation: Matrix4;
}

export class Instance implements IInstance {
    model: IModel;
    position: Vector3 | Vector4;
    orientation: Matrix4 | Euler | Quaternion;
    scale: Vector3 | Vector4;
    transformation: Matrix4;
    
    constructor(
        model: IModel,
        position: Vector3 = new Vector3(0,0,0),
        orientation: Matrix4 | Euler | Quaternion = new Matrix4,
        scale: Vector3 = new Vector3(1,1,1)
    ) {
        this.model = model;
        this.transformation = new Transformation(position, orientation, scale).getTransformation();
    }
}