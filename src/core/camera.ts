import { Vector4 } from './vector4'
import { Matrix4 } from './matrix4'
import { Quaternion } from './quaternion';
import { IProjection, ProjectionDescriptor } from './projection';
import { Vector3 } from './vector3';
import { CameraEventController, ICameraCommand, KeyboardMoveCommand, PanCommand, RotateCommand, ZoomCommand } from './camera-command';

interface Subscriber {update(): void;}

export class Camera {
    public keysPressed: { [key: string]: boolean } = {};
    private subscribers: Subscriber[] = [];
    public canvas: HTMLCanvasElement;
    public target!: Vector4;
    public position!: Vector4;
    public right!: Vector4;
    public up!: Vector4;
    public forward!: Vector4;
    public verticalOffset: Vector4 = new Vector4();
    public horizontalOffset: Vector4 = new Vector4();
    public panOffset: Vector4 = new Vector4();
    private rotationMatrix!: Matrix4;
    private verticalRotation!: Quaternion;
    private horizontalRotation!: Quaternion;
    private rotationQuaternion!: Quaternion;
    public theta!: number;
    public phi!: number;
    public radius!: number;
    private lastMouseX: number = 0;
    private lastMouseY: number = 0;
    public panSpeed: number = 0.0005;
    public zoomSpeed: number = 0.05;
    public rotationSpeed: number = 0.005;
    public projection: IProjection<ProjectionDescriptor>;
    private eventController: CameraEventController;
    public dirty: boolean = true;

    constructor(
        canvas: HTMLCanvasElement,
        target: Vector4,
        position: Vector4,
        projection: IProjection<ProjectionDescriptor>
    ) {
        this.canvas = canvas;
        this.init(target, position);
        this.projection = projection;
        this.keysPressed = {};
        this.eventController = new CameraEventController(this);
    }

    public subscribe(subscriber: Subscriber): void {
        this.subscribers.push(subscriber);
    }
    public unsubscribe(subscriber: Subscriber): void {
        this.subscribers = this.subscribers.filter(sub => sub !== subscriber);
    }
    public notify(): void {
        this.subscribers.forEach(subscriber => subscriber.update());
    }
    private init(target: Vector4, position: Vector4): void {
        [this.target, this.position] = [target, position];
        [this.right, this.up, this.forward] = position.subtract(this.target).normalize().orthonormalBasis();
        [this.theta, this.phi] = [0, 0];
        this.radius = this.target.distance(this.position);
        this.updateTransform();
    }
    public updateMousePosition(event: MouseEvent): void {
        [this.lastMouseX, this.lastMouseY] = [event.clientX, event.clientY];
    }
    public updateTransform(): void {
        this.verticalRotation = Quaternion.fromAngleAxis(-this.phi, Vector3.rightward);
        this.horizontalRotation = Quaternion.fromAngleAxis(-this.theta, Vector3.upward);
        this.rotationQuaternion = this.horizontalRotation.multiply(this.verticalRotation);
        this.rotationMatrix = this.rotationQuaternion.toRotationMatrix();
        this.right.copy(this.rotationMatrix.getRightVector());
        this.up.copy(this.rotationMatrix.getUpVector());
        this.forward.copy(this.rotationMatrix.getForwardVector());
        this.position.copy(this.target.subtract(this.forward.scale(this.radius)));
    }
    public getMouseDelta(event: MouseEvent): [number, number] {
        return [event.clientX - this.lastMouseX, event.clientY - this.lastMouseY];
    }
    public getViewMatrix(): Matrix4 {
        if (this.dirty) this.updateTransform(); this.dirty = false;
        return new Matrix4(                               // offsets
            this.right.x,   this.right.y,   this.right.z,   -this.right.dot(this.position),
            this.up.x,      this.up.y,      this.up.z,      -this.up.dot(this.position),
            this.forward.x, this.forward.y, this.forward.z, -this.forward.dot(this.position),
            0,              0,              0,               1    
        );
    }
}