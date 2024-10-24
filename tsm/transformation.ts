import { Vector } from './vector';
import { Matrix } from './matrix';
import { Euler } from './euler';
import { Quaternion } from './quaternion';

export interface ITransformation {
    position: Vector;
    orientation: Matrix | Euler | Quaternion;
    scale: Vector;
    setPosition(position: Vector);
    setOrientation(orientation: Matrix);
    setScale?(scale: Vector);
}

export class Transformation implements ITransformation {
    static coordinatesSystem: 'RHS' | 'LHS' = 'RHS';
    position: Vector = new Vector([0,0,0,1]); 
    orientation: Matrix | Euler | Quaternion = Matrix.identity(4);
    scale: Vector = new Vector([1,1,1,1]);
    private lastTransform: Matrix = Matrix.identity(4);
    private subjectToUpdate: boolean = true;
 
    constructor(
        position: Vector = new Vector([0,0,0,1]),
        orientation: Matrix | Euler | Quaternion = Matrix.identity(4),
        scale: Vector = new Vector([1,1,1,1])
    ) {
        this.position = position;
        this.orientation = orientation;
        this.scale = scale;
    }

    static setCoordinatesSystem(system: 'RHS' | 'LHS'): void {
        if (system !== 'RHS' && system !== 'LHS') {
            throw new Error("Unknown coordinate system. Use 'LHS' or 'RHS'.");
        }
        Transformation.coordinatesSystem = system;
    }

    setPosition(position: Vector): void {
        this.position = position;
        this.subjectToUpdate = true;
    }

    setOrientation(orientation: Matrix | Euler | Quaternion): void {
        if (orientation instanceof Matrix) {
            this.orientation = orientation;
        } else if (orientation instanceof Euler) {
            this.orientation = Euler.rotate.xyz(orientation);
        } else if (orientation instanceof Quaternion) {
            this.orientation = Quaternion.to.matrix(orientation);
        } else {
            throw new Error("Rotation must be either a Matrix, Euler or Quaternion.");
        }
        this.subjectToUpdate = true;
    }

    setScale(scale: Vector): void {
        this.scale = scale;
        this.subjectToUpdate = true;
    }

    get transformation(): Matrix {
        if (!this.subjectToUpdate) {
            return this.lastTransform;
        }
        this.lastTransform = Transformation.complex(this.position, this.orientation, this.scale);
        this.subjectToUpdate = false;
        return this.lastTransform;
    }

    static scale(s: Vector): Matrix {
        return new Matrix([
            [s.x,0, 0, 0],
            [0, s.y,0, 0],
            [0, 0, s.z,0],
            [0, 0, 0,  1]
        ]);
    }

    static translation(t: Vector): Matrix {
        switch (Transformation.coordinatesSystem) {
            case 'LHS':
                return new Matrix([
                    [1, 0, 0, t.x],
                    [0, 1, 0, t.y],
                    [0, 0, 1,-t.z],
                    [0, 0, 0,   1]
                ]);
            case 'RHS':
            default:
                return new Matrix([
                    [1, 0, 0, t.x],
                    [0, 1, 0, t.y],
                    [0, 0, 1, t.z],
                    [0, 0, 0,   1]
                ]);
        }
    }

    static rotation(rotation: Matrix | Euler | Quaternion): Matrix {
        if (rotation instanceof Matrix) {
            return rotation;
        } else if (rotation instanceof Euler) {
            return Euler.rotate.xyz(rotation);
        } else if (rotation instanceof Quaternion) {
            return Quaternion.to.matrix(rotation);
        } else {
            throw new Error("Rotation must be either a Matrix, Euler or Quaternion.");
        }
    }

    static complex(position: Vector, orientation: Matrix | Euler | Quaternion, scale: Vector) {
        return Matrix.multiply.matrix(Transformation.translation(position),
            Matrix.multiply.matrix(Transformation.rotation(orientation), Transformation.scale(scale)));
    }
}