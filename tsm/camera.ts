import { Vector4 } from './vector'
import { Matrix4 } from './matrix'
import { Canvas } from './canvas'
import { Render } from './render';
import { Quaternion } from './quaternion';

export class Camera {
    static coordinatesSystem: 'RHS' | 'LHS' = 'RHS';
    private canvas: Canvas;
    private target: Vector4;
    private position: Vector4;
    private near: number = 1e-2;
    private far: number = 1e3;
    private fovY: number = 90;
    private projectionType: string;
    public forward: Vector4;
    private right: Vector4;
    private up: Vector4;
    private radius: number;
    public rotationQuaternion: Quaternion;
    public rotationMatrix: Matrix4;
    private lastMouseX: number;
    private lastMouseY: number;
    private isRotating: boolean;

    constructor(
        canvas: Canvas,
        target: Vector4,
        position: Vector4,
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
        this.forward = this.target.subtract(position).normalize();
        this.right = new Vector4(0,1,0,1).cross(this.forward).normalize();
        this.up = this.forward.cross(this.right).normalize();
        this.radius = this.distance();
        this.rotationQuaternion = Quaternion.fromAngleAxis(1, this.position).normalize();
        this.rotationMatrix = this.rotationQuaternion.toRotationMatrix();
        this.updateOrientationVectors();
        this.updateCameraPosition();
        this.lastMouseX = 0;
        this.lastMouseY = 0;
        this.isRotating = true;
        this.projectionType = 'PERSPECTIVE';
        this.canvas.canvas.addEventListener('wheel', this.handleScroll.bind(this), false);
        this.canvas.canvas.addEventListener('mousedown', this.startRotation.bind(this), false);
    }

    getRightVector(): Vector4 {
        return new Vector4(
            this.rotationMatrix.m11,
            this.rotationMatrix.m12,
            this.rotationMatrix.m13,
            this.rotationMatrix.m14
        );
    }
    
    getUpVector(): Vector4 {
        return new Vector4(
            this.rotationMatrix.m21,
            this.rotationMatrix.m22,
            this.rotationMatrix.m23,
            this.rotationMatrix.m24
        );
    }
    getForwardVector(): Vector4 {
        return new Vector4(
            this.rotationMatrix.m31,
            this.rotationMatrix.m32,
            this.rotationMatrix.m33,
            this.rotationMatrix.m34
        );
    }

    distance(): number {
        return this.position.subtract(this.target).length();
    }

    handleScroll(event): void {
        const delta = event.deltaY;
        const increment = delta < 0 ? 1.1 : 0.9;
        this.radius *= increment;
        this.position = this.target.subtract(this.forward.multiplyScalar(this.radius))
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
        const azimuth = Quaternion.fromAngleAxis(deltaX*rotateSpeed, this.getUpVector());
        const elevation = Quaternion.fromAngleAxis(-deltaY*rotateSpeed, this.getRightVector());
        this.rotationQuaternion = azimuth.multiplyQuaternion(elevation).multiplyQuaternion(this.rotationQuaternion).normalize();
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
        this.rotationMatrix = this.rotationQuaternion.toRotationMatrix();
        const cameraOffset = new Vector4(0, 0, -this.radius, 1);
        this.position = this.target.add(this.rotationQuaternion.applyToVector(cameraOffset));
    }

    view(): Matrix4 {
        const right = this.getRightVector()
        const up = this.getUpVector();
        const forward = this.getForwardVector();
        const xOffset = right.dot(this.position);
        const yOffset = up.dot(this.position);
        const zOffset = forward.dot(this.position);

        return new Matrix4(
            right.x,   right.y,   right.z,  -xOffset,
            up.x,      up.y,      up.z,     -yOffset,
            forward.x, forward.y, forward.z,-zOffset,
            0,         0,         0,         1    
        );
    }

    setProjectionType(type): void {
        this.projectionType = type;
    }

    getProjectionMatrix(): Matrix4 {
        switch (this.projectionType) {
            case 'PERSPECTIVE':
                return new Matrix4(
                    1/(Math.tan(this.fovY/2)*this.canvas.aspect),0,                  0,                  0,
                    0,   1/Math.tan(this.fovY/2),                0,                                      0,
                    0,   0,  (this.far)/(this.far-this.near),   -(this.far*this.near)/(this.far-this.near),
                    0,                                           0,                  1,                  0
                );
            default:
                throw new Error(`Unknown projection type: ${this.projectionType}`);
        }
    }
}