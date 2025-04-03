import { ArcballCamera } from "./camera";
import { Instance } from "./instance";
import { WebGPUBufferManager } from "./buffer-manager";
import { defaultShader } from "./default-shaders"
import { DrawMode, Model } from "./model";

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
    private modelBuffers: 
        Map<Model, { 
            vertices: GPUBuffer;
            indices:  GPUBuffer;
            colors:   GPUBuffer;
            normals:  GPUBuffer;
            uniform:  GPUBuffer;
            bindGroup:   GPUBindGroup; 
        }> = new Map();

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

        this.instances.forEach(instance => {
            const buffers = this.bufferManager!.createModelBuffers(instance.model);
            this.modelBuffers.set(instance.model, buffers);
        });
    }

    public createPipeline(drawMode: DrawMode): GPURenderPipeline {
        if (!this.device) throw new Error("Device is not initialized.");
        return this.device.createRenderPipeline({
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
                module: this.device.createShaderModule({ code: this.shader, }),
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
                        arrayStride: 16,
                        attributes: [{
                            shaderLocation: 1,
                            format: "float32x4",
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
    }

    public createPassEncoder(encoder: GPUCommandEncoder): GPURenderPassEncoder {
        if (!this.device || !this.context) throw new Error("Device or context is not initialized.");
        return encoder.beginRenderPass({
            colorAttachments: [{
                view: this.context.getCurrentTexture().createView(),
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
    }

    public render(
        instances: Instance[],
        camera: ArcballCamera
    ): void {
        if (!this.device || !this.context || !this.bufferManager) {
            throw new Error("Device, context, or bufferManager is not initialized.");
        }

        const encoder = this.device.createCommandEncoder();
        const pass = this.createPassEncoder(encoder);

        const instancesByMode = new Map<DrawMode, Instance[]>();
        instances.forEach(instance => {
            const mode = instance.model.drawMode;
            if (!instancesByMode.has(mode)) instancesByMode.set(mode, []);
            instancesByMode.get(mode)!.push(instance);
        });

        for (const [drawMode, instances] of instancesByMode) {
            pass.setPipeline(this.createPipeline(drawMode));
    
            for (const instance of instances) {
                const buffers = this.modelBuffers.get(instance.model);
                if (!buffers) continue;
                this.bufferManager!.updateUniformBuffer(buffers.uniform, instance, camera);
                
                pass.setBindGroup(0, buffers.bindGroup);
                pass.setVertexBuffer(0, buffers.vertices);
                pass.setVertexBuffer(1, buffers.colors);
                pass.setIndexBuffer(buffers.indices, "uint32");
                pass.drawIndexed(instance.model.indices.length);
            }
        }
    
        pass.end();
        this.device.queue.submit([encoder.finish()]);
    }
}