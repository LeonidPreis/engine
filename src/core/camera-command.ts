import { Camera } from "./camera";
import { Matrix4 } from "./matrix4";
import { Quaternion } from "./quaternion";
import { Vector3 } from "./vector3";
import { Vector4 } from "./vector4";
import { EventBuffer, ICommand } from "./event-buffer";

export type CameraEventType = MouseEvent | WheelEvent | KeyboardEvent;
export type CameraInteractionType = 'rotate' | 'pan' | 'zoom' | 'keyboard' | 'roll';
export type CameraInteractionHandler = (event: MouseEvent | WheelEvent | KeyboardEvent) => void;
export type CameraInputType = 'LeftMouseDown' | 'RightMouseDown' | 'WheelDown' | 'AltLeftDown';

export interface ICameraInteraction  {
    active: boolean, 
    handler: CameraInteractionHandler
};

export interface ICameraCommand {
    execute(event?: CameraEventType): void;
}

export class RotateCommand implements ICameraCommand {
    constructor(private camera: Camera) {}

    public execute(event: MouseEvent): void {
        const state = this.camera.state;
        const [deltaX, deltaY] = state.getMouseDelta(event);
        state.alpha -= deltaX * state.rotationSpeed;
        state.beta -= deltaY * state.rotationSpeed;
        this.camera.notify();
    }
}

export class PanCommand implements ICameraCommand {
    constructor(private camera: Camera) {}

    execute(event: MouseEvent | KeyboardEvent): void {
        const state = this.camera.state;
        const [deltaX, deltaY] = state.getMouseDelta(event as MouseEvent);
        state.updateOffsets(deltaX, deltaY);
        state.target.copy(state.target.add(state.panOffset));
        state.position.copy(state.position.add(state.panOffset));
        this.camera.notify();
    }
}

export class ZoomCommand implements ICameraCommand {
    constructor(private camera: Camera) {}

    public execute(event: WheelEvent): void {
        const state = this.camera.state;
        const zoomFactor = event.deltaY < 0 ? 1 + state.zoomSpeed : 1 - state.zoomSpeed;
        state.radius *= zoomFactor;
        if (this.camera.projection.zoom)
            this.camera.projection.zoom(zoomFactor);
        state.position.copy(state.target.subtract(state.forward.scale(state.radius)));
        this.camera.notify();
    }
}

export class KeyboardMoveCommand implements ICameraCommand {
    constructor(private camera: Camera) {}

    execute(): void {
        let moveX = 0, moveY = 0;
        const state = this.camera.state;
        if (state.keysPressed.ArrowUp    || state.keysPressed.KeyW) moveY += 1;
        if (state.keysPressed.ArrowDown  || state.keysPressed.KeyS) moveY -= 1;
        if (state.keysPressed.ArrowLeft  || state.keysPressed.KeyA) moveX += 1;
        if (state.keysPressed.ArrowRight || state.keysPressed.KeyD) moveX -= 1;
        if (moveX === 0 && moveY === 0) return;

        const length = Math.sqrt(moveX * moveX + moveY * moveY);
        moveX /= length; moveY /= length;

        state.updateOffsets(moveX, moveY);
        state.target.copy(state.target.add(state.panOffset));
        state.position.copy(state.position.add(state.panOffset));
        this.camera.notify();
    }
}

export class RollCommand implements ICameraCommand { 
    public lastGamma: number | null = 0;
    
    constructor(private camera: Camera) {}

    public execute(event: MouseEvent) {
        const boundaries = this.camera.canvas.getBoundingClientRect();
        const state = this.camera.state;   

        const dx = event.clientX - boundaries.left - boundaries.width / 2;
        const dy = event.clientY - boundaries.top - boundaries.height / 2;
        const currentGamma = Math.atan2(dy, dx);
    
        if (this.lastGamma === null) {
            this.lastGamma = currentGamma;
            return;
        }
    
        let deltaGamma = currentGamma - this.lastGamma;

        state.gamma += deltaGamma;
        state.updateTransform();
    
        this.lastGamma = currentGamma;
        this.camera.notify();
    }
}

export class CameraEventController {
    private interactions: Record<CameraInteractionType, ICameraInteraction>;
    private commands: Record<CameraInteractionType, ICameraCommand>;
    private inputStates: Record<CameraInputType, boolean>;
    private keyboardInterval: NodeJS.Timeout | null = null;
    private eventBuffer: EventBuffer;
    private lastMousePos = { x: 0, y: 0 };
    
    constructor(private camera: Camera) {
        this.eventBuffer = new EventBuffer(this.camera.canvas);
        this.commands = {
            rotate: new RotateCommand(this.camera),
            pan: new PanCommand(this.camera),
            zoom: new ZoomCommand(this.camera),
            keyboard: new KeyboardMoveCommand(this.camera),
            roll: new RollCommand(this.camera)
        };
        this.interactions = {
            rotate: { active: false, handler: this.handleRotating.bind(this) as CameraInteractionHandler},
            pan: { active: false, handler: this.handlePanning.bind(this) as CameraInteractionHandler},
            zoom: { active: false, handler: this.handleZooming.bind(this) as CameraInteractionHandler},
            keyboard: { active: false, handler: this.handleKeyboardMove.bind(this) as CameraInteractionHandler},
            roll: { active: false, handler: this.handleRolling.bind(this) as CameraInteractionHandler}
        };
        this.inputStates = {
            'LeftMouseDown': false,
            'RightMouseDown': false,
            'WheelDown': false,
            'AltLeftDown': false
        };
        this.setupPatterns();
        this.setupListeners();
    }

    private setupPatterns() {
        const createToggleCommand = (stateKey: CameraInputType, value: boolean) => ({
            execute: () => { this.inputStates[stateKey] = value; }
        });

        this.eventBuffer.addPattern("LeftMouseDown", {
            active: false,
            command: createToggleCommand('LeftMouseDown', true)
        });

        this.eventBuffer.addPattern("LeftMouseUp", {
            active: false,
            command: createToggleCommand('LeftMouseDown', false)
        });

        this.eventBuffer.addPattern("RightMouseDown", {
            active: false,
            command: createToggleCommand('RightMouseDown', true)
        });

        this.eventBuffer.addPattern("RightMouseUp", {
            active: false,
            command: createToggleCommand('RightMouseDown', false)
        });

        this.eventBuffer.addPattern("WheelDown", {
            active: false,
            command: createToggleCommand('WheelDown', true)
        });

        this.eventBuffer.addPattern("WheelUp", {
            active: false,
            command: createToggleCommand('WheelDown', false)
        });

        this.eventBuffer.addPattern("AltLeftDown", {
            active: false,
            command: {
                execute: () => { this.inputStates['AltLeftDown'] = true; }
            }
        });

        this.eventBuffer.addPattern("AltLeftUp", {
            active: false,
            command: {
                execute: () => { this.inputStates['AltLeftDown'] = false; }
            }
        });
    }

    private setupWheelListener() {
        this.camera.canvas.addEventListener('wheel', (event) => {
            event.preventDefault();
            this.interactions.zoom.active = true;
            this.handleZooming(event);
            this.interactions.zoom.active = false;
        }, { passive: false });
    }

    private setupMouseListener() {
        this.camera.canvas.addEventListener('mousedown', (event) => {
            if (event.button === 0) {
                if (this.inputStates.AltLeftDown) {
                    this.startInteraction(event, 'roll');
                } else {
                    this.startInteraction(event, 'rotate');
                }
            }
            ;
            if (event.button === 2)
                this.startInteraction(event, 'pan');
        });
    }

    private setupKeyboardListener() {
        window.addEventListener('keydown', (event) => {
            if (event.code === 'AltLeft') {
                this.eventBuffer.push({
                    type: 'Keyboard',
                    key: 'AltLeft',
                    state: 'Down',
                    timestamp: Date.now(),
                    event: event
                });
            }
        });

        window.addEventListener('keyup', (event) => {
            if (event.code === 'AltLeft') {
                this.eventBuffer.push({
                    type: 'Keyboard',
                    key: 'AltLeft',
                    state: 'Up',
                    timestamp: Date.now(),
                    event: event
                });
                return;
            }
        });
    }

    private setupListeners(): void {
        this.camera.canvas.addEventListener('contextmenu', (event) => event.preventDefault());
        this.setupWheelListener();
        this.setupMouseListener();
        this.setupKeyboardListener();
    }

    private startInteraction(event: MouseEvent | WheelEvent, type: CameraInteractionType) {
        this.camera.state.updateMousePosition(event);
        this.interactions[type].active = true;
        const onMouseMove = this.interactions[type].handler;
        const onMouseUp = () => {
            this.interactions[type].active = false;
            this.camera.canvas.removeEventListener('mousemove', onMouseMove);
            this.camera.canvas.removeEventListener('mouseup', onMouseUp);
        };
        this.camera.canvas.addEventListener('mousemove', onMouseMove, false);
        this.camera.canvas.addEventListener('mouseup', onMouseUp, false);
        if (type === 'roll') (this.commands.roll as RollCommand).lastGamma = null;
    }

    private handleRotating(event: MouseEvent): void {
        if (!this.interactions.rotate.active) return;
        this.commands.rotate.execute(event);
        this.camera.state.updateMousePosition(event);
    }
    private handlePanning(event: MouseEvent): void {
        if (!this.interactions.pan.active) return;
        this.commands.pan.execute(event);
        this.camera.state.updateMousePosition(event);
    }
    private handleZooming(event: WheelEvent): void {
        if (!this.interactions.zoom.active) return;
        this.commands.zoom.execute(event);
    }
    private handleKeyboardMove(): void {
        if (!this.interactions.keyboard.active) return;
        this.commands.keyboard.execute();
    }
    private handleRolling(event: MouseEvent): void {
        if (!this.interactions.roll.active) return;
        this.commands.roll.execute(event);
        this.camera.state.updateMousePosition(event);
    }
}

export class CameraState {
    public target!: Vector4;
    public position!: Vector4;
    public right!: Vector4;
    public up!: Vector4;
    public forward!: Vector4;
    public offsetX: Vector4 = new Vector4();
    public offsetY: Vector4 = new Vector4();
    public panOffset: Vector4 = new Vector4();
    public rotationX!: Quaternion;
    public rotationY!: Quaternion;
    public rotationZ!: Quaternion;
    public rotationQuaternion!: Quaternion;
    public rotationMatrix!: Matrix4;
    public radius!: number;
    public dirty: boolean = true;
    public alpha: number = 0;
    public beta: number = 0;
    public gamma: number = 0;
    public lastMouseX: number = 0;
    public lastMouseY: number = 0;
    public panSpeed: number = 0.0005;
    public zoomSpeed: number = 0.05;
    public rotationSpeed: number = 0.005;
    public keysPressed: { [key: string]: boolean } = {};

    constructor(target: Vector4, position: Vector4) {
        [this.target, this.position] = [target, position];
        [this.right, this.up, this.forward] = position.subtract(this.target).normalize().orthonormalBasis();
        this.radius = this.target.distance(this.position);
        this.updateTransform();
    }

    public getMouseDelta(event: MouseEvent): [number, number] {
        return [event.clientX - this.lastMouseX, event.clientY - this.lastMouseY];
    }

    public clampAngles(): void {
        this.alpha = ((this.alpha + Math.PI) % (2 * Math.PI)) - Math.PI;
        this.beta = Math.max(-Math.PI / 2 - 1e-3, Math.min(Math.PI / 2 + 1e-3, this.beta));
        this.gamma = ((this.gamma + Math.PI) % (2 * Math.PI)) - Math.PI;
    }

    public updateMousePosition(event: MouseEvent) {
        [this.lastMouseX, this.lastMouseY] = [event.clientX, event.clientY];
    }

    public updateOffsets(deltaX: number, deltaY: number) {
        this.offsetY.copy(this.right.scale(-deltaX * this.panSpeed * this.radius));
        this.offsetX.copy(this.up.scale(deltaY * this.panSpeed * this.radius));
        this.panOffset.copy(this.offsetY.add(this.offsetX));
    }

    public updateBasisVectors(): void {
        this.right.copy(this.rotationMatrix.getRightVector());
        this.up.copy(this.rotationMatrix.getUpVector());
        this.forward.copy(this.rotationMatrix.getForwardVector());
    }

    public updateTransform() {
        this.clampAngles();
        this.rotationX = Quaternion.fromAngleAxis(-this.alpha, Vector3.upward);
        this.rotationY = Quaternion.fromAngleAxis(-this.beta, Vector3.rightward);
        this.rotationZ = Quaternion.fromAngleAxis(this.gamma, Vector3.forward);
        this.rotationQuaternion = this.rotationX.multiply(this.rotationY).multiply(this.rotationZ);
        this.rotationMatrix = this.rotationQuaternion.toRotationMatrix();
        this.updateBasisVectors();
        this.position.copy(this.target.subtract(this.forward.scale(this.radius)));
    }
}