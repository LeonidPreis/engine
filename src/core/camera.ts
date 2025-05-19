import { Vector4 } from './vector4'
import { Matrix4 } from './matrix4'
import { Quaternion } from './quaternion';
import { IProjection, ProjectionDescriptor } from './projection';
import { Vector3 } from './vector3';
import { CameraEventController, CameraState, KeyboardMoveCommand, PanCommand, RotateCommand, ZoomCommand } from './camera-command';

interface Subscriber { update(): void; }

export class Camera {
    private subscribers: Subscriber[] = [];
    public canvas: HTMLCanvasElement;
    public projection: IProjection<ProjectionDescriptor>;
    public state: CameraState;
    private eventController: CameraEventController;
    

    constructor(
        canvas: HTMLCanvasElement,
        target: Vector4,
        position: Vector4,
        projection: IProjection<ProjectionDescriptor>
    ) {
        this.canvas = canvas;
        this.projection = projection;
        this.state = new CameraState(target, position);
        this.eventController = new CameraEventController(this);
    }

    public subscribe(subscriber: Subscriber): void {
        this.subscribers.push(subscriber);
    }
    public unsubscribe(subscriber: Subscriber): void {
        this.subscribers = this.subscribers.filter(sub => sub !== subscriber);
    }
    public notify(): void {
        this.state.dirty = true;
        this.subscribers.forEach(subscriber => subscriber.update());
    }
    public getViewMatrix(): Matrix4 {
        const state = this.state;
        if (this.state.dirty) this.state.updateTransform(); this.state.dirty = false;
        return new Matrix4(                                  // offsets
            state.right.x,   state.right.y,   state.right.z,   -state.right.dot(state.position),
            state.up.x,      state.up.y,      state.up.z,      -state.up.dot(state.position),
            state.forward.x, state.forward.y, state.forward.z, -state.forward.dot(state.position),
            0,               0,               0,                1    
        );
    }
}