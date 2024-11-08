import { Vector } from './vector'
import { Matrix } from './matrix'
import { Canvas } from './canvas'
import { Render } from './render';
import { Quaternion } from './quaternion';

export class Camera {
    static coordinatesSystem: 'RHS' | 'LHS' = 'RHS';
    private canvas: Canvas;
    private target: Vector;
    private position: Vector;
    private near: number = 1e-2;
    private far: number = 1e3;
    private fovY: number = 90;
    private projectionType: string;
    public forward: Vector;
    private right: Vector;
    private up: Vector;
    private radius: number;
    public rotationQuaternion: Quaternion;
    public rotationMatrix: Matrix;
    private lastMouseX: number;
    private lastMouseY: number;
    private isRotating: boolean;

    constructor(
        canvas: Canvas,
        target: Vector,
        position: Vector,
        near: number,
        far: number,
        fovY: number,
    ) {
        this.canvas = canvas;
        this.target = target;
        this.position = position;
        this.near = near;
        this.far = far;
        this.fovY = fovY*Math.PI/180;
        this.forward = Vector.subtract(this.target, this.position).normalize();
        this.right = Vector.cross(new Vector([0,1,0,1]), this.forward).normalize();
        this.up = Vector.cross(this.forward, this.right);
        this.radius = Vector.subtract(this.position, this.target).length();
        this.rotationQuaternion = Quaternion.from.angleAxis(1, this.position).normalize();
        this.rotationMatrix = Quaternion.to.matrix(this.rotationQuaternion) as Matrix;
        this.updateOrientationVectors();
        this.updateCameraPosition();
        this.lastMouseX = 0;
        this.lastMouseY = 0;
        this.isRotating = true;
        this.projectionType = 'PERSPECTIVE';
        this.canvas.canvas.addEventListener('wheel', this.handleScroll.bind(this), false);
        this.canvas.canvas.addEventListener('mousedown', this.startRotation.bind(this), false);
    }

    getRightVector(): Vector {
        return new Vector(this.rotationMatrix.data[0]);
    }
    getUpVector(): Vector {
        return new Vector(this.rotationMatrix.data[1]);
    }
    getForwardVector(): Vector {
        return new Vector(this.rotationMatrix.data[2]);
    }

    distance(): number {
        return Vector.subtract(this.position,this.target).length();
    }

    handleScroll(event): void {
        const delta = event.deltaY;
        const increment = delta < 0 ? 1.1 : 0.9;
        this.radius *= increment;
        this.position = Vector.subtract(
            this.target,
            Vector.multiply.scalar(
                this.forward,
                this.radius
            )
        )
        this.updateOrientationVectors();
        Render.main();
    }
    
    startRotation(event): void {
        this.lastMouseX = event.clientX;
        this.lastMouseY = event.clientY;
        this.isRotating = true;
        const onMouseMove = this.rotateCamera.bind(this);
        const onMouseUp = () => {
            this.isRotating = false;
            this.canvas.canvas.removeEventListener('mousemove', onMouseMove);
            this.canvas.canvas.removeEventListener('mouseup', onMouseUp);
        };
        this.canvas.canvas.addEventListener('mousemove', onMouseMove, false);
        this.canvas.canvas.addEventListener('mouseup', onMouseUp, false);
    }

    rotateCamera(event): void {
        if (!this.isRotating)
            return;
        const deltaX = event.clientX - this.lastMouseX;
        const deltaY = event.clientY - this.lastMouseY;
        const rotateSpeed = 0.5;
        const azimuth = Quaternion.from.angleAxis(deltaX*rotateSpeed, this.getUpVector());
        const elevation = Quaternion.from.angleAxis(-deltaY*rotateSpeed, this.getRightVector());
        this.rotationQuaternion = Quaternion.multiply.quaternion(
            Quaternion.multiply.quaternion(azimuth, elevation),
            this.rotationQuaternion
        ).normalize()
        this.updateOrientationVectors();
        this.updateCameraPosition();
        this.lastMouseX = event.clientX;
        this.lastMouseY = event.clientY;
        Render.main();
    }
    
    updateOrientationVectors(): void {
        this.right = this.getRightVector();
        this.up = this.getUpVector();
        this.forward = this.getForwardVector();
    }

    updateCameraPosition(): void {
        this.rotationMatrix = Quaternion.to.matrix(this.rotationQuaternion)
        const cameraOffset = new Vector([0, 0, -this.radius, 1]);
        this.position = Vector.add(this.target, Quaternion.multiply.vector(this.rotationQuaternion, cameraOffset));
    }

    view(): Matrix {
        const right = this.rotationMatrix.data[0];
        const up = this.rotationMatrix.data[1];
        const forward = this.rotationMatrix.data[2];
        const xOffset = -Vector.dot(new Vector(right), this.position);
        const yOffset = -Vector.dot(new Vector(up), this.position);
        const zOffset = -Vector.dot(new Vector(forward), this.position);

        return new Matrix([
            [right[0],   right[1],   right[2],   xOffset],
            [up[0],      up[1],      up[2],      yOffset],
            [forward[0], forward[1], forward[2], zOffset],
            [0,          0,          0,          1      ]
        ]);
    }

    setProjectionType(type): void {
        this.projectionType = type;
    }

    getProjectionMatrix(): Matrix {
        switch (this.projectionType) {
            case 'PERSPECTIVE':
                return new Matrix([
                    [1/(Math.tan(this.fovY/2)*this.canvas.aspect),0,                  0,                  0],
                    [0,   1/Math.tan(this.fovY/2),                0,                                      0],
                    [0,   0,  (this.far)/(this.far-this.near),   -(this.far*this.near)/(this.far-this.near)],
                    [0,                                           0,                  1,                  0]
                ]);
            default:
                throw new Error(`Unknown projection type: ${this.projectionType}`);
        }
    }
}