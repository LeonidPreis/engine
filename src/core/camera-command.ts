import { Camera } from "./camera";

export type CameraEventType = MouseEvent | WheelEvent | KeyboardEvent;
export type CameraInteractionType = 'rotate' | 'pan' | 'zoom' | 'keyboard';
export type CameraInteractionHandler = (event: MouseEvent | WheelEvent | KeyboardEvent) => void;

export interface Subscriber {
    update(): void;
}
export interface ICameraInteraction {
    active: boolean, 
    handler: CameraInteractionHandler
};

export interface ICameraCommand {
    execute(event?: CameraEventType): void;
}

export class RotateCommand implements ICameraCommand {
    constructor(private camera: Camera) {}

    execute(event: MouseEvent): void {
        const [deltaX, deltaY] = this.camera.getMouseDelta(event);
        this.camera.theta -= deltaX * this.camera.rotationSpeed;
        this.camera.phi -= deltaY * this.camera.rotationSpeed;
        this.camera.phi = Math.max(-Math.PI/2 - 1e-3, Math.min(Math.PI/2 + 1e-3, this.camera.phi));
        this.camera.updateMousePosition(event);
        this.camera.dirty = true;
        this.camera.notify();
    }
}

export class PanCommand implements ICameraCommand {
    constructor(private camera: Camera) {}

    execute(event: MouseEvent | KeyboardEvent): void {
        const [deltaX, deltaY] = this.camera.getMouseDelta(event as MouseEvent);
        this.camera.horizontalOffset.copy(this.camera.right.scale(-deltaX * this.camera.panSpeed * this.camera.radius));
        this.camera.verticalOffset.copy(this.camera.up.scale(deltaY * this.camera.panSpeed * this.camera.radius));
        this.camera.panOffset.copy(this.camera.horizontalOffset.add(this.camera.verticalOffset));
        this.camera.target.copy(this.camera.target.add(this.camera.panOffset));
        this.camera.position.copy(this.camera.position.add(this.camera.panOffset));
        this.camera.updateMousePosition(event as MouseEvent);
        this.camera.dirty = true;
        this.camera.notify();
    }
}

export class ZoomCommand implements ICameraCommand {
    constructor(private camera: Camera) {}

    execute(event: WheelEvent): void {
        const zoomFactor = event.deltaY < 0 ? 1 + this.camera.zoomSpeed : 1 - this.camera.zoomSpeed;
        this.camera.radius *= zoomFactor;
        if (this.camera.projection.zoom)
            this.camera.projection.zoom(zoomFactor);
        this.camera.position.copy(this.camera.target.subtract(this.camera.forward.scale(this.camera.radius)));
        this.camera.dirty = true;
        this.camera.notify();
    }
}

export class KeyboardMoveCommand implements ICameraCommand {
    constructor(private camera: Camera) {}

    execute(): void {
        let moveX = 0, moveY = 0;
        
        if (this.camera.keysPressed.ArrowUp    || this.camera.keysPressed.KeyW) moveY += 1;
        if (this.camera.keysPressed.ArrowDown  || this.camera.keysPressed.KeyS) moveY -= 1;
        if (this.camera.keysPressed.ArrowLeft  || this.camera.keysPressed.KeyA) moveX += 1;
        if (this.camera.keysPressed.ArrowRight || this.camera.keysPressed.KeyD) moveX -= 1;
        if (moveX === 0 && moveY === 0) return;

        const length = Math.sqrt(moveX * moveX + moveY * moveY);
        moveX /= length; moveY /= length;

        this.camera.horizontalOffset.copy(this.camera.right.scale(-moveX * this.camera.panSpeed * this.camera.radius));
        this.camera.verticalOffset.copy(this.camera.up.scale(moveY * this.camera.panSpeed * this.camera.radius));
        this.camera.panOffset.copy(this.camera.horizontalOffset.add(this.camera.verticalOffset));
        this.camera.target.copy(this.camera.target.add(this.camera.panOffset));
        this.camera.position.copy(this.camera.position.add(this.camera.panOffset));
        this.camera.dirty = true;
        this.camera.notify();
    }
}

export class CameraEventController {
    private interactions: Record<CameraInteractionType, ICameraInteraction>;
    private commands: Record<CameraInteractionType, ICameraCommand>;
    private keyboardInterval: NodeJS.Timeout | null = null;
    
    constructor(private camera: Camera) {
        this.setupListeners();
        this.commands = {
            rotate: new RotateCommand(this.camera),
            pan: new PanCommand(this.camera),
            zoom: new ZoomCommand(this.camera),
            keyboard: new KeyboardMoveCommand(this.camera)
        };
        this.interactions = {
            rotate: { active: false, handler: this.handleRotating.bind(this) as CameraInteractionHandler},
            pan: { active: false, handler: this.handlePanning.bind(this) as CameraInteractionHandler},
            zoom: { active: false, handler: this.handleZooming.bind(this) as CameraInteractionHandler},
            keyboard: { active: false, handler: this.handleKeyboardMove.bind(this) as CameraInteractionHandler}
        };
        this.setupListeners();
    }

    private setupListeners(): void {
        this.camera.canvas.addEventListener('contextmenu', (event) => event.preventDefault());
        this.camera.canvas.addEventListener('wheel', (event) => {
            event.preventDefault();
            this.handleZooming(event);
        }, { passive: false });
        this.camera.canvas.addEventListener('mousedown', (event) => {
            if (event.button === 0) this.startInteraction(event, 'rotate');
            if (event.button === 2) this.startInteraction(event, 'pan');
        });

        window.addEventListener('keydown', (event) => {
            if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'KeyW', 'KeyA', 'KeyS', 'KeyD'].includes(event.code)) {
                this.camera.keysPressed[event.code] = true;
                if (!this.keyboardInterval) {
                    this.keyboardInterval = setInterval(() => this.handleKeyboardMove(), 16);
                }
            }
        });

        window.addEventListener('keyup', (event) => {
            if (this.camera.keysPressed[event.code]) {
                delete this.camera.keysPressed[event.code];
                if (Object.keys(this.camera.keysPressed).length === 0 && this.keyboardInterval) {
                    clearInterval(this.keyboardInterval);
                    this.keyboardInterval = null;
                }
            }
        });
    }

    private startInteraction(event: MouseEvent | WheelEvent, type: CameraInteractionType) {
        this.camera.updateMousePosition(event);
        this.interactions[type].active = true;
        const onMouseMove = this.interactions[type].handler;
        const onMouseUp = () => {
            this.interactions[type].active = false;
            this.camera.canvas.removeEventListener('mousemove', onMouseMove);
            this.camera.canvas.removeEventListener('mouseup', onMouseUp);
        };
        this.camera.canvas.addEventListener('mousemove', onMouseMove, false);
        this.camera.canvas.addEventListener('mouseup', onMouseUp, false);
    }

    private handleRotating(event: MouseEvent): void {
        if (!this.interactions.rotate.active) return;
        this.commands.rotate.execute(event);
    }
    private handlePanning(event: MouseEvent): void {
        if (!this.interactions.pan.active) return;
        this.commands.pan.execute(event);
    }
    private handleZooming(event: WheelEvent): void {
        if (!this.interactions.zoom.active) return;
        this.commands.zoom.execute(event);
    }
    private handleKeyboardMove(): void {
        if (!this.interactions.keyboard.active) return;
        this.commands.keyboard.execute();
    }
}