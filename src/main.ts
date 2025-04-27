import { ArcballCamera } from "./core/camera";
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


const canvas = document.getElementById("canvas") as HTMLCanvasElement;
const ratio = window.devicePixelRatio || 1;
canvas.width = window.innerWidth * ratio;
canvas.height = window.innerHeight * ratio;
canvas.style.width = `${window.innerWidth}px`;
canvas.style.height = `${window.innerHeight}px`;

const camera = new ArcballCamera(
    canvas,
    new Vector4(0,0,0),
    new Vector4(100,100,100),
    new OrthographicProjection({
        left: -canvas.width / 2,
        right: canvas.width / 2,
        top: canvas.height / 2,
        bottom: -canvas.height / 2,
        near: 0.1,
        far: 500,
    } as OrthographicProjectionDescriptor)
);

const cube = new Instance(
    new Model(
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
);

const axisX = new Instance(Mesh.arrow(new Vector3(0,0,0), new Vector3(20,0,0), new Color('RGBA', [255,0,0,255])));
const axisY = new Instance(Mesh.arrow(new Vector3(0,0,0), new Vector3(0,20,0), new Color('RGBA', [0,255,0,255])));
const axisZ = new Instance(Mesh.arrow(new Vector3(0,0,0), new Vector3(0,0,20), new Color('RGBA', [0,0,255,255])));
const target = new Instance(Mesh.sphere(3,16,8,new Color('RGBA',[128,0,128,255])),
new Transformation(new Vector4(40,50,-60)));
const position = new Instance(Mesh.sphere(3,16,8,new Color('RGBA',[128,0,128,255])),
new Transformation(new Vector4(80,100,-20)));
const direction = new Instance(Mesh.arrow(new Vector3(40,50,60), new Vector3(80,100,20), new Color('RGBA', [255,255,255,255]),5,3,1));
const forward = new Instance(Mesh.arrow(new Vector3(80,100,20), new Vector3(72,110,12), new Color('RGBA', [255,255,0,255]),5,3,1));
const right = new Instance(Mesh.arrow(new Vector3(80,100,20), new Vector3(72,100,12), new Color('RGBA', [0,255,255,255]),5,3,1));
const up = new Instance(Mesh.arrow(new Vector3(80,100,20), new Vector3(75,108,25), new Color('RGBA', [255,0,255,255]),5,3,1));

const instances = [
    axisX,
    axisY,
    axisZ,
    position,
    direction,
    forward,
    right,
    up,
    //cube,
];

const webGPU = new WebGPU(canvas, camera, instances);
async function main() {
    await webGPU.init();
    webGPU.render(camera);
}
main();


