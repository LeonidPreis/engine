export class Canvas {
    public canvas: HTMLCanvasElement;
    private context: CanvasRenderingContext2D;
    private buffer: ImageData;
    public zbuffer: number[];
    public aspect: number;
    private step: number;
    private dpi: number;
    public ratio: { x: number; y: number };

    constructor(canvas?: HTMLCanvasElement) {
        if (!canvas) {
            this.canvas = document.createElement('canvas');
            this.canvas.id = "canvas";
            document.getElementsByClassName('canvas-container')[0].appendChild(this.canvas);
        } else {
            this.canvas = canvas;
        }
        this.context = this.canvas.getContext('2d')!;
        this.canvas.width = document.documentElement.clientWidth;
        this.canvas.height = document.documentElement.clientHeight;
        this.buffer = this.context.getImageData(0, 0, this.canvas.width, this.canvas.height);
        this.zbuffer = new Array(this.canvas.width*this.canvas.height).fill(Infinity);
        this.aspect = this.canvas.width / this.canvas.height;
        this.step = this.buffer.width * 4;
        this.context.imageSmoothingEnabled = false;
        this.dpi = 1 / 2.54 * this.context.miterLimit;
        this.ratio = {
            x: this.canvas.width > this.canvas.height ? this.canvas.width / this.canvas.height : this.canvas.height / this.canvas.width,
            y: this.canvas.width > this.canvas.height ? this.canvas.height / this.canvas.width : this.canvas.width / this.canvas.height
        }
    }

    public set width(w: number) {
        this.canvas.width = w;
        this.buffer = this.context.createImageData(w, this.height);
        this.zbuffer = new Array(w * this.canvas.height);
    }

    public set height(h: number) {
        this.canvas.height = h;
        this.buffer = this.context.createImageData(this.width, h);
        this.zbuffer = new Array(this.canvas.width * h);
    }

    public get width(): number {
        return this.canvas.width;
    }

    public get height(): number {
        return this.canvas.height;
    }

    clear(): void {
        const data = new Uint32Array(this.buffer.data.buffer);
        data.fill(0);
        this.zbuffer.fill(Infinity);
    }

    update(): void { 
        this.context.putImageData(this.buffer, 0, 0);
    }

    updateNearestZ(x: number, y:number, z:number): boolean | void {
        x = this.canvas.width / 2 + (x|0);
        y = this.canvas.height/ 2 - (y|0) - 1;
        if (x < 0 || y < 0 || x >= this.canvas.width || y >= this.canvas.height) {
            return;
        }
        const offset = this.canvas.width * y + x;
        if (this.zbuffer[offset] > z) {
            this.zbuffer[offset] = z;
            return true;
        }
        return false;
    }

    putPixel(x: number, y: number, color: [number, number, number, number]): void {
        x = this.canvas.width / 2 + (x|0);
        y = this.canvas.height/ 2 - (y|0) - 1;
        if (x < 0 || y < 0 || x >= this.canvas.width || y >= this.canvas.height) {
            return;
        }
        var offset = 4 * x + this.step * y;
        this.buffer.data[offset++] = color[0];
        this.buffer.data[offset++] = color[1];
        this.buffer.data[offset++] = color[2];
        this.buffer.data[offset++] = color[3] || 255;
    }
}