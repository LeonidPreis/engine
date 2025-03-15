import { ArcballCamera } from "./core/camera";
import { Euler, RotationOrder } from "./core/euler";
import { Instance } from "./core/instance";
import { Model } from "./core/model";
import { PerspectiveProjection } from "./core/projection";
import { WebGPU } from "./core/renderer";
import { Transformation } from "./core/transformation";
import { Vector3 } from "./core/vector3";
import { Vector4 } from "./core/vector4";

const canvas = document.getElementById("canvas") as HTMLCanvasElement;
const camera = new ArcballCamera(
    canvas,
    new Vector4(0,0,0),
    new Vector4(5,5,5),
    new PerspectiveProjection({aspect: canvas.clientWidth / canvas.clientHeight}))

const instance = new Instance(
    new Model(
        new Float32Array([
            -1,-1,-1,  0,0,0,1,
             1,-1,-1,  0,1,0,1,
             1, 1,-1,  1,1,0,1,
            -1, 1,-1,  1,0,0,1,
            -1,-1, 1,  0,0,1,1,
             1,-1, 1,  0,1,1,1,
             1, 1, 1,  1,1,1,1,
            -1, 1, 1,  1,0,1,1,
        ]),
        new Uint32Array([
            0,3,1, 3,2,1,
            5,1,2, 2,6,5,
            1,5,4, 0,1,4,
            7,2,3, 7,6,2,
            5,6,7, 4,5,7,
            4,7,3, 0,4,3
        ])
    ),
    new Transformation(
        new Vector3(0,0,0),
        new Euler(0,0,0,RotationOrder.XYZ, true),
        new Vector3(1,1,1)
    )
)

const webGPU = new WebGPU(canvas, camera, instance);
const shader = `
struct Uniforms {
    modelMatrix: mat4x4<f32>,
    viewMatrix: mat4x4<f32>,
    projectionMatrix: mat4x4<f32>,
};

@group(0) @binding(0) var<uniform> uniforms: Uniforms;

struct Output {
    @builtin(position) Position: vec4<f32>,
    @location(0) Color: vec4<f32>,
};

@vertex
fn Vertex(
    @location(0) position: vec3<f32>,
    @location(1) color: vec4<f32>)
    -> Output {
        var output: Output;
        let worldPosition = uniforms.modelMatrix * vec4<f32>(position, 1.0);
        let viewPosition = uniforms.viewMatrix * worldPosition;
        let clipPosition = uniforms.projectionMatrix * viewPosition;
        output.Position = clipPosition;
        output.Color = color;
        return output;
    };

@fragment
fn Fragment(
    @location(0) Color: vec4<f32>)
    -> @location(0) vec4<f32> {
        return Color;
    };
`;
async function main() {
    await webGPU.init();
    webGPU.render(instance, camera, shader);
}

main();