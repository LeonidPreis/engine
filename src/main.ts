import { ArcballCamera } from "./core/camera";
import { Euler, RotationOrder } from "./core/euler";
import { Instance } from "./core/instance";
import { PrimitiveType, Model } from "./core/model";
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
    new PerspectiveProjection({aspect: canvas.clientWidth / canvas.clientHeight})
);

const axes = new Instance(
    new Model(
        new Float32Array([
            0,0,0, 4,0,0,
            0,0,0, 0,4,0,
            0,0,0, 0,0,4
        ]),
        new Uint32Array([
            0,1,2,3,4,5
        ]),
        new Float32Array([
            255,0,0,255,
            255,0,0,255,

            0,255,0,255,
            0,255,0,255,

            0,0,255,255,
            0,0,255,255
        ]),
        PrimitiveType.line
    )
);

const cube = new Instance(
    new Model(
        new Float32Array([
            -1,-1,-1,   1,-1,-1,   1, 1,-1,   -1, 1,-1,
            -1,-1, 1,   1,-1, 1,   1, 1, 1,   -1, 1, 1,
        ]),
        new Uint32Array([
            0,3,1,   3,2,1,   5,1,2,   2,6,5,
            1,5,4,   0,1,4,   7,2,3,   7,6,2,
            5,6,7,   4,5,7,   4,7,3,   0,4,3 
        ]),
        new Float32Array([
            0,  0,  0,255,   0,255,  0,255,   255,255,  0,255,   255,0,  0,255,
            0,  0,255,255,   0,255,255,255,   255,255,255,255,   255,0,255,255,
        ]),
    )
);

const plane = new Instance(
    new Model(
        new Float32Array([
            0,0,1, 1,0,1, 1,0,0, 0,.5,0
        ]),
        new Uint32Array([
            0,1,2, 2,3,0
        ]),
        new Float32Array([
            255,0,0,255, 255,0,0,255, 255,0,0,255,
            0,0,255,255, 0,0,255,255, 0,0,255,255, 
        ])
    )
);

cube.model.smoothNormals()

const instances = [
    axes,
    cube,
    Mesh.getNormals(cube, 0.2, new Color('RGBA', [255,0,0,255])),
]



const webGPU = new WebGPU(canvas, camera, instances);
async function main() {
    await webGPU.init();
    webGPU.render(instances, camera);
}
main();


