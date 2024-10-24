
import { Camera } from "./camera";
import { Canvas } from "./canvas";
import { IInstance, Instance } from "./instance";
import { Matrix } from "./matrix";
import { Polygon } from "./polygon";
import { Vector } from "./vector";
import { Draw } from "./draw";
import { IModel, Model } from "./model";
import { Color } from "./color";

export class Render {
    static drawMethod: 'wireframe' | 'filled' | 'shaded' | 'gradient' = 'gradient';
    static drawOutlines: boolean = false;
    static renderInstance: Render;
    canvas: Canvas;
    camera: Camera;
    instances: Instance[];
    
    constructor(canvas: Canvas, camera: Camera, instances: Instance[]) {
        this.canvas = canvas;
        this.camera = camera;
        this.instances = instances;
    }

    static initialize(canvas: Canvas, camera: Camera, instances: Instance[]) {
        this.renderInstance = new Render(canvas, camera, instances);
    }

    model(camera: Camera, instance: Instance) {
        const viewed: Vector[] = [];
        const cameraView: Matrix = camera.view();
        const cameraProjection: Matrix = camera.getProjectionMatrix();
        const cameraDirection: Vector = new Vector([0,0,-1,1]);

        for (let i = 0; i < instance.model.vertices.length; i++) {
            const local: Vector = instance.model.vertices[i];
            const global: Vector = Matrix.multiply.vector(instance.transformation, local);
            const view: Vector = Matrix.multiply.vector(cameraView, global);
            viewed.push(view);
        }

        if (instance.model.polygons[0] instanceof Polygon) {
            for (let i = 0; i < instance.model.polygons.length; i++) {
                const polygon: Polygon = instance.model.polygons[i];
                const normal: Vector = polygon.normal(viewed);
                const dot: number = Vector.dot(normal, cameraDirection);

                if (dot > 0) {
                    const ndcA: Vector = Matrix.multiply.vector(cameraProjection, viewed[polygon.vA]);
                    const ndcB: Vector = Matrix.multiply.vector(cameraProjection, viewed[polygon.vB]);
                    const ndcC: Vector = Matrix.multiply.vector(cameraProjection, viewed[polygon.vC]);
                    const screenA: Vector = camera.perspectiveDivision(ndcA);
                    const screenB: Vector = camera.perspectiveDivision(ndcB);
                    const screenC: Vector = camera.perspectiveDivision(ndcC);

                    switch(Render.drawMethod) {
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
                        Draw.triangle.wireframe(screenA, screenB, screenC,[0,255,255,255]);
                    }
                }
            }
        }
    }

    scene(camera: Camera, instances: IInstance[]) {
        for (let i = 0; i < instances.length; i++) {
            this.model(camera, instances[i]);
        }
    }

    static main() {
        if (!this.renderInstance) {
            throw new Error('Render instance is not initialized.');
        }

        this.renderInstance.canvas.clear();
        this.renderInstance.scene(this.renderInstance.camera, this.renderInstance.instances);
        this.renderInstance.canvas.update();
    }
}

const model: IModel = new Model(
    [
        new Vector([-1,-1,-1, 1]),
        new Vector([-1, 1,-1, 1]),
        new Vector([ 1, 1,-1, 1]),
        new Vector([ 1,-1,-1, 1]),
        new Vector([-1,-1, 1, 1]),
        new Vector([-1, 1, 1, 1]),
        new Vector([ 1, 1, 1, 1]),
        new Vector([ 1,-1, 1, 1])
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
    model,
    new Vector([0,0,0,1]),
    Matrix.identity(4),
    new Vector([1,1,1,1])
);

const instances: IInstance[] = [
    instance
];

let canvasElement = document.getElementById('canvas') as HTMLCanvasElement;
let canvas = new Canvas(canvasElement);
let draw = new Draw(canvas);
let camera = new Camera(canvas, new Vector([0,0,0,1]), new Vector([10,10,10,1]), 0.1, 50, 90);
camera.setProjection('ONE POINT');
let render = Render.initialize(canvas, camera, instances);

Render.main();
