
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
                fragments.push(this.rasterizer.gradientLine(vertices, polygon as Line, false));
            }
            if (Render.drawOutlines && polygon instanceof Polygon) {
                const A = new Line(polygon.vA, polygon.vB, Color.white, Color.white);
                const B = new Line(polygon.vB, polygon.vC, Color.white, Color.white);
                const C = new Line(polygon.vC, polygon.vA, Color.white, Color.white);
                fragments.push(this.rasterizer.gradientLine(vertices, A, false));
                fragments.push(this.rasterizer.gradientLine(vertices, B, false));
                fragments.push(this.rasterizer.gradientLine(vertices, C, false));
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

const axes = new Model([
    new Vector3(0, 0, 0),
    new Vector3(2, 0, 0),
    new Vector3(0, 2, 0),
    new Vector3(0, 0, 2),
], [
    new Line(0, 1, Color.red, Color.red),
    new Line(0, 2, Color.green, Color.green),
    new Line(0, 3, Color.blue, Color.blue)
]);

const model = new Model([
        new Vector3(-1,-1,-1),
        new Vector3(-1, 1,-1),
        new Vector3( 1, 1,-1),
        new Vector3( 1,-1,-1),
        new Vector3(-1,-1, 1),
        new Vector3(-1, 1, 1),
        new Vector3( 1, 1, 1),
        new Vector3( 1,-1, 1)
],[  
        new Polygon(0,1,3, Color.black,  Color.green, Color.red),
        new Polygon(3,1,2, Color.red,    Color.green, Color.yellow),
        new Polygon(6,5,7, Color.white,  Color.cyan,  Color.magenta),
        new Polygon(7,5,4, Color.magenta,Color.cyan,  Color.blue),
        new Polygon(5,1,4, Color.cyan,   Color.green, Color.blue),
        new Polygon(4,1,0, Color.blue,   Color.green, Color.black),
        new Polygon(3,2,7, Color.red,    Color.yellow,Color.magenta),
        new Polygon(7,2,6, Color.magenta,Color.yellow,Color.white),
        new Polygon(2,1,5, Color.yellow, Color.green, Color.cyan),
        new Polygon(6,2,5, Color.white,  Color.yellow,Color.cyan),
        new Polygon(0,3,4, Color.black,  Color.red,   Color.blue),
        new Polygon(4,3,7, Color.blue,   Color.red,   Color.magenta),   
]);
const instances = [
    new Instance(new Mesh().sphere(1,10,10), new Vector3(0, 0, 0), new Matrix4, new Vector3(2, 2, 2)),
    new Instance(axes, new Vector3(0, 0, 0), new Matrix4, new Vector3(2, 2, 2))
    
];

let ambient = new Light('AMBIENT', {
    color: Color.white, 
    intensity: 0.75} as IAmbient);
let canvas = new Canvas(
    document.documentElement.clientWidth,
    document.documentElement.clientHeight,
    document.getElementsByClassName('canvas-container')[0] as HTMLElement);
let draw = new Draw(canvas);
let camera = new Camera(canvas, new Vector4(0,0,0), new Vector4(50,50,50), 0.1, 500, 90);
let render = Render.initialize(canvas, camera, instances, ambient);

Render.main();