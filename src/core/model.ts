export interface IModel {
    vertices: Float32Array;
    indices: Uint32Array;
    colors?: Uint8ClampedArray;
    normals?: Float32Array;
    drawMode: DrawMode;
}

export enum DrawMode {
    polygon = 'polygon',
    line = 'line'
}

export class Model implements IModel {
    vertices: Float32Array;
    indices: Uint32Array;
    colors: Uint8ClampedArray;
    drawMode: DrawMode;

    constructor(
        vertices: Float32Array,
        indices: Uint32Array,
        colors: Uint8ClampedArray,
        drawMode: DrawMode = DrawMode.polygon
    ) {
        this.vertices = vertices;
        this.indices = indices;
        this.colors = colors;
        this.drawMode = drawMode;
    }

    public verticesAmount(): number {
        return this.vertices.length;
    }

    public polygonAmount(): number {
        return this.indices.length / 3;
    }
}