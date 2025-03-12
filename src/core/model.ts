export interface IModel {
    vertices: Float32Array;
    indices: Uint32Array;
    colors: Uint8ClampedArray[];
}

export class Model implements IModel {
    vertices: Float32Array;
    indices: Uint32Array;
    colors: Uint8ClampedArray[];

    constructor(
        vertices: Float32Array,
        indices: Uint32Array,
        colors: Uint8ClampedArray[]
    ) {
        this.vertices = vertices;
        this.indices = indices;
        this.colors = colors;
    }

    public verticesAmount(): number {
        return this.vertices.length;
    }

    public polygonAmount(): number {
        return this.indices.length / 3;
    }
}