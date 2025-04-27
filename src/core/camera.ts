import { Vector4 } from './vector4'
import { Matrix4 } from './matrix4'
import { Quaternion } from './quaternion';
import { IProjection, OrthographicProjectionDescriptor, ProjectionDescriptor, ProjectionType } from './projection';

interface Subscriber {
    update(): void;
}

export class ArcballCamera {
    private subscribers: Subscriber[] = [];
    public subscribe(subscriber: Subscriber): void {
        this.subscribers.push(subscriber);
    }
    public unsubscribe(subscriber: Subscriber): void {
        this.subscribers = this.subscribers.filter(sub => sub !== subscriber);
    }
    private notify(): void {
        this.subscribers.forEach(subscriber => subscriber.update());
    }
    private canvas: HTMLCanvasElement;
    private target!: Vector4;
    private position!: Vector4;
    private right!: Vector4;
    private up!: Vector4;
    private forward!: Vector4;
    private radius!: number;
    private rotationQuaternion!: Quaternion;
    private rotationMatrix!: Matrix4;
    private lastMouseX: number;
    private lastMouseY: number;
    private isRotating: boolean;
    public rotationSpeed: number = 0.01;
    public projection: IProjection<ProjectionDescriptor>;

    constructor(
        canvas: HTMLCanvasElement,
        target: Vector4,
        position: Vector4,
        projection: IProjection<ProjectionDescriptor>
    ) {
        this.subscribers = [];
        this.canvas = canvas;
        this.init(target, position);
        this.projection = projection;  
        this.rotationSpeed = 0.01;
        this.lastMouseX = 0;
        this.lastMouseY = 0;
        this.isRotating = false;
        this.canvas.addEventListener('wheel', this.handleZoom.bind(this), false);
        this.canvas.addEventListener('mousedown', this.startRotation.bind(this), false);
    }

    init(target: Vector4, position: Vector4): void {
        [this.target, this.position] = [target, position];
        this.radius = this.target.distance(this.position);
        this.forward = this.target.subtract(this.position).normalize();
        [this.right, this.up] = this.forward.orthonormalBasis();
        this.rotationMatrix = Matrix4.fromBasis(this.right, this.up, this.forward);
        this.rotationQuaternion = Quaternion.fromRotationMatrix(this.rotationMatrix).normalize();
        if (isNaN(this.rotationQuaternion.w)) {
            this.rotationQuaternion = new Quaternion(1, 0, 0, 0); // единичный
        }        
        this.updateTransform();
    }

    private handleZoom(event: WheelEvent): void {
        const zoom = event.deltaY < 0 ? 1.1 : 0.9;
        this.radius *= zoom;
        this.position = this.target.subtract(this.forward.scale(this.radius));
        if (this.projection.zoom) {
            this.projection.zoom(zoom);
        }
        this.updateTransform();
    }
    
    private startRotation(event: MouseEvent): void {
        [this.lastMouseX, this.lastMouseY] = [event.clientX, event.clientY];
        this.isRotating = true;
        const onMouseMove = this.handleRotation.bind(this);
        const onMouseUp = (): void => {
            this.isRotating = false;
            this.canvas.removeEventListener('mousemove', onMouseMove);
            this.canvas.removeEventListener('mouseup', onMouseUp);
        };
        this.canvas.addEventListener('mousemove', onMouseMove, false);
        this.canvas.addEventListener('mouseup', onMouseUp, false);
    }

    private handleRotation(event: MouseEvent): void {
        if (!this.isRotating) { return; }
        const [deltaX, deltaY] = [event.clientX - this.lastMouseX, event.clientY - this.lastMouseY];
        const azimuth = Quaternion.fromAngleAxis(deltaX * this.rotationSpeed, this.rotationMatrix.getUpVector());
        const elevation = Quaternion.fromAngleAxis(deltaY * this.rotationSpeed, this.rotationMatrix.getRightVector());
        this.rotationQuaternion = azimuth.multiply(elevation).multiply(this.rotationQuaternion).normalize();
        [this.lastMouseX, this.lastMouseY] = [event.clientX, event.clientY];
        this.updateTransform();
    }

    private updateTransform(): void {
        this.rotationMatrix = this.rotationQuaternion.toRotationMatrix();
        this.right = this.rotationMatrix.getRightVector();
        this.up = this.rotationMatrix.getUpVector();
        this.forward = this.rotationMatrix.getForwardVector();
        this.position = this.target.subtract(this.forward.scale(this.radius));
        this.notify();
    }

    public getViewMatrix(): Matrix4 {
        return new Matrix4(                               // offsets
            this.right.x,   this.right.y,   this.right.z,   -this.right.dot(this.position),
            this.up.x,      this.up.y,      this.up.z,      -this.up.dot(this.position),
            this.forward.x, this.forward.y, this.forward.z, -this.forward.dot(this.position),
            0,              0,              0,               1    
        );
    }
}