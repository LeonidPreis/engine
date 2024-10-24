import { Euler } from './euler';
import { Matrix } from './matrix';
import { IModel } from './model'
import { Quaternion } from './quaternion';
import { ITransformation, Transformation } from './transformation';
import { Vector } from './vector';

export interface IInstance {
    model: IModel;
    position: Vector;
    orientation: Matrix | Euler | Quaternion;
    scale: Vector;
    transformation: Matrix;
}

export class Instance implements IInstance {
    model: IModel;
    position: Vector;
    orientation: Matrix | Euler | Quaternion;
    scale: Vector;
    transformation: Matrix;
    
    constructor(
        model: IModel,
        position: Vector = new Vector([0,0,0,1]),
        orientation: Matrix | Euler | Quaternion = Matrix.identity(4),
        scale: Vector = new Vector([1,1,1,1])
    ) {
        this.model = model;
        this.transformation = new Transformation(position, orientation, scale).transformation;
    }
}