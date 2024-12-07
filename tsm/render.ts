
import { Camera } from "./camera";
import { Canvas } from "./canvas";
import { IInstance, Instance } from "./instance";
import { Matrix4 } from "./matrix";
import { Polygon, Line } from "./polygon";
import { Vector4, Vector3} from "./vector";
import { Draw } from "./draw";
import { IModel, Model } from "./model";
import { Color } from "./color";
import { Mesh } from "./mesh";
import { VertexShader } from "./vertexShader";
import { Rasterizer, IFragment } from "./rasterizer";
import { FragmentShader } from "./fragmentShader";
import { Light, IAmbient, IPointLight } from "./light";

export class Render {
    static coordinatesSystem: 'RHS' | 'LHS' = 'RHS';
    static drawMethod: 'wireframe' | 'filled' | 'shaded' | 'gradient' = 'filled';
    static drawOutlines: boolean = true;
    static renderInstance: Render;
    canvas: Canvas;
    camera: Camera;
    instances: Instance[];
    lights: Light;
    vertexShader: VertexShader;
    rasterizer: Rasterizer;
    fragmentShader: FragmentShader
    
    constructor(canvas: Canvas, camera: Camera, instances: Instance[], lights: Light) {
        this.canvas = canvas;
        this.camera = camera;
        this.instances = instances;
        this.lights = lights;
        this.vertexShader = new VertexShader( this.canvas, this.camera);
        this.rasterizer = new Rasterizer(this.canvas);
        this.fragmentShader = new FragmentShader(this.canvas);
    }

    static initialize(canvas: Canvas, camera: Camera, instances: Instance[], lights: Light) {
        this.renderInstance = new Render(canvas, camera, instances, lights);
    }

    scene(instances: IInstance[]) {
        for (let i = 0; i < instances.length; i++) {
            const modelData = this.vertexShader.getScreenVertices(instances[i]);
            if (modelData !== null) {
                this.represent(modelData);
            }
        }
    }

    represent(modelData: [Vector3[], (Polygon | Line)[]]): void {
        const vertices: Vector3[] = modelData[0];
        const polygons: (Polygon | Line)[] = modelData[1];
        var fragments: IFragment[] = [];
        for (var i = 0; i < polygons.length; i++) {
            const polygon = polygons[i];
            if (polygon instanceof Polygon) {
                fragments.push(this.rasterizer.gradientPolygon(vertices, polygons as Polygon[], i));
            }
            if (polygon instanceof Line) {
                fragments.push(this.rasterizer.gradientLine(vertices, polygon as Line));
            }
        }
        this.fragmentShader.insert(fragments, this.lights, vertices, polygons);
    }

    static main() {
        if (!this.renderInstance) {
            throw new Error('Render instance is not initialized.');
        }
        this.renderInstance.canvas.clear();
        this.renderInstance.scene(this.renderInstance.instances);
        this.renderInstance.canvas.update();
    }
}

const model = new Model([
    new Vector3(-40,0,-5),
    new Vector3(10,15,15),
    new Vector3(5,5,-10),
    new Vector3(35,-5,5)
], [
    new Polygon(0, 1, 2, new Color('RGBA', [255, 255, 0, 255]), new Color('RGBA', [255, 255, 0, 255]), new Color('RGBA', [255, 255, 0, 255])),
    new Polygon(1, 3, 2, new Color('RGBA', [0, 255, 255, 255]), new Color('RGBA', [0, 255, 255, 255]), new Color('RGBA', [0, 255, 255, 255]))
]);
const axes = new Model([
    new Vector3(0, 0, 0),
    new Vector3(10, 0, 0),
    new Vector3(0, 10, 0),
    new Vector3(0, 0, 10),    
],[
    new Line(0, 1, new Color('RGBA', [255, 0, 0, 255]), new Color('RGBA', [255, 0, 0, 255])),
    new Line(0, 2, new Color('RGBA', [0, 200, 0, 255]), new Color('RGBA', [0, 200, 0, 255])),
    new Line(0, 3, new Color('RGBA', [0, 0, 255, 255]), new Color('RGBA', [0, 0, 255, 255]))
]);

const instances = [
    new Instance(model, new Vector3(0, 0, 0), new Matrix4, new Vector3(2, 2, 2)),
    new Instance(axes, new Vector3(0, 0, 0), new Matrix4, new Vector3(2, 2, 2))
];

let ambient = new Light('AMBIENT', {
    color: new Color('RGBA',[255,255,255,255]), 
    intensity: 0.75} as IAmbient);
let canvas = new Canvas(
    document.documentElement.clientWidth,
    document.documentElement.clientHeight,
    document.getElementsByClassName('canvas-container')[0] as HTMLElement);
let draw = new Draw(canvas);
let camera = new Camera(canvas, new Vector4(0,0,0), new Vector4(50,50,50), 0.1, 500, 90);
let render = Render.initialize(canvas, camera, instances, ambient);

Render.main();