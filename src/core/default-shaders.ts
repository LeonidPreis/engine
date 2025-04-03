export const defaultShader = `
struct Matrices {
    model: mat4x4<f32>,
    view: mat4x4<f32>, 
    projection: mat4x4<f32>,
    nolmal: mat4x4<f32>,
};

@group(0) @binding(0) var<uniform> matrices: Matrices;

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
        let world = matrices.model * vec4<f32>(position.x, position.y, -position.z, 1.0);
        let view = matrices.view * world;
        let clip = matrices.projection * view;
        output.Position = clip;
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