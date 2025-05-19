type InputType = 'Keyboard' | 'Mouse';
type InputState = 'Down' | 'Up';
type EventType = KeyboardEvent | WheelEvent | MouseEvent;

export interface IEventInput {
    type: InputType;
    key: string;
    state: InputState;
    timestamp: number;
    event: EventType;
}

export interface ICommand {
    execute(event?: EventType): void;
}

export interface ICommandHandler {
    active: boolean;
    command: ICommand;
}

export class EventBuffer {
    private buffer: IEventInput[];
    private bufferSize: number = 10;
    private element: HTMLElement;
    private patterns: Map<string, ICommandHandler> = new Map();
    private activeEvent?: EventType;
    private lastEvents: Map<string, EventType> = new Map();
    private listeners: {[key: string]: (event: InputType | EventType) => void} = {};

    constructor(element: HTMLElement) {
        this.element = element;
        this.buffer = [];
        this.setupListeners();
    }

    public addPattern(
        pattern: string, 
        commandHandler: ICommandHandler
    ): void {
        this.patterns.set(pattern, commandHandler);
    }

    public removePattern(pattern: string): void {
        this.patterns.delete(pattern);
    }

    private checkAllPatterns(): void {
        for (const [pattern, handler] of this.patterns) {
            const isMatch = this.matches(pattern);
            if (isMatch && !handler.active) {
                handler.active = true;
                if (handler.command) handler.command.execute(this.activeEvent);
            } else if (!isMatch && handler.active) {
                handler.active = false;
            }
        }
    }

    public push(event: IEventInput): void {
        this.buffer.push(event);
        this.lastEvents.set(event.key + event.state, event.event);
        if (this.buffer.length > this.bufferSize) this.buffer.shift();
        this.checkAllPatterns();
    }

    private getRecent(pattern: string) {
        const tokensAmount = pattern.length - pattern.replace(/\+/g, "").length + 1;
        return this.buffer.slice(-tokensAmount);
    }

    public getLastEvent(type: string): EventType | undefined {
        return this.lastEvents.get(type);
    }

    private setupListeners() {
        this.listeners.keydown = (event) => this.handleKey(event as KeyboardEvent, 'Down');
        this.listeners.keyup = (event) => this.handleKey(event as KeyboardEvent, 'Up');
        this.listeners.mousedown = (event) => this.handleMouse(event as MouseEvent, 'Down');
        this.listeners.mouseup = (event) => this.handleMouse(event as MouseEvent, 'Up');
        this.listeners.wheel = (event) => this.handleMouseWheel(event as WheelEvent);

        this.element.addEventListener('keydown', this.listeners.keydown);
        this.element.addEventListener('keyup', this.listeners.keyup);
        this.element.addEventListener('mousedown', this.listeners.mousedown);
        this.element.addEventListener('mouseup', this.listeners.mouseup);
        this.element.addEventListener('wheel', this.listeners.wheel);
    }

    private handleKey(event: KeyboardEvent, state: InputState) {
        this.push({
            type: 'Keyboard',
            key: event.code,
            state: state,
            timestamp: Date.now(),
            event: event
        });
        this.activeEvent = event;
    }

    private handleMouse(event: MouseEvent, state: InputState) {
        var button: string;
        switch (event.button) {
            case 0: button = 'LeftMouse'; break;
            case 1: button = 'MiddleMouse'; break;
            case 2: button = 'RightMouse'; break;
            default:button = 'MouseButton'; break;
        }
        this.push({
            type: 'Mouse',
            key: button,
            state: state,
            timestamp: Date.now(),
            event: event
        });
        this.activeEvent = event;
    }

    private handleMouseWheel(event: WheelEvent) {
        this.push({
            type: 'Mouse',
            key: 'Wheel',
            state: event.deltaY < 0 ? 'Down' : 'Up',
            timestamp: Date.now(),
            event: event
        });
        this.activeEvent = event;
    }

    private getTokens(pattern: string) {
        return pattern.split('+').map(token => token.trim());
    }

    public matches(pattern: string): boolean {
        const recentTokens = this.getRecent(pattern);
        const tokenStrings = this.getTokens(pattern);
        
        if (recentTokens.length !== tokenStrings.length) return false;
        
        for (let i = 0; i < tokenStrings.length; i++) {
            let command = (recentTokens[i].key).concat('', recentTokens[i].state)
            if (command !== tokenStrings[i]) return false;
        }
        return true;
    }
}
