import { ArcballCamera } from "./camera";
import { Instance } from "./instance";
import { Model } from "./model";
import { Vector3 } from "./vector3";
import { Matrix4 } from "./matrix4";
import { Vector4 } from "./vector4";
import { Euler, RotationOrder } from "./euler";
import { Quaternion } from "./quaternion";
import { PerspectiveProjection } from "./projection";
import { Transformation } from "./transformation";

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

interface Subscriber {
    update(): void;
}

export class WebGPU implements Subscriber{
    private canvas: HTMLCanvasElement;
    private device: GPUDevice | null = null;
    private context: GPUCanvasContext | null = null;
    private camera: ArcballCamera;
    private instances: Instance[];

    constructor(canvas: HTMLCanvasElement, camera: ArcballCamera, instances: Instance[]) {
        this.canvas = canvas;
        this.camera = camera;
        this.instances = instances;
        this.camera.subscribe(this);
    } 

    public update(): void {
        this.render(this.instances, this.camera, shader);
    }

    public async init(): Promise<void> {
        if (!navigator.gpu) {
            throw Error("WebGPU is not available.");
        }

        const adapter = await navigator.gpu.requestAdapter();
        if (!adapter) {
            throw Error("WebGPU adapter is not available.");
        }

        this.device = await adapter.requestDevice();
        if (!this.device) {
            throw new Error("WebGPU device is not available.");
        }

        const ratio = window.devicePixelRatio || 1;
        this.canvas.width = window.innerWidth * ratio;
        this.canvas.height = window.innerHeight * ratio;
        this.canvas.style.width = `${window.innerWidth}px`;
        this.canvas.style.height = `${window.innerHeight}px`;
       
        this.context = this.canvas.getContext("webgpu") as GPUCanvasContext;
        this.context.configure({
            device: this.device,
            format: navigator.gpu.getPreferredCanvasFormat(),
            usage: GPUTextureUsage.RENDER_ATTACHMENT,
            alphaMode: "premultiplied",
            colorSpace: "srgb",
        });
    }

    private createVerticesBuffer(vertices: Float32Array): GPUBuffer {
        if (!this.device) {
            throw new Error("Device is not initialized.");
        }
        const buffer = this.device.createBuffer({
            size: vertices.byteLength,
            usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
            mappedAtCreation: true,
        });
        new Float32Array(buffer.getMappedRange()).set(vertices);
        buffer.unmap();
        return buffer;
    }

    private createIndicesBuffer(indices: Uint32Array): GPUBuffer {
        if (!this.device) {
            throw new Error("Device is not initialized.");
        }
        const buffer =  this.device.createBuffer({
            size: indices.byteLength,
            usage: GPUBufferUsage.INDEX | GPUBufferUsage.COPY_DST,
            mappedAtCreation: true,
        });
        new Uint32Array(buffer.getMappedRange()).set(indices);
        buffer.unmap();
        return buffer;
    }

    private createColorsBuffer(colors: Uint8ClampedArray, verticesAmount: number): GPUBuffer {
        if (!this.device) {
            throw new Error("Device is not initialized.");
        }
        let colorsArray;
        if (colors.length === 4) {
            const singleColor = colors;
            colorsArray = new Uint8ClampedArray(verticesAmount / 3 * 4);
            for (let i = 0; i < colorsArray.length; i += 4) {
                colorsArray.set(singleColor, i);
            }
        } else {
            colorsArray = colors;
        }

        const buffer = this.device.createBuffer({
            size: colorsArray.byteLength,
            usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
            mappedAtCreation: true,
        });

        new Uint8ClampedArray(buffer.getMappedRange()).set(colorsArray);
        buffer.unmap();
        return buffer;
    }

    private createUniformBuffer(size: number): GPUBuffer {
        if (!this.device) {
            throw new Error("Device is not initialized.");
        }
        const buffer = this.device.createBuffer({
            size: size,
            usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
        });
        return buffer;
    }

    public createPipeline(
        shader: string): GPURenderPipeline {
        if (!this.device) {
            throw new Error("Device is not initialized.");
        }

        const pipeline = this.device.createRenderPipeline({
            layout: this.device.createPipelineLayout({
                bindGroupLayouts: [this.device.createBindGroupLayout({
                    entries: [{
                        binding: 0,
                        visibility: GPUShaderStage.VERTEX,
                        buffer: { type: "uniform" },
                    }],
                })],
            }),
            vertex: {
                module: this.device.createShaderModule({
                    code: shader,
                }),
                entryPoint: "Vertex",
                buffers: [
                    {   
                        arrayStride: 12,
                        attributes: [{
                            shaderLocation: 0,
                            format: "float32x3",
                            offset: 0,
                        },]
                    },
                    {
                        arrayStride: 4,
                        attributes: [{
                            shaderLocation: 1,
                            format: "unorm8x4",
                            offset: 0,
                        },]
                    }
                ]
            },
            fragment: {
                module: this.device.createShaderModule({ code: shader, }),
                entryPoint: "Fragment",
                targets: [{ format: navigator.gpu.getPreferredCanvasFormat(), }]
            },
            primitive: {
                topology: "triangle-list",
                cullMode: "front"
            }
        });

        return pipeline;
    }

    public render(
        instances: Instance[],
        camera: ArcballCamera,
        shader: string
    ): void {
        if (!this.device || !this.context) {
            throw new Error("Device or context is not initialized.");
        }

        const encoder = this.device.createCommandEncoder();
        const texture = this.context.getCurrentTexture();
        const pass = encoder.beginRenderPass({
            colorAttachments: [{
                view: texture.createView(),
                clearValue: { r: 0.4, g: 0.4, b: 0.4, a: 1 },
                loadOp: "clear",
                storeOp: "store",
            }]
        });
    
        const pipeline = this.createPipeline(shader);
        pass.setPipeline(pipeline);
    
        for (const instance of instances) {
            const model = instance.model;
    
            const modelMatrix = instance.getTransformationMatrix().transpose().toFloat32Array();
            const viewMatrix = camera.getViewMatrix().transpose().toFloat32Array();
            const projectionMatrix = camera.projection.getProjectionMatrix().transpose().toFloat32Array();
    
            const verticesBuffer = this.createVerticesBuffer(new Float32Array(model.vertices));
            const colorsBuffer = this.createColorsBuffer(new Uint8ClampedArray(model.colors), model.vertices.length);
            const indicesBuffer = this.createIndicesBuffer(new Uint32Array(model.indices));
            const uniformBuffer = this.createUniformBuffer(192);
    
            const matrices = new Float32Array(16 * 3);
            matrices.set(modelMatrix, 0);
            matrices.set(viewMatrix, 16);
            matrices.set(projectionMatrix, 32);
    
            this.device.queue.writeBuffer(uniformBuffer, 0, matrices);
    
            const bindGroupLayout = this.device.createBindGroupLayout({
                entries: [{
                    binding: 0,
                    visibility: GPUShaderStage.VERTEX,
                    buffer: {
                        type: "uniform",
                    },
                }],
            });
    
            const bindGroup = this.device.createBindGroup({
                layout: bindGroupLayout,
                entries: [{
                    binding: 0,
                    resource: {
                        buffer: uniformBuffer,
                    },
                }],
            });
    
            pass.setBindGroup(0, bindGroup);
            pass.setVertexBuffer(0, verticesBuffer);
            pass.setVertexBuffer(1, colorsBuffer);
            pass.setIndexBuffer(indicesBuffer, "uint32");
            pass.drawIndexed(instance.model.indices.length);
        }

        pass.end();
        this.device.queue.submit([encoder.finish()]);
    }
}