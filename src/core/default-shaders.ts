export const defaultShader = `
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
        let worldPosition = uniforms.modelMatrix * vec4<f32>(position.x, position.y, -position.z, 1.0);
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