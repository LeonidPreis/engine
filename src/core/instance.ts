import { Matrix4 } from './matrix4';
import { Model } from './model'
import { Transformation } from './transformation';

export class Instance {
    public model: Model;
    public transformation: Transformation;
    
    constructor(
        model: Model,
        transformation: Transformation,
    ) {
        this.model = model;
        this.transformation = transformation;
    }

    public getTransformationMatrix(): Matrix4 {
        return this.transformation.getTransformation();
    }
}