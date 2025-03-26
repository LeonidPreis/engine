import { ArcballCamera } from "./camera";
import { Instance } from "./instance";
import { WebGPUBufferManager } from "./buffer-manager";
import { defaultShader } from "./default-shaders"
import { DrawMode } from "./model";

interface Subscriber {
    update(): void;
}

export class WebGPU implements Subscriber{
    private canvas: HTMLCanvasElement;
    private camera: ArcballCamera;
    private instances: Instance[];
    private shader: string = defaultShader;
    private device: GPUDevice | null = null;
    private context: GPUCanvasContext | null = null;
    private bufferManager: WebGPUBufferManager | null = null;

    constructor(canvas: HTMLCanvasElement, camera: ArcballCamera, instances: Instance[]) {
        this.canvas = canvas;
        this.camera = camera;
        this.instances = instances;
        this.camera.subscribe(this);
    } 

    public update(): void {
        this.render(this.instances, this.camera);
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
        this.bufferManager = new WebGPUBufferManager(this.device);
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

    public createPipeline(drawMode: DrawMode): GPURenderPipeline {
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
                    code: this.shader,
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
                module: this.device.createShaderModule({ code: this.shader, }),
                entryPoint: "Fragment",
                targets: [{ format: navigator.gpu.getPreferredCanvasFormat(), }]
            },
            primitive: {
                topology: drawMode === DrawMode.polygon ? "triangle-list" : "line-list",
                cullMode: drawMode === DrawMode.polygon ? "back" : "none"
            },
            depthStencil: {
                format: "depth24plus",
                depthWriteEnabled: true,
                depthCompare: "less-equal",
            },
        });

        return pipeline;
    }

    public render(
        instances: Instance[],
        camera: ArcballCamera
    ): void {
        if (!this.device || !this.context || !this.bufferManager) {
            throw new Error("Device, context, or bufferManager is not initialized.");
        }

        const encoder = this.device.createCommandEncoder();
        const texture = this.context.getCurrentTexture();
        const pass = encoder.beginRenderPass({
            colorAttachments: [{
                view: texture.createView(),
                clearValue: { r: 0.05, g: 0.05, b: 0.05, a: 1 },
                loadOp: "clear",
                storeOp: "store",
            }],
            depthStencilAttachment: {
                view: this.device.createTexture({
                    size: [this.canvas.width, this.canvas.height],
                    format: 'depth24plus',
                    usage: GPUTextureUsage.RENDER_ATTACHMENT,
                }).createView(),
                depthClearValue: 1.0,
                depthLoadOp: 'clear',
                depthStoreOp: 'store',
            }
        });

        const instancesByMode = new Map<DrawMode, Instance[]>();
        instances.forEach(instance => {
            const mode = instance.model.drawMode;
            if (!instancesByMode.has(mode)) instancesByMode.set(mode, []);
            instancesByMode.get(mode)!.push(instance);
        });

        for (const [drawMode, instances] of instancesByMode) {
            const pipeline = this.createPipeline(drawMode);
            pass.setPipeline(pipeline);
    
            for (const instance of instances) {
                const model = instance.model;
    
                const modelMatrix = instance.getTransformationMatrix().transpose().toFloat32Array();
                const viewMatrix = camera.getViewMatrix().transpose().toFloat32Array();
                const projectionMatrix = camera.projection.getProjectionMatrix().transpose().toFloat32Array();
        
                const colorsBuffer = this.bufferManager.createColorsBuffer(new Uint8ClampedArray(model.colors), model.vertices.length);
                const indicesBuffer = this.bufferManager.createIndicesBuffer(new Uint32Array(model.indices));
                const verticesBuffer = this.bufferManager.createVerticesBuffer(new Float32Array(model.vertices));
                const uniformBuffer = this.bufferManager.createUniformBuffer(192);
        
                const matrices = new Float32Array(48);
                matrices.set(modelMatrix, 0);
                matrices.set(viewMatrix, 16);
                matrices.set(projectionMatrix, 32);
        
                this.device.queue.writeBuffer(uniformBuffer, 0, matrices);
        
                const bindGroupLayout = this.device.createBindGroupLayout({
                    entries: [{
                        binding: 0,
                        visibility: GPUShaderStage.VERTEX,
                        buffer: { type: "uniform" },
                    }],
                });
        
                const bindGroup = this.device.createBindGroup({
                    layout: bindGroupLayout,
                    entries: [{
                        binding: 0,
                        resource: { buffer: uniformBuffer, },
                    }],
                });
                
                pass.setBindGroup(0, bindGroup);
                pass.setVertexBuffer(0, verticesBuffer);
                pass.setVertexBuffer(1, colorsBuffer);
                pass.setIndexBuffer(indicesBuffer, "uint32");
                pass.drawIndexed(model.indices.length);
            }
        }
    
        pass.end();
        this.device.queue.submit([encoder.finish()]);
    }
}