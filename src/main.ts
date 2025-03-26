import { ArcballCamera } from "./core/camera";
import { Euler, RotationOrder } from "./core/euler";
import { Instance } from "./core/instance";
import { DrawMode, Model } from "./core/model";
import { PerspectiveProjection } from "./core/projection";
import { WebGPU } from "./core/renderer";
import { Transformation } from "./core/transformation";
import { Vector3 } from "./core/vector3";
import { Vector4 } from "./core/vector4";
import { Mesh } from "./core/mesh"
import { Color } from "./core/color";

const canvas = document.getElementById("canvas") as HTMLCanvasElement;
const camera = new ArcballCamera(
    canvas,
    new Vector4(0,0,0), new Vector4(4,4,8),
    new PerspectiveProjection({aspect: canvas.clientWidth / canvas.clientHeight}))

const cube = new Model(
    new Float32Array([
        -1,-1,-1,   1,-1,-1,   1, 1,-1,   -1, 1,-1,
        -1,-1, 1,   1,-1, 1,   1, 1, 1,   -1, 1, 1,
    ]),
    new Uint32Array([
        0,3,1,   3,2,1,   5,1,2,   2,6,5,
        1,5,4,   0,1,4,   7,2,3,   7,6,2,
        5,6,7,   4,5,7,   4,7,3,   0,4,3
    ]),
    new Uint8ClampedArray([
        0,  0,  0,255,   0,255,  0,255,   255,255,  0,255,   255,0,  0,255,
        0,  0,255,255,   0,255,255,255,   255,255,255,255,   255,0,255,255,
    ]),
);

const instances = [
    new Instance(
        cube,
        new Transformation(
            new Vector3(0,0,0),
            new Euler(0,0,0,RotationOrder.XYZ, true),
            new Vector3(1,1,1)
        )
    ),
    new Instance(
        new Model(
            new Float32Array([
                0,0,0, 1,0,0,
                0,0,0, 0,1,0,
                0,0,0, 0,0,1
            ]),
            new Uint32Array([
                0,1,2,3,4,5
            ]),
            new Uint8ClampedArray([
                255,0,0,255,
                255,0,0,255,

                0,255,0,255,
                0,255,0,255,

                0,0,255,255,
                0,0,255,255
            ]),
            DrawMode.line
        ),
        new Transformation(
            new Vector3(0,0,0),
            new Euler(0,0,0,RotationOrder.XYZ,true),
            new Vector3(2,2,2)
        )
    ),
]

const webGPU = new WebGPU(canvas, camera, instances);
async function main() {
    await webGPU.init();
    webGPU.render(instances, camera);
}
main();