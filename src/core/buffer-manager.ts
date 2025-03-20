

export class WebGPUBufferManager {
    private device: GPUDevice
    constructor(device: GPUDevice) { this.device = device; }

    public createVerticesBuffer(vertices: Float32Array): GPUBuffer {
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

    public createIndicesBuffer(indices: Uint32Array): GPUBuffer {
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

    public createColorsBuffer(colors: Uint8ClampedArray, verticesAmount: number): GPUBuffer {
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

    public createUniformBuffer(size: number): GPUBuffer {
        if (!this.device) {
            throw new Error("Device is not initialized.");
        }
        const buffer = this.device.createBuffer({
            size: size,
            usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
        });
        return buffer;
    }
}