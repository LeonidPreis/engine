
import { Camera } from "./camera";
import { Canvas } from "./canvas";
import { IInstance, Instance } from "./instance";
import { Matrix4 } from "./matrix";
import { Polygon } from "./polygon";
import { Vector4, Vector3} from "./vector";
import { Draw } from "./draw";
import { IModel, Model } from "./model";
import { Color } from "./color";
import { Mesh } from "./mesh";
import { VertexShader } from "./vertexShader";

export class Render {
    static coordinatesSystem: 'RHS' | 'LHS' = 'RHS';
    static drawMethod: 'wireframe' | 'filled' | 'shaded' | 'gradient' = 'filled';
    static drawOutlines: boolean = true;
    static renderInstance: Render;
    canvas: Canvas;
    camera: Camera;
    instances: Instance[];
    vertexShader: VertexShader;
    
    constructor(canvas: Canvas, camera: Camera, instances: Instance[]) {
        this.canvas = canvas;
        this.camera = camera;
        this.instances = instances;
        this.vertexShader = new VertexShader( this.canvas, this.camera)
    }

    static initialize(canvas: Canvas, camera: Camera, instances: Instance[]) {
        this.renderInstance = new Render(canvas, camera, instances);
    }

    scene(instances: IInstance[]) {
        for (let i = 0; i < instances.length; i++) {
            this.model(instances[i]);
        }
    }

    model(instance: Instance) {
        const modelData = this.vertexShader.getScreenVertices(instance);
        if (modelData !== null) {
            this.represent(modelData);
        }
    }

    represent(modelData: [Vector3[], Polygon[]]): void {
        const vertices: Vector3[] = modelData[0];
        const polygons: Polygon[] = modelData[1];
        for (var i = 0; i < polygons.length; i++) {
            const polygon = polygons[i]
            var screenA = vertices[polygon.vA];
            var screenB = vertices[polygon.vB];
            var screenC = vertices[polygon.vC];
            switch (Render.drawMethod) {
                case 'wireframe':
                    Draw.triangle.wireframe(screenA, screenB, screenC, polygon.cA.rgbaArray);
                    break;
                case 'filled':
                    Draw.triangle.filled(screenA, screenB, screenC, polygon.cA.rgbaArray);
                    break;
                case 'gradient':
                    Draw.triangle.gradient(screenA, screenB, screenC, polygon.cA.rgbaArray, polygon.cB.rgbaArray, polygon.cC.rgbaArray);
                    break;
            }
            if (Render.drawOutlines) {
                Draw.triangle.wireframe(screenA, screenB, screenC, [0, 255, 255, 255], false);
            }
        }
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

const model: IModel = new Model(
    [
        new Vector3(-1,-1,-1),
        new Vector3(-1, 1,-1),
        new Vector3( 1, 1,-1),
        new Vector3( 1,-1,-1),
        new Vector3(-1,-1, 1),
        new Vector3(-1, 1, 1),
        new Vector3( 1, 1, 1),
        new Vector3( 1,-1, 1)
    ],
    [
        new Polygon(0,1,3, new Color('RGBA',[0,0,0,255]),       new Color('RGBA',[0,255,0,255]),   new Color('RGBA',[255,0,0,255])),
        new Polygon(3,1,2, new Color('RGBA',[255,0,0,255]),     new Color('RGBA',[0,255,0,255]),   new Color('RGBA',[255,255,0,255])),
        new Polygon(6,5,7, new Color('RGBA',[255,255,255,255]), new Color('RGBA',[0,255,255,255]), new Color('RGBA',[255,0,255,255])),
        new Polygon(7,5,4, new Color('RGBA',[255,0,255,255]),   new Color('RGBA',[0,255,255,255]), new Color('RGBA',[0,0,255,255])),
        new Polygon(5,1,4, new Color('RGBA',[0,255,255,255]),   new Color('RGBA',[0,255,0,255]),   new Color('RGBA',[0,0,255,255])),
        new Polygon(4,1,0, new Color('RGBA',[0,0,255,255]),     new Color('RGBA',[0,255,0,255]),   new Color('RGBA',[0,0,0,255])),
        new Polygon(3,2,7, new Color('RGBA',[255,0,0,255]),     new Color('RGBA',[255,255,0,255]), new Color('RGBA',[255,0,255,255])),
        new Polygon(7,2,6, new Color('RGBA',[255,0,255,255]),   new Color('RGBA',[255,255,0,255]), new Color('RGBA',[255,255,255,255])),
        new Polygon(2,1,5, new Color('RGBA',[255,255,0,255]),   new Color('RGBA',[0,255,0,255]),   new Color('RGBA',[0,255,255,255])),
        new Polygon(6,2,5, new Color('RGBA',[255,255,255,255]), new Color('RGBA',[255,255,0,255]), new Color('RGBA',[0,255,255,255])),
        new Polygon(0,3,4, new Color('RGBA',[0,0,0,255]),       new Color('RGBA',[255,0,0,255]),   new Color('RGBA',[0,0,255,255])),
        new Polygon(4,3,7, new Color('RGBA',[0,0,255,255]),     new Color('RGBA',[255,0,0,255]),   new Color('RGBA',[255,0,255,255])),   
    ]
);

var instance: IInstance = new Instance(
    new Mesh().sphere(),
    new Vector3(0,0,0),
    new Matrix4,
    new Vector3(6,6,6)
);

const instances: IInstance[] = [
    instance
];

let canvas = new Canvas(
    document.documentElement.clientWidth,
    document.documentElement.clientHeight,
    document.getElementsByClassName('canvas-container')[0] as HTMLElement);
let draw = new Draw(canvas);
let camera = new Camera(canvas, new Vector4(0,0,0), new Vector4(50,50,50), 0.1, 500, 90);
let render = Render.initialize(canvas, camera, instances);

Render.main();