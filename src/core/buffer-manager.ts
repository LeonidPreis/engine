import { ArcballCamera } from "./camera";
import { Instance } from "./instance";


export class WebGPUBufferManager {
    private device: GPUDevice;
    private bindGroupLayout: GPUBindGroupLayout;
    constructor(device: GPUDevice) { 
        this.device = device;
        this.bindGroupLayout = this.device.createBindGroupLayout({
            entries: [{
                binding: 0,
                visibility: GPUShaderStage.VERTEX,
                buffer: { type: "uniform" },
            }],
        });
    }

    public createVerticesBuffer(vertices: Float32Array): GPUBuffer {
        if (!this.device) throw new Error("Device is not initialized.");
        const buffer = this.device.createBuffer({
            size: vertices.byteLength,
            usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
            mappedAtCreation: true,
        });
        new Float32Array(buffer.getMappedRange()).set(vertices);
        buffer.unmap();
        return buffer;
    }

    public createIndicesBuffer(indices: Uint32Array): GPUBuffer {
        if (!this.device) throw new Error("Device is not initialized.");
        const buffer =  this.device.createBuffer({
            size: indices.byteLength,
            usage: GPUBufferUsage.INDEX | GPUBufferUsage.COPY_DST,
            mappedAtCreation: true,
        });
        new Uint32Array(buffer.getMappedRange()).set(indices);
        buffer.unmap();
        return buffer;
    }

    public createColorsBuffer(colors: Uint8ClampedArray, verticesAmount: number): GPUBuffer {
        if (!this.device) throw new Error("Device is not initialized.");
        let colorsArray;
        if (colors.length === 4) {
            const singleColor = colors;
            colorsArray = new Uint8ClampedArray(verticesAmount / 3 * 4);
            for (let i = 0; i < colorsArray.length; i += 4) {
                colorsArray.set(singleColor, i);
            }
        } else { colorsArray = colors; }

        const buffer = this.device.createBuffer({
            size: colorsArray.byteLength,
            usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
            mappedAtCreation: true,
        });

        new Uint8ClampedArray(buffer.getMappedRange()).set(colorsArray);
        buffer.unmap();
        return buffer;
    }

    public createNormalsBuffer(normals: Float32Array): GPUBuffer {
        if (!this.device) throw new Error("Device is not initialized.");
        const buffer = this.device.createBuffer({
            size: normals.byteLength,
            usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
            mappedAtCreation: true,
        });
        new Float32Array(buffer.getMappedRange()).set(normals);
        buffer.unmap();
        return buffer;
    }

    public createUniformBuffer(size: number): GPUBuffer {
        if (!this.device) throw new Error("Device is not initialized.");
        const buffer = this.device.createBuffer({
            size: size,
            usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
        });
        return buffer;
    }

    public createInstanceBuffers(instance: Instance): {
        verticesBuffer: GPUBuffer;
        indicesBuffer:  GPUBuffer;
        colorsBuffer:   GPUBuffer;
        normalsBuffer:  GPUBuffer;
        uniformBuffer:  GPUBuffer;
        bindGroup:   GPUBindGroup;
    } {
        const verticesBuffer = this.createVerticesBuffer(instance.model.vertices);
        const indicesBuffer = this.createIndicesBuffer(instance.model.indices);
        const colorsBuffer = this.createColorsBuffer(instance.model.colors, instance.model.vertices.length);
        const normalsBuffer = this.createNormalsBuffer(instance.model.normals);
        const uniformBuffer = this.createUniformBuffer(256);
        const bindGroup = this.device.createBindGroup({
            layout: this.bindGroupLayout,
            entries: [{ binding: 0, resource: { buffer: uniformBuffer } }],
        });

        return { verticesBuffer, indicesBuffer, colorsBuffer, normalsBuffer, uniformBuffer, bindGroup };
    }

    public updateUniformBuffer(uniformBuffer: GPUBuffer, instance: Instance, camera: ArcballCamera) {
        const modelMatrix = instance.getTransformationMatrix().transpose().toFloat32Array();
        const viewMatrix = camera.getViewMatrix().transpose().toFloat32Array();
        const projectionMatrix = camera.projection.getProjectionMatrix().transpose().toFloat32Array();
        const normalMatrix = instance.getNormalMatrix().toFloat32Array();
        const matrices = new Float32Array(64);
        matrices.set(modelMatrix, 0);
        matrices.set(viewMatrix, 16);
        matrices.set(projectionMatrix, 32);
        matrices.set(normalMatrix, 48);
        this.device.queue.writeBuffer(uniformBuffer, 0, matrices);
    }
}