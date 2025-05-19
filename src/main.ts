import { Camera } from "./core/camera";
import { Euler, RotationOrder } from "./core/euler";
import { Instance } from "./core/instance";
import { PrimitiveType, Model } from "./core/model";
import { OrthographicProjection, OrthographicProjectionDescriptor, PerspectiveProjection } from "./core/projection";
import { WebGPU } from "./core/renderer";
import { Transformation } from "./core/transformation";
import { Vector3 } from "./core/vector3";
import { Vector4 } from "./core/vector4";
import { Mesh } from "./core/mesh"
import { Color } from "./core/color";
import { EventBuffer } from "./core/event-buffer"

const viewportContainer = document.getElementById('viewport-container');
const canvas = document.getElementById("canvas") as HTMLCanvasElement;
const ratio = window.devicePixelRatio || 1;
canvas.width = viewportContainer!.clientWidth * ratio;
canvas.height = viewportContainer!.clientHeight * ratio;
canvas.style.width = `${viewportContainer!.clientWidth}px`;
canvas.style.height = `${viewportContainer!.clientHeight}px`;
window.addEventListener('DOMContentLoaded', () => {
    const eventBuffer = new EventBuffer(canvas as HTMLElement);
});

const camera = new Camera(
    canvas,
    new Vector4(0,0,0),
    new Vector4(1000,1000,1000),
    new OrthographicProjection({
        left: -canvas.width / 2,
        right: canvas.width / 2,
        top: canvas.height / 2,
        bottom: -canvas.height / 2,
        near: 0.1,
        far: 3000,
    } as OrthographicProjectionDescriptor)
);

const cube = new Model(
    new Float32Array([
        -10, -10, -10, 10, -10, -10, 10, 10, -10, -10, 10, -10,
        -10, -10, 10, 10, -10, 10, 10, 10, 10, -10, 10, 10,
    ]), new Uint32Array([
        0, 3, 1, 3, 2, 1, 5, 1, 2, 2, 6, 5,
        1, 5, 4, 0, 1, 4, 7, 2, 3, 7, 6, 2,
        5, 6, 7, 4, 5, 7, 4, 7, 3, 0, 4, 3
    ]), new Float32Array([
        0, 0, 0, 255,
        255, 0, 0, 255,
        255, 255, 0, 255,
        0, 255, 0, 255,
        0, 0, 255, 255,
        255, 0, 255, 255,
        255, 255, 255, 255,
        0, 255, 255, 255,
    ]), PrimitiveType.polygon
)

const axisX = new Instance(Mesh.arrow(new Vector3(0,0,0), new Vector3(50,0,0), new Color('RGBA', [255,0,0,255]),10,0.5,2));
const axisY = new Instance(Mesh.arrow(new Vector3(0,0,0), new Vector3(0,50,0), new Color('RGBA', [0,255,0,255]),10,0.5,2));
const axisZ = new Instance(Mesh.arrow(new Vector3(0,0,0), new Vector3(0,0,50), new Color('RGBA', [0,0,255,255]),10,0.5,2));

const rad = Math.PI / 180;
const instances = [
    axisX,
    axisY,
    axisZ,
    new Instance(cube.clone(), new Transformation(new Vector3(-250, -250, -250))),
    new Instance(cube.clone(), new Transformation(new Vector3(-250, 250, -250))),
    new Instance(cube.clone(), new Transformation(new Vector3(250, 250, -250))),
    new Instance(cube.clone(), new Transformation(new Vector3(250, -250, -250))),
    new Instance(cube.clone(), new Transformation(new Vector3(-250, -250, 250))),
    new Instance(cube.clone(), new Transformation(new Vector3(-250, 250, 250))),
    new Instance(cube.clone(), new Transformation(new Vector3(250, 250, 250))),
    new Instance(cube.clone(), new Transformation(new Vector3(250, -250, 250))),
    new Instance(cube.clone(), new Transformation(new Vector3(-250, 0, 0), new Euler(10 * rad, 20 * rad, 30 * rad, RotationOrder.XYZ, true), new Vector3(0.5, 0.5, 0.5))),
    new Instance(cube.clone(), new Transformation(new Vector3(250, 0, 0), new Euler(10 * rad, 20 * rad, 30 * rad, RotationOrder.XYZ, true), new Vector3(0.5, 0.5, 0.5))),
    new Instance(cube.clone(), new Transformation(new Vector3(0, 250, 0), new Euler(10 * rad, 20 * rad, 30 * rad, RotationOrder.XYZ, true), new Vector3(0.5, 0.5, 0.5))),
    new Instance(cube.clone(), new Transformation(new Vector3(0, -250, 0), new Euler(10 * rad, 20 * rad, 30 * rad, RotationOrder.XYZ, true), new Vector3(0.5, 0.5, 0.5))),
    new Instance(cube.clone(), new Transformation(new Vector3(0, 0, -250), new Euler(10 * rad, 20 * rad, 30 * rad, RotationOrder.XYZ, true), new Vector3(0.5, 0.5, 0.5))),
    new Instance(cube.clone(), new Transformation(new Vector3(0, 0, 250), new Euler(10 * rad, 20 * rad, 30 * rad, RotationOrder.XYZ, true), new Vector3(0.5, 0.5, 0.5))),
    new Instance(cube.clone(), new Transformation(new Vector3(0, 0, 0))),
];

const webGPU = new WebGPU(canvas, camera, instances);
async function main() {
    await webGPU.init();
    webGPU.render(camera);
}
main();


