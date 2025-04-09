export class ResourceManager {
    private device: GPUDevice;
    private layout!: GPUBindGroupLayout;
    constructor(device: GPUDevice) { 
        this.device = device;
        this.createLayout();
    }

    public createLayout(
        binding: number = 0,
        visibility: number = GPUShaderStage.VERTEX,
        bufferType: GPUBufferBindingType = "uniform"): void {
        this.layout = this.device.createBindGroupLayout({
            entries: [{
                binding: binding,
                visibility: visibility,
                buffer: { type: bufferType },
            }],
        });
    }

    public getLayout(): GPUBindGroupLayout {
        return this.layout;
    }

    public createBindGroup(uniformBuffer: GPUBuffer): GPUBindGroup {
        return this.device.createBindGroup({
            layout: this.layout,
            entries: [{
                binding: 0,
                resource: { buffer: uniformBuffer }
            }],
        });
    }

    public createPipelineLayout(): GPUPipelineLayout {
        return this.device.createPipelineLayout({
            bindGroupLayouts: [this.layout],
        });
    }
}