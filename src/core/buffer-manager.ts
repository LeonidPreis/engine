import { ArcballCamera } from "./camera";
import { Instance } from "./instance";
import { Model, PrimitiveType } from "./model";


export class BufferManager {
    private device: GPUDevice;
    constructor(device: GPUDevice) { 
        this.device = device;
    }

    public createBuffer(data: Float32Array | Uint32Array | number, usage : number, mapping: boolean = true): GPUBuffer {
        if (!this.device) throw new Error("Device is not initialized.");
        const buffer = this.device.createBuffer({
            size: typeof data === 'number' ? data : data.byteLength,
            usage: usage,
            mappedAtCreation: mapping && typeof data !== 'number',
        });

        if (mapping && typeof data !== 'number') {
            if (data instanceof Float32Array) {
                new Float32Array(buffer.getMappedRange()).set(data);
            } else if (data instanceof Uint32Array) {
                new Uint32Array(buffer.getMappedRange()).set(data);
            }
            buffer.unmap();
        }

        return buffer;
    }

    public createVerticesBuffer(model: Model): GPUBuffer {
        return this.createBuffer(model.vertices, GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST);
    }

    public createIndicesBuffer(model: Model): GPUBuffer {
        return this.createBuffer(model.indices, GPUBufferUsage.INDEX | GPUBufferUsage.COPY_DST);
    }

    public createColorsBuffer(model: Model): GPUBuffer {
        if (!this.device) throw new Error("Device is not initialized.");
        const neededLength = model.vertices.length * 4 / 3;
        if (model.colors.length === neededLength) {
            return this.createBuffer(model.colors.map(channel => channel / 255), GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST);
        }
        let colors = new Float32Array(neededLength);
        if (model.colors.length === 4) {
            for (let i = 0; i < colors.length; i += 4) {
                colors.set(model.colors, i);
            }
        } else {
            for (let i = 0; i < colors.length; i += 4) {
                const colorPattern = (i / 4) % (model.colors.length / 4) * 4;
                colors.set(model.colors.slice(colorPattern, colorPattern + 4), i);
            }
        }
        return this.createBuffer(colors.map(channel => channel / 255), GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST);
    }

    public createNormalsBuffer(model: Model): GPUBuffer {
        return this.createBuffer(model.normals as Float32Array, GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST);
    }

    public createUniformBuffer(size: number): GPUBuffer {
        return this.createBuffer(size, GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST, false);
    }

    public createModelBuffers(model: Model): {
        vertices: GPUBuffer;
        indices:  GPUBuffer;
        colors:   GPUBuffer;
        normals:  GPUBuffer | null;
        uniform:  GPUBuffer;
    } {
        const vertices = this.createVerticesBuffer(model);
        const indices = this.createIndicesBuffer(model);
        const colors = this.createColorsBuffer(model);
        const normals = model.primitive != PrimitiveType.line ? this.createNormalsBuffer(model) : null;
        const uniform = this.createUniformBuffer(256);

        return { vertices, indices, colors, normals, uniform };
    }

    public updateUniformBuffer(uniformBuffer: GPUBuffer, instance: Instance, camera: ArcballCamera) {
        const matrices = new Float32Array(64);
        matrices.set(instance.getTransformationMatrix().transpose().toFloat32Array(), 0);
        matrices.set(camera.getViewMatrix().transpose().toFloat32Array(), 16);
        matrices.set(camera.projection.getProjectionMatrix().transpose().toFloat32Array(), 32);
        matrices.set(instance.getNormalMatrix().toFloat32Array(), 48);
        this.device.queue.writeBuffer(uniformBuffer, 0, matrices);
    }
}