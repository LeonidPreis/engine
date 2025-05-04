import { Vector4 } from './vector4'
import { Matrix4 } from './matrix4'
import { Quaternion } from './quaternion';
import { IProjection, ProjectionDescriptor } from './projection';
import { Vector3 } from './vector3';

interface Subscriber {
    update(): void;
}

type CameraInteractionType = 'rotate' | 'pan' | 'zoom';
type CameraInteractionHandler = (event: MouseEvent | WheelEvent) => void;
interface ICameraInteraction {active: boolean, handler: CameraInteractionHandler};

export class Camera {
    private subscribers: Subscriber[] = [];

    private canvas: HTMLCanvasElement;
    private target!: Vector4;
    private position!: Vector4;
    private right!: Vector4;
    private up!: Vector4;
    private forward!: Vector4;
    private rotationMatrix!: Matrix4;
    private rotationQuaternion!: Quaternion;
    private theta!: number;
    private phi!: number;
    private radius!: number;
    private lastMouseX: number = 0;
    private lastMouseY: number = 0;
    private panSpeed: number = 0.0005;
    private zoomSpeed: number = 0.05;
    private rotationSpeed: number = 0.01;
    public projection: IProjection<ProjectionDescriptor>;
    private interactions: Record<CameraInteractionType, ICameraInteraction>;

    constructor(
        canvas: HTMLCanvasElement,
        target: Vector4,
        position: Vector4,
        projection: IProjection<ProjectionDescriptor>
    ) {
        this.canvas = canvas;
        this.init(target, position);
        this.projection = projection;
        this.interactions = {
            rotate: { active: false, handler: this.handleRotating.bind(this) },
            pan: { active: false, handler: this.handlePanning.bind(this) },
            zoom: { active: false, handler: this.handleZooming.bind(this) as CameraInteractionHandler}
        };
        this.setupEventListeners();
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

    private setupEventListeners(): void {
        this.canvas.addEventListener('contextmenu', (event) => event.preventDefault());
        this.canvas.addEventListener('wheel', (event) => {
            event.preventDefault();
            this.handleZooming(event);
        }, { passive: false });
        
        this.canvas.addEventListener('mousedown', (event) => {
            switch(event.button) {
                case 0: this.startInteraction(event, 'rotate'); break;
                case 2: this.startInteraction(event, 'pan'); break;
            }
        });
    }

    private init(target: Vector4, position: Vector4): void {
        [this.target, this.position] = [target, position];
        [this.right, this.up, this.forward] = position.subtract(this.target).normalize().orthonormalBasis();
        [this.theta, this.phi] = [0, 0];
        this.radius = this.target.distance(this.position);
        this.updateTransform();
    }
    private updateMousePosition(event: MouseEvent): void {
        [this.lastMouseX, this.lastMouseY] = [event.clientX, event.clientY];
    }
    private getMouseDelta(event: MouseEvent): [number, number] {
        return [event.clientX - this.lastMouseX, event.clientY - this.lastMouseY];
    }
    private startInteraction(event: MouseEvent, type: CameraInteractionType): void {
        this.updateMousePosition(event);
        this.interactions[type].active = true;
        
        const onMouseMove = this.interactions[type].handler;
        const onMouseUp = () => {
            this.interactions[type].active = false;
            this.canvas.removeEventListener('mousemove', onMouseMove);
            this.canvas.removeEventListener('mouseup', onMouseUp);
        };
        
        this.canvas.addEventListener('mousemove', onMouseMove, false);
        this.canvas.addEventListener('mouseup', onMouseUp, false);
    }

    private handleRotating(event: MouseEvent): void {
        if (!this.interactions.rotate.active) return;
        const [deltaX, deltaY] = this.getMouseDelta(event);
        this.theta -= deltaX * this.rotationSpeed;
        this.phi -= deltaY * this.rotationSpeed;
        this.updateMousePosition(event);
        this.updateTransform();
    }

    private handlePanning(event: MouseEvent): void {
        if (!this.interactions.pan.active) return;
        const [deltaX, deltaY] = this.getMouseDelta(event);
        const horizntalOffset = this.right.scale(-deltaX * this.panSpeed * this.radius);
        const verticalOffset = this.up.scale(deltaY * this.panSpeed * this.radius);
        const panOffset = horizntalOffset.add(verticalOffset);
        this.target = this.target.add(panOffset);
        this.position = this.position.add(panOffset);
        this.updateMousePosition(event);
        this.updateTransform();
    }

    private handleZooming(event: WheelEvent): void {
        const zoomFactor = event.deltaY < 0 ? 1 + this.zoomSpeed : 1 - this.zoomSpeed;
        this.radius *= zoomFactor;
        if (this.projection.zoom)
            this.projection.zoom(zoomFactor);
        this.position = this.target.subtract(this.forward.scale(this.radius));
        this.updateTransform();
    }

    private updateTransform(): void {
        let verticalRotation = Quaternion.fromAngleAxis(-this.phi, new Vector3(1,0,0));
        let horizontalRotation = Quaternion.fromAngleAxis(-this.theta, new Vector3(0,1,0));
        this.rotationQuaternion = verticalRotation.multiply(horizontalRotation);
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